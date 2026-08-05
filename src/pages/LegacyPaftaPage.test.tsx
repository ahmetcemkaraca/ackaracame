import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { beforeEach, vi } from 'vitest';
import { AppPreferencesProvider } from '../context/AppPreferences';
import LegacyPaftaPage, {
  isValidLegacyPaftaCode,
  loadPublishedPafta,
  parseLegacyPaftaResponse,
} from './LegacyPaftaPage';

const mocks = vi.hoisted(() => ({
  callable: vi.fn(),
  getPublicFirebaseServices: vi.fn(),
  httpsCallable: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: mocks.httpsCallable,
}));

vi.mock('../lib/firebase/publicClient', () => ({
  getPublicFirebaseServices: mocks.getPublicFirebaseServices,
}));

const code = 'pafta-1722796800000-a1b2c3d4e';
const approvedImage = 'https://firebasestorage.googleapis.com/v0/b/ackaracame/o/images%2Fpaftas%2Fboard.webp?alt=media';
const publishedPafta = {
  title: 'Kadıköy Kentsel Arayüzü',
  description: 'Fiziksel sunumu dijital bir okuma katmanıyla genişleten çalışma.',
  semester: 'Bahar',
  year: '2025',
  course: 'Mimari Tasarım',
  professor: 'Dr. Öğr. Üyesi A. Yılmaz',
  technologies: ['Rhino', 'Illustrator'],
  images: [approvedImage],
};

describe('legacy pafta safety boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicFirebaseServices.mockReturnValue({ functions: { name: 'functions' } });
    mocks.httpsCallable.mockReturnValue(mocks.callable);
    mocks.callable.mockResolvedValue({ data: { ok: true, pafta: publishedPafta } });
  });

  it('accepts only the exact QR shape emitted by the historical generator', () => {
    expect(isValidLegacyPaftaCode(code)).toBe(true);
    expect(isValidLegacyPaftaCode('PAFTA-1722796800000-a1b2c3d4e')).toBe(false);
    expect(isValidLegacyPaftaCode('pafta-1722796800000-a1b2c3d4e?admin=true')).toBe(false);
    expect(isValidLegacyPaftaCode('pafta-1722796800000-../../admin')).toBe(false);
    expect(isValidLegacyPaftaCode('pafta-123-a1b2c3d4e')).toBe(false);
  });

  it('fails an invalid route before initializing Firebase', () => {
    const location = memoryLocation({ path: '/pafta/not-valid', static: true });
    render(
      <Router hook={location.hook}>
        <AppPreferencesProvider>
          <LegacyPaftaPage />
        </AppPreferencesProvider>
      </Router>,
    );

    expect(screen.getByRole('heading', { name: 'Bu QR kod biçimi tanınmıyor.' })).toBeInTheDocument();
    expect(mocks.getPublicFirebaseServices).not.toHaveBeenCalled();
    expect(mocks.httpsCallable).not.toHaveBeenCalled();
  });

  it('rejects unknown response fields and non-allowlisted media hosts', () => {
    expect(() => parseLegacyPaftaResponse({
      ok: true,
      pafta: { ...publishedPafta, secret: 'must-not-render' },
    })).toThrow(/invalid response/i);

    expect(() => parseLegacyPaftaResponse({
      ok: true,
      pafta: { ...publishedPafta, images: ['https://attacker.example/board.webp'] },
    })).toThrow(/invalid response/i);
  });

  it('lazy-calls the protected public projection with only the validated code', async () => {
    await expect(loadPublishedPafta(code)).resolves.toEqual(publishedPafta);
    expect(mocks.httpsCallable).toHaveBeenCalledWith(
      { name: 'functions' },
      'getPublishedPafta',
      { limitedUseAppCheckTokens: true },
    );
    expect(mocks.callable).toHaveBeenCalledWith({ code });
  });

  it('renders the approved projection as text and keeps the route noindex', async () => {
    const location = memoryLocation({ path: `/pafta/${code}`, static: true });
    mocks.callable.mockResolvedValue({
      data: {
        ok: true,
        pafta: {
          ...publishedPafta,
          title: '<img src=x onerror=alert(1)>',
        },
      },
    });

    render(
      <Router hook={location.hook}>
        <AppPreferencesProvider>
          <LegacyPaftaPage />
        </AppPreferencesProvider>
      </Router>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Dijital pafta yükleniyor');
    expect(await screen.findByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Pafta görseli 1/ })).toHaveAttribute('src', approvedImage);
    expect(document.querySelector('img[src="x"]')).not.toBeInTheDocument();
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow'));
  });

  it('offers an accessible retry and distinguishes a safe not-found response', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const location = memoryLocation({ path: `/pafta/${code}`, static: true });
    mocks.callable
      .mockRejectedValueOnce(new Error('internal deployment detail'))
      .mockResolvedValueOnce({ data: { ok: true, pafta: null } });

    render(
      <Router hook={location.hook}>
        <AppPreferencesProvider>
          <LegacyPaftaPage />
        </AppPreferencesProvider>
      </Router>,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Dijital pafta güvenli biçimde yüklenemedi.');
    expect(alert).not.toHaveTextContent('internal deployment detail');
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }));

    expect(await screen.findByRole('heading', { name: 'Bu dijital pafta artık yayında değil.' })).toBeInTheDocument();
    expect(mocks.callable).toHaveBeenCalledTimes(2);
    warning.mockRestore();
  });
});
