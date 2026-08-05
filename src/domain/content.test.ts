import { describe, expect, it } from 'vitest';

import {
  ContentBundleSchema,
  MAX_PUBLIC_CONTENT_BUNDLE_BYTES,
  MediaSchema,
  PortfolioProjectCollectionSchema,
  parseContentBundle,
  parseInquiry,
  safeParseJournalEntry,
  safeParsePortfolioProject,
  sanitizeCode,
  sanitizeSlug,
  sanitizeText,
  stripFirestoreSystemMetadata,
} from './content';
import {
  allEntries,
  contentBundle,
  journalEntries,
  labEntries,
  portfolioProjects,
  siteSettings,
} from '../data/portfolio';

describe('content domain schemas', () => {
  it('normalizes plain text and Turkish slugs while preserving code indentation', () => {
    expect(sanitizeText('  Ahmet\u202E   Cem\r\n\r\n\r\nKaraca  ')).toBe(
      'Ahmet Cem\n\nKaraca',
    );
    expect(sanitizeCode('  if (ready) {  \r\n    run();\t\r\n  }  ')).toBe(
      'if (ready) {\n    run();\n  }',
    );
    expect(sanitizeSlug('  Hoca Puanla / 2026  ')).toBe('hoca-puanla-2026');
  });

  it('defaults bounded ordering and strips only known Firestore metadata', () => {
    const reference = portfolioProjects[0];
    if (!reference) throw new Error('Expected at least one portfolio project fixture.');
    const projectWithoutOrder = Object.fromEntries(
      Object.entries(reference).filter(([key]) => key !== 'order'),
    );
    const withSystemMetadata = {
      ...projectWithoutOrder,
      createdAt: 'firestore-timestamp',
      updatedAt: 'firestore-timestamp',
    };

    const parsed = safeParsePortfolioProject(
      stripFirestoreSystemMetadata(withSystemMetadata),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.order).toBe(100);

    expect(
      safeParsePortfolioProject({ ...reference, order: 10001 }).success,
    ).toBe(false);
    expect(safeParsePortfolioProject(withSystemMetadata).success).toBe(false);
    expect(
      safeParsePortfolioProject(
        stripFirestoreSystemMetadata({ ...withSystemMetadata, unexpected: true }),
      ).success,
    ).toBe(false);
  });

  it('sanitizes a valid inquiry and applies safe defaults', () => {
    const inquiry = parseInquiry({
      name: '  Ahmet   Cem  ',
      email: '  TEST@EXAMPLE.COM ',
      organization: '  Studio   One ',
      inquiryType: 'collaboration',
      message: '  Yeni bir mimarlık ve yazılım projesini konuşmak istiyorum.  ',
      locale: 'tr',
      privacyConsent: true,
      website: '',
    });

    expect(inquiry).toMatchObject({
      name: 'Ahmet Cem',
      email: 'test@example.com',
      organization: 'Studio One',
      status: 'new',
    });
  });

  it('rejects unsafe links, missing locales, and duplicate slugs', () => {
    const reference = portfolioProjects[0];
    const unsafeLink = safeParsePortfolioProject({
      ...reference,
      links: [
        {
          kind: 'live',
          label: { tr: 'Aç', en: 'Open' },
          href: 'javascript:alert(1)',
          newTab: false,
        },
      ],
    });
    const missingEnglish = safeParsePortfolioProject({
      ...reference,
      title: { tr: 'Yalnızca Türkçe başlık' },
    });
    const duplicateSlugs = PortfolioProjectCollectionSchema.safeParse([
      reference,
      reference,
    ]);

    expect(unsafeLink.success).toBe(false);
    expect(missingEnglish.success).toBe(false);
    expect(duplicateSlugs.success).toBe(false);
  });

  it('rejects schema-valid content that would approach Firestore document limits', () => {
    const reference = portfolioProjects[0];
    if (!reference) throw new Error('Expected at least one portfolio project fixture.');
    const oversized = safeParsePortfolioProject({
      ...reference,
      blocks: Array.from({ length: 22 }, (_, index) => ({
        id: `oversized-code-${index.toString()}`,
        type: 'code',
        language: 'text',
        code: 'x'.repeat(50_000),
      })),
    });

    expect(oversized.success).toBe(false);
    if (!oversized.success) {
      expect(oversized.error.issues.some((issue) => issue.message.includes('document safety budget'))).toBe(true);
    }
  });

  it('rejects placeholder media and incomplete ready assets', () => {
    const sharedMedia = {
      id: 'sample-media',
      kind: 'image',
      role: 'gallery',
      alt: { tr: 'Örnek görsel', en: 'Sample visual' },
    } as const;

    expect(
      MediaSchema.safeParse({
        ...sharedMedia,
        assetState: 'ready',
        src: 'https://placehold.co/1200x800',
      }).success,
    ).toBe(false);

    expect(
      MediaSchema.safeParse({
        ...sharedMedia,
        assetState: 'ready',
      }).success,
    ).toBe(false);

    expect(
      MediaSchema.safeParse({
        ...sharedMedia,
        assetState: 'ready',
        src: 'https://cdn.example.com/project.webp',
        width: 1200,
        height: 800,
      }).success,
    ).toBe(false);

    expect(
      MediaSchema.safeParse({
        ...sharedMedia,
        assetState: 'ready',
        src: '/media/project.webp',
      }).success,
    ).toBe(false);

    expect(
      MediaSchema.safeParse({
        ...sharedMedia,
        assetState: 'ready',
        src: '/media/project.webp',
        width: 1200,
        height: 800,
      }).success,
    ).toBe(true);
  });

  it('requires publication dates for published journal entries', () => {
    const draft = labEntries[0];
    const result = safeParseJournalEntry({
      ...draft,
      status: 'published',
      publishedAt: undefined,
    });

    expect(result.success).toBe(false);
  });

  it('rejects spam honeypots and unconsented inquiries', () => {
    const baseInquiry = {
      name: 'Example Person',
      email: 'person@example.com',
      inquiryType: 'employment',
      message: 'This message is long enough to pass the minimum length rule.',
      locale: 'en',
    };

    expect(
      parseContentBundle({
        settings: siteSettings,
        projects: portfolioProjects,
        journal: allEntries,
      }),
    ).toEqual(contentBundle);

    expect(() =>
      parseInquiry({
        ...baseInquiry,
        privacyConsent: false,
        website: '',
      }),
    ).toThrow();

    expect(() =>
      parseInquiry({
        ...baseInquiry,
        privacyConsent: true,
        website: 'https://spam.example',
      }),
    ).toThrow();
  });
});

describe('portfolio fallback content', () => {
  it('contains every existing named project with unique, resolvable slugs', () => {
    const requiredSlugs = [
      'draw-or-die',
      'mailcrush',
      'beatforge',
      'peakactivity',
      'hocapuanla',
      'archbuilder',
      'duaapp',
      'where-to-go',
    ];
    const actualSlugs = new Set(portfolioProjects.map((project) => project.slug));

    expect(requiredSlugs.every((slug) => actualSlugs.has(slug))).toBe(true);
    expect(actualSlugs.size).toBe(portfolioProjects.length);

    for (const project of portfolioProjects) {
      expect(project.cover.slug).toBe(project.slug);
      expect(project.relatedSlugs.every((slug) => actualSlugs.has(slug))).toBe(true);
    }
  });

  it('keeps all public narrative fields bilingual and free of placeholder assets', () => {
    for (const project of portfolioProjects) {
      expect(project.title.tr.length).toBeGreaterThan(0);
      expect(project.title.en.length).toBeGreaterThan(0);
      expect(project.dek.tr.length).toBeGreaterThan(0);
      expect(project.dek.en.length).toBeGreaterThan(0);
      expect(project.blocks.length).toBeGreaterThanOrEqual(2);
    }

    const serialized = JSON.stringify(contentBundle).toLowerCase();
    expect(serialized).not.toContain('placehold.co');
    expect(serialized).not.toContain('placeholder.jpg');
  });

  it('rejects a valid-per-document snapshot that exceeds the public delivery budget', () => {
    const reference = portfolioProjects[0];
    if (!reference) throw new Error('Expected at least one portfolio project fixture.');
    const projects = Array.from({ length: 3 }, (_, projectIndex) => {
      const slug = `bundle-budget-${projectIndex + 1}`;
      return {
        ...reference,
        slug,
        cover: { ...reference.cover, slug },
        relatedSlugs: [],
        blocks: [
          ...reference.blocks,
          ...Array.from({ length: 14 }, (__, blockIndex) => ({
            id: `budget-code-${projectIndex + 1}-${blockIndex + 1}`,
            type: 'code' as const,
            language: 'text' as const,
            code: 'x'.repeat(49_900),
          })),
        ],
      };
    });

    expect(new TextEncoder().encode(JSON.stringify({ ...contentBundle, projects })).byteLength)
      .toBeGreaterThan(MAX_PUBLIC_CONTENT_BUNDLE_BYTES);
    const parsed = ContentBundleSchema.safeParse({ ...contentBundle, projects });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.message.includes('delivery budget'))).toBe(true);
    }
  });

  it('limits metrics to verified repository scope rather than invented outcomes', () => {
    for (const project of portfolioProjects) {
      if (project.slug === 'draw-or-die') {
        expect(project.metrics.map((metric) => metric.id)).toEqual([
          'analysis-modes',
          'jury-personas',
        ]);
        expect(
          project.metrics.every(
            (metric) => metric.verified && Boolean(metric.context),
          ),
        ).toBe(true);
      } else {
        expect(project.metrics).toEqual([]);
      }
    }
  });

  it('keeps README-verified product stacks and lifecycle caveats intact', () => {
    const bySlug = new Map(
      portfolioProjects.map((project) => [project.slug, project]),
    );

    expect(bySlug.get('draw-or-die')?.technologies).toEqual(
      expect.arrayContaining(['Next.js 15', 'React 19', 'Appwrite', 'Gemini', 'Stripe']),
    );
    expect(bySlug.get('beatforge')?.technologies).toEqual(
      expect.arrayContaining(['Python', 'mido', 'music21', 'simpleaudio', 'Paperclip']),
    );
    expect(bySlug.get('beatforge')?.technologies).not.toEqual(
      expect.arrayContaining(['TypeScript', 'Vite']),
    );
    expect(bySlug.get('duaapp')?.technologies).toEqual(
      expect.arrayContaining(['Flutter', 'Riverpod', 'GoRouter', 'Appwrite Auth']),
    );
    expect(bySlug.get('where-to-go')?.releaseStage).toBe('in-development');
    expect(bySlug.get('where-to-go')?.technologies).toEqual(
      expect.arrayContaining(['Flutter', 'Riverpod', 'Google Places', 'Deep Links']),
    );
  });

  it('keeps editorial publication state and search visibility coherent', () => {
    const editorialEntries = allEntries;

    expect(editorialEntries.length).toBeGreaterThan(0);
    expect(editorialEntries.some((entry) => entry.status === 'published')).toBe(true);
    expect(editorialEntries.every((entry) => (
      entry.status === 'published'
        ? Boolean(entry.publishedAt) && !entry.seo.noIndex
        : entry.seo.noIndex
    ))).toBe(true);
  });

  it('derives typed editorial views from the complete content bundle without dropping release notes', () => {
    expect(allEntries).toBe(contentBundle.journal);
    expect(journalEntries).toEqual(allEntries.filter((entry) => entry.entryType === 'journal'));
    expect(labEntries).toEqual(allEntries.filter((entry) => entry.entryType === 'lab-note'));
    expect(allEntries.filter((entry) => entry.entryType === 'release-note'))
      .toEqual(contentBundle.journal.filter((entry) => entry.entryType === 'release-note'));
  });
});
