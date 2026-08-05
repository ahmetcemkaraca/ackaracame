import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitInquiry } from './inquiries';

const mocks = vi.hoisted(() => ({
  callable: vi.fn(),
  httpsCallable: vi.fn(),
  requirePublicFirebaseServices: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: mocks.httpsCallable,
}));

vi.mock('./publicClient', () => ({
  requirePublicFirebaseServices: mocks.requirePublicFirebaseServices,
}));

describe('public inquiry Firebase boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePublicFirebaseServices.mockReturnValue({ functions: { name: 'public-functions' } });
    mocks.httpsCallable.mockReturnValue(mocks.callable);
    mocks.callable.mockResolvedValue({ data: { ok: true, id: 'inquiry-1' } });
  });

  it('submits through the public Functions client without admin services', async () => {
    await expect(submitInquiry({
      name: 'Example Person',
      email: 'person@example.com',
      inquiryType: 'employment',
      message: 'This message is long enough to pass the minimum length rule.',
      locale: 'en',
      privacyConsent: true,
      website: '',
    })).resolves.toEqual({ ok: true, id: 'inquiry-1' });

    expect(mocks.requirePublicFirebaseServices).toHaveBeenCalledOnce();
    expect(mocks.httpsCallable).toHaveBeenCalledWith(
      { name: 'public-functions' },
      'submitInquiry',
      { limitedUseAppCheckTokens: true },
    );
    expect(mocks.callable).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Example Person',
      email: 'person@example.com',
    }));
    expect(mocks.callable.mock.calls[0]?.[0]).not.toHaveProperty('status');
  });
});
