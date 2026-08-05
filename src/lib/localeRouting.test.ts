import {
  absoluteLocaleUrl,
  isPermanentlyUnprefixedPath,
  isLocaleNeutralPublicPath,
  localeAlternates,
  localeFromPath,
  localePath,
  stripLocalePrefix,
} from './localeRouting';

describe('locale routing', () => {
  it('treats only the /en route segment as English', () => {
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/en/work/mailcrush')).toBe('en');
    expect(localeFromPath('/english')).toBe('tr');
    expect(stripLocalePrefix('/en')).toBe('/');
    expect(stripLocalePrefix('/en/work/mailcrush/')).toBe('/work/mailcrush');
  });

  it('maps every localizable path between the Turkish default and English namespace', () => {
    expect(localePath('/', 'en')).toBe('/en');
    expect(localePath('/work/mailcrush', 'en')).toBe('/en/work/mailcrush');
    expect(localePath('/en/work/mailcrush', 'tr')).toBe('/work/mailcrush');
    expect(absoluteLocaleUrl('/about', 'en')).toBe('https://ackaraca.me/en/about');
  });

  it('keeps owner, product-policy, and physical-code routes at permanent URLs', () => {
    for (const path of ['/studio', '/admin/users', '/account-delete', '/dua/news', '/wheretogo/privacy', '/all/terms', '/pafta/ABC-123']) {
      expect(isPermanentlyUnprefixedPath(path)).toBe(true);
      expect(localePath(path, 'en')).toBe(path);
      expect(localeAlternates(path)).toBeUndefined();
    }
    expect(isLocaleNeutralPublicPath('/wheretogo/privacy')).toBe(true);
    expect(isLocaleNeutralPublicPath('/studio')).toBe(false);
  });

  it('publishes reciprocal Turkish, English, and x-default alternates', () => {
    expect(localeAlternates('/work')).toEqual({
      tr: 'https://ackaraca.me/work',
      en: 'https://ackaraca.me/en/work',
      xDefault: 'https://ackaraca.me/work',
    });
    expect(localeAlternates('/work', 'en')?.xDefault).toBe('https://ackaraca.me/en/work');
  });
});
