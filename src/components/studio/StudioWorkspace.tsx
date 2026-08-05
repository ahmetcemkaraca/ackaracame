import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { siteSettings as fallbackSettings } from '../../data/portfolio';
import type {
  ContentStatus,
  JournalEntry,
  PortfolioProject,
  SiteSettings,
} from '../../domain/content';
import { journalEntryPath } from '../../domain/content';
import {
  archiveContent,
  getLatestSiteRebuildStatus,
  getSiteRebuildStatus,
  loadAdminJournal,
  loadAdminProjects,
  loadInquiries,
  loadSiteSettings,
  requestSiteRebuild,
  restoreContent,
  seedFallbackContent,
  type AdminContentResult,
  type AdminInquiryCursor,
  type AdminInquiryRecord,
  type SiteRebuildRequest,
} from '../../lib/firebase/adminRepository';
import { InboxPanel } from './InboxPanel';
import { JournalEditor } from './JournalEditor';
import { ProjectEditor } from './ProjectEditor';
import {
  LatestRebuildStatusNotice,
  RebuildStatusNotice,
  type RebuildStatus,
} from './RebuildStatusNotice';
import { SettingsEditor } from './SettingsEditor';
import { ConfirmDialog } from './StudioDialog';
import { InvalidRecordsNotice, SeedDialog } from './StudioNotices';
import { readableError, sortByOrder } from './editorUtils';

type StudioSection = 'dashboard' | 'projects' | 'journal' | 'settings' | 'inbox';

const sections: Array<{ id: StudioSection; label: string; index: string }> = [
  { id: 'dashboard', label: 'Overview', index: '00' },
  { id: 'projects', label: 'Projects', index: '01' },
  { id: 'journal', label: 'Journal', index: '02' },
  { id: 'settings', label: 'Settings', index: '03' },
  { id: 'inbox', label: 'Inbox', index: '04' },
];

const statusLabels: Record<ContentStatus, string> = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşivde',
};

const emptyProjects: AdminContentResult<PortfolioProject> = { valid: [], invalid: [] };
const emptyJournal: AdminContentResult<JournalEntry> = { valid: [], invalid: [] };
const emptyInquiries: AdminContentResult<AdminInquiryRecord> = { valid: [], invalid: [] };

interface StudioWorkspaceProps {
  userEmail: string;
  onLogout: () => Promise<void>;
}

const filterContent = <T extends PortfolioProject | JournalEntry>(
  values: T[],
  query: string,
  status: 'all' | ContentStatus,
) => {
  const needle = query.trim().toLocaleLowerCase('tr-TR');
  return values.filter((item) => {
    if (status !== 'all' && item.status !== status) return false;
    if (!needle) return true;
    const extra = 'technologies' in item ? item.technologies : item.topics;
    return [item.slug, item.title.tr, item.title.en, ...extra]
      .some((value) => value.toLocaleLowerCase('tr-TR').includes(needle));
  });
};

interface ProjectListProps {
  projects: PortfolioProject[];
  loading: boolean;
  onNew: () => void;
  onEdit: (project: PortfolioProject) => void;
  onStatusAction: (kind: 'projects', project: PortfolioProject) => void;
}

const ProjectList = ({ projects, loading, onNew, onEdit, onStatusAction }: ProjectListProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ContentStatus>('all');
  const filtered = useMemo(() => filterContent(projects, query, status), [projects, query, status]);

  return (
    <section className="studio-panel" aria-labelledby="projects-title">
      <header className="studio-panel__header">
        <div><p className="studio-kicker">Selected work system</p><h2 id="projects-title">Projects</h2><p>Vaka çalışmalarını iki dilde hazırlayın, sıralayın ve yayınlayın.</p></div>
        <button type="button" className="studio-button studio-button--primary" onClick={onNew}>+ Yeni proje</button>
      </header>
      <div className="studio-toolbar">
        <label className="studio-search"><span className="sr-only">Projelerde ara</span><input type="search" placeholder="Başlık, slug veya teknoloji ara…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="studio-filter"><span>Durum</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">Tümü</option><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşivde</option></select></label>
      </div>
      {loading ? <div className="studio-list-loading" aria-live="polite">Projeler yükleniyor…</div> : null}
      {!loading && !filtered.length ? <div className="studio-empty-state"><strong>Eşleşen proje yok.</strong><p>Filtreleri temizleyin veya ilk projeyi oluşturun.</p></div> : null}
      <div className="studio-content-list">
        {filtered.map((project) => (
          <article className="studio-content-row" key={project.slug}>
            <button type="button" className="studio-content-row__main" onClick={() => onEdit(project)}>
              <span className="studio-order">{String(project.order).padStart(3, '0')}</span>
              <span><strong>{project.title.tr}</strong><small>{project.title.en}</small></span>
              <span className={`studio-status studio-status--${project.status}`}>{statusLabels[project.status]}</span>
              <span className="studio-content-row__meta">{project.discipline} · {project.format}{project.year ? ` · ${project.year}` : ''}</span>
            </button>
            <div className="studio-content-row__actions">
              {project.status === 'published' ? <a href={`/work/${project.slug}`} target="_blank" rel="noreferrer" className="studio-text-button">Dağıtılmış sürüm ↗</a> : null}
              <button type="button" className="studio-text-button" onClick={() => onEdit(project)}>Düzenle</button>
              <button type="button" className={`studio-text-button${project.status === 'archived' ? '' : ' studio-text-button--danger'}`} onClick={() => onStatusAction('projects', project)}>{project.status === 'archived' ? 'Geri yükle' : 'Arşivle'}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

interface JournalListProps {
  entries: JournalEntry[];
  loading: boolean;
  onNew: () => void;
  onEdit: (entry: JournalEntry) => void;
  onStatusAction: (kind: 'journal', entry: JournalEntry) => void;
}

const JournalList = ({ entries, loading, onNew, onEdit, onStatusAction }: JournalListProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ContentStatus>('all');
  const filtered = useMemo(() => filterContent(entries, query, status), [entries, query, status]);

  return (
    <section className="studio-panel" aria-labelledby="journal-title">
      <header className="studio-panel__header">
        <div><p className="studio-kicker">Editorial stream</p><h2 id="journal-title">Journal</h2><p>Yazıları, laboratuvar notlarını ve sürüm kayıtlarını yönetin.</p></div>
        <button type="button" className="studio-button studio-button--primary" onClick={onNew}>+ Yeni yazı</button>
      </header>
      <div className="studio-toolbar">
        <label className="studio-search"><span className="sr-only">Journal’da ara</span><input type="search" placeholder="Başlık, slug veya konu ara…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="studio-filter"><span>Durum</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">Tümü</option><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşivde</option></select></label>
      </div>
      {loading ? <div className="studio-list-loading" aria-live="polite">Journal yükleniyor…</div> : null}
      {!loading && !filtered.length ? <div className="studio-empty-state"><strong>Eşleşen yazı yok.</strong><p>Filtreleri temizleyin veya yeni bir taslak açın.</p></div> : null}
      <div className="studio-content-list">
        {filtered.map((entry) => (
          <article className="studio-content-row" key={entry.slug}>
            <button type="button" className="studio-content-row__main" onClick={() => onEdit(entry)}>
              <span className="studio-order">{String(entry.order).padStart(3, '0')}</span>
              <span><strong>{entry.title.tr}</strong><small>{entry.title.en}</small></span>
              <span className={`studio-status studio-status--${entry.status}`}>{statusLabels[entry.status]}</span>
              <span className="studio-content-row__meta">{entry.entryType}{entry.publishedAt ? ` · ${new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(entry.publishedAt))}` : ''}</span>
            </button>
            <div className="studio-content-row__actions">
              {entry.status === 'published' ? <a href={journalEntryPath(entry)} target="_blank" rel="noreferrer" className="studio-text-button">Dağıtılmış sürüm ↗</a> : null}
              <button type="button" className="studio-text-button" onClick={() => onEdit(entry)}>Düzenle</button>
              <button type="button" className={`studio-text-button${entry.status === 'archived' ? '' : ' studio-text-button--danger'}`} onClick={() => onStatusAction('journal', entry)}>{entry.status === 'archived' ? 'Geri yükle' : 'Arşivle'}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Dashboard = ({
  projects,
  journal,
  inquiries,
  onNavigate,
  onSeed,
  onManualRebuild,
}: {
  projects: PortfolioProject[];
  journal: JournalEntry[];
  inquiries: AdminInquiryRecord[];
  onNavigate: (section: StudioSection) => void;
  onSeed: () => void;
  onManualRebuild: () => void;
}) => {
  const publishedProjects = projects.filter((item) => item.status === 'published').length;
  const draftCount = [...projects, ...journal].filter((item) => item.status === 'draft').length;
  const newInquiries = inquiries.filter((item) => item.inquiry.status === 'new').length;
  return (
    <section className="studio-dashboard" aria-labelledby="dashboard-title">
      <header className="studio-panel__header studio-dashboard__hero">
        <div><p className="studio-kicker">Editorial control room</p><h2 id="dashboard-title">Overview</h2><p>Yayın yüzeyinin durumu, bekleyen işler ve hızlı girişler.</p></div>
        <a className="studio-button studio-button--ghost" href="/" target="_blank" rel="noreferrer">Siteyi aç ↗</a>
      </header>
      <div className="studio-metric-grid">
        <button type="button" onClick={() => onNavigate('projects')}><span>Yayındaki proje</span><strong>{publishedProjects}</strong><small>{projects.length} toplam proje</small></button>
        <button type="button" onClick={() => onNavigate('journal')}><span>Bekleyen taslak</span><strong>{draftCount}</strong><small>Proje + journal</small></button>
        <button type="button" onClick={() => onNavigate('inbox')}><span>Yeni mesaj</span><strong>{newInquiries}</strong><small>{inquiries.length} toplam talep</small></button>
      </div>
      <div className="studio-dashboard-grid">
        <article className="studio-dashboard-card">
          <p className="studio-kicker">Quick start</p><h3>Bir sonraki hamle</h3>
          <div className="studio-dashboard-actions">
            <button type="button" onClick={() => onNavigate('projects')}><span>01</span><strong>Proje vaka çalışmasını geliştir</strong><small>İki dilli anlatı, medya ve bloklar</small></button>
            <button type="button" onClick={() => onNavigate('journal')}><span>02</span><strong>Journal taslağı aç</strong><small>Editoryal düşünce ve laboratuvar notları</small></button>
            <button type="button" onClick={() => onNavigate('inbox')}><span>03</span><strong>Yeni talepleri incele</strong><small>Durum ve yanıt takibi</small></button>
          </div>
        </article>
        <article className="studio-dashboard-card studio-dashboard-card--risk">
          <p className="studio-kicker">Recovery tool</p><h3>Fallback seed</h3>
          <p>Yetkili sunucu işleviyle yalnız eksik başlangıç kayıtlarını oluşturur. Günlük kullanım aracı değildir.</p>
          <button type="button" className="studio-button studio-button--danger" onClick={onSeed}>Riskli işlemi aç</button>
        </article>
        <article className="studio-dashboard-card">
          <p className="studio-kicker">Deployment recovery</p><h3>Manuel rebuild</h3>
          <p>Yalnız otomatik sunucu kuyruğunun yeniden tetiklenmesi gerektiğinde açıkça yeni bir rebuild isteği oluşturur.</p>
          <button type="button" className="studio-button studio-button--secondary" onClick={onManualRebuild}>Manuel rebuild iste</button>
        </article>
      </div>
    </section>
  );
};

export const StudioWorkspace = ({ userEmail, onLogout }: StudioWorkspaceProps) => {
  const [section, setSection] = useState<StudioSection>('dashboard');
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [projects, setProjects] = useState(emptyProjects);
  const [journal, setJournal] = useState(emptyJournal);
  const [inquiries, setInquiries] = useState(emptyInquiries);
  const [inquiryCursor, setInquiryCursor] = useState<AdminInquiryCursor>(null);
  const [inquiriesHaveMore, setInquiriesHaveMore] = useState(false);
  const [inquiriesLoadingMore, setInquiriesLoadingMore] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(fallbackSettings);
  const [settingsSource, setSettingsSource] = useState<'firestore' | 'missing' | 'error'>('error');
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [projectEditor, setProjectEditor] = useState<PortfolioProject | null | undefined>(undefined);
  const [journalEditor, setJournalEditor] = useState<JournalEntry | null | undefined>(undefined);
  const [editorDirty, setEditorDirty] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const pendingTransition = useRef<(() => void) | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ kind: 'projects'; item: PortfolioProject } | { kind: 'journal'; item: JournalEntry } | null>(null);
  const [statusPending, setStatusPending] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedPending, setSeedPending] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [rebuildStatus, setRebuildStatus] = useState<RebuildStatus>({ state: 'idle' });
  const [latestRebuildStatus, setLatestRebuildStatus] = useState<{
    result: Awaited<ReturnType<typeof getLatestSiteRebuildStatus>> | null;
    loading: boolean;
    error: string | null;
  }>({ result: null, loading: true, error: null });
  const [latestRebuildPollEpoch, setLatestRebuildPollEpoch] = useState(0);
  const latestRebuildDiscoveryUntil = useRef(0);
  const rebuildSequence = useRef(0);
  const mobileNavigationRef = useRef<HTMLElement | null>(null);
  const mobileNavigationTriggerRef = useRef<HTMLButtonElement | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setSettingsLoading(true);
    setLoadErrors([]);
    const [projectResult, journalResult, inquiryResult, settingsResult] = await Promise.allSettled([
      loadAdminProjects(),
      loadAdminJournal(),
      loadInquiries(),
      loadSiteSettings(),
    ]);
    const errors: string[] = [];
    if (projectResult.status === 'fulfilled') setProjects(projectResult.value);
    else errors.push(`Projects: ${readableError(projectResult.reason)}`);
    if (journalResult.status === 'fulfilled') setJournal(journalResult.value);
    else errors.push(`Journal: ${readableError(journalResult.reason)}`);
    if (inquiryResult.status === 'fulfilled') {
      setInquiries(inquiryResult.value);
      setInquiryCursor(inquiryResult.value.nextCursor);
      setInquiriesHaveMore(inquiryResult.value.hasMore);
    }
    else errors.push(`Inbox: ${readableError(inquiryResult.reason)}`);
    if (settingsResult.status === 'fulfilled') {
      if (settingsResult.value) {
        setSettings(settingsResult.value);
        setSettingsSource('firestore');
      } else {
        setSettings(fallbackSettings);
        setSettingsSource('missing');
      }
    } else {
      setSettings(fallbackSettings);
      setSettingsSource('error');
      errors.push(`Settings: ${readableError(settingsResult.reason)}`);
    }
    setLoadErrors(errors);
    setLoading(false);
    setSettingsLoading(false);
  }, []);

  const loadMoreInquiries = useCallback(async () => {
    if (!inquiryCursor || !inquiriesHaveMore || inquiriesLoadingMore) return;
    setInquiriesLoadingMore(true);
    setActionError(null);
    try {
      const page = await loadInquiries(inquiryCursor);
      setInquiries((current) => ({
        valid: [...current.valid, ...page.valid.filter((record) => (
          !current.valid.some((existing) => existing.documentId === record.documentId)
        ))],
        invalid: [...current.invalid, ...page.invalid.filter((record) => (
          !current.invalid.some((existing) => existing.id === record.id)
        ))],
      }));
      setInquiryCursor(page.nextCursor);
      setInquiriesHaveMore(page.hasMore);
    } catch (error) {
      setActionError(`Inbox: ${readableError(error)}`);
    } finally {
      setInquiriesLoadingMore(false);
    }
  }, [inquiriesHaveMore, inquiriesLoadingMore, inquiryCursor]);

  const handleEditorBusy = useCallback((busy: boolean) => {
    setEditorBusy(busy);
    if (!busy) {
      setActionError((current) => (
        current?.startsWith('Devam eden kaydetme veya medya işlemi') ? null : current
      ));
    }
  }, []);

  const triggerRebuild = useCallback(async (request: SiteRebuildRequest) => {
    const sequence = rebuildSequence.current + 1;
    rebuildSequence.current = sequence;
    setActionSuccess(null);
    setRebuildStatus({ state: 'requesting', request });
    try {
      const result = await requestSiteRebuild(request);
      if (rebuildSequence.current !== sequence) return;
      setRebuildStatus({
        state: 'deploying',
        request,
        requestId: result.requestId,
        revision: result.revision,
        acceptedRevision: result.acceptedRevision,
        coalesced: result.coalesced,
      });
    } catch (error) {
      if (rebuildSequence.current !== sequence) return;
      setRebuildStatus({
        state: 'failed',
        request,
        error: readableError(error),
      });
    }
  }, []);

  const refreshLatestRebuildStatus = useCallback(() => {
    setLatestRebuildPollEpoch((current) => current + 1);
  }, []);

  const discoverAutomaticRebuild = useCallback(() => {
    latestRebuildDiscoveryUntil.current = Date.now() + 30_000;
    setLatestRebuildPollEpoch((current) => current + 1);
  }, []);

  const monitoredRebuildRevision = rebuildStatus.state === 'deploying'
    ? rebuildStatus.revision
    : null;

  useEffect(() => {
    if (monitoredRebuildRevision === null) return undefined;
    let cancelled = false;
    let timer: number | undefined;
    let consecutiveReadFailures = 0;
    const startedAt = Date.now();
    const poll = async () => {
      try {
        const result = await getSiteRebuildStatus(monitoredRebuildRevision);
        if (cancelled) return;
        consecutiveReadFailures = 0;
        if (result.state === 'active') {
          setRebuildStatus((current) => current.state === 'deploying'
            && current.revision === monitoredRebuildRevision
            ? {
                state: 'deployed',
                request: current.request,
                requestId: current.requestId,
                revision: current.revision,
                activeRevision: result.activeRevision,
                deploymentId: result.activeDeploymentId,
              }
            : current);
          return;
        }
        if (result.state === 'hook-failed' || result.state === 'deploy-failed') {
          setRebuildStatus((current) => current.state === 'deploying'
            && current.revision === monitoredRebuildRevision
            ? {
                state: 'failed',
                request: current.request,
                error: result.state === 'hook-failed'
                  ? `Rebuild hook başarısız oldu (${result.failureCode ?? 'unknown'}).`
                  : `Dağıtım aktifleşemedi (${result.failureCode ?? result.deploymentStatus}).`,
              }
            : current);
          return;
        }
        if (Date.now() - startedAt >= 15 * 60 * 1000) {
          setRebuildStatus((current) => current.state === 'deploying'
            && current.revision === monitoredRebuildRevision
            ? {
                state: 'failed',
                request: current.request,
                error: 'Dağıtım 15 dakika içinde aktif revizyon olarak doğrulanamadı.',
              }
            : current);
          return;
        }
      } catch (error) {
        if (cancelled) return;
        consecutiveReadFailures += 1;
        if (consecutiveReadFailures >= 3) {
          setRebuildStatus((current) => current.state === 'deploying'
            && current.revision === monitoredRebuildRevision
            ? {
                state: 'failed',
                request: current.request,
                error: `Dağıtım durumu okunamadı: ${readableError(error)}`,
              }
            : current);
          return;
        }
      }
      timer = window.setTimeout(() => void poll(), 5000);
    };
    timer = window.setTimeout(() => void poll(), 1500);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [monitoredRebuildRevision]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      setLatestRebuildStatus((current) => ({ ...current, loading: true }));
      try {
        const result = await getLatestSiteRebuildStatus();
        if (cancelled) return;
        setLatestRebuildStatus({ result, loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setLatestRebuildStatus((current) => ({
          ...current,
          loading: false,
          error: readableError(error),
        }));
      }
      if (cancelled) return;
      const discoveryActive = Date.now() < latestRebuildDiscoveryUntil.current;
      timer = window.setTimeout(() => void poll(), discoveryActive ? 1500 : 15_000);
    };
    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [latestRebuildPollEpoch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timeout);
  }, [reload]);

  useEffect(() => {
    if (!mobileNavigationOpen) return undefined;
    const navigation = mobileNavigationRef.current;
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      navigation?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    const handleNavigationKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileNavigationOpen(false);
        window.requestAnimationFrame(() => mobileNavigationTriggerRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab' || !window.matchMedia('(max-width: 820px)').matches || !navigation) return;
      const focusable = [...navigation.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter((element) => element.getClientRects().length > 0);
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleNavigationKeys);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleNavigationKeys);
    };
  }, [mobileNavigationOpen]);

  const requestTransition = (action: () => void) => {
    if (editorBusy) {
      setActionError('Devam eden kaydetme veya medya işlemi tamamlanmadan bu görünümden ayrılamazsınız.');
      return;
    }
    if (editorDirty) {
      pendingTransition.current = action;
      setDiscardOpen(true);
      return;
    }
    action();
  };

  const navigate = (nextSection: StudioSection) => {
    const focusWorkspace = mobileNavigationOpen;
    requestTransition(() => {
      setSection(nextSection);
      setProjectEditor(undefined);
      setJournalEditor(undefined);
      setEditorDirty(false);
      setEditorBusy(false);
      setMobileNavigationOpen(false);
      if (focusWorkspace) {
        window.requestAnimationFrame(() => document.getElementById('studio-main')?.focus());
      }
    });
  };

  const refreshStudio = () => {
    requestTransition(() => {
      setProjectEditor(undefined);
      setJournalEditor(undefined);
      setEditorDirty(false);
      setEditorBusy(false);
      refreshLatestRebuildStatus();
      void reload();
    });
  };

  const upsertProject = (saved: PortfolioProject) => {
    setProjects((current) => ({
      ...current,
      valid: sortByOrder([...current.valid.filter((item) => item.slug !== saved.slug), saved]),
    }));
  };

  const upsertJournal = (saved: JournalEntry) => {
    setJournal((current) => ({
      ...current,
      valid: sortByOrder([...current.valid.filter((item) => item.slug !== saved.slug), saved]),
    }));
  };

  const confirmStatusAction = async () => {
    if (!statusTarget || statusPending) return;
    setStatusPending(true);
    setActionError(null);
    setActionSuccess(null);
    const { item, kind } = statusTarget;
    try {
      if (item.status === 'archived') await restoreContent(kind, item.slug);
      else await archiveContent(kind, item.slug);
      const nextStatus: ContentStatus = item.status === 'archived' ? 'draft' : 'archived';
      if (kind === 'projects') {
        setProjects((current) => ({ ...current, valid: current.valid.map((project) => project.slug === item.slug ? { ...project, status: nextStatus } : project) }));
      } else {
        setJournal((current) => ({ ...current, valid: current.valid.map((entry) => entry.slug === item.slug ? { ...entry, status: nextStatus } : entry) }));
      }
      const label = kind === 'projects' ? 'Proje' : 'Yazı';
      setActionSuccess(`${label} ${item.status === 'archived' ? 'taslak olarak geri yüklendi' : 'arşivlendi'}; rebuild sunucu tarafındaki dayanıklı içerik senkronizasyon kuyruğuna alındı. Bu, canlı dağıtım onayı değildir.`);
      discoverAutomaticRebuild();
      setStatusTarget(null);
    } catch (statusError) {
      setActionError(readableError(statusError));
      setStatusTarget(null);
    } finally {
      setStatusPending(false);
    }
  };

  const confirmSeed = async () => {
    if (seedPending) return;
    setSeedPending(true);
    setSeedError(null);
    setActionSuccess(null);
    try {
      const result = await seedFallbackContent();
      if (result.createdCount > 0) {
        setActionSuccess(`${result.createdCount} eksik başlangıç kaydı oluşturuldu. Rebuild sunucu tarafındaki dayanıklı içerik senkronizasyon kuyruğuna alındı; bu, canlı dağıtım onayı değildir.`);
        discoverAutomaticRebuild();
      } else {
        setActionSuccess('Eksik başlangıç kaydı yoktu; içerik yazılmadı ve yeni bir rebuild kuyruğu oluşturulmadı.');
      }
      setSeedOpen(false);
      await reload();
    } catch (error) {
      setSeedError(readableError(error));
    } finally {
      setSeedPending(false);
    }
  };

  const editorVisible = projectEditor !== undefined || journalEditor !== undefined;

  return (
    <div className="studio-shell">
      <a className="studio-skip-link" href="#studio-main">Ana içeriğe geç</a>
      <aside ref={mobileNavigationRef} id="studio-navigation" className={`studio-sidebar${mobileNavigationOpen ? ' studio-sidebar--open' : ''}`}>
        <div className="studio-brand"><a href="/" aria-label="ACKaraca sitesine git"><span>ACK</span><strong>Content studio</strong></a><small>Private editorial system</small></div>
        <nav aria-label="Stüdyo bölümleri">
          {sections.map((item) => <button type="button" key={item.id} className={section === item.id ? 'is-active' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span>{item.index}</span>{item.label}</button>)}
        </nav>
        <div className="studio-sidebar__footer"><span>Admin session</span><strong>{userEmail}</strong><button type="button" className="studio-text-button" onClick={() => requestTransition(() => void onLogout())}>Güvenli çıkış</button></div>
      </aside>

      <div className="studio-workspace">
        <header className="studio-mobile-header">
          <button ref={mobileNavigationTriggerRef} type="button" className="studio-icon-button" aria-label={mobileNavigationOpen ? 'Stüdyo menüsünü kapat' : 'Stüdyo menüsünü aç'} aria-controls="studio-navigation" aria-expanded={mobileNavigationOpen} onClick={() => setMobileNavigationOpen((value) => !value)}>☰</button>
          <strong>ACK / Studio</strong>
          <button type="button" className="studio-text-button" onClick={refreshStudio} disabled={loading}>Yenile</button>
        </header>
        <main id="studio-main" tabIndex={-1}>
          {loadErrors.length ? <div className="studio-message studio-message--error" role="alert"><strong>Bazı veri kaynakları yüklenemedi.</strong><ul>{loadErrors.map((item) => <li key={item}>{item}</li>)}</ul><button type="button" className="studio-text-button" onClick={refreshStudio}>Yeniden dene</button></div> : null}
          {actionError ? <p className="studio-message studio-message--error" role="alert">{actionError}</p> : null}
          {actionSuccess ? <p className="studio-message studio-message--success" role="status">{actionSuccess}</p> : null}
          <div className="studio-rebuild-stack">
            <RebuildStatusNotice status={rebuildStatus} onRetry={(request) => void triggerRebuild(request)} />
            <LatestRebuildStatusNotice {...latestRebuildStatus} onRefresh={refreshLatestRebuildStatus} />
          </div>

          {!editorVisible ? (
            <div className="studio-invalid-stack">
              <InvalidRecordsNotice records={projects.invalid} label="proje" />
              <InvalidRecordsNotice records={journal.invalid} label="journal" />
              <InvalidRecordsNotice records={inquiries.invalid} label="inquiry" />
            </div>
          ) : null}

          {projectEditor !== undefined ? <ProjectEditor key={projectEditor?.slug || 'new-project'} initial={projectEditor} onSaved={(saved) => {
            upsertProject(saved);
            setProjectEditor(saved);
            discoverAutomaticRebuild();
          }} onDirtyChange={setEditorDirty} onBusyChange={handleEditorBusy} onRequestClose={() => requestTransition(() => { setProjectEditor(undefined); setEditorDirty(false); setEditorBusy(false); })} /> : null}
          {journalEditor !== undefined ? <JournalEditor key={journalEditor?.slug || 'new-journal'} initial={journalEditor} onSaved={(saved) => {
            upsertJournal(saved);
            setJournalEditor(saved);
            discoverAutomaticRebuild();
          }} onDirtyChange={setEditorDirty} onBusyChange={handleEditorBusy} onRequestClose={() => requestTransition(() => { setJournalEditor(undefined); setEditorDirty(false); setEditorBusy(false); })} /> : null}
          {!editorVisible && section === 'dashboard' ? <Dashboard projects={projects.valid} journal={journal.valid} inquiries={inquiries.valid} onNavigate={navigate} onSeed={() => setSeedOpen(true)} onManualRebuild={() => void triggerRebuild({ reason: 'manual' })} /> : null}
          {!editorVisible && section === 'projects' ? <ProjectList projects={projects.valid} loading={loading} onNew={() => setProjectEditor(null)} onEdit={setProjectEditor} onStatusAction={(kind, item) => setStatusTarget({ kind, item })} /> : null}
          {!editorVisible && section === 'journal' ? <JournalList entries={journal.valid} loading={loading} onNew={() => setJournalEditor(null)} onEdit={setJournalEditor} onStatusAction={(kind, item) => setStatusTarget({ kind, item })} /> : null}
          {!editorVisible && section === 'settings' ? (settingsLoading ? <div className="studio-list-loading">Ayarlar yükleniyor…</div> : settingsSource === 'error' ? <div className="studio-empty-state"><strong>Site ayarları doğrulanamadı.</strong><p>Olası bir mevcut kaydın fallback ile üzerine yazılmasını önlemek için editör kapalı tutuldu.</p><button type="button" className="studio-button studio-button--primary" onClick={refreshStudio}>Yeniden dene</button></div> : <SettingsEditor key={`${settingsSource}-${JSON.stringify(settings)}`} initial={settings} source={settingsSource} onSaved={(saved) => {
            setSettings(saved);
            setSettingsSource('firestore');
            discoverAutomaticRebuild();
          }} onDirtyChange={setEditorDirty} onBusyChange={handleEditorBusy} />) : null}
          {!editorVisible && section === 'inbox' ? <InboxPanel inquiries={inquiries.valid} loading={loading} loadingMore={inquiriesLoadingMore} hasMore={inquiriesHaveMore} onLoadMore={() => void loadMoreInquiries()} onUpdated={(updated) => setInquiries((current) => ({ ...current, valid: current.valid.map((record) => record.documentId === updated.documentId ? updated : record) }))} onDeleted={(documentId) => setInquiries((current) => ({ ...current, valid: current.valid.filter((record) => record.documentId !== documentId) }))} /> : null}
        </main>
      </div>

      <ConfirmDialog open={discardOpen} title="Kaydedilmemiş değişiklikler var" description="Bu görünümden ayrılırsanız son değişiklikler kaybolacak. Bu işlem geri alınamaz." confirmLabel="Değişiklikleri bırak" danger onClose={() => { setDiscardOpen(false); pendingTransition.current = null; }} onConfirm={() => {
        const action = pendingTransition.current;
        pendingTransition.current = null;
        setDiscardOpen(false);
        setEditorDirty(false);
        setEditorBusy(false);
        action?.();
      }} />
      <ConfirmDialog open={Boolean(statusTarget)} title={statusTarget?.item.status === 'archived' ? 'İçeriği geri yükle' : 'İçeriği arşivle'} description={statusTarget?.item.status === 'archived' ? 'Kayıt taslak durumuna döner ve yeniden düzenlenebilir.' : 'Kayıt silinmez; arşiv durumuna alınır ve public listelerden çıkar.'} confirmLabel={statusTarget?.item.status === 'archived' ? 'Taslak olarak geri yükle' : 'Arşivle'} danger={statusTarget?.item.status !== 'archived'} pending={statusPending} onClose={() => setStatusTarget(null)} onConfirm={() => void confirmStatusAction()} />
      <SeedDialog key={seedOpen ? 'seed-open' : 'seed-closed'} open={seedOpen} pending={seedPending} error={seedError} onClose={() => { setSeedOpen(false); setSeedError(null); }} onConfirm={() => void confirmSeed()} />
    </div>
  );
};
