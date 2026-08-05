import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  PROJECT_DISCIPLINES,
  PROJECT_FORMATS,
  safeParsePortfolioProject,
  sanitizeSlug,
  type ContentLink,
  type Media,
  type PortfolioProject,
} from '../../domain/content';
import { firebaseConfig } from '../../lib/firebase/config';
import {
  deleteAdminImage,
  deletePromotedAdminImage,
  promoteAdminImage,
  saveProject,
} from '../../lib/firebase/adminRepository';
import { ContentBlockEditor } from './ContentBlockEditor';
import { ProjectMetadataEditor } from './ProjectMetadataEditor';
import {
  MediaUploader,
  type AdminImageUpload,
  type UploadRole,
} from './MediaUploader';
import {
  commaList,
  collectStudioMediaReferenceUrls,
  createProjectDraft,
  nextBlockId,
  normalizeContentBlocks,
  normalizeMediaMetadata,
  parseCommaList,
  parsePalette,
  readableError,
  validateStudioMediaContext,
} from './editorUtils';

const coverVariants: PortfolioProject['cover']['visualVariant'][] = [
  'architectural-grid',
  'code-canvas',
  'editorial-collage',
  'product-orbit',
  'signal-field',
  'spatial-gradient',
];

const linkKinds: ContentLink['kind'][] = [
  'live',
  'source',
  'article',
  'download',
  'updates',
  'privacy',
  'terms',
  'safety',
  'social',
  'contact',
];

const normalizeOptionalLocalized = <T extends { tr: string; en: string }>(value?: T) => (
  value && (value.tr.trim() || value.en.trim()) ? value : undefined
);

interface ProjectEditorProps {
  initial: PortfolioProject | null;
  onSaved: (project: PortfolioProject) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onRequestClose: () => void;
}

interface StagedMedia {
  upload: AdminImageUpload;
  role: UploadRole;
  alt: { tr: string; en: string };
}

interface SessionPromotedMedia {
  storagePath: string;
  slug: string;
  url: string;
  deletionCapability: string;
}

export const ProjectEditor = ({
  initial,
  onSaved,
  onDirtyChange,
  onBusyChange,
  onRequestClose,
}: ProjectEditorProps) => {
  const [form, setForm] = useState<PortfolioProject>(() => initial || createProjectDraft());
  const [technologyInput, setTechnologyInput] = useState(() => commaList(form.technologies));
  const [topicInput, setTopicInput] = useState(() => commaList(form.topics));
  const [paletteInput, setPaletteInput] = useState(() => commaList(form.cover.palette));
  const [stagedMedia, setStagedMedia] = useState<StagedMedia[]>([]);
  const [promotingPath, setPromotingPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [uploaderBusy, setUploaderBusy] = useState(false);
  const [mediaBoundSlug, setMediaBoundSlug] = useState<string | null>(null);
  const [localMediaPreviews, setLocalMediaPreviews] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef(new Set<string>());
  const stagedPathsRef = useRef(new Set<string>());
  const sessionPromotedMediaRef = useRef(new Map<string, SessionPromotedMedia>());
  const mountedRef = useRef(true);
  const saveInFlightRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify({
    form,
    technologyInput,
    topicInput,
    paletteInput,
    stagedMedia,
  }));

  const snapshot = useMemo(
    () => JSON.stringify({ form, technologyInput, topicInput, paletteInput, stagedMedia }),
    [form, technologyInput, topicInput, paletteInput, stagedMedia],
  );
  const dirty = snapshot !== baseline;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const busy = saving || uploaderBusy || Boolean(promotingPath || deletingPath);
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  useEffect(() => {
    if (!dirty && !busy) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy, dirty]);

  const cleanupSessionPromotedMedia = useCallback(async () => {
    const pending = [...sessionPromotedMediaRef.current.entries()];
    for (const [storagePath, item] of pending) {
      try {
        await deletePromotedAdminImage(
          item.storagePath,
          'project',
          item.slug,
          item.deletionCapability,
        );
        sessionPromotedMediaRef.current.delete(storagePath);
      } catch {
        // Retain the capability in memory for a later retry while this editor lives.
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const previewUrls = previewUrlsRef.current;
    const stagedPaths = stagedPathsRef.current;
    return () => {
      mountedRef.current = false;
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
      stagedPaths.forEach((path) => {
        void deleteAdminImage(path).catch(() => undefined);
      });
      stagedPaths.clear();
      if (!saveInFlightRef.current) void cleanupSessionPromotedMedia();
    };
  }, [cleanupSessionPromotedMedia]);

  const updateForm = (updater: (current: PortfolioProject) => PortfolioProject) => {
    setForm(updater);
    setError(null);
    setSuccess(null);
  };

  const addLink = () => {
    updateForm((current) => ({
      ...current,
      links: [
        ...current.links,
        {
          kind: 'live',
          label: { tr: 'Proje bağlantısı', en: 'Project link' },
          href: 'https://ackaraca.me',
          newTab: true,
        },
      ],
    }));
  };

  const updateLink = (index: number, patch: Partial<ContentLink>) => {
    updateForm((current) => ({
      ...current,
      links: current.links.map((link, linkIndex) => (
        linkIndex === index ? { ...link, ...patch } : link
      )),
    }));
  };

  const addUploadedMedia = (upload: AdminImageUpload, role: UploadRole) => {
    if (upload.previewUrl.startsWith('blob:')) previewUrlsRef.current.add(upload.previewUrl);
    stagedPathsRef.current.add(upload.storagePath);
    setStagedMedia((current) => [
      ...current,
      {
        upload,
        role,
        alt: {
          tr: form.title.tr || 'Proje görseli',
          en: form.title.en || 'Project image',
        },
      },
    ]);
    setError(null);
    setSuccess(null);
  };

  const promoteMedia = async (item: StagedMedia) => {
    if (promotingPath || deletingPath || saving || uploaderBusy) return;
    const slug = sanitizeSlug(form.slug);
    if (slug.length < 2) {
      setError('Medyayı aktarmadan önce geçerli bir proje slug’ı girin.');
      return;
    }
    if (!initial && slug === 'new-project') {
      setError('Medyayı aktarmadan önce projeye benzersiz bir slug verin.');
      return;
    }
    if (!item.alt.tr.trim() || !item.alt.en.trim()) {
      setError('Medyayı aktarmadan önce iki dilde de açıklayıcı alt metin girin.');
      return;
    }
    if (item.role === 'cover' && form.media.some((media) => media.role === 'cover')) {
      setError('Yeni kapak medyasını aktarmadan önce mevcut kapağı güvenli biçimde kaldırın.');
      return;
    }
    setPromotingPath(item.upload.storagePath);
    setError(null);
    setSuccess(null);
    try {
      const promoted = await promoteAdminImage(
        item.upload.storagePath,
        'project',
        slug,
      );
      if (!mountedRef.current) {
        if (promoted.promotedNow && promoted.deletionCapability) {
          await deletePromotedAdminImage(
            promoted.storagePath,
            'project',
            slug,
            promoted.deletionCapability,
          ).catch(() => undefined);
        }
        return;
      }
      if (promoted.promotedNow && promoted.deletionCapability) {
        sessionPromotedMediaRef.current.set(promoted.storagePath, {
          storagePath: promoted.storagePath,
          slug,
          url: promoted.url,
          deletionCapability: promoted.deletionCapability,
        });
      }
      const media: Media = {
        id: nextBlockId(item.role === 'cover' ? 'cover-media' : 'gallery-media'),
        kind: 'image',
        role: item.role,
        assetState: 'ready',
        src: promoted.url,
        alt: item.alt,
        width: item.upload.width,
        height: item.upload.height,
        mimeType: promoted.contentType,
      };
      updateForm((current) => ({
        ...current,
        slug,
        cover: { ...current.cover, slug },
        media: item.role === 'cover'
          ? [...current.media.filter((existing) => existing.role !== 'cover'), media]
          : [...current.media, media],
      }));
      setStagedMedia((current) => current.filter(
        (staged) => staged.upload.storagePath !== item.upload.storagePath,
      ));
      stagedPathsRef.current.delete(item.upload.storagePath);
      setLocalMediaPreviews((current) => ({
        ...current,
        [promoted.url]: item.upload.previewUrl,
      }));
      setMediaBoundSlug(slug);
      setSuccess(
        promoted.promotedNow
          ? 'Medya public kitaplığa aktarıldı; proje yayınlanana kadar yalnız admin erişebilir.'
          : 'Daha önce aktarılan medya güvenli biçimde yeniden bağlandı.',
      );
    } catch (promotionError) {
      if (mountedRef.current) setError(readableError(promotionError));
    } finally {
      if (mountedRef.current) setPromotingPath(null);
    }
  };

  const removeStagedMedia = async (item: StagedMedia) => {
    if (deletingPath || promotingPath || saving || uploaderBusy) return;
    setDeletingPath(item.upload.storagePath);
    setError(null);
    try {
      await deleteAdminImage(item.upload.storagePath);
      stagedPathsRef.current.delete(item.upload.storagePath);
      if (item.upload.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.upload.previewUrl);
        previewUrlsRef.current.delete(item.upload.previewUrl);
      }
      if (!mountedRef.current) return;
      setStagedMedia((current) => current.filter(
        (staged) => staged.upload.storagePath !== item.upload.storagePath,
      ));
      setSuccess('Bekleyen staging yüklemesi güvenli biçimde silindi.');
    } catch (deleteError) {
      if (mountedRef.current) setError(readableError(deleteError));
    } finally {
      if (mountedRef.current) setDeletingPath(null);
    }
  };

  const removeMediaReference = (item: Media) => {
    const previewUrl = item.src ? localMediaPreviews[item.src] : undefined;
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(previewUrl);
    }
    if (item.src) {
      setLocalMediaPreviews((current) => {
        const next = { ...current };
        delete next[item.src || ''];
        return next;
      });
    }
    updateForm((current) => ({
      ...current,
      media: current.media.filter((media) => media.id !== item.id),
    }));
  };

  const removeReadyMedia = (item: Media) => {
    if (busy) return;
    removeMediaReference(item);
    setSuccess(item.src?.startsWith('https://firebasestorage.googleapis.com/')
      ? 'Medya referansı taslaktan çıkarıldı. Dosya başarılı kayıt ve deploy sonrasındaki sunucu temizliğine kadar fiziksel olarak korunur.'
      : 'Harici medya referansı projeden kaldırıldı.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || uploaderBusy || promotingPath || deletingPath) return;
    setError(null);
    setSuccess(null);

    if (stagedMedia.length > 0) {
      setError('Yüklenen medya henüz public kitaplığa aktarılmadı. Medyayı aktarın veya bekleyen yüklemeyi kaldırın.');
      return;
    }
    if (!initial && sanitizeSlug(form.slug) === 'new-project') {
      setError('Yeni projeyi kaydetmeden önce benzersiz bir slug girin.');
      return;
    }

    const candidate: PortfolioProject = {
      ...form,
      slug: sanitizeSlug(form.slug),
      context: normalizeOptionalLocalized(form.context),
      location: normalizeOptionalLocalized(form.location),
      technologies: parseCommaList(technologyInput),
      topics: parseCommaList(topicInput),
      metrics: form.metrics.map((metric) => ({
        ...metric,
        context: normalizeOptionalLocalized(metric.context),
        evidenceUrl: metric.evidenceUrl?.trim() ? metric.evidenceUrl : undefined,
      })),
      media: form.media.map(normalizeMediaMetadata),
      blocks: normalizeContentBlocks(form.blocks),
      cover: {
        ...form.cover,
        slug: sanitizeSlug(form.slug),
        palette: parsePalette(paletteInput),
      },
    };
    if (!candidate.context) delete candidate.context;
    if (!candidate.location) delete candidate.location;
    candidate.metrics.forEach((metric) => {
      if (!metric.context) delete metric.context;
      if (!metric.evidenceUrl) delete metric.evidenceUrl;
    });
    const mediaContextError = validateStudioMediaContext({
      entity: 'project',
      slug: candidate.slug,
      storageBucket: firebaseConfig.storageBucket,
      media: candidate.media,
      blocks: candidate.blocks,
    });
    if (mediaContextError) {
      setError(mediaContextError);
      return;
    }
    const parsed = safeParsePortfolioProject(candidate);
    if (!parsed.success) {
      setError(readableError(parsed.error));
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    try {
      const saved = await saveProject(parsed.data, initial);
      const savedMediaUrls = collectStudioMediaReferenceUrls(saved.media, saved.blocks);
      sessionPromotedMediaRef.current.forEach((item, storagePath) => {
        if (savedMediaUrls.has(item.url)) sessionPromotedMediaRef.current.delete(storagePath);
      });
      await cleanupSessionPromotedMedia();
      setForm(saved);
      setTechnologyInput(commaList(saved.technologies));
      setTopicInput(commaList(saved.topics));
      setPaletteInput(commaList(saved.cover.palette));
      setBaseline(JSON.stringify({
        form: saved,
        technologyInput: commaList(saved.technologies),
        topicInput: commaList(saved.topics),
        paletteInput: commaList(saved.cover.palette),
        stagedMedia: [],
      }));
      setSuccess('Proje kaydedildi; rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı. Bu, canlı dağıtım onayı değildir.');
      onSaved(saved);
      onDirtyChange(false);
    } catch (saveError) {
      if (mountedRef.current) {
        setError(readableError(saveError));
      } else {
        await cleanupSessionPromotedMedia();
      }
    } finally {
      saveInFlightRef.current = false;
      if (mountedRef.current) setSaving(false);
      else await cleanupSessionPromotedMedia();
    }
  };

  return (
    <form className="studio-editor" onSubmit={handleSubmit} aria-busy={busy} noValidate>
      <header className="studio-editor__topbar">
        <div>
          <button type="button" className="studio-back-button" onClick={onRequestClose} disabled={busy}>← Projelere dön</button>
          <p className="studio-kicker">{initial ? 'Project editor' : 'New project'}</p>
          <h2>{form.title.tr || 'İsimsiz proje'}</h2>
          <p>{initial ? `Kalıcı URL: /work/${initial.slug}` : 'Yeni vaka çalışması taslağı'}</p>
        </div>
        <div className="studio-editor__actions">
          {initial?.status === 'published' ? <a className="studio-button studio-button--ghost" href={`/work/${initial.slug}`} target="_blank" rel="noreferrer">Dağıtılmış sürüm ↗</a> : null}
          <button type="submit" className="studio-button studio-button--primary" disabled={busy || !dirty}>
            {saving ? 'Kaydediliyor…' : promotingPath ? 'Medya aktarılıyor…' : deletingPath ? 'Staging temizleniyor…' : uploaderBusy ? 'Medya yükleniyor…' : 'Projeyi kaydet'}
          </button>
        </div>
      </header>

      {error ? <p className="studio-message studio-message--error studio-message--sticky" role="alert">{error}</p> : null}
      {success ? <p className="studio-message studio-message--success studio-message--sticky" role="status">{success}</p> : null}

      <section className="studio-editor-section" aria-labelledby="project-basics-title">
        <div className="studio-section-heading">
          <div><p className="studio-kicker">01 / Identity</p><h3 id="project-basics-title">Temel bilgiler</h3></div>
          {dirty ? <span className="studio-dirty-badge">Kaydedilmemiş değişiklik</span> : <span className="studio-saved-badge">Güncel</span>}
        </div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>Başlık · TR</span><input required maxLength={120} value={form.title.tr} onChange={(event) => updateForm((current) => ({ ...current, title: { ...current.title, tr: event.target.value } }))} /></label>
          <label className="studio-field"><span>Title · EN</span><input required maxLength={120} value={form.title.en} onChange={(event) => updateForm((current) => ({ ...current, title: { ...current.title, en: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Slug</span><input required value={form.slug} readOnly={Boolean(initial || mediaBoundSlug)} aria-describedby="project-slug-help" onChange={(event) => {
            const slug = sanitizeSlug(event.target.value);
            updateForm((current) => ({ ...current, slug, cover: { ...current.cover, slug } }));
          }} /><small id="project-slug-help">{initial ? 'Yayın URL’lerini korumak için mevcut slug kilitlidir.' : mediaBoundSlug ? 'Public medya bu URL’ye bağlandığı için slug kilitlendi.' : 'Küçük harf, sayı ve tire kullanılır.'}</small></label>
          <label className="studio-field studio-field--full"><span>Kısa anlatı · TR</span><textarea required rows={3} maxLength={360} value={form.dek.tr} onChange={(event) => updateForm((current) => ({ ...current, dek: { ...current.dek, tr: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Short narrative · EN</span><textarea required rows={3} maxLength={360} value={form.dek.en} onChange={(event) => updateForm((current) => ({ ...current, dek: { ...current.dek, en: event.target.value } }))} /></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="project-classification-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">02 / Classification</p><h3 id="project-classification-title">Yayın ve sınıflandırma</h3></div></div>
        <div className="studio-form-grid studio-form-grid--compact">
          <label className="studio-field"><span>Durum</span><select value={form.status} onChange={(event) => updateForm((current) => ({ ...current, status: event.target.value as PortfolioProject['status'] }))}><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşivde</option></select></label>
          <label className="studio-field"><span>Disiplin</span><select value={form.discipline} onChange={(event) => updateForm((current) => ({ ...current, discipline: event.target.value as PortfolioProject['discipline'] }))}>{PROJECT_DISCIPLINES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="studio-field"><span>Format</span><select value={form.format} onChange={(event) => updateForm((current) => ({ ...current, format: event.target.value as PortfolioProject['format'] }))}>{PROJECT_FORMATS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="studio-field"><span>Sıra</span><input type="number" min={0} max={10000} value={form.order} onChange={(event) => updateForm((current) => ({ ...current, order: Number(event.target.value) }))} /></label>
          <label className="studio-field"><span>Yıl</span><input type="number" min={2000} max={2100} value={form.year ?? ''} onChange={(event) => updateForm((current) => ({ ...current, year: event.target.value ? Number(event.target.value) : undefined }))} /></label>
          <label className="studio-check"><input type="checkbox" checked={form.featured} onChange={(event) => updateForm((current) => ({ ...current, featured: event.target.checked }))} /><span>Seçili çalışma olarak öne çıkar</span></label>
          <label className="studio-field studio-field--full"><span>Teknolojiler</span><input required value={technologyInput} onChange={(event) => setTechnologyInput(event.target.value)} /><small>Virgülle ayırın; 1–20 değer.</small></label>
          <label className="studio-field studio-field--full"><span>Konular</span><input required value={topicInput} onChange={(event) => setTopicInput(event.target.value)} /><small>Virgülle ayırın; 1–12 değer.</small></label>
        </div>
      </section>

      <ProjectMetadataEditor project={form} onChange={(project) => updateForm(() => project)} />

      <section className="studio-editor-section" aria-labelledby="project-cover-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">03 / Visual system</p><h3 id="project-cover-title">Kapak ve medya</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field studio-field--full"><span>Kapak paleti</span><input required value={paletteInput} onChange={(event) => setPaletteInput(event.target.value)} /><small>2–6 adet altı haneli HEX değeri, virgülle ayrılmış.</small></label>
          <label className="studio-field"><span>Görsel varyant</span><select value={form.cover.visualVariant} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, visualVariant: event.target.value as PortfolioProject['cover']['visualVariant'] } }))}>{coverVariants.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="studio-field"><span>Kapak alt · TR</span><input required value={form.cover.alt.tr} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, alt: { ...current.cover.alt, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>Cover alt · EN</span><input required value={form.cover.alt.en} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, alt: { ...current.cover.alt, en: event.target.value } } }))} /></label>
        </div>
        <MediaUploader onUploaded={addUploadedMedia} onBusyChange={setUploaderBusy} />
        {stagedMedia.length ? (
          <div className="studio-staged-media" role="status">
            <div className="studio-message studio-message--warning">
              <strong>{stagedMedia.length} görsel güvenli staging alanında bekliyor.</strong>
              <p>Bu geçici URL’ler public içeriğe yazılmaz. Yayın kitaplığına aktarım tamamlanmadan proje kaydedilemez.</p>
            </div>
            {stagedMedia.map((item, index) => (
              <article className="studio-media-row" key={item.upload.storagePath}>
                <div>
                  <strong>{item.role} · staging</strong>
                  <code>{item.upload.storagePath}</code>
                  <a href={item.upload.previewUrl} target="_blank" rel="noreferrer">Yerel admin önizleme ↗</a>
                </div>
                <label className="studio-field"><span>Alt · TR</span><input value={item.alt.tr} onChange={(event) => setStagedMedia((current) => current.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, tr: event.target.value } } : media))} /></label>
                <label className="studio-field"><span>Alt · EN</span><input value={item.alt.en} onChange={(event) => setStagedMedia((current) => current.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, en: event.target.value } } : media))} /></label>
                <div className="studio-staged-media__actions">
                  <button type="button" className="studio-button studio-button--secondary" disabled={busy} onClick={() => void promoteMedia(item)}>{promotingPath === item.upload.storagePath ? 'Aktarılıyor…' : 'Public kitaplığa aktar'}</button>
                  <button type="button" className="studio-text-button studio-text-button--danger" disabled={busy} onClick={() => void removeStagedMedia(item)}>{deletingPath === item.upload.storagePath ? 'Siliniyor…' : 'Bekleyen yüklemeyi kaldır'}</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {form.media.length ? (
          <div className="studio-media-list">
            {form.media.map((item, index) => (
              <article className="studio-media-row" key={item.id}>
                <div><strong>{item.role}</strong>{item.src ? <a href={localMediaPreviews[item.src] || item.src} target="_blank" rel="noreferrer">{localMediaPreviews[item.src] ? 'Yerel önizleme ↗' : 'Dosyayı aç ↗'}</a> : null}</div>
                <label className="studio-field"><span>Alt · TR</span><input value={item.alt.tr} onChange={(event) => updateForm((current) => ({ ...current, media: current.media.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, tr: event.target.value } } : media) }))} /></label>
                <label className="studio-field"><span>Alt · EN</span><input value={item.alt.en} onChange={(event) => updateForm((current) => ({ ...current, media: current.media.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, en: event.target.value } } : media) }))} /></label>
                <button type="button" className="studio-text-button studio-text-button--danger" disabled={busy} onClick={() => removeReadyMedia(item)}>Medyayı kaldır</button>
              </article>
            ))}
          </div>
        ) : <p className="studio-empty-inline">Henüz yüklenmiş medya yok; metadata tabanlı kapak yine üretilebilir.</p>}
      </section>

      <section className="studio-editor-section" aria-labelledby="project-links-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">04 / Destinations</p><h3 id="project-links-title">Bağlantılar</h3></div><button type="button" className="studio-button studio-button--quiet" onClick={addLink}>+ Bağlantı</button></div>
        <div className="studio-link-list">
          {form.links.map((link, index) => (
            <fieldset className="studio-link-row" key={index}>
              <legend>Bağlantı {index + 1}</legend>
              <label className="studio-field"><span>Tür</span><select value={link.kind} onChange={(event) => updateLink(index, { kind: event.target.value as ContentLink['kind'] })}>{linkKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}</select></label>
              <label className="studio-field"><span>Etiket · TR</span><input required value={link.label.tr} onChange={(event) => updateLink(index, { label: { ...link.label, tr: event.target.value } })} /></label>
              <label className="studio-field"><span>Label · EN</span><input required value={link.label.en} onChange={(event) => updateLink(index, { label: { ...link.label, en: event.target.value } })} /></label>
              <label className="studio-field studio-field--wide"><span>HTTPS veya site içi yol</span><input required type="url" value={link.href} onChange={(event) => updateLink(index, { href: event.target.value, newTab: event.target.value.startsWith('/') ? false : link.newTab })} /></label>
              <label className="studio-check"><input type="checkbox" checked={link.newTab} disabled={link.href.startsWith('/')} onChange={(event) => updateLink(index, { newTab: event.target.checked })} /><span>Yeni sekme</span></label>
              <button type="button" className="studio-text-button studio-text-button--danger" onClick={() => updateForm((current) => ({ ...current, links: current.links.filter((_, linkIndex) => linkIndex !== index) }))}>Bağlantıyı sil</button>
            </fieldset>
          ))}
          {!form.links.length ? <p className="studio-empty-inline">Bu proje için bağlantı eklenmemiş.</p> : null}
        </div>
      </section>

      <ContentBlockEditor blocks={form.blocks} onChange={(blocks) => updateForm((current) => ({ ...current, blocks }))} allowedTypes={['text', 'facts', 'callout', 'quote', 'code', 'media', 'gallery']} minimumBlocks={2} />

      <section className="studio-editor-section" aria-labelledby="project-seo-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">06 / Discovery</p><h3 id="project-seo-title">Arama görünümü</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>SEO başlık · TR</span><input required maxLength={70} value={form.seo.title.tr} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, title: { ...current.seo.title, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO title · EN</span><input required maxLength={70} value={form.seo.title.en} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, title: { ...current.seo.title, en: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO açıklama · TR</span><textarea required rows={3} maxLength={180} value={form.seo.description.tr} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, description: { ...current.seo.description, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO description · EN</span><textarea required rows={3} maxLength={180} value={form.seo.description.en} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, description: { ...current.seo.description, en: event.target.value } } }))} /></label>
          <label className="studio-check studio-field--full"><input type="checkbox" checked={form.seo.noIndex} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, noIndex: event.target.checked } }))} /><span>Arama motorlarından gizle (noindex)</span></label>
        </div>
      </section>

      <footer className="studio-editor__footer">
        <p>{dirty ? 'Değişiklikler yalnız kaydettiğinizde yayın katmanına gider.' : 'Tüm değişiklikler kaydedildi.'}</p>
        <div className="studio-button-row"><button type="button" className="studio-button studio-button--ghost" onClick={onRequestClose} disabled={busy}>Kapat</button><button type="submit" className="studio-button studio-button--primary" disabled={busy || !dirty}>{saving ? 'Kaydediliyor…' : promotingPath ? 'Medya aktarılıyor…' : deletingPath ? 'Staging temizleniyor…' : uploaderBusy ? 'Medya yükleniyor…' : 'Projeyi kaydet'}</button></div>
      </footer>
    </form>
  );
};
