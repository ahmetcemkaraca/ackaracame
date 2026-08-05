import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isAcceptingInquiries } from '../lib/availability';

type WorkFilter = 'all' | 'software' | 'architecture' | 'hybrid' | 'experiment';

const labels = {
  tr: {
    eyebrow: 'İş arşivi',
    title: 'Ürünler, sistemler ve deneyler.',
    intro: 'Her çalışma; problem, kararlar ve teknik omurga üzerinden okunabilecek bağımsız bir vaka çalışmasıdır.',
    search: 'Projelerde ara',
    all: 'Tümü', software: 'Yazılım', architecture: 'Mimarlık', hybrid: 'Hibrit', experiment: 'Deneyler',
    result: 'sonuç', empty: 'Bu filtrelerle eşleşen bir çalışma yok.', reset: 'Filtreleri temizle', filters: 'Filtreler', archive: 'Proje arşivi',
  },
  en: {
    eyebrow: 'Work archive',
    title: 'Products, systems, and experiments.',
    intro: 'Each project is a self-contained case study, readable through its problem, decisions, and technical spine.',
    search: 'Search projects',
    all: 'All', software: 'Software', architecture: 'Architecture', hybrid: 'Hybrid', experiment: 'Experiments',
    result: 'results', empty: 'No work matches these filters.', reset: 'Clear filters', filters: 'Filters', archive: 'Project archive',
  },
} as const;

const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').toLowerCase();

export default function WorkPage() {
  const { projects, settings } = useContent();
  const { locale } = useAppPreferences();
  const t = labels[locale];
  const acceptingInquiries = isAcceptingInquiries(settings.availability);
  const [filter, setFilter] = useState<WorkFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const needle = normalize(search.trim());
    return projects.filter((project) => {
      const matchesFilter = filter === 'all'
        || (filter === 'experiment' ? project.format === 'experiment' : project.discipline === filter);
      const haystack = normalize([
        localize(project.title, locale),
        localize(project.dek, locale),
        project.discipline,
        project.format,
        ...project.technologies,
        ...project.topics,
      ].join(' '));
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [projects, search, filter, locale]);

  useDocumentMeta({
    title: locale === 'tr' ? 'İşler — Ahmet Cem Karaca' : 'Work — Ahmet Cem Karaca',
    description: t.intro,
    path: '/work',
    locale,
  });

  const filters: WorkFilter[] = ['all', 'software', 'architecture', 'hybrid', 'experiment'];

  return (
    <main id="main-content" tabIndex={-1} className="page work-page">
      <header className="page-hero shell">
        <span className="eyebrow">{t.eyebrow}</span>
        <div className="page-hero__grid">
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </header>

      <section className="shell work-browser" aria-labelledby="work-browser-title">
        <h2 id="work-browser-title" className="sr-only">{t.archive}</h2>
        <div className="work-toolbar">
          <div className="work-toolbar__filters" role="group" aria-label={t.filters}>
            <SlidersHorizontal aria-hidden="true" />
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item}>
                {t[item]}
              </button>
            ))}
          </div>
          <label className="work-search">
            <span className="sr-only">{t.search}</span>
            <Search aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} type="search" />
          </label>
        </div>
        <div className="work-result-count" aria-live="polite"><strong>{filtered.length}</strong> {t.result}</div>

        {filtered.length ? (
          <div className="project-grid project-grid--archive">
            {filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>{t.empty}</p>
            <button type="button" className="button button--ghost" onClick={() => { setFilter('all'); setSearch(''); }}>{t.reset}</button>
          </div>
        )}
      </section>

      <aside className="work-page__contact shell">
        <span>{acceptingInquiries ? (locale === 'tr' ? 'Benzer bir sistem üzerine mi düşünüyorsunuz?' : 'Thinking about a system like this?') : (locale === 'tr' ? 'Şu anda yeni görüşme almıyorum; çalışma yaklaşımımı inceleyebilirsiniz.' : 'I am not taking new enquiries right now; you can still explore how I work.')}</span>
        {acceptingInquiries ? <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> : <Link href="/about">{locale === 'tr' ? 'Profili oku' : 'Read the profile'}</Link>}
      </aside>
    </main>
  );
}
