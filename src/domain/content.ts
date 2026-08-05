import { z } from 'zod';

export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export const PROJECT_DISCIPLINES = ['architecture', 'software', 'hybrid', 'research'] as const;
export const PROJECT_FORMATS = ['case-study', 'product', 'experiment', 'academic'] as const;
export const MAX_CONTENT_DOCUMENT_BYTES = 750 * 1024;
export const MAX_PUBLIC_CONTENT_BUNDLE_BYTES = 2 * 1024 * 1024;

const BIDI_CONTROL_CHARACTERS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORBIDDEN_PLACEHOLDER_PATTERN =
  /(?:placehold\.co|placeholder\.(?:com|net)|\/placeholder(?:[-_.?/]|$))/i;

const enforceDocumentByteBudget = (value: unknown, context: z.RefinementCtx) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  if (bytes > MAX_CONTENT_DOCUMENT_BYTES) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Content exceeds the ${MAX_CONTENT_DOCUMENT_BYTES}-byte document safety budget.`,
    });
  }
};

const stripUnsafeCharacters = (input: string): string =>
  Array.from(input)
    .filter((character) => {
      const codePoint = character.codePointAt(0) || 0;
      return !(
        codePoint <= 8 ||
        codePoint === 11 ||
        codePoint === 12 ||
        (codePoint >= 14 && codePoint <= 31) ||
        (codePoint >= 127 && codePoint <= 159)
      );
    })
    .join('')
    .replace(BIDI_CONTROL_CHARACTERS, '');

/**
 * Normalizes human-authored text without interpreting or rendering it as HTML.
 * React consumers should still render these values as text, never with
 * dangerouslySetInnerHTML.
 */
export const sanitizeText = (input: string): string =>
  stripUnsafeCharacters(input.normalize('NFKC'))
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Preserves meaningful indentation while removing spoofing/control characters. */
export const sanitizeCode = (input: string): string =>
  stripUnsafeCharacters(input.normalize('NFC'))
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();

export const sanitizeSlug = (input: string): string => {
  const turkishCharacters: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
  };

  return input
    .normalize('NFKD')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (character) => turkishCharacters[character] || character)
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '');
};

const isSafeInternalHref = (value: string): boolean => {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return false;
  if (/[\s<>"']/.test(value) || value.includes(String.fromCharCode(96))) return false;

  try {
    const decoded = decodeURIComponent(value);
    return !decoded.split(/[/?#]/).some((segment) => segment === '..');
  } catch {
    return false;
  }
};

const isSafeHttpsHref = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

export const isSafeHref = (value: string): boolean =>
  isSafeInternalHref(value) || isSafeHttpsHref(value);

const sanitizedString = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? sanitizeText(value) : value),
    z.string().min(minimum).max(maximum),
  );

const optionalSanitizedString = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const sanitized = sanitizeText(value);
      return sanitized.length === 0 ? undefined : sanitized;
    },
    z.string().max(maximum).optional(),
  );

const sanitizedCode = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? sanitizeCode(value) : value),
    z.string().min(minimum).max(maximum),
  );

export const SlugSchema = z.preprocess(
  (value) => (typeof value === 'string' ? sanitizeSlug(value) : value),
  z.string().min(2).max(80).regex(SLUG_PATTERN),
);

export const SafeHrefSchema = sanitizedString(1, 2048).refine(isSafeHref, {
  message: 'Only root-relative paths and credential-free HTTPS URLs are allowed.',
});

export const AssetHrefSchema = SafeHrefSchema.refine(
  (value) => !FORBIDDEN_PLACEHOLDER_PATTERN.test(value),
  { message: 'Placeholder assets are not valid production media.' },
);

const isApprovedHostedAsset = (value: string): boolean => {
  if (value.startsWith('/')) return true;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === 'firebasestorage.googleapis.com' || hostname.endsWith('.googleusercontent.com');
  } catch {
    return false;
  }
};

const isApprovedEmbed = (value: string): boolean => {
  if (value.startsWith('/')) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(hostname);
  } catch {
    return false;
  }
};

export const EmailSchema = z
  .preprocess(
    (value) => (typeof value === 'string' ? sanitizeText(value).toLowerCase() : value),
    z.string().min(3).max(254).regex(EMAIL_PATTERN),
  )
  .transform((value) => value.toLowerCase());

const localizedTextSchema = (minimum: number, maximum: number) =>
  z
    .object({
      tr: sanitizedString(minimum, maximum),
      en: sanitizedString(minimum, maximum),
    })
    .strict();

export const LocalizedLabelSchema = localizedTextSchema(1, 80);
export const LocalizedTitleSchema = localizedTextSchema(2, 120);
export const LocalizedSummarySchema = localizedTextSchema(12, 360);
export const LocalizedBodySchema = localizedTextSchema(20, 8000);

export const ContentStatusSchema = z.enum(CONTENT_STATUSES);
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export const ProjectDisciplineSchema = z.enum(PROJECT_DISCIPLINES);
export const ProjectFormatSchema = z.enum(PROJECT_FORMATS);
export const HexColorSchema = z.string().regex(HEX_COLOR_PATTERN);

const uniqueSanitizedStringArray = (
  minimumItems: number,
  maximumItems: number,
  maximumItemLength: number,
) =>
  z
    .array(sanitizedString(1, maximumItemLength))
    .min(minimumItems)
    .max(maximumItems)
    .superRefine((values, context) => {
      const normalizedValues = values.map((value) => value.toLocaleLowerCase('en-US'));
      if (new Set(normalizedValues).size !== normalizedValues.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Values must be unique (case-insensitive).',
        });
      }
    });

export const CoverVisualSchema = z
  .object({
    slug: SlugSchema,
    palette: z.array(HexColorSchema).min(2).max(6),
    visualVariant: z.enum([
      'architectural-grid',
      'code-canvas',
      'editorial-collage',
      'product-orbit',
      'signal-field',
      'spatial-gradient',
    ]),
    alt: LocalizedLabelSchema,
  })
  .strict()
  .superRefine((cover, context) => {
    if (new Set(cover.palette.map((color) => color.toLowerCase())).size !== cover.palette.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['palette'],
        message: 'Cover palette colors must be unique.',
      });
    }
  });

export const MediaSchema = z
  .object({
    id: SlugSchema,
    kind: z.enum(['image', 'video', 'audio', 'document', 'embed']),
    role: z.enum(['cover', 'gallery', 'diagram', 'demo', 'thumbnail', 'download']),
    assetState: z.enum(['planned', 'ready']),
    src: AssetHrefSchema.optional(),
    poster: AssetHrefSchema.optional(),
    alt: LocalizedLabelSchema,
    caption: LocalizedSummarySchema.optional(),
    width: z.number().int().min(1).max(12000).optional(),
    height: z.number().int().min(1).max(12000).optional(),
    mimeType: sanitizedString(3, 100).optional(),
  })
  .strict()
  .superRefine((media, context) => {
    if (media.assetState === 'ready' && !media.src) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['src'],
        message: 'Ready media must provide a source URL.',
      });
    }
    if (
      media.src &&
      !(media.kind === 'embed' ? isApprovedEmbed(media.src) : isApprovedHostedAsset(media.src))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['src'],
        message: media.kind === 'embed'
          ? 'Embeds must use an approved YouTube or Vimeo URL.'
          : 'Public media must use this site or an approved Firebase/Google media host.',
      });
    }
    if (media.poster && !isApprovedHostedAsset(media.poster)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['poster'],
        message: 'Video posters must use this site or an approved Firebase/Google media host.',
      });
    }
    if (media.assetState === 'planned' && media.src) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['src'],
        message: 'Planned media must not pretend to have a ready asset.',
      });
    }
    if ((media.width && !media.height) || (!media.width && media.height)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['width'],
        message: 'Media dimensions must include both width and height.',
      });
    }
    if (
      media.assetState === 'ready' &&
      ['image', 'video'].includes(media.kind) &&
      (!media.width || !media.height)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['width'],
        message: 'Ready images and videos require intrinsic dimensions to prevent layout shift.',
      });
    }
  });

export const LinkSchema = z
  .object({
    kind: z.enum([
      'live',
      'source',
      'article',
      'download',
      'updates',
      'privacy',
      'terms',
      'safety',
      'social',
      'contact',
    ]),
    label: LocalizedLabelSchema,
    href: SafeHrefSchema,
    newTab: z.boolean().default(false),
  })
  .strict()
  .superRefine((link, context) => {
    if (link.href.startsWith('/') && link.newTab) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newTab'],
        message: 'Internal links should remain in the current browsing context.',
      });
    }
  });

export const MetricSchema = z
  .object({
    id: SlugSchema,
    label: LocalizedLabelSchema,
    value: localizedTextSchema(1, 48),
    context: LocalizedSummarySchema.optional(),
    evidenceUrl: SafeHrefSchema.optional(),
    verified: z.boolean(),
  })
  .strict()
  .superRefine((metric, context) => {
    if (metric.verified && !metric.evidenceUrl && !metric.context) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['verified'],
        message: 'Verified metrics require evidence or a clear source context.',
      });
    }
  });

const TextBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('text'),
    eyebrow: LocalizedLabelSchema.optional(),
    heading: LocalizedTitleSchema,
    body: LocalizedBodySchema,
  })
  .strict();

const FactsBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('facts'),
    heading: LocalizedTitleSchema,
    items: z
      .array(
        z
          .object({
            label: LocalizedLabelSchema,
            value: localizedTextSchema(1, 160),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict();

const MediaBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('media'),
    heading: LocalizedTitleSchema.optional(),
    media: MediaSchema,
  })
  .strict();

const GalleryBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('gallery'),
    heading: LocalizedTitleSchema.optional(),
    items: z.array(MediaSchema).min(2).max(12),
  })
  .strict();

const QuoteBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('quote'),
    quote: LocalizedSummarySchema,
    attribution: LocalizedLabelSchema.optional(),
  })
  .strict();

const CodeBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('code'),
    language: z.enum([
      'typescript',
      'javascript',
      'python',
      'dart',
      'json',
      'bash',
      'text',
    ]),
    code: sanitizedCode(1, 50000),
    caption: LocalizedSummarySchema.optional(),
  })
  .strict();

const CalloutBlockSchema = z
  .object({
    id: SlugSchema,
    type: z.literal('callout'),
    tone: z.enum(['note', 'decision', 'constraint', 'outcome']),
    heading: LocalizedTitleSchema,
    body: LocalizedSummarySchema,
  })
  .strict();

export const ContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  FactsBlockSchema,
  MediaBlockSchema,
  GalleryBlockSchema,
  QuoteBlockSchema,
  CodeBlockSchema,
  CalloutBlockSchema,
]);

export const SeoSchema = z
  .object({
    title: localizedTextSchema(10, 70),
    description: localizedTextSchema(40, 180),
    noIndex: z.boolean().default(false),
  })
  .strict();

export const PortfolioProjectSchema = z
  .object({
    slug: SlugSchema,
    status: ContentStatusSchema,
    discipline: ProjectDisciplineSchema,
    format: ProjectFormatSchema,
    order: z.number().int().min(0).max(10000).default(100),
    featured: z.boolean().default(false),
    title: LocalizedTitleSchema,
    dek: LocalizedSummarySchema,
    year: z.number().int().min(2000).max(2100).optional(),
    context: LocalizedLabelSchema.optional(),
    location: LocalizedLabelSchema.optional(),
    releaseStage: z
      .enum(['concept', 'prototype', 'in-development', 'live', 'maintained', 'archived'])
      .optional(),
    technologies: uniqueSanitizedStringArray(1, 20, 40),
    topics: uniqueSanitizedStringArray(1, 12, 40),
    cover: CoverVisualSchema,
    media: z.array(MediaSchema).max(30).default([]),
    links: z.array(LinkSchema).max(12).default([]),
    metrics: z.array(MetricSchema).max(8).default([]),
    blocks: z.array(ContentBlockSchema).min(2).max(40),
    relatedSlugs: z.array(SlugSchema).max(6).default([]),
    seo: SeoSchema,
  })
  .strict()
  .superRefine((project, context) => {
    enforceDocumentByteBudget(project, context);

    if (project.cover.slug !== project.slug) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cover', 'slug'],
        message: 'The cover slug must match its project slug.',
      });
    }

    if (project.relatedSlugs.includes(project.slug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['relatedSlugs'],
        message: 'A project cannot relate to itself.',
      });
    }

    if (new Set(project.relatedSlugs).size !== project.relatedSlugs.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['relatedSlugs'],
        message: 'Related project slugs must be unique.',
      });
    }

    const blockIds = project.blocks.map((block) => block.id);
    if (new Set(blockIds).size !== blockIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['blocks'],
        message: 'Block IDs must be unique within a project.',
      });
    }
  });

export const JournalEntrySchema = z
  .object({
    slug: SlugSchema,
    entryType: z.enum(['journal', 'lab-note', 'release-note']),
    status: ContentStatusSchema,
    order: z.number().int().min(0).max(10000).default(100),
    title: LocalizedTitleSchema,
    excerpt: LocalizedSummarySchema,
    topics: uniqueSanitizedStringArray(1, 10, 40),
    cover: CoverVisualSchema,
    blocks: z.array(ContentBlockSchema).min(1).max(40),
    linkedProjectSlugs: z.array(SlugSchema).max(8).default([]),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    seo: SeoSchema,
  })
  .strict()
  .superRefine((entry, context) => {
    enforceDocumentByteBudget(entry, context);

    if (entry.cover.slug !== entry.slug) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cover', 'slug'],
        message: 'The cover slug must match its journal entry slug.',
      });
    }

    if (entry.status === 'published' && !entry.publishedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: 'Published journal entries require a publication timestamp.',
      });
    }

    if (new Set(entry.linkedProjectSlugs).size !== entry.linkedProjectSlugs.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkedProjectSlugs'],
        message: 'Linked project slugs must be unique.',
      });
    }
  });

export const SiteSettingsSchema = z
  .object({
    siteName: localizedTextSchema(2, 80),
    ownerName: localizedTextSchema(2, 100),
    headline: LocalizedTitleSchema,
    introduction: LocalizedSummarySchema,
    location: LocalizedLabelSchema,
    contactEmail: EmailSchema,
    canonicalUrl: sanitizedString(8, 2048).refine((value) => (
      value === 'https://ackaraca.me' || value === 'https://ackaraca.me/'
    ), {
      message: 'The canonical URL is fixed to the production ACKaraca origin.',
    }),
    defaultLocale: LocaleSchema,
    supportedLocales: z
      .array(LocaleSchema)
      .length(SUPPORTED_LOCALES.length)
      .refine(
        (locales) => SUPPORTED_LOCALES.every((locale) => locales.includes(locale)),
        { message: 'Both Turkish and English must be supported.' },
      ),
    availability: z.enum(['open-to-inquiries', 'limited', 'unavailable']),
    socialLinks: z.array(LinkSchema).max(8),
    palette: z
      .object({
        background: HexColorSchema,
        foreground: HexColorSchema,
        accent: HexColorSchema,
      })
      .strict(),
    footerNote: LocalizedSummarySchema,
    defaultSeo: SeoSchema,
  })
  .strict();

export const InquirySchema = z
  .object({
    id: SlugSchema.optional(),
    name: sanitizedString(2, 100),
    email: EmailSchema,
    organization: optionalSanitizedString(120),
    inquiryType: z.enum([
      'employment',
      'architecture',
      'product',
      'collaboration',
      'speaking',
      'other',
    ]),
    budgetBand: z
      .enum(['not-specified', 'under-5k', '5k-15k', '15k-50k', 'over-50k'])
      .optional(),
    timeline: z
      .enum(['not-specified', 'as-soon-as-possible', 'one-to-three-months', 'flexible'])
      .optional(),
    message: sanitizedString(20, 4000),
    locale: LocaleSchema,
    privacyConsent: z.literal(true),
    website: z.literal('').optional(),
    status: z.enum(['new', 'in-review', 'replied', 'archived']).default('new'),
    createdAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

const uniqueSlugCollection = <T extends { slug: string }>(
  values: T[],
  context: z.RefinementCtx,
) => {
  const slugs = values.map((value) => value.slug);
  if (new Set(slugs).size !== slugs.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Content slugs must be unique.',
    });
  }
};

export const PortfolioProjectCollectionSchema = z
  .array(PortfolioProjectSchema)
  .min(1)
  .max(200)
  .superRefine(uniqueSlugCollection);

export const JournalEntryCollectionSchema = z
  .array(JournalEntrySchema)
  .max(500)
  .superRefine(uniqueSlugCollection);

export const ContentBundleSchema = z
  .object({
    settings: SiteSettingsSchema,
    projects: PortfolioProjectCollectionSchema,
    journal: JournalEntryCollectionSchema,
  })
  .strict()
  .superRefine((bundle, context) => {
    const bytes = new TextEncoder().encode(JSON.stringify(bundle)).byteLength;
    if (bytes > MAX_PUBLIC_CONTENT_BUNDLE_BYTES) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Public content snapshot exceeds the ${MAX_PUBLIC_CONTENT_BUNDLE_BYTES}-byte delivery budget.`,
      });
    }
  });

export type LocalizedText = z.infer<typeof LocalizedBodySchema>;
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
export type CoverVisual = z.infer<typeof CoverVisualSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ContentLink = z.infer<typeof LinkSchema>;
export type ContentMetric = z.infer<typeof MetricSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type PortfolioProject = z.infer<typeof PortfolioProjectSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type Inquiry = z.infer<typeof InquirySchema>;
export type ContentBundle = z.infer<typeof ContentBundleSchema>;

export type JournalRouteBase = 'lab' | 'journal';

export const journalRouteBase = (
  entry: Pick<JournalEntry, 'entryType'>,
): JournalRouteBase => entry.entryType === 'lab-note' ? 'lab' : 'journal';

export const journalEntryPath = (
  entry: Pick<JournalEntry, 'entryType' | 'slug'>,
): `/${JournalRouteBase}/${string}` => `/${journalRouteBase(entry)}/${entry.slug}`;

/**
 * Firestore adapters may add timestamps beside an otherwise strict content
 * document. Strip only those two known system fields so accidental or hostile
 * fields continue to fail strict schema validation.
 */
export const stripFirestoreSystemMetadata = (value: unknown): unknown => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;

  const content = { ...(value as Record<string, unknown>) };
  delete content.createdAt;
  delete content.updatedAt;

  return content;
};

export const parsePortfolioProject = (value: unknown): PortfolioProject =>
  PortfolioProjectSchema.parse(value);
export const safeParsePortfolioProject = (value: unknown) =>
  PortfolioProjectSchema.safeParse(value);
export const parsePortfolioProjects = (value: unknown): PortfolioProject[] =>
  PortfolioProjectCollectionSchema.parse(value);
export const parseJournalEntry = (value: unknown): JournalEntry =>
  JournalEntrySchema.parse(value);
export const safeParseJournalEntry = (value: unknown) =>
  JournalEntrySchema.safeParse(value);
export const parseJournalEntries = (value: unknown): JournalEntry[] =>
  JournalEntryCollectionSchema.parse(value);
export const parseSiteSettings = (value: unknown): SiteSettings =>
  SiteSettingsSchema.parse(value);
export const safeParseSiteSettings = (value: unknown) =>
  SiteSettingsSchema.safeParse(value);
export const parseInquiry = (value: unknown): Inquiry => InquirySchema.parse(value);
export const safeParseInquiry = (value: unknown) => InquirySchema.safeParse(value);
export const parseContentBundle = (value: unknown): ContentBundle =>
  ContentBundleSchema.parse(value);
