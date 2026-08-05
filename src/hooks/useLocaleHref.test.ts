import { localeHrefForRouter } from './useLocaleHref';

describe('localeHrefForRouter', () => {
  it('keeps localizable links relative to the English router base', () => {
    expect(localeHrefForRouter('/about', 'en', '/en')).toBe('/about');
  });

  it('escapes the English router base for permanent policy URLs', () => {
    expect(localeHrefForRouter('/wheretogo/privacy', 'en', '/en'))
      .toBe('~/wheretogo/privacy');
    expect(localeHrefForRouter('/studio', 'en', '/en')).toBe('~/studio');
  });

  it('prefixes portfolio routes for English UI outside the nested router', () => {
    expect(localeHrefForRouter('/work', 'en', '')).toBe('/en/work');
  });
});
