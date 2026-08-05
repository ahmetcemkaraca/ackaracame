import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  safeParseSiteSettings,
  type ContentLink,
  type SiteSettings,
} from '../../domain/content';
import { saveSiteSettings } from '../../lib/firebase/adminRepository';
import { readableError } from './editorUtils';

interface SettingsEditorProps {
  initial: SiteSettings;
  source: 'firestore' | 'missing';
  onSaved: (settings: SiteSettings) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}

export const SettingsEditor = ({
  initial,
  source,
  onSaved,
  onDirtyChange,
  onBusyChange,
}: SettingsEditorProps) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const snapshot = useMemo(() => JSON.stringify(form), [form]);
  const dirty = snapshot !== baseline;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => onBusyChange?.(saving), [saving, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const updateForm = (updater: (current: SiteSettings) => SiteSettings) => {
    setForm(updater);
    setError(null);
    setSuccess(null);
  };

  const updateSocial = (index: number, patch: Partial<ContentLink>) => {
    updateForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, linkIndex) => (
        linkIndex === index ? { ...link, ...patch } : link
      )),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const parsed = safeParseSiteSettings(form);
    if (!parsed.success) {
      setError(readableError(parsed.error));
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveSiteSettings(parsed.data, source === 'firestore' ? initial : null);
      setForm(parsed.data);
      setBaseline(JSON.stringify(parsed.data));
      setSuccess('Site ayarları kaydedildi; rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı. Bu, canlı dağıtım onayı değildir.');
      onSaved(parsed.data);
      onDirtyChange(false);
    } catch (saveError) {
      setError(readableError(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="studio-editor studio-editor--settings" onSubmit={handleSubmit} aria-busy={saving} noValidate>
      <header className="studio-editor__topbar">
        <div>
          <p className="studio-kicker">Global system</p>
          <h2>Site ayarları</h2>
          <p>Kimlik, iletişim ve arama görünümünün tek doğruluk kaynağı.</p>
        </div>
        <button type="submit" className="studio-button studio-button--primary" disabled={saving || !dirty}>{saving ? 'Kaydediliyor…' : 'Ayarları kaydet'}</button>
      </header>

      {source === 'missing' ? (
        <p className="studio-message studio-message--warning" role="status">
          Firestore’da ana ayar belgesi bulunamadı. Form doğrulanmış yerel fallback ile açıldı; kaydetmek create-only olarak yeni ana ayar belgesini oluşturur.
        </p>
      ) : null}
      {error ? <p className="studio-message studio-message--error studio-message--sticky" role="alert">{error}</p> : null}
      {success ? <p className="studio-message studio-message--success studio-message--sticky" role="status">{success}</p> : null}

      <section className="studio-editor-section" aria-labelledby="settings-identity-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">01 / Identity</p><h3 id="settings-identity-title">Kişisel kimlik</h3></div>{dirty ? <span className="studio-dirty-badge">Kaydedilmemiş değişiklik</span> : <span className="studio-saved-badge">Güncel</span>}</div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>Site adı · TR</span><input required maxLength={80} value={form.siteName.tr} onChange={(event) => updateForm((current) => ({ ...current, siteName: { ...current.siteName, tr: event.target.value } }))} /></label>
          <label className="studio-field"><span>Site name · EN</span><input required maxLength={80} value={form.siteName.en} onChange={(event) => updateForm((current) => ({ ...current, siteName: { ...current.siteName, en: event.target.value } }))} /></label>
          <label className="studio-field"><span>İsim · TR</span><input required value={form.ownerName.tr} onChange={(event) => updateForm((current) => ({ ...current, ownerName: { ...current.ownerName, tr: event.target.value } }))} /></label>
          <label className="studio-field"><span>Name · EN</span><input required value={form.ownerName.en} onChange={(event) => updateForm((current) => ({ ...current, ownerName: { ...current.ownerName, en: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Başlık · TR</span><input required maxLength={120} value={form.headline.tr} onChange={(event) => updateForm((current) => ({ ...current, headline: { ...current.headline, tr: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Headline · EN</span><input required maxLength={120} value={form.headline.en} onChange={(event) => updateForm((current) => ({ ...current, headline: { ...current.headline, en: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Giriş · TR</span><textarea required rows={4} maxLength={360} value={form.introduction.tr} onChange={(event) => updateForm((current) => ({ ...current, introduction: { ...current.introduction, tr: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Introduction · EN</span><textarea required rows={4} maxLength={360} value={form.introduction.en} onChange={(event) => updateForm((current) => ({ ...current, introduction: { ...current.introduction, en: event.target.value } }))} /></label>
          <label className="studio-field"><span>Konum · TR</span><input required value={form.location.tr} onChange={(event) => updateForm((current) => ({ ...current, location: { ...current.location, tr: event.target.value } }))} /></label>
          <label className="studio-field"><span>Location · EN</span><input required value={form.location.en} onChange={(event) => updateForm((current) => ({ ...current, location: { ...current.location, en: event.target.value } }))} /></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="settings-contact-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">02 / Contact</p><h3 id="settings-contact-title">İletişim ve kullanılabilirlik</h3></div></div>
        <div className="studio-form-grid studio-form-grid--compact">
          <label className="studio-field"><span>İletişim e-postası</span><input required type="email" value={form.contactEmail} onChange={(event) => updateForm((current) => ({ ...current, contactEmail: event.target.value }))} /></label>
          <label className="studio-field"><span>Canonical URL</span><input required type="url" value={form.canonicalUrl} readOnly aria-describedby="canonical-url-help" /><small id="canonical-url-help">SEO, App Check ve güvenlik allowlist’leriyle aynı kalması için üretim origin’i kilitlidir.</small></label>
          <label className="studio-field studio-field--full"><span>Uygunluk</span><select value={form.availability} onChange={(event) => updateForm((current) => ({ ...current, availability: event.target.value as SiteSettings['availability'] }))}><option value="open-to-inquiries">Yeni görüşmelere açık</option><option value="limited">Sınırlı uygunluk</option><option value="unavailable">Şu an uygun değil</option></select></label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="settings-social-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">03 / Network</p><h3 id="settings-social-title">Sosyal bağlantılar</h3></div><button type="button" className="studio-button studio-button--quiet" disabled={form.socialLinks.length >= 8} onClick={() => updateForm((current) => ({ ...current, socialLinks: [...current.socialLinks, { kind: 'social', label: { tr: 'Yeni profil', en: 'New profile' }, href: 'https://ackaraca.me', newTab: true }] }))}>+ Profil</button></div>
        <div className="studio-link-list">
          {form.socialLinks.map((link, index) => (
            <fieldset className="studio-link-row" key={index}>
              <legend>Profil {index + 1}</legend>
              <label className="studio-field"><span>Etiket · TR</span><input required value={link.label.tr} onChange={(event) => updateSocial(index, { label: { ...link.label, tr: event.target.value } })} /></label>
              <label className="studio-field"><span>Label · EN</span><input required value={link.label.en} onChange={(event) => updateSocial(index, { label: { ...link.label, en: event.target.value } })} /></label>
              <label className="studio-field studio-field--wide"><span>HTTPS URL</span><input required type="url" value={link.href} onChange={(event) => updateSocial(index, { href: event.target.value })} /></label>
              <button type="button" className="studio-text-button studio-text-button--danger" onClick={() => updateForm((current) => ({ ...current, socialLinks: current.socialLinks.filter((_, linkIndex) => linkIndex !== index) }))}>Profili sil</button>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="settings-locale-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">04 / Locale & footer</p><h3 id="settings-locale-title">Dil ve alt bilgi</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field">
            <span>Varsayılan dil</span>
            <select value={form.defaultLocale} onChange={(event) => updateForm((current) => ({ ...current, defaultLocale: event.target.value as SiteSettings['defaultLocale'] }))}>
              <option value="tr">Türkçe (TR)</option>
              <option value="en">English (EN)</option>
            </select>
          </label>
          <label className="studio-field">
            <span id="settings-supported-locales-label">Desteklenen diller</span>
            <input readOnly value="Türkçe (TR) + English (EN)" aria-labelledby="settings-supported-locales-label" aria-describedby="settings-supported-locales-help" />
            <small id="settings-supported-locales-help">İçerik sözleşmesi gereği TR ve EN birlikte ve sabit olarak desteklenir.</small>
          </label>
          <label className="studio-field studio-field--full"><span>Footer notu · TR</span><textarea required rows={3} maxLength={360} value={form.footerNote.tr} onChange={(event) => updateForm((current) => ({ ...current, footerNote: { ...current.footerNote, tr: event.target.value } }))} /></label>
          <label className="studio-field studio-field--full"><span>Footer note · EN</span><textarea required rows={3} maxLength={360} value={form.footerNote.en} onChange={(event) => updateForm((current) => ({ ...current, footerNote: { ...current.footerNote, en: event.target.value } }))} /></label>
        </div>
        <p className="studio-message studio-message--warning">Palette bu panelden değiştirilmez. Kayıtlı accent değeri yalnız “illustration accent only” olarak korunur ve kamu temasına uygulanmaz.</p>
      </section>

      <section className="studio-editor-section" aria-labelledby="settings-seo-title">
        <div className="studio-section-heading"><div><p className="studio-kicker">05 / Default discovery</p><h3 id="settings-seo-title">Varsayılan SEO</h3></div></div>
        <div className="studio-form-grid">
          <label className="studio-field"><span>SEO başlık · TR</span><input required maxLength={70} value={form.defaultSeo.title.tr} onChange={(event) => updateForm((current) => ({ ...current, defaultSeo: { ...current.defaultSeo, title: { ...current.defaultSeo.title, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO title · EN</span><input required maxLength={70} value={form.defaultSeo.title.en} onChange={(event) => updateForm((current) => ({ ...current, defaultSeo: { ...current.defaultSeo, title: { ...current.defaultSeo.title, en: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO açıklama · TR</span><textarea required rows={3} maxLength={180} value={form.defaultSeo.description.tr} onChange={(event) => updateForm((current) => ({ ...current, defaultSeo: { ...current.defaultSeo, description: { ...current.defaultSeo.description, tr: event.target.value } } }))} /></label>
          <label className="studio-field"><span>SEO description · EN</span><textarea required rows={3} maxLength={180} value={form.defaultSeo.description.en} onChange={(event) => updateForm((current) => ({ ...current, defaultSeo: { ...current.defaultSeo, description: { ...current.defaultSeo.description, en: event.target.value } } }))} /></label>
          <label className="studio-check studio-field--full"><input type="checkbox" checked={form.defaultSeo.noIndex} onChange={(event) => updateForm((current) => ({ ...current, defaultSeo: { ...current.defaultSeo, noIndex: event.target.checked } }))} /><span>Tüm site için varsayılan noindex</span></label>
        </div>
      </section>

      <footer className="studio-editor__footer"><p>{dirty ? 'Global değişiklikler kaydedilmedi.' : 'Ayarlar güncel.'}</p><button type="submit" className="studio-button studio-button--primary" disabled={saving || !dirty}>{saving ? 'Kaydediliyor…' : 'Ayarları kaydet'}</button></footer>
    </form>
  );
};
