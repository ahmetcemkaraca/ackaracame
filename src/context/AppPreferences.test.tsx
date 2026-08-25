import { renderHook, act } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { AppPreferencesProvider, useAppPreferences } from './AppPreferences';

describe('AppPreferencesProvider', () => {
  beforeEach(() => window.localStorage.clear());

  it('persists locale as a non-authoritative preference', () => {
    const { result } = renderHook(() => useAppPreferences(), { wrapper: AppPreferencesProvider });

    act(() => {
      result.current.setLocale('en');
    });

    expect(result.current.locale).toBe('en');
    expect(window.localStorage.getItem('ack.locale')).toBe('en');
  });

  it('reflects a theme override on the document root', () => {
    const { result } = renderHook(() => useAppPreferences(), { wrapper: AppPreferencesProvider });
    act(() => result.current.setTheme('dark'));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('lets the route locale override a stale stored preference', () => {
    window.localStorage.setItem('ack.locale', 'en');
    const onLocaleChange = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppPreferencesProvider routeLocale="tr" onLocaleChange={onLocaleChange}>{children}</AppPreferencesProvider>
    );
    const { result } = renderHook(() => useAppPreferences(), { wrapper });

    expect(result.current.locale).toBe('tr');
    act(() => result.current.setLocale('en'));
    expect(onLocaleChange).toHaveBeenCalledWith('en');
    expect(window.localStorage.getItem('ack.locale')).toBe('en');
  });

  it('uses the configured site default when a permanent URL has no saved locale', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppPreferencesProvider defaultLocale="en">{children}</AppPreferencesProvider>
    );
    const { result } = renderHook(() => useAppPreferences(), { wrapper });
    expect(result.current.locale).toBe('en');
  });
});
