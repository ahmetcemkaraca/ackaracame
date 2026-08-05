import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { SiteRebuildStatusResult } from '../../lib/firebase/adminRepository';
import {
  LatestRebuildStatusNotice,
  RebuildStatusNotice,
} from './RebuildStatusNotice';

const latestStatus = (patch: Partial<SiteRebuildStatusResult> = {}): SiteRebuildStatusResult => ({
  ok: true,
  targetRevision: 12,
  state: 'awaiting-hook',
  requestedRevision: 12,
  hookAcceptedRevision: 11,
  activeRevision: 11,
  queueStatus: 'queued',
  deploymentStatus: 'active',
  failureCode: null,
  activeDeploymentId: 'deployment-11',
  ...patch,
});

describe('RebuildStatusNotice', () => {
  it('keeps a failed static rebuild visible and retries the same request', () => {
    const retry = vi.fn();
    const request = {
      reason: 'content-updated' as const,
      paths: ['projects/atlas'],
    };

    render(
      <RebuildStatusNotice
        status={{ state: 'failed', request, error: 'Deploy hook unavailable.' }}
        onRetry={retry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Statik site henüz güncellenmedi.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('mevcut Firestore içeriği değişmeden korunur.');
    fireEvent.click(screen.getByRole('button', { name: 'Rebuild’i yeniden dene' }));
    expect(retry).toHaveBeenCalledWith(request);
  });

  it('states that an accepted hook is not a completed deployment', () => {
    render(
      <RebuildStatusNotice
        status={{
          state: 'deploying',
          request: { reason: 'settings-updated', paths: ['siteSettings/main'] },
          requestId: 'rebuild-request-id',
          revision: 7,
          acceptedRevision: 8,
          coalesced: true,
        }}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Bu bildirim henüz canlı site başarısı değildir.',
    );
    expect(screen.getByRole('status')).toHaveTextContent('rebuild-request-id');
    expect(screen.getByRole('status')).toHaveTextContent('Hedef revizyon: 7');
    expect(screen.getByRole('status')).toHaveTextContent('Hook revizyonu: 8');
    expect(screen.getByRole('status')).toHaveTextContent('kaybolmadan hook’a ulaştı');
  });

  it('shows success only after an active deployment revision is observed', () => {
    render(
      <RebuildStatusNotice
        status={{
          state: 'deployed',
          request: { reason: 'content-updated', paths: ['projects/atlas'] },
          requestId: 'rebuild-request-id',
          revision: 9,
          activeRevision: 10,
          deploymentId: 'r10-deployment',
        }}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('canlı olarak doğrulandı');
    expect(screen.getByRole('status')).toHaveTextContent('aktif yayın revizyonu 10');
  });

  it('makes every automatic outbox stage and explicit refresh visible', () => {
    const refresh = vi.fn();
    const { rerender } = render(
      <LatestRebuildStatusNotice
        result={latestStatus()}
        loading={false}
        error={null}
        onRefresh={refresh}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Kuyrukta · automatic outbox');
    expect(screen.getByRole('status')).toHaveTextContent('dayanıklı kuyrukta');

    rerender(<LatestRebuildStatusNotice result={latestStatus({ state: 'dispatching', queueStatus: 'dispatching' })} loading={false} error={null} onRefresh={refresh} />);
    expect(screen.getByRole('status')).toHaveTextContent('Hook · automatic outbox');

    rerender(<LatestRebuildStatusNotice result={latestStatus({ state: 'deploying', queueStatus: 'hook-accepted', deploymentStatus: 'preparing' })} loading={false} error={null} onRefresh={refresh} />);
    expect(screen.getByRole('status')).toHaveTextContent('Build · automatic outbox');

    rerender(<LatestRebuildStatusNotice result={latestStatus({ state: 'deploying', queueStatus: 'hook-accepted', deploymentStatus: 'finalizing' })} loading={false} error={null} onRefresh={refresh} />);
    expect(screen.getByRole('status')).toHaveTextContent('Deploy · automatic outbox');

    rerender(<LatestRebuildStatusNotice result={latestStatus({ state: 'active', queueStatus: 'hook-accepted', deploymentStatus: 'active', activeRevision: 12 })} loading={false} error={null} onRefresh={refresh} />);
    expect(screen.getByRole('status')).toHaveTextContent('Canlı · automatic outbox');

    rerender(<LatestRebuildStatusNotice result={latestStatus({ state: 'deploy-failed', queueStatus: 'hook-accepted', deploymentStatus: 'finalize-failed', failureCode: 'deploy-failed' })} loading={false} error={null} onRefresh={refresh} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Başarısız · automatic outbox');

    fireEvent.click(screen.getByRole('button', { name: 'Durumu yenile' }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
