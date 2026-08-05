import { allEntries } from '../data/portfolio';
import type { JournalEntry } from '../domain/content';
import { buildPublishedEntryIndex } from './Content';

const reference = allEntries[0];
if (!reference) throw new Error('Expected at least one editorial entry fixture.');

const entry = (
  entryType: JournalEntry['entryType'],
  slug: string,
  status: JournalEntry['status'] = 'published',
): JournalEntry => ({
  ...reference,
  slug,
  entryType,
  status,
  publishedAt: status === 'published' ? '2026-08-04T12:00:00.000Z' : undefined,
  cover: { ...reference.cover, slug },
  seo: { ...reference.seo, noIndex: false },
});

describe('published editorial content index', () => {
  it('keeps lab notes in Lab while journal and release notes share the journal route', () => {
    const labNote = entry('lab-note', 'published-lab-note');
    const journal = entry('journal', 'published-journal');
    const releaseNote = entry('release-note', 'published-release-note');
    const draft = entry('release-note', 'draft-release-note', 'draft');
    const index = buildPublishedEntryIndex([labNote, journal, releaseNote, draft]);

    expect(index.all.map(({ slug }) => slug)).toEqual(expect.arrayContaining([
      'published-lab-note',
      'published-journal',
      'published-release-note',
    ]));
    expect(index.all.map(({ slug }) => slug)).not.toContain('draft-release-note');
    expect(index.lab.map(({ slug }) => slug)).toEqual(['published-lab-note']);
    expect(index.journal.map(({ slug }) => slug)).toEqual(expect.arrayContaining([
      'published-journal',
      'published-release-note',
    ]));
    expect(index.findEntry('published-lab-note', 'lab')).toBe(labNote);
    expect(index.findEntry('published-lab-note', 'journal')).toBeUndefined();
    expect(index.findEntry('published-release-note', 'journal')).toBe(releaseNote);
    expect(index.findEntry('published-release-note', 'lab')).toBeUndefined();
  });
});
