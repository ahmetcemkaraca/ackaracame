import type {
  SiteRebuildRequest,
  SiteRebuildStatusResult,
} from '../../lib/firebase/adminRepository';

export type RebuildStatus =
  | { state: 'idle' }
  | { state: 'requesting'; request: SiteRebuildRequest }
  | {
      state: 'deploying';
      request: SiteRebuildRequest;
      requestId: string;
      revision: number;
      acceptedRevision: number;
      coalesced: boolean;
    }
  | {
      state: 'deployed';
      request: SiteRebuildRequest;
      requestId: string;
      revision: number;
      activeRevision: number;
      deploymentId: string | null;
    }
  | { state: 'failed'; request: SiteRebuildRequest; error: string };

export const RebuildStatusNotice = ({
  status,
  onRetry,
}: {
  status: RebuildStatus;
  onRetry: (request: SiteRebuildRequest) => void;
}) => {
  if (status.state === 'idle') return null;
  if (status.state === 'requesting') {
    return (
      <aside className="studio-rebuild-notice studio-rebuild-notice--pending" role="status">
        <span className="studio-spinner" aria-hidden="true" />
        <div><small>Manual · exact revision monitor</small><strong>Rebuild isteği gönderiliyor.</strong><p>Statik site ve SEO için güvenli dağıtım hattı çağrılıyor…</p></div>
      </aside>
    );
  }
  if (status.state === 'deploying') {
    return (
      <aside className="studio-rebuild-notice studio-rebuild-notice--pending" role="status">
        <span aria-hidden="true">↗</span>
        <div><small>Manual · exact revision monitor</small><strong>Rebuild hook’u kabul edildi; dağıtım sonucu bekleniyor.</strong><p>{status.coalesced ? 'Değişiklik önceki istekle birleştirildi ve kaybolmadan hook’a ulaştı.' : 'Dağıtım hattı isteği kabul etti.'} Bu bildirim henüz canlı site başarısı değildir. Hedef revizyon: {status.revision} · Hook revizyonu: {status.acceptedRevision} · İstek: {status.requestId}</p></div>
      </aside>
    );
  }
  if (status.state === 'deployed') {
    return (
      <aside className="studio-rebuild-notice studio-rebuild-notice--success" role="status">
        <span aria-hidden="true">✓</span>
        <div><small>Manual · exact revision monitor</small><strong>Statik dağıtım canlı olarak doğrulandı.</strong><p>Revizyon {status.revision}, aktif yayın revizyonu {status.activeRevision}.{status.deploymentId ? ` Dağıtım: ${status.deploymentId}` : ''}</p></div>
      </aside>
    );
  }
  return (
    <aside className="studio-rebuild-notice studio-rebuild-notice--failed" role="alert">
      <span aria-hidden="true">!</span>
      <div><small>Manual · exact revision monitor</small><strong>Statik site henüz güncellenmedi.</strong><p>{status.error} Rebuild isteğini yeniden deneyebilirsiniz; mevcut Firestore içeriği değişmeden korunur.</p></div>
      <button type="button" className="studio-button studio-button--danger" onClick={() => onRetry(status.request)}>Rebuild’i yeniden dene</button>
    </aside>
  );
};

const latestRebuildPresentation = (status: SiteRebuildStatusResult) => {
  const revision = status.targetRevision;
  if (status.state === 'idle') {
    return {
      label: 'Idle',
      title: 'Bekleyen otomatik rebuild yok.',
      body: status.activeRevision > 0
        ? `Son doğrulanan canlı revizyon ${status.activeRevision}.`
        : 'Henüz sunucu tarafından istenmiş bir rebuild bulunmuyor.',
      tone: 'pending' as const,
    };
  }
  if (
    status.state === 'hook-failed'
    || status.state === 'deploy-failed'
    || status.queueStatus === 'failed'
    || ['prepare-failed', 'finalize-failed', 'aborted'].includes(status.deploymentStatus)
  ) {
    return {
      label: 'Başarısız',
      title: status.state === 'hook-failed' ? 'Otomatik rebuild hook aşamasında başarısız.' : 'Otomatik dağıtım başarısız.',
      body: `Revizyon ${revision} tamamlanamadı (${status.failureCode ?? status.deploymentStatus}). Firestore içeriği korunuyor; manuel recovery kullanılabilir.`,
      tone: 'failed' as const,
    };
  }
  if (status.state === 'active') {
    return {
      label: 'Canlı',
      title: 'Otomatik rebuild canlı olarak doğrulandı.',
      body: `Hedef revizyon ${revision}; aktif revizyon ${status.activeRevision}.${status.activeDeploymentId ? ` Dağıtım: ${status.activeDeploymentId}` : ''}`,
      tone: 'success' as const,
    };
  }
  if (status.state === 'awaiting-hook' && status.queueStatus === 'queued') {
    return {
      label: 'Kuyrukta',
      title: 'Otomatik rebuild dayanıklı kuyrukta.',
      body: `Revizyon ${revision} sunucu outbox’ında bekliyor; hook henüz kabul edilmedi.`,
      tone: 'pending' as const,
    };
  }
  if (status.state === 'awaiting-hook' || status.state === 'dispatching') {
    return {
      label: 'Hook',
      title: 'Otomatik rebuild hook’a gönderiliyor.',
      body: `Revizyon ${revision} güvenli dağıtım hattına aktarılıyor.`,
      tone: 'pending' as const,
    };
  }
  if (status.deploymentStatus === 'finalizing') {
    return {
      label: 'Deploy',
      title: 'Otomatik deploy etkinleştiriliyor.',
      body: `Revizyon ${revision} build aşamasını geçti; canlı yayın doğrulaması bekleniyor.`,
      tone: 'pending' as const,
    };
  }
  return {
    label: 'Build',
    title: status.deploymentStatus === 'prepared' ? 'Otomatik build hazır.' : 'Otomatik build hazırlanıyor.',
    body: `Revizyon ${revision} için hook kabul edildi; build/deploy hattı izleniyor.`,
    tone: 'pending' as const,
  };
};

export const LatestRebuildStatusNotice = ({
  result,
  loading,
  error,
  onRefresh,
}: {
  result: SiteRebuildStatusResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) => {
  if (!result && loading) {
    return (
      <aside className="studio-rebuild-notice studio-rebuild-notice--pending" role="status">
        <span className="studio-spinner" aria-hidden="true" />
        <div><strong>Sunucu rebuild durumu okunuyor.</strong><p>Otomatik outbox ve canlı dağıtım revizyonu doğrulanıyor…</p></div>
      </aside>
    );
  }
  if (!result) {
    return (
      <aside className="studio-rebuild-notice studio-rebuild-notice--failed" role="alert">
        <span aria-hidden="true">!</span>
        <div><strong>Otomatik rebuild durumu okunamadı.</strong><p>{error || 'Bilinmeyen durum okuma hatası.'} İçerik kaydı bundan etkilenmedi.</p></div>
        <button type="button" className="studio-button studio-button--danger" onClick={onRefresh} disabled={loading}>Durumu yeniden oku</button>
      </aside>
    );
  }

  const presentation = latestRebuildPresentation(result);
  return (
    <aside className={`studio-rebuild-notice studio-rebuild-notice--${error ? 'failed' : presentation.tone}`} role={error || presentation.tone === 'failed' ? 'alert' : 'status'}>
      <span aria-hidden="true">{presentation.tone === 'success' ? '✓' : presentation.tone === 'failed' || error ? '!' : '↗'}</span>
      <div>
        <small>{presentation.label} · automatic outbox</small>
        <strong>{presentation.title}</strong>
        <p>{presentation.body}{error ? ` Son durum yenilemesi başarısız: ${error}` : ''}</p>
      </div>
      <button type="button" className="studio-button studio-button--quiet" onClick={onRefresh} disabled={loading}>{loading ? 'Okunuyor…' : 'Durumu yenile'}</button>
    </aside>
  );
};
