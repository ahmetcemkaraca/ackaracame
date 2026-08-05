import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { journalEntries, portfolioProjects, siteSettings } from '../../data/portfolio';
import type { JournalEntry, PortfolioProject, SiteSettings } from '../../domain/content';
import {
  archiveContent,
  getLatestSiteRebuildStatus,
  getSiteRebuildStatus,
  loadAdminJournal,
  loadAdminProjects,
  loadInquiries,
  loadSiteSettings,
  requestSiteRebuild,
  seedFallbackContent,
} from '../../lib/firebase/adminRepository';
import { StudioWorkspace } from './StudioWorkspace';

vi.mock('../../lib/firebase/adminRepository', () => ({
  archiveContent: vi.fn(() => Promise.resolve()),
  getLatestSiteRebuildStatus: vi.fn(),
  getSiteRebuildStatus: vi.fn(() => Promise.resolve({
    ok: true,
    targetRevision: 7,
    state: 'active',
    requestedRevision: 7,
    hookAcceptedRevision: 7,
    activeRevision: 7,
    queueStatus: 'hook-accepted',
    deploymentStatus: 'active',
    failureCode: null,
    activeDeploymentId: 'manual-deployment',
  })),
  loadAdminJournal: vi.fn(),
  loadAdminProjects: vi.fn(),
  loadInquiries: vi.fn(),
  loadSiteSettings: vi.fn(),
  requestSiteRebuild: vi.fn(() => Promise.resolve({
    ok: true,
    status: 'hook-accepted',
    requestId: 'manual-rebuild-request',
    revision: 7,
    acceptedRevision: 7,
    coalesced: false,
  })),
  restoreContent: vi.fn(() => Promise.resolve()),
  seedFallbackContent: vi.fn(() => Promise.resolve({
    ok: true,
    manifestHash: 'manifest-hash',
    ids: ['projects/draw-or-die', 'journal/mekan-ve-arayuz-arasinda'],
    createdCount: 2,
    skippedCount: 0,
  })),
}));

vi.mock('./ProjectEditor', () => ({
  ProjectEditor: ({
    initial,
    onSaved,
  }: {
    initial: PortfolioProject | null;
    onSaved: (project: PortfolioProject) => void;
  }) => (
    <button type="button" onClick={() => initial && onSaved(initial)}>
      Test projesini kaydet
    </button>
  ),
}));

vi.mock('./JournalEditor', () => ({
  JournalEditor: ({
    initial,
    onSaved,
  }: {
    initial: JournalEntry | null;
    onSaved: (entry: JournalEntry) => void;
  }) => (
    <button type="button" onClick={() => initial && onSaved(initial)}>
      Test yazısını kaydet
    </button>
  ),
}));

vi.mock('./SettingsEditor', () => ({
  SettingsEditor: ({
    initial,
    onSaved,
  }: {
    initial: SiteSettings;
    onSaved: (settings: SiteSettings) => void;
  }) => (
    <button type="button" onClick={() => onSaved(initial)}>
      Test ayarlarını kaydet
    </button>
  ),
}));

describe('StudioWorkspace rebuild ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadAdminJournal).mockResolvedValue({
      valid: journalEntries[0] ? [journalEntries[0]] : [],
      invalid: [],
    });
    vi.mocked(loadAdminProjects).mockResolvedValue({
      valid: portfolioProjects[0] ? [portfolioProjects[0]] : [],
      invalid: [],
    });
    vi.mocked(loadInquiries).mockResolvedValue({
      valid: [],
      invalid: [],
      nextCursor: null,
      hasMore: false,
    });
    vi.mocked(loadSiteSettings).mockResolvedValue(siteSettings);
    vi.mocked(getLatestSiteRebuildStatus).mockResolvedValue({
      ok: true,
      targetRevision: 0,
      state: 'idle',
      requestedRevision: 0,
      hookAcceptedRevision: 0,
      activeRevision: 0,
      queueStatus: 'unknown',
      deploymentStatus: 'unknown',
      failureCode: null,
      activeDeploymentId: null,
    });
  });

  it('lets server onWrite own save, settings, archive, and seed rebuilds while preserving explicit manual rebuild', async () => {
    const project = portfolioProjects[0];
    const entry = journalEntries[0];
    if (!project || !entry) throw new Error('Expected content fixtures.');

    render(<StudioWorkspace userEmail="admin@example.com" onLogout={vi.fn()} />);

    await waitFor(() => expect(getLatestSiteRebuildStatus).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Bekleyen otomatik rebuild yok.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Durumu yenile' }));
    await waitFor(() => expect(getLatestSiteRebuildStatus).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: /Projects/ }));
    await screen.findByRole('button', { name: new RegExp(project.title.tr) });
    fireEvent.click(screen.getByRole('button', { name: new RegExp(project.title.tr) }));
    vi.mocked(getLatestSiteRebuildStatus).mockResolvedValue({
      ok: true,
      targetRevision: 8,
      state: 'awaiting-hook',
      requestedRevision: 8,
      hookAcceptedRevision: 7,
      activeRevision: 7,
      queueStatus: 'queued',
      deploymentStatus: 'active',
      failureCode: null,
      activeDeploymentId: 'deployment-7',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Test projesini kaydet' }));
    await waitFor(() => expect(getLatestSiteRebuildStatus).toHaveBeenCalledTimes(3));
    expect(await screen.findByText('Otomatik rebuild dayanıklı kuyrukta.')).toBeInTheDocument();
    vi.mocked(getLatestSiteRebuildStatus).mockResolvedValue({
      ok: true,
      targetRevision: 8,
      state: 'active',
      requestedRevision: 8,
      hookAcceptedRevision: 8,
      activeRevision: 8,
      queueStatus: 'hook-accepted',
      deploymentStatus: 'active',
      failureCode: null,
      activeDeploymentId: 'deployment-8',
    });
    expect(await screen.findByText('Otomatik rebuild canlı olarak doğrulandı.', {}, { timeout: 3000 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Journal/ }));
    await screen.findByRole('button', { name: new RegExp(entry.title.tr) });
    fireEvent.click(screen.getByRole('button', { name: new RegExp(entry.title.tr) }));
    fireEvent.click(screen.getByRole('button', { name: 'Test yazısını kaydet' }));

    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Test ayarlarını kaydet' }));

    fireEvent.click(screen.getByRole('button', { name: /Projects/ }));
    await screen.findByRole('button', { name: 'Arşivle' });
    fireEvent.click(screen.getByRole('button', { name: 'Arşivle' }));
    const dialog = await screen.findByRole('dialog', { name: 'İçeriği arşivle' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Arşivle' }));

    await waitFor(() => expect(archiveContent).toHaveBeenCalledWith('projects', project.slug));
    expect(screen.getByText(/Proje arşivlendi; rebuild sunucu tarafındaki dayanıklı içerik senkronizasyon kuyruğuna alındı/)).toBeInTheDocument();
    expect(screen.getByText(/Proje arşivlendi/)).toHaveTextContent('canlı dağıtım onayı değildir');
    expect(requestSiteRebuild).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Overview/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Riskli işlemi aç' }));
    fireEvent.change(screen.getByLabelText('Onay ifadesi'), { target: { value: 'SEED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Riski kabul et ve yaz' }));

    await waitFor(() => expect(seedFallbackContent).toHaveBeenCalledTimes(1));
    const seedSuccess = await screen.findByText(/2 eksik başlangıç kaydı oluşturuldu/);
    expect(seedSuccess).toHaveTextContent('sunucu tarafındaki dayanıklı içerik senkronizasyon kuyruğuna alındı');
    expect(seedSuccess).toHaveTextContent('canlı dağıtım onayı değildir');
    expect(requestSiteRebuild).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Manuel rebuild iste' }));
    await waitFor(() => expect(requestSiteRebuild).toHaveBeenCalledWith({ reason: 'manual' }));
    expect(await screen.findByText(/Rebuild hook’u kabul edildi/)).toBeInTheDocument();
    await waitFor(() => expect(getSiteRebuildStatus).toHaveBeenCalledWith(7), { timeout: 3000 });
    expect(await screen.findByText('Statik dağıtım canlı olarak doğrulandı.')).toBeInTheDocument();
  }, 15_000);
});
