import { useCallback } from 'react';
import { useRouter } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import {
  ENGLISH_PREFIX,
  isPermanentlyUnprefixedPath,
  localePath,
  stripLocalePrefix,
} from '../lib/localeRouting';

export const localeHrefForRouter = (path: string, locale: 'tr' | 'en', base: string) => {
  if (base !== ENGLISH_PREFIX) return localePath(path, locale);
  const pathname = stripLocalePrefix(path);
  // `~` is Wouter's explicit escape from a nested router base. Permanent
  // product-policy and owner routes must never become `/en/...`.
  return isPermanentlyUnprefixedPath(pathname) ? `~${pathname}` : pathname;
};

/**
 * Wouter's English router base prefixes logical links automatically. Locale-
 * neutral pages have no URL base, so their English UI needs explicit `/en`
 * destinations when it links back into the portfolio.
 */
export const useLocaleHref = () => {
  const { locale } = useAppPreferences();
  const { base } = useRouter();
  return useCallback(
    (path: string) => localeHrefForRouter(path, locale, base),
    [base, locale],
  );
};
