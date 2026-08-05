import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import {
  allEntries as fallbackEntries,
  portfolioProjects as fallbackProjects,
  siteSettings as fallbackSettings,
} from '../data/portfolio';
import {
  journalRouteBase,
  type JournalEntry,
  type JournalRouteBase,
  type PortfolioProject,
  type SiteSettings,
} from '../domain/content';

interface ContentValue {
  settings: SiteSettings;
  projects: PortfolioProject[];
  featuredProjects: PortfolioProject[];
  journal: JournalEntry[];
  lab: JournalEntry[];
  findProject: (slug: string) => PortfolioProject | undefined;
  findEntry: (slug: string, base?: JournalRouteBase) => JournalEntry | undefined;
}

export interface PublishedEntryIndex {
  all: JournalEntry[];
  journal: JournalEntry[];
  lab: JournalEntry[];
  findEntry: (slug: string, base?: JournalRouteBase) => JournalEntry | undefined;
}

const ContentContext = createContext<ContentValue | null>(null);

const sortProjects = (projects: PortfolioProject[]) => [...projects].sort((left, right) => {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  return (left.order ?? 100) - (right.order ?? 100) || left.slug.localeCompare(right.slug);
});

const sortEntries = (entries: JournalEntry[]) => [...entries].sort((left, right) => {
  const byOrder = (left.order ?? 100) - (right.order ?? 100);
  if (byOrder !== 0) return byOrder;
  return (right.publishedAt ?? '').localeCompare(left.publishedAt ?? '');
});

export const buildPublishedEntryIndex = (entries: JournalEntry[]): PublishedEntryIndex => {
  const published = sortEntries(entries).filter((entry) => entry.status === 'published');
  return {
    all: published,
    journal: published.filter((entry) => journalRouteBase(entry) === 'journal'),
    lab: published.filter((entry) => journalRouteBase(entry) === 'lab'),
    findEntry: (slug, base) => published.find((entry) => (
      entry.slug === slug && (!base || journalRouteBase(entry) === base)
    )),
  };
};

export const ContentProvider = ({ children }: PropsWithChildren) => {
  const settings = fallbackSettings;
  const projects = useMemo(() => sortProjects(fallbackProjects), []);
  const entryIndex = useMemo(() => buildPublishedEntryIndex(fallbackEntries), []);

  const value = useMemo<ContentValue>(() => {
    const publishedProjects = projects.filter((project) => project.status === 'published');
    return {
      settings,
      projects: publishedProjects,
      featuredProjects: publishedProjects.filter((project) => project.featured),
      journal: entryIndex.journal,
      lab: entryIndex.lab,
      findProject: (slug) => publishedProjects.find((project) => project.slug === slug),
      findEntry: entryIndex.findEntry,
    };
  }, [settings, projects, entryIndex]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
};
