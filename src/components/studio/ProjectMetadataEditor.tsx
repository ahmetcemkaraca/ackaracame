import { useState, type KeyboardEvent } from 'react';
import { sanitizeSlug, type PortfolioProject } from '../../domain/content';

type Metric = PortfolioProject['metrics'][number];
type Locale = 'tr' | 'en';
type OptionalLocalizedProjectField = 'context' | 'location';
type ReleaseStage = NonNullable<PortfolioProject['releaseStage']>;

const releaseStages = [
  ['concept', 'Konsept'],
  ['prototype', 'Prototip'],
  ['in-development', 'Geliştirme aşamasında'],
  ['live', 'Yayında'],
  ['maintained', 'Aktif bakımda'],
  ['archived', 'Arşivlendi'],
] as const satisfies ReadonlyArray<readonly [ReleaseStage, string]>;

const isReleaseStage = (value: string): value is ReleaseStage =>
  releaseStages.some(([stage]) => stage === value);

const optionalLocalized = (value: { tr: string; en: string }) =>
  value.tr.trim() || value.en.trim() ? value : undefined;

const nextMetricId = (metrics: Metric[]) => {
  let suffix = metrics.length + 1;
  while (metrics.some(({ id }) => id === `metric-${suffix.toString()}`)) suffix += 1;
  return `metric-${suffix.toString()}`;
};

const createMetric = (metrics: Metric[]): Metric => ({
  id: nextMetricId(metrics),
  label: { tr: 'Yeni metrik', en: 'New metric' },
  value: { tr: '—', en: '—' },
  verified: false,
});

export interface ProjectMetadataEditorProps {
  project: PortfolioProject;
  onChange: (project: PortfolioProject) => void;
}

export const ProjectMetadataEditor = ({
  project,
  onChange,
}: ProjectMetadataEditorProps) => {
  const [relatedInput, setRelatedInput] = useState('');
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const updateOptionalProjectField = (
    field: OptionalLocalizedProjectField,
    locale: Locale,
    value: string,
  ) => {
    const current = project[field] || { tr: '', en: '' };
    onChange({
      ...project,
      [field]: optionalLocalized({ ...current, [locale]: value }),
    });
  };

  const updateMetric = (index: number, updater: (metric: Metric) => Metric) => {
    onChange({
      ...project,
      metrics: project.metrics.map((metric, metricIndex) => (
        metricIndex === index ? updater(metric) : metric
      )),
    });
  };

  const addMetric = () => {
    if (project.metrics.length >= 8) return;
    onChange({ ...project, metrics: [...project.metrics, createMetric(project.metrics)] });
  };

  const removeMetric = (index: number) => {
    onChange({
      ...project,
      metrics: project.metrics.filter((_, metricIndex) => metricIndex !== index),
    });
  };

  const addRelatedSlug = () => {
    const slug = sanitizeSlug(relatedInput);
    if (!slug) {
      setRelatedError('Geçerli bir proje slug’ı girin.');
      return;
    }
    if (slug === project.slug) {
      setRelatedError('Bir proje kendisiyle ilişkilendirilemez.');
      return;
    }

    const normalizedExisting = Array.from(new Set(
      project.relatedSlugs
        .map((value) => sanitizeSlug(value))
        .filter((value) => value && value !== project.slug),
    ));
    if (normalizedExisting.includes(slug)) {
      setRelatedError('Bu proje zaten ilişkili listesinde.');
      return;
    }
    if (normalizedExisting.length >= 6) {
      setRelatedError('En fazla 6 ilgili proje ekleyebilirsiniz.');
      return;
    }

    onChange({ ...project, relatedSlugs: [...normalizedExisting, slug] });
    setRelatedInput('');
    setRelatedError(null);
  };

  const handleRelatedKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addRelatedSlug();
  };

  return (
    <>
      <section className="studio-editor-section" aria-labelledby="project-metadata-title">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">Project metadata</p>
            <h3 id="project-metadata-title">Bağlam ve yayın aşaması</h3>
            <p>Opsiyonel alanları iki dilde birlikte doldurun; tamamen boş çiftler kayıtta tutulmaz.</p>
          </div>
        </div>
        <div className="studio-form-grid">
          <label className="studio-field">
            <span>Bağlam · TR</span>
            <input maxLength={80} value={project.context?.tr || ''} onChange={(event) => updateOptionalProjectField('context', 'tr', event.target.value)} />
          </label>
          <label className="studio-field">
            <span>Context · EN</span>
            <input maxLength={80} value={project.context?.en || ''} onChange={(event) => updateOptionalProjectField('context', 'en', event.target.value)} />
          </label>
          <label className="studio-field">
            <span>Konum · TR</span>
            <input maxLength={80} value={project.location?.tr || ''} onChange={(event) => updateOptionalProjectField('location', 'tr', event.target.value)} />
          </label>
          <label className="studio-field">
            <span>Location · EN</span>
            <input maxLength={80} value={project.location?.en || ''} onChange={(event) => updateOptionalProjectField('location', 'en', event.target.value)} />
          </label>
          <label className="studio-field studio-field--full">
            <span>Yayın aşaması</span>
            <select
              value={project.releaseStage || ''}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) {
                  onChange({ ...project, releaseStage: undefined });
                  return;
                }
                if (!isReleaseStage(value)) return;
                onChange({ ...project, releaseStage: value });
              }}
            >
              <option value="">Belirtilmedi</option>
              {releaseStages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="project-metrics-title">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">Evidence system</p>
            <h3 id="project-metrics-title">Metrikler</h3>
            <p>Doğrulanmış metriklerde kanıt bağlantısı veya iki dilli kaynak bağlamı sağlayın.</p>
          </div>
          <button type="button" className="studio-button studio-button--quiet" disabled={project.metrics.length >= 8} onClick={addMetric}>+ Metrik</button>
        </div>

        <div className="studio-link-list">
          {project.metrics.map((metric, index) => {
            const context = metric.context || { tr: '', en: '' };
            return (
              <fieldset className="studio-link-row" key={`metric-row-${index.toString()}`}>
                <legend>Metrik {index + 1}</legend>
                <label className="studio-field">
                  <span>Metrik ID</span>
                  <input required maxLength={80} value={metric.id} onChange={(event) => updateMetric(index, (current) => ({ ...current, id: sanitizeSlug(event.target.value) }))} />
                </label>
                <label className="studio-field">
                  <span>Etiket · TR</span>
                  <input required maxLength={80} value={metric.label.tr} onChange={(event) => updateMetric(index, (current) => ({ ...current, label: { ...current.label, tr: event.target.value } }))} />
                </label>
                <label className="studio-field">
                  <span>Label · EN</span>
                  <input required maxLength={80} value={metric.label.en} onChange={(event) => updateMetric(index, (current) => ({ ...current, label: { ...current.label, en: event.target.value } }))} />
                </label>
                <label className="studio-field">
                  <span>Değer · TR</span>
                  <input required maxLength={48} value={metric.value.tr} onChange={(event) => updateMetric(index, (current) => ({ ...current, value: { ...current.value, tr: event.target.value } }))} />
                </label>
                <label className="studio-field">
                  <span>Value · EN</span>
                  <input required maxLength={48} value={metric.value.en} onChange={(event) => updateMetric(index, (current) => ({ ...current, value: { ...current.value, en: event.target.value } }))} />
                </label>
                <label className="studio-field studio-field--wide">
                  <span>Kaynak bağlamı · TR</span>
                  <textarea rows={3} minLength={12} maxLength={360} value={context.tr} onChange={(event) => updateMetric(index, (current) => ({ ...current, context: optionalLocalized({ ...context, tr: event.target.value }) }))} />
                </label>
                <label className="studio-field studio-field--wide">
                  <span>Source context · EN</span>
                  <textarea rows={3} minLength={12} maxLength={360} value={context.en} onChange={(event) => updateMetric(index, (current) => ({ ...current, context: optionalLocalized({ ...context, en: event.target.value }) }))} />
                </label>
                <label className="studio-field studio-field--wide">
                  <span>Kanıt URL’si</span>
                  <input inputMode="url" maxLength={2048} placeholder="https://… veya /…" value={metric.evidenceUrl || ''} onChange={(event) => updateMetric(index, (current) => ({ ...current, evidenceUrl: event.target.value.trim() ? event.target.value : undefined }))} />
                </label>
                <label className="studio-check">
                  <input type="checkbox" checked={metric.verified} onChange={(event) => updateMetric(index, (current) => ({ ...current, verified: event.target.checked }))} />
                  <span>Doğrulandı</span>
                </label>
                <button type="button" className="studio-text-button studio-text-button--danger" onClick={() => removeMetric(index)}>Metriği sil</button>
              </fieldset>
            );
          })}
          {!project.metrics.length ? <p className="studio-empty-inline">Bu proje için henüz metrik eklenmedi.</p> : null}
        </div>
      </section>

      <section className="studio-editor-section" aria-labelledby="project-related-title">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">Archive connections</p>
            <h3 id="project-related-title">İlgili projeler</h3>
            <p>En fazla 6 farklı proje slug’ı ekleyin; mevcut proje kendi listesine eklenemez.</p>
          </div>
        </div>
        <div className="studio-toolbar">
          <label className="studio-field studio-field--grow">
            <span>İlgili proje slug’ı</span>
            <input value={relatedInput} onKeyDown={handleRelatedKeyDown} onChange={(event) => {
              setRelatedInput(event.target.value);
              setRelatedError(null);
            }} />
          </label>
          <button type="button" className="studio-button studio-button--quiet" disabled={project.relatedSlugs.length >= 6} onClick={addRelatedSlug}>Projeyi ekle</button>
        </div>
        {relatedError ? <p className="studio-message studio-message--error" role="alert">{relatedError}</p> : null}
        <div className="studio-link-list">
          {project.relatedSlugs.map((slug, index) => (
            <div className="studio-link-row" key={`related-row-${index.toString()}`}>
              <code>{slug}</code>
              <button type="button" className="studio-text-button studio-text-button--danger" onClick={() => onChange({ ...project, relatedSlugs: project.relatedSlugs.filter((_, slugIndex) => slugIndex !== index) })}>İlişkiyi kaldır</button>
            </div>
          ))}
          {!project.relatedSlugs.length ? <p className="studio-empty-inline">Henüz ilgili proje seçilmedi.</p> : null}
        </div>
      </section>
    </>
  );
};
