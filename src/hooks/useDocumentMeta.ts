import { useEffect } from 'react';
import type { Locale } from '../context/AppPreferences';
import { siteSettings } from '../data/portfolio';
import { SITE_ORIGIN, absoluteLocaleUrl, localeAlternates } from '../lib/localeRouting';

interface DocumentMetaOptions {
  title: string;
  description: string;
  path?: string;
  locale: Locale;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile';
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
};

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = href;
};

const syncLocaleAlternates = (path: string) => {
  const alternates = localeAlternates(path, siteSettings.defaultLocale);
  const entries = alternates ? [['tr', alternates.tr], ['en', alternates.en], ['x-default', alternates.xDefault]] as const : [];
  const active = new Set(entries.map(([hrefLang]) => hrefLang));

  document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((link) => {
    if (!active.has(link.hreflang as 'tr' | 'en' | 'x-default')) link.remove();
  });
  entries.forEach(([hrefLang, href]) => {
    let link = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hrefLang}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hrefLang;
      document.head.appendChild(link);
    }
    link.href = href;
  });
  return alternates;
};

export const useDocumentMeta = ({
  title,
  description,
  path = '/',
  locale,
  image = '/og.png',
  noIndex = false,
  type = 'website',
  structuredData,
}: DocumentMetaOptions) => {
  useEffect(() => {
    const effectiveNoIndex = noIndex || siteSettings.defaultSeo.noIndex;
    const canonical = absoluteLocaleUrl(path, locale);
    const imageUrl = new URL(image, SITE_ORIGIN).toString();
    document.title = title;
    document.documentElement.lang = locale;
    upsertCanonical(canonical);
    const alternates = syncLocaleAlternates(path);
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: effectiveNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: locale === 'tr' ? 'tr_TR' : 'en_GB' });
    if (alternates) {
      upsertMeta('meta[property="og:locale:alternate"]', { property: 'og:locale:alternate', content: locale === 'tr' ? 'en_GB' : 'tr_TR' });
    } else {
      document.head.querySelector('meta[property="og:locale:alternate"]')?.remove();
    }
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    const existing = document.head.querySelector<HTMLScriptElement>('script[data-ack-structured-data]');
    existing?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.ackStructuredData = 'true';
      script.text = JSON.stringify(structuredData).replace(/</g, '\\u003c');
      document.head.appendChild(script);
    }

    return () => {
      document.head.querySelector<HTMLScriptElement>('script[data-ack-structured-data]')?.remove();
    };
  }, [title, description, path, locale, image, noIndex, type, structuredData]);
};
