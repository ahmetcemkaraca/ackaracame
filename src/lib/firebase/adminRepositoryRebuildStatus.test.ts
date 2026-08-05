import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestSiteRebuildStatus } from './adminRepository';

const mocks = vi.hoisted(() => ({
  callable: vi.fn(),
  httpsCallable: vi.fn(),
  functions: { name: 'admin-functions' },
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: mocks.httpsCallable,
}));

vi.mock('./client', () => ({
  requireFirebaseServices: () => ({ functions: mocks.functions }),
}));

const idleStatus = {
  ok: true as const,
  targetRevision: 0,
  state: 'idle' as const,
  requestedRevision: 0,
  hookAcceptedRevision: 0,
  activeRevision: 4,
  queueStatus: 'unknown' as const,
  deploymentStatus: 'active' as const,
  failureCode: null,
  activeDeploymentId: 'active-deployment',
};

describe('latest site rebuild status repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.httpsCallable.mockReturnValue(mocks.callable);
  });

  it('uses the admin no-input callable and accepts an idle queue with an existing active deployment', async () => {
    mocks.callable.mockResolvedValue({ data: idleStatus });

    await expect(getLatestSiteRebuildStatus()).resolves.toEqual(idleStatus);
    expect(mocks.httpsCallable).toHaveBeenCalledWith(
      mocks.functions,
      'getLatestSiteRebuildStatus',
      { limitedUseAppCheckTokens: true },
    );
    expect(mocks.callable).toHaveBeenCalledWith();
  });

  it('accepts a bounded automatic debounce queue state', async () => {
    const queued = {
      ...idleStatus,
      targetRevision: 7,
      state: 'awaiting-hook' as const,
      requestedRevision: 7,
      activeRevision: 6,
      queueStatus: 'queued' as const,
      deploymentStatus: 'active' as const,
    };
    mocks.callable.mockResolvedValue({ data: queued });

    await expect(getLatestSiteRebuildStatus()).resolves.toEqual(queued);
  });

  it('rejects inconsistent idle and unbounded response shapes', async () => {
    mocks.callable
      .mockResolvedValueOnce({ data: { ...idleStatus, requestedRevision: 1 } })
      .mockResolvedValueOnce({ data: { ...idleStatus, unexpected: true } });

    await expect(getLatestSiteRebuildStatus()).rejects.toThrow(/invalid response/i);
    await expect(getLatestSiteRebuildStatus()).rejects.toThrow(/invalid response/i);
  });
});
