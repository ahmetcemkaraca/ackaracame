import type { Locale } from '../context/AppPreferences';

export const SITE_ORIGIN = 'https://ackaraca.me';
export const ENGLISH_PREFIX = '/en';

const OWNER_ONLY_ROUTES = [
  '/studio',
  '/admin',
] as const;

const LOCALE_NEUTRAL_PUBLIC_ROUTES = [
  '/account-delete',
  '/dua',
  '/wheretogo',
  '/all',
  '/pafta',
] as const;

const normalizePathname = (value: string) => {
  const withoutSuffix = value.split(/[?#]/, 1)[0] || '/';
  const withLeadingSlash = withoutSuffix.startsWith('/') ? withoutSuffix : `/${withoutSuffix}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash;
};

const hasRoutePrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export const localeFromPath = (path: string): Locale => {
  const pathname = normalizePathname(path);
  return hasRoutePrefix(pathname, ENGLISH_PREFIX) ? 'en' : 'tr';
};

export const stripLocalePrefix = (path: string) => {
  const pathname = normalizePathname(path);
  if (pathname === ENGLISH_PREFIX) return '/';
  return pathname.startsWith(`${ENGLISH_PREFIX}/`) ? pathname.slice(ENGLISH_PREFIX.length) : pathname;
};

export const isPermanentlyUnprefixedPath = (path: string) => {
  const pathname = stripLocalePrefix(path);
  return [...OWNER_ONLY_ROUTES, ...LOCALE_NEUTRAL_PUBLIC_ROUTES].some((prefix) => hasRoutePrefix(pathname, prefix));
};

export const isLocaleNeutralPublicPath = (path: string) => {
  const pathname = stripLocalePrefix(path);
  return LOCALE_NEUTRAL_PUBLIC_ROUTES.some((prefix) => hasRoutePrefix(pathname, prefix));
};

export const localePath = (path: string, locale: Locale) => {
  const pathname = stripLocalePrefix(path);
  if (isPermanentlyUnprefixedPath(pathname)) return pathname;
  if (locale === 'tr') return pathname;
  return pathname === '/' ? ENGLISH_PREFIX : `${ENGLISH_PREFIX}${pathname}`;
};

export const absoluteLocaleUrl = (path: string, locale: Locale) =>
  new URL(localePath(path, locale), `${SITE_ORIGIN}/`).toString();

export interface LocaleAlternates {
  tr: string;
  en: string;
  xDefault: string;
}

export const localeAlternates = (path: string, defaultLocale: Locale = 'tr'): LocaleAlternates | undefined => {
  if (isPermanentlyUnprefixedPath(path)) return undefined;
  const tr = absoluteLocaleUrl(path, 'tr');
  const en = absoluteLocaleUrl(path, 'en');
  return {
    tr,
    en,
    xDefault: defaultLocale === 'en' ? en : tr,
  };
};
