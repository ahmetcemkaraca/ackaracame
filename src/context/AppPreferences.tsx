import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';

export type Locale = 'tr' | 'en';
export type ThemePreference = 'light' | 'dark' | 'system';
export type VisitorLens = 'hire' | 'explore';

interface AppPreferencesValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
  motionEnabled: boolean;
  setMotionEnabled: (enabled: boolean) => void;
  lens: VisitorLens;
  setLens: (lens: VisitorLens) => void;
}

interface AppPreferencesProviderProps extends PropsWithChildren {
  routeLocale?: Locale;
  defaultLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

const AppPreferencesContext = createContext<AppPreferencesValue | null>(null);

const PREFERENCE_EVENT = 'ack-preferences-changed';

const preferenceSnapshot = () => {
  try {
    return [
      window.localStorage.getItem('ack.locale') ?? '',
      window.localStorage.getItem('ack.theme') ?? '',
      window.localStorage.getItem('ack.lens') ?? '',
      window.localStorage.getItem('ack.motion') ?? '',
    ].join('|');
  } catch {
    return '';
  }
};

const subscribePreferences = (notify: () => void) => {
  window.addEventListener(PREFERENCE_EVENT, notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, notify);
    window.removeEventListener('storage', notify);
  };
};

const mediaSnapshot = (query: string) => window.matchMedia?.(query).matches ?? false;
const subscribeMedia = (query: string, notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};

const writePreference = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(PREFERENCE_EVENT));
  } catch {
    // Preferences are intentionally non-authoritative; privacy modes may block storage.
  }
};

export const AppPreferencesProvider = ({ children, routeLocale, defaultLocale = 'tr', onLocaleChange }: AppPreferencesProviderProps) => {
  const stored = useSyncExternalStore(subscribePreferences, preferenceSnapshot, () => '');
  const [storedLocale = '', storedTheme = '', storedLens = '', storedMotion = ''] = stored.split('|');
  const locale: Locale = routeLocale ?? (storedLocale === 'tr' || storedLocale === 'en' ? storedLocale : defaultLocale);
  const theme: ThemePreference = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system';
  const lens: VisitorLens = storedLens === 'explore' ? 'explore' : 'hire';
  const motionOverride: 'on' | 'off' | null = storedMotion === 'on' || storedMotion === 'off' ? storedMotion : null;
  const systemDark = useSyncExternalStore(
    (notify) => subscribeMedia('(prefers-color-scheme: dark)', notify),
    () => mediaSnapshot('(prefers-color-scheme: dark)'),
    () => false,
  );
  const systemReducedMotion = useSyncExternalStore(
    (notify) => subscribeMedia('(prefers-reduced-motion: reduce)', notify),
    () => mediaSnapshot('(prefers-reduced-motion: reduce)'),
    () => false,
  );

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const motionEnabled = motionOverride === null ? !systemReducedMotion : motionOverride === 'on';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off';
  }, [motionEnabled]);

  const setLocale = useCallback((next: Locale) => {
    writePreference('ack.locale', next);
    onLocaleChange?.(next);
  }, [onLocaleChange]);

  const setTheme = useCallback((next: ThemePreference) => {
    writePreference('ack.theme', next);
  }, []);

  const setLens = useCallback((next: VisitorLens) => {
    writePreference('ack.lens', next);
  }, []);

  const setMotionEnabled = useCallback((enabled: boolean) => {
    const next = enabled ? 'on' : 'off';
    writePreference('ack.motion', next);
  }, []);

  const value = useMemo<AppPreferencesValue>(() => ({
    locale,
    setLocale,
    theme,
    resolvedTheme,
    setTheme,
    motionEnabled,
    setMotionEnabled,
    lens,
    setLens,
  }), [locale, setLocale, theme, resolvedTheme, setTheme, motionEnabled, setMotionEnabled, lens, setLens]);

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export const useAppPreferences = () => {
  const value = useContext(AppPreferencesContext);
  if (!value) throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  return value;
};

export const localize = <T extends { tr: string; en: string }>(value: T, locale: Locale) => value[locale];
