import {
  sanitizeSlug,
  type ContentBlock,
  type JournalEntry,
  type Media,
  type PortfolioProject,
} from '../../domain/content';

export const commaList = (values: string[]) => values.join(', ');

export const parseCommaList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

export const parsePalette = (value: string) =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

const hasLocalizedValue = (value?: { tr: string; en: string }) =>
  Boolean(value?.tr.trim() || value?.en.trim());

const normalizeOptionalValue = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export const normalizeMediaMetadata = (media: Media): Media => {
  const src = media.assetState === 'ready'
    ? normalizeOptionalValue(media.src)
    : undefined;
  const poster = media.assetState === 'ready'
    ? normalizeOptionalValue(media.poster)
    : undefined;
  const mimeType = normalizeOptionalValue(media.mimeType);

  return {
    id: sanitizeSlug(media.id),
    kind: media.kind,
    role: media.role,
    assetState: media.assetState,
    alt: media.alt,
    ...(src ? { src } : {}),
    ...(poster ? { poster } : {}),
    ...(hasLocalizedValue(media.caption) ? { caption: media.caption } : {}),
    ...(media.width === undefined ? {} : { width: media.width }),
    ...(media.height === undefined ? {} : { height: media.height }),
    ...(mimeType ? { mimeType } : {}),
  };
};

export const normalizeContentBlocks = (blocks: ContentBlock[]): ContentBlock[] =>
  blocks.map((block) => {
    if (block.type === 'text') {
      return {
        id: block.id,
        type: 'text',
        heading: block.heading,
        body: block.body,
        ...(hasLocalizedValue(block.eyebrow) ? { eyebrow: block.eyebrow } : {}),
      };
    }
    if (block.type === 'media') {
      return {
        id: block.id,
        type: 'media',
        media: normalizeMediaMetadata(block.media),
        ...(hasLocalizedValue(block.heading) ? { heading: block.heading } : {}),
      };
    }
    if (block.type === 'gallery') {
      return {
        id: block.id,
        type: 'gallery',
        items: block.items.map(normalizeMediaMetadata),
        ...(hasLocalizedValue(block.heading) ? { heading: block.heading } : {}),
      };
    }
    if (block.type === 'quote') {
      return {
        id: block.id,
        type: 'quote',
        quote: block.quote,
        ...(hasLocalizedValue(block.attribution) ? { attribution: block.attribution } : {}),
      };
    }
    if (block.type === 'code') {
      return {
        id: block.id,
        type: 'code',
        language: block.language,
        code: block.code,
        ...(hasLocalizedValue(block.caption) ? { caption: block.caption } : {}),
      };
    }
    return block;
  });

export type StudioMediaEntity = 'project' | 'journal';

interface StudioMediaContextInput {
  entity: StudioMediaEntity;
  slug: string;
  storageBucket?: string;
  media?: Media[];
  blocks: ContentBlock[];
}

interface LocatedMedia {
  media: Media;
  path: string;
}

const locatedMedia = (media: Media[], blocks: ContentBlock[]): LocatedMedia[] => [
  ...media.map((item, index) => ({ media: item, path: `media.${index}` })),
  ...blocks.flatMap((block, blockIndex) => {
    if (block.type === 'media') {
      return [{ media: block.media, path: `blocks.${blockIndex}.media` }];
    }
    if (block.type === 'gallery') {
      return block.items.map((item, itemIndex) => ({
        media: item,
        path: `blocks.${blockIndex}.items.${itemIndex}`,
      }));
    }
    return [];
  }),
];

export const collectStudioMediaReferenceUrls = (
  media: Media[],
  blocks: ContentBlock[],
) => new Set(
  locatedMedia(media, blocks).flatMap(({ media: item }) => (
    [item.src, item.poster].filter((url): url is string => Boolean(url))
  )),
);

const FIREBASE_STORAGE_MEDIA_HOST = 'firebasestorage.googleapis.com';
const MANAGED_MEDIA_FILE = /^[a-zA-Z0-9_-]{1,128}[.](?:jpg|jpeg|png|webp|avif)$/u;
const STORAGE_BUCKET = /^[a-zA-Z0-9._-]{3,222}$/u;

export const validateStudioMediaContext = ({
  entity,
  slug,
  storageBucket,
  media = [],
  blocks,
}: StudioMediaContextInput): string | null => {
  const expectedCollection = entity === 'project' ? 'projects' : 'journal';
  const expectedBucket = storageBucket?.trim() || '';

  for (const located of locatedMedia(media, blocks)) {
    for (const field of ['src', 'poster'] as const) {
      const rawUrl = located.media[field];
      if (!rawUrl || rawUrl.startsWith('/')) continue;

      let url: URL;
      try {
        url = new URL(rawUrl);
      } catch {
        continue;
      }
      if (url.hostname !== FIREBASE_STORAGE_MEDIA_HOST) continue;

      const fieldPath = `${located.path}.${field}`;
      if (!STORAGE_BUCKET.test(expectedBucket)) {
        return `${fieldPath}: Firebase Storage bucket yapılandırması eksik; yönetilen medya güvenli biçimde doğrulanamadı.`;
      }

      const pathParts = url.pathname.split('/');
      let bucket: string;
      let storagePath: string;
      try {
        bucket = decodeURIComponent(pathParts[3] || '');
        storagePath = decodeURIComponent(pathParts[5] || '');
      } catch {
        return `${fieldPath}: Firebase medya URL’sinin kodlaması geçersiz.`;
      }
      const storageSegments = storagePath.split('/');
      const fileName = storageSegments[3] || '';
      const expectedStoragePath = `media/${expectedCollection}/${slug}/${fileName}`;
      const expectedPathname = `/v0/b/${encodeURIComponent(expectedBucket)}/o/${encodeURIComponent(expectedStoragePath)}`;
      const canonical = (
        url.protocol === 'https:'
        && url.hostname === FIREBASE_STORAGE_MEDIA_HOST
        && !url.port
        && !url.username
        && !url.password
        && !url.hash
        && url.search === '?alt=media'
        && pathParts.length === 6
        && pathParts[1] === 'v0'
        && pathParts[2] === 'b'
        && pathParts[4] === 'o'
        && bucket === expectedBucket
        && storageSegments.length === 4
        && storageSegments[0] === 'media'
        && storageSegments[1] === expectedCollection
        && storageSegments[2] === slug
        && MANAGED_MEDIA_FILE.test(fileName)
        && storagePath === expectedStoragePath
        && url.pathname === expectedPathname
      );
      if (!canonical) {
        return `${fieldPath}: Firebase medya URL’si bu sitenin ${expectedBucket} bucket’ındaki media/${expectedCollection}/${slug}/… yoluyla ve yalnız ?alt=media sorgusuyla eşleşmelidir; farklı bucket, slug veya token kabul edilmez.`;
      }
    }
  }

  return null;
};

export const readableError = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'issues' in error &&
    Array.isArray((error as { issues?: unknown[] }).issues)
  ) {
    const issues = (error as {
      issues: Array<{ path?: PropertyKey[]; message?: string }>;
    }).issues;
    return issues
      .slice(0, 5)
      .map((issue) => {
        const path = issue.path?.join('.') || 'form';
        return `${path}: ${issue.message || 'Invalid value'}`;
      })
      .join(' · ');
  }

  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.';
};

let localId = 0;
export const nextBlockId = (type: string) => {
  localId += 1;
  return `${type}-${Date.now().toString(36)}-${localId.toString(36)}`;
};

export const createTextBlock = (): ContentBlock => ({
  id: nextBlockId('text'),
  type: 'text',
  eyebrow: { tr: 'Bölüm', en: 'Section' },
  heading: { tr: 'Yeni bölüm', en: 'New section' },
  body: {
    tr: 'Bu bölümün Türkçe anlatımını burada geliştirin.',
    en: 'Develop the English narrative for this section here.',
  },
});

export const createFactsBlock = (): ContentBlock => ({
  id: nextBlockId('facts'),
  type: 'facts',
  heading: { tr: 'Proje bilgileri', en: 'Project facts' },
  items: [
    {
      label: { tr: 'Rol', en: 'Role' },
      value: { tr: 'Tasarım ve geliştirme', en: 'Design and development' },
    },
  ],
});

export const createCalloutBlock = (): ContentBlock => ({
  id: nextBlockId('callout'),
  type: 'callout',
  tone: 'decision',
  heading: { tr: 'Tasarım kararı', en: 'Design decision' },
  body: {
    tr: 'Kararı, bağlamını ve etkisini burada açıklayın.',
    en: 'Explain the decision, its context, and its impact here.',
  },
});

export const createQuoteBlock = (): ContentBlock => ({
  id: nextBlockId('quote'),
  type: 'quote',
  quote: {
    tr: 'Anlatının temel fikrini taşıyan alıntıyı burada geliştirin.',
    en: 'Develop the quotation that carries the central idea of the narrative here.',
  },
  attribution: { tr: 'Kaynak', en: 'Source' },
});

export const createCodeBlock = (): ContentBlock => ({
  id: nextBlockId('code'),
  type: 'code',
  language: 'typescript',
  code: 'const outcome = buildIdea();',
  caption: {
    tr: 'Kod örneğinin bağlamını ve neden önemli olduğunu açıklayın.',
    en: 'Explain the context of this code sample and why it matters.',
  },
});

export const createMediaMetadata = (
  role: Media['role'] = 'gallery',
): Media => ({
  id: nextBlockId('media-item'),
  kind: 'image',
  role,
  assetState: 'planned',
  alt: {
    tr: 'Planlanan medya için erişilebilir açıklama',
    en: 'Accessible description for the planned media',
  },
});

export const createMediaBlock = (): ContentBlock => ({
  id: nextBlockId('media'),
  type: 'media',
  media: createMediaMetadata(),
});

export const createGalleryBlock = (): ContentBlock => ({
  id: nextBlockId('gallery'),
  type: 'gallery',
  items: [createMediaMetadata(), createMediaMetadata()],
});

export const createProjectDraft = (): PortfolioProject => ({
  slug: 'new-project',
  status: 'draft',
  discipline: 'hybrid',
  format: 'case-study',
  order: 100,
  featured: false,
  title: { tr: 'Yeni proje', en: 'New project' },
  dek: {
    tr: 'Projenin kapsamını ve neden önemli olduğunu anlatan kısa bir giriş.',
    en: 'A concise introduction explaining the project scope and why it matters.',
  },
  technologies: ['Design'],
  topics: ['portfolio'],
  cover: {
    slug: 'new-project',
    palette: ['#171714', '#f3efe4', '#a84b35'],
    visualVariant: 'architectural-grid',
    alt: { tr: 'Yeni proje kapak kompozisyonu', en: 'New project cover composition' },
  },
  media: [],
  links: [],
  metrics: [],
  blocks: [createTextBlock(), createFactsBlock()],
  relatedSlugs: [],
  seo: {
    title: { tr: 'Yeni Proje — ACKaraca', en: 'New Project — ACKaraca' },
    description: {
      tr: 'Yeni proje için mimarlık, ürün ve teknoloji kararlarını açıklayan ayrıntılı vaka çalışması.',
      en: 'A detailed case study explaining the architecture, product, and technology decisions behind a new project.',
    },
    noIndex: true,
  },
});

export const createJournalDraft = (): JournalEntry => ({
  slug: 'new-journal-entry',
  entryType: 'journal',
  status: 'draft',
  order: 100,
  title: { tr: 'Yeni yazı', en: 'New entry' },
  excerpt: {
    tr: 'Yazının temel sorusunu ve okura sunduğu bağlamı açıklayan kısa özet.',
    en: 'A short summary describing the entry’s central question and context for readers.',
  },
  topics: ['practice'],
  cover: {
    slug: 'new-journal-entry',
    palette: ['#191815', '#f3efe4', '#47745f'],
    visualVariant: 'editorial-collage',
    alt: { tr: 'Yeni yazı kapak kompozisyonu', en: 'New entry cover composition' },
  },
  blocks: [createTextBlock()],
  linkedProjectSlugs: [],
  seo: {
    title: { tr: 'Yeni Yazı — ACKaraca', en: 'New Entry — ACKaraca' },
    description: {
      tr: 'Mimarlık, ürün geliştirme ve yaratıcı teknoloji pratiğine ilişkin yeni editoryal yazı.',
      en: 'A new editorial entry about architecture, product development, and creative technology practice.',
    },
    noIndex: true,
  },
});

export const isoToLocalDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

export const localDateTimeToIso = (value: string) =>
  value ? new Date(value).toISOString() : undefined;

export const sortByOrder = <T extends { order: number }>(values: T[]) =>
  [...values].sort((left, right) => left.order - right.order);
