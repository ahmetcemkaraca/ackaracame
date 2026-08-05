import { allEntries } from './data/portfolio';
import type { JournalEntry } from './domain/content';
import {
  findPublishedEntryForPath,
  publishedEntryPaths,
  render,
  resolveMeta,
  staticPaths,
} from './entry-server';

const reference = allEntries[0];
if (!reference) throw new Error('Expected at least one editorial entry fixture.');

const publishedEntry = (entryType: JournalEntry['entryType'], slug: string): JournalEntry => ({
  ...reference,
  slug,
  entryType,
  status: 'published',
  publishedAt: '2026-08-04T12:00:00.000Z',
  cover: { ...reference.cover, slug },
  seo: { ...reference.seo, noIndex: false },
});

describe('localized static portfolio output', () => {
  it('renders the English namespace with prefixed internal links', () => {
    const html = render('/en/work');
    expect(html).toContain('Work archive');
    expect(html).toContain('href="/en/about"');
    expect(html).toContain('href="/en/work/');
    expect(html).not.toContain('href="/about"');
  });

  it('localizes SEO values and publishes a complete static path pair', () => {
    expect(resolveMeta('/en/about')).toMatchObject({
      locale: 'en',
      title: 'Profile — Ahmet Cem Karaca',
      canonical: 'https://ackaraca.me/en/about',
      alternates: {
        tr: 'https://ackaraca.me/about',
        en: 'https://ackaraca.me/en/about',
        xDefault: 'https://ackaraca.me/about',
      },
    });
    expect(staticPaths).toContain('/work');
    expect(staticPaths).toContain('/en/work');
    expect(staticPaths).toContain('/journal');
    expect(staticPaths).toContain('/en/journal');
    expect(staticPaths).toContain('/en/work/mailcrush');
    expect(staticPaths).not.toContain('/en/wheretogo/privacy');
  });

  it('prerenders published lab notes and release notes at their canonical route families', () => {
    const labNote = publishedEntry('lab-note', 'published-lab-note');
    const releaseNote = publishedEntry('release-note', 'published-release-note');
    const journal = publishedEntry('journal', 'published-journal');

    expect(publishedEntryPaths([labNote, releaseNote, journal])).toEqual([
      '/lab/published-lab-note',
      '/journal/published-release-note',
      '/journal/published-journal',
    ]);
    expect(findPublishedEntryForPath([labNote, releaseNote], '/lab/published-lab-note')).toBe(labNote);
    expect(findPublishedEntryForPath([labNote, releaseNote], '/journal/published-release-note')).toBe(releaseNote);
    expect(findPublishedEntryForPath([labNote], '/journal/published-lab-note')).toBeUndefined();
    expect(findPublishedEntryForPath([releaseNote], '/lab/published-release-note')).toBeUndefined();
  });
});
