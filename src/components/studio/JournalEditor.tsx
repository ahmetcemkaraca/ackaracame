import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  journalEntryPath,
  safeParseJournalEntry,
  sanitizeSlug,
  type ContentBlock,
  type JournalEntry,
  type Media,
} from '../../domain/content';
import { firebaseConfig } from '../../lib/firebase/config';
import {
  deleteAdminImage,
  deletePromotedAdminImage,
  promoteAdminImage,
  saveJournalEntry,
} from '../../lib/firebase/adminRepository';
import { ContentBlockEditor } from './ContentBlockEditor';
import {
  MediaUploader,
  type AdminImageUpload,
  type UploadRole,
} from './MediaUploader';
import {
  commaList,
  collectStudioMediaReferenceUrls,
  createJournalDraft,
  isoToLocalDateTime,
  localDateTimeToIso,
  nextBlockId,
  normalizeContentBlocks,
  parseCommaList,
  parsePalette,
  readableError,
  validateStudioMediaContext,
} from './editorUtils';

const coverVariants: JournalEntry['cover']['visualVariant'][] = [
  'architectural-grid',
  'code-canvas',
  'editorial-collage',
  'product-orbit',
  'signal-field',
  'spatial-gradient',
];

const normalizeLinkedProjectSlugs = (value: string) => Array.from(new Set(
  parseCommaList(value)
    .map((slug) => sanitizeSlug(slug))
    .filter(Boolean),
));

interface JournalEditorProps {
  initial: JournalEntry | null;
  onSaved: (entry: JournalEntry) => void;
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

export const JournalEditor = ({
  initial,
  onSaved,
  onDirtyChange,
  onBusyChange,
  onRequestClose,
}: JournalEditorProps) => {
  const [form, setForm] = useState<JournalEntry>(() => initial || createJournalDraft());
  const [topicInput, setTopicInput] = useState(() => commaList(form.topics));
  const [linkedProjectInput, setLinkedProjectInput] = useState(() => commaList(form.linkedProjectSlugs));
  const [paletteInput, setPaletteInput] = useState(() => commaList(form.cover.palette));
  const [publicationInput, setPublicationInput] = useState(() => isoToLocalDateTime(form.publishedAt));
  const [stagedMedia, setStagedMedia] = useState<StagedMedia[]>([]);
  const [promotingPath, setPromotingPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [uploaderBusy, setUploaderBusy] = useState(false);
  const [mediaBoundSlug, setMediaBoundSlug] = useState<string | null>(null);
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
    topicInput,
    linkedProjectInput,
    paletteInput,
    publicationInput,
    stagedMedia,
  }));

  const snapshot = useMemo(
    () => JSON.stringify({ form, topicInput, linkedProjectInput, paletteInput, publicationInput, stagedMedia }),
    [form, topicInput, linkedProjectInput, paletteInput, publicationInput, stagedMedia],
  );
  const dirty = snapshot !== baseline;
  const entryPath = journalEntryPath(form);
  const busy = saving || uploaderBusy || Boolean(promotingPath || deletingPath);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
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
          'journal',
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

  const updateForm = (updater: (current: JournalEntry) => JournalEntry) => {
    setForm(updater);
    setError(null);
    setSuccess(null);
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
          tr: form.title.tr || 'Journal görseli',
          en: form.title.en || 'Journal image',
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
      setError('Medyayı aktarmadan önce geçerli bir journal slug’ı girin.');
      return;
    }
    if (!initial && slug === 'new-journal-entry') {
      setError('Medyayı aktarmadan önce yazıya benzersiz bir slug verin.');
      return;
    }
    if (!item.alt.tr.trim() || !item.alt.en.trim()) {
      setError('Medyayı aktarmadan önce iki dilde de açıklayıcı alt metin girin.');
      return;
    }

    setPromotingPath(item.upload.storagePath);
    setError(null);
    setSuccess(null);
    try {
      const promoted = await promoteAdminImage(
        item.upload.storagePath,
        'journal',
        slug,
      );
      if (!mountedRef.current) {
        if (promoted.promotedNow && promoted.deletionCapability) {
          await deletePromotedAdminImage(
            promoted.storagePath,
            'journal',
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
        id: nextBlockId(item.role === 'cover' ? 'journal-cover-media' : 'journal-media'),
        kind: 'image',
        role: item.role,
        assetState: 'ready',
        src: promoted.url,
        alt: item.alt,
        width: item.upload.width,
        height: item.upload.height,
        mimeType: promoted.contentType,
      };
      const mediaBlock: ContentBlock = {
        id: nextBlockId('media'),
        type: 'media',
        media,
      };
      updateForm((current) => ({
        ...current,
        slug,
        cover: { ...current.cover, slug },
        blocks: [...current.blocks, mediaBlock],
      }));
      setStagedMedia((current) => current.filter(
        (staged) => staged.upload.storagePath !== item.upload.storagePath,
      ));
      stagedPathsRef.current.delete(item.upload.storagePath);
      if (item.upload.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.upload.previewUrl);
        previewUrlsRef.current.delete(item.upload.previewUrl);
      }
      setMediaBoundSlug(slug);
      setSuccess(
        promoted.promotedNow
          ? 'Medya public journal kitaplığına aktarıldı; yazı kaydedilene kadar oturum tarafından korunuyor.'
          : 'Daha önce aktarılan medya güvenli biçimde yazıya yeniden bağlandı.',
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
    setSuccess(null);
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
      setSuccess('Bekleyen journal staging yüklemesi güvenli biçimde silindi.');
    } catch (deleteError) {
      if (mountedRef.current) setError(readableError(deleteError));
    } finally {
      if (mountedRef.current) setDeletingPath(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || uploaderBusy || promotingPath || deletingPath) return;
    setError(null);
    setSuccess(null);
    if (stagedMedia.length > 0) {
      setError('Yüklenen medya henüz public journal kitaplığına aktarılmadı. Medyayı aktarın veya bekleyen yüklemeyi kaldırın.');
      return;
    }
    if (!initial && sanitizeSlug(form.slug) === 'new-journal-entry') {
      setError('Yeni yazıyı kaydetmeden önce benzersiz bir slug girin.');
      return;
    }
    let publishedAt: string | undefined;
    try {
      publishedAt = localDateTimeToIso(publicationInput);
    } catch {
      setError('Yayın zamanı geçerli bir tarih olmalıdır.');
      return;
    }
    const slug = sanitizeSlug(form.slug);
    const linkedProjectSlugs = normalizeLinkedProjectSlugs(linkedProjectInput);
    if (linkedProjectSlugs.length > 8) {
      setError('En fazla 8 bağlı proje slug’ı ekleyebilirsiniz.');
      return;
    }
    const candidate: JournalEntry = {
      ...form,
      slug,
      topics: parseCommaList(topicInput),
      linkedProjectSlugs,
      blocks: normalizeContentBlocks(form.blocks),
      publishedAt,
      cover: { ...form.cover, slug, palette: parsePalette(paletteInput) },
    };
    const mediaContextError = validateStudioMediaContext({
      entity: 'journal',
      slug: candidate.slug,
      storageBucket: firebaseConfig.storageBucket,
      blocks: candidate.blocks,
    });
    if (mediaContextError) {
      setError(mediaContextError);
      return;
    }
    const parsed = safeParseJournalEntry(candidate);
    if (!parsed.success) {
      setError(readableError(parsed.error));
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    try {
      const saved = await saveJournalEntry(parsed.data, initial);
      const savedMediaUrls = collectStudioMediaReferenceUrls([], saved.blocks);
      sessionPromotedMediaRef.current.forEach((item, storagePath) => {
        if (savedMediaUrls.has(item.url)) sessionPromotedMediaRef.current.delete(storagePath);
      });
      await cleanupSessionPromotedMedia();
      const topics = commaList(saved.topics);
      const linkedProjects = commaList(saved.linkedProjectSlugs);
      const palette = commaList(saved.cover.palette);
      const publication = isoToLocalDateTime(saved.publishedAt);
      setForm(saved);
      setTopicInput(topics);
      setLinkedProjectInput(linkedProjects);
      setPaletteInput(palette);
      setPublicationInput(publication);
      setBaseline(JSON.stringify({
        form: saved,
        topicInput: topics,
        linkedProjectInput: linkedProjects,
        paletteInput: palette,
        publicationInput: publication,
        stagedMedia: [],
      }));
      setSuccess('Yazı kaydedildi; rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı. Bu, canlı dağıtım onayı değildir.');
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
          <button type="button" className="studio-back-button" onClick={onRequestClose} disabled={busy}>← Journal’a dön</button>
          <p className="studio-kicker">{initial ? 'Editorial editor' : 'New entry'}</p>
          <h2>{form.title.tr || 'İsimsiz yazı'}</h2>
          <p>{initial ? 'Kalıcı URL' : 'Planlanan URL'}: {entryPath}</p>
        </div>
        <div className="studio-editor__actions">
          {initial?.status === 'published' ? <a className="studio-button studio-button--ghost" href={entryPath} target="_blank" rel="noreferrer">Dağıtılmış sürüm ↗</a> : null}
          <button type="submit" className="studio-button studio-button--primary" disabled={busy || !dirty}>{saving ? 'Kaydediliyor…' : promotingPath ? 'Medya aktarılıyor…' : deletingPath ? 'Staging temizleniyor…' : uploaderBusy ? 'Medya yükleniyor…' : 'Yazıyı kaydet'}</button>
        </div>
      </header>

      {error ? <p className="studio-message studio-message--error studio-message--sticky" role="alert">{error}</p> : null}
      {success ? <p className="studio-message studio-message--success studio-message--sticky" role="status">{success}</p> : null}

      <section className="studio-editor-section" aria-labelledby="journal-basics-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">01 / Editorial identity</p><h3 id="journal-basics-title">Yazı bilgileri</h3></div>{dirty ? <span className="studio-dirty-badge">Kaydedilmemiş değişiklik</span> : <span className="studio-saved-badge">Güncel</span>}</div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>Başlık · TR</span><input required maxLength={120} value={form.title.tr} onChange={(event) => updateForm((current) => ({ ...current, title: { ...current.title, tr: event.target.value } }))} /></label>
          <label className="studio-field"><span>Title · EN</span><input required maxLength={120} value={form.title.en} onChange={(event) => updateForm((current) => ({ ...current, title: { ...current.title, en: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Slug</span><input required value={form.slug} readOnly={Boolean(initial || mediaBoundSlug)} aria-describedby="journal-slug-help" onChange={(event) => {
            const slug = sanitizeSlug(event.target.value);
            updateForm((current) => ({ ...current, slug, cover: { ...current.cover, slug } }));
          }} /><small id="journal-slug-help">{initial ? 'Mevcut yayın URL’sini korumak için kilitli.' : mediaBoundSlug ? 'Public medya bu URL’ye bağlandığı için slug kilitlendi.' : 'Küçük harf, sayı ve tire.'}</small></label>
          <label className="studio-field studio-field--full"><span>Özet · TR</span><textarea required rows={3} maxLength={360} value={form.excerpt.tr} onChange={(event) => updateForm((current) => ({ ...current, excerpt: { ...current.excerpt, tr: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Excerpt · EN</span><textarea required rows={3} maxLength={360} value={form.excerpt.en} onChange={(event) => updateForm((current) => ({ ...current, excerpt: { ...current.excerpt, en: event.target.value } }))} /></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="journal-publishing-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">02 / Publishing</p><h3 id="journal-publishing-title">Yayın ayarları</h3></div></div>
        <div className="studio-form-grid studio-form-grid--compact">
          <label className="studio-field"><span>Tür</span><select value={form.entryType} onChange={(event) => updateForm((current) => ({ ...current, entryType: event.target.value as JournalEntry['entryType'] }))}><option value="journal">Journal</option><option value="lab-note">Lab note</option><option value="release-note">Release note</option></select></label>
          <label className="studio-field"><span>Durum</span><select value={form.status} onChange={(event) => {
            const status = event.target.value as JournalEntry['status'];
            updateForm((current) => ({ ...current, status }));
            if (status === 'published' && !publicationInput) setPublicationInput(isoToLocalDateTime(new Date().toISOString()));
          }}><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşivde</option></select></label>
          <label className="studio-field"><span>Sıra</span><input type="number" min={0} max={10000} value={form.order} onChange={(event) => updateForm((current) => ({ ...current, order: Number(event.target.value) }))} /></label>
          <label className="studio-field"><span>Yayın zamanı</span><input type="datetime-local" value={publicationInput} required={form.status === 'published'} onChange={(event) => setPublicationInput(event.target.value)} /></label>
          <label className="studio-field studio-field--full"><span>Konular</span><input required value={topicInput} onChange={(event) => setTopicInput(event.target.value)} /><small>Virgülle ayırın.</small></label>
          <label className="studio-field studio-field--full"><span>Bağlı proje slug’ları</span><input value={linkedProjectInput} onChange={(event) => setLinkedProjectInput(event.target.value)} /><small>Virgülle ayırın; değerler slug biçimine getirilir, tekrarlar kaldırılır ve en fazla 8 proje saklanır.</small></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="journal-cover-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">03 / Cover system</p><h3 id="journal-cover-title">Kapak</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field studio-field--full"><span>Palet</span><input required value={paletteInput} onChange={(event) => setPaletteInput(event.target.value)} /><small>2–6 HEX değeri.</small></label>
          <label className="studio-field"><span>Varyant</span><select value={form.cover.visualVariant} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, visualVariant: event.target.value as JournalEntry['cover']['visualVariant'] } }))}>{coverVariants.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="studio-field"><span>Alt · TR</span><input required value={form.cover.alt.tr} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, alt: { ...current.cover.alt, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>Alt · EN</span><input required value={form.cover.alt.en} onChange={(event) => updateForm((current) => ({ ...current, cover: { ...current.cover, alt: { ...current.cover.alt, en: event.target.value } } }))} /></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="journal-media-title">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">04 / Managed media</p>
            <h3 id="journal-media-title">Journal görselleri</h3>
            <p>Görseller önce özel staging alanına, ardından bu yazının kalıcı medya yoluna aktarılır.</p>
          </div>
        </div>
        <MediaUploader onUploaded={addUploadedMedia} onBusyChange={setUploaderBusy} />
        {stagedMedia.length ? (
          <div className="studio-staged-media" role="status">
            <div className="studio-message studio-message--warning">
              <strong>{stagedMedia.length} görsel güvenli staging alanında bekliyor.</strong>
              <p>Geçici yükleme adresleri içeriğe yazılmaz. Public journal kitaplığına aktarım bitmeden yazı kaydedilemez.</p>
            </div>
            {stagedMedia.map((item, index) => (
              <article className="studio-media-row" key={item.upload.storagePath}>
                <div>
                  <strong>{item.role} · staging</strong>
                  <code>{item.upload.storagePath}</code>
                  <a href={item.upload.previewUrl} target="_blank" rel="noreferrer">Yerel admin önizleme ↗</a>
                </div>
                <label className="studio-field"><span>Medya alt · TR</span><input required maxLength={80} value={item.alt.tr} onChange={(event) => setStagedMedia((current) => current.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, tr: event.target.value } } : media))} /></label>
                <label className="studio-field"><span>Media alt · EN</span><input required maxLength={80} value={item.alt.en} onChange={(event) => setStagedMedia((current) => current.map((media, mediaIndex) => mediaIndex === index ? { ...media, alt: { ...media.alt, en: event.target.value } } : media))} /></label>
                <div className="studio-staged-media__actions">
                  <button type="button" className="studio-button studio-button--secondary" disabled={busy} onClick={() => void promoteMedia(item)}>{promotingPath === item.upload.storagePath ? 'Aktarılıyor…' : 'Public journal kitaplığına aktar'}</button>
                  <button type="button" className="studio-text-button studio-text-button--danger" disabled={busy} onClick={() => void removeStagedMedia(item)}>{deletingPath === item.upload.storagePath ? 'Siliniyor…' : 'Bekleyen yüklemeyi kaldır'}</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="studio-empty-inline">Hazır görseller aktarım sonrasında düzenlenebilir bir medya bloğu olarak anlatıya eklenir.</p>
        )}
        <p className="studio-message">Kaydedilmiş medya bloklarını kaldırmak yalnız içerik referansını ayırır; dağıtılmış dosyalar yeni deploy etkinleşene ve sunucu temizliği tamamlanana kadar korunur.</p>
      </section>

      <ContentBlockEditor blocks={form.blocks} onChange={(blocks) => updateForm((current) => ({ ...current, blocks }))} allowedTypes={['text', 'callout', 'quote', 'code', 'media', 'gallery']} minimumBlocks={1} />

      <section className="studio-editor-section" aria-labelledby="journal-seo-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">05 / Discovery</p><h3 id="journal-seo-title">Arama görünümü</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>SEO başlık · TR</span><input required maxLength={70} value={form.seo.title.tr} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, title: { ...current.seo.title, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO title · EN</span><input required maxLength={70} value={form.seo.title.en} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, title: { ...current.seo.title, en: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO açıklama · TR</span><textarea required rows={3} maxLength={180} value={form.seo.description.tr} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, description: { ...current.seo.description, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO description · EN</span><textarea required rows={3} maxLength={180} value={form.seo.description.en} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, description: { ...current.seo.description, en: event.target.value } } }))} /></label>
          <label className="studio-check studio-field--full"><input type="checkbox" checked={form.seo.noIndex} onChange={(event) => updateForm((current) => ({ ...current, seo: { ...current.seo, noIndex: event.target.checked } }))} /><span>Arama motorlarından gizle (noindex)</span></label>
        </div>
      </section>

      <footer className="studio-editor__footer"><p>{dirty ? 'Yayınlanmadan önce değişiklikleri kaydedin.' : 'Tüm değişiklikler kaydedildi.'}</p><div className="studio-button-row"><button type="button" className="studio-button studio-button--ghost" onClick={onRequestClose} disabled={busy}>Kapat</button><button type="submit" className="studio-button studio-button--primary" disabled={busy || !dirty}>{saving ? 'Kaydediliyor…' : promotingPath ? 'Medya aktarılıyor…' : deletingPath ? 'Staging temizleniyor…' : uploaderBusy ? 'Medya yükleniyor…' : 'Yazıyı kaydet'}</button></div></footer>
    </form>
  );
};
