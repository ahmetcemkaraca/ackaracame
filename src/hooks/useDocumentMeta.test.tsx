import { renderHook } from '@testing-library/react';
import { useDocumentMeta } from './useDocumentMeta';

const alternate = (hrefLang: string) =>
  document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hrefLang}"]`)?.href;

describe('useDocumentMeta locale metadata', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('publishes an English canonical and reciprocal language alternates', () => {
    renderHook(() => useDocumentMeta({
      title: 'Work — Ahmet Cem Karaca',
      description: 'Selected work.',
      path: '/work',
      locale: 'en',
    }));

    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://ackaraca.me/en/work');
    expect(alternate('tr')).toBe('https://ackaraca.me/work');
    expect(alternate('en')).toBe('https://ackaraca.me/en/work');
    expect(alternate('x-default')).toBe('https://ackaraca.me/work');
    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://ackaraca.me/en/work');
  });

  it('does not invent localized variants for permanent product-policy URLs', () => {
    renderHook(() => useDocumentMeta({
      title: 'WhereToGo privacy policy',
      description: 'Privacy policy.',
      path: '/wheretogo/privacy',
      locale: 'tr',
    }));

    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://ackaraca.me/wheretogo/privacy');
    expect(document.querySelector('link[rel="alternate"]')).not.toBeInTheDocument();
  });
});
