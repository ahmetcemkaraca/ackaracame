import { ContentBlockSchema } from '../../domain/content';
import {
  createCodeBlock,
  createGalleryBlock,
  createMediaBlock,
  createQuoteBlock,
  collectStudioMediaReferenceUrls,
  isoToLocalDateTime,
  localDateTimeToIso,
  normalizeContentBlocks,
  parseCommaList,
  parsePalette,
  validateStudioMediaContext,
} from './editorUtils';

const canonicalProjectUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fprojects%2Fdraw-or-die%2Fhero.webp?alt=media';

describe('studio editor utilities', () => {
  it('round-trips publication timestamps through a local datetime control', () => {
    const source = '2026-08-04T18:25:00.000Z';
    expect(localDateTimeToIso(isoToLocalDateTime(source))).toBe(source);
  });

  it('normalizes comma fields without duplicate empty values', () => {
    expect(parseCommaList('React, TypeScript, React,  ')).toEqual([
      'React',
      'TypeScript',
    ]);
    expect(parsePalette('#ABCDEF, #123456, #abcdef')).toEqual([
      '#abcdef',
      '#123456',
    ]);
  });

  it('creates schema-valid quote, code, media, and gallery blocks', () => {
    const quote = createQuoteBlock();
    const code = createCodeBlock();
    const media = createMediaBlock();
    const gallery = createGalleryBlock();

    expect(ContentBlockSchema.safeParse(quote).success).toBe(true);
    expect(ContentBlockSchema.safeParse(code).success).toBe(true);
    expect(ContentBlockSchema.safeParse(media).success).toBe(true);
    expect(ContentBlockSchema.safeParse(gallery).success).toBe(true);
    expect(quote.type).toBe('quote');
    expect(code).toMatchObject({ type: 'code', language: 'typescript' });
    expect(media).toMatchObject({ type: 'media', media: { assetState: 'planned' } });
    expect(gallery).toMatchObject({ type: 'gallery', items: [{ assetState: 'planned' }, { assetState: 'planned' }] });
  });

  it('omits fully blank optional quote attribution and code captions', () => {
    const quote = createQuoteBlock();
    const code = createCodeBlock();
    if (quote.type !== 'quote' || code.type !== 'code') throw new Error('Expected editable block fixtures.');

    const normalized = normalizeContentBlocks([
      { ...quote, attribution: { tr: ' ', en: '' } },
      { ...code, caption: { tr: '', en: ' ' } },
    ]);

    expect(normalized[0]).not.toHaveProperty('attribution');
    expect(normalized[1]).not.toHaveProperty('caption');
    expect(normalized.every((block) => ContentBlockSchema.safeParse(block).success)).toBe(true);
  });

  it('omits blank optional media metadata and sources from planned assets', () => {
    const media = createMediaBlock();
    const gallery = createGalleryBlock();
    if (media.type !== 'media' || gallery.type !== 'gallery') throw new Error('Expected media block fixtures.');

    const normalized = normalizeContentBlocks([
      {
        ...media,
        heading: { tr: ' ', en: '' },
        media: {
          ...media.media,
          src: ' /media/not-ready.webp ',
          poster: ' /media/planned-poster.webp ',
          caption: { tr: '', en: ' ' },
          mimeType: ' ',
        },
      },
      {
        ...gallery,
        heading: { tr: '', en: ' ' },
        items: gallery.items.map((item) => ({
          ...item,
          poster: '',
          caption: { tr: ' ', en: '' },
          mimeType: '',
        })),
      },
    ]);

    expect(normalized[0]).not.toHaveProperty('heading');
    expect(normalized[0]).not.toHaveProperty('media.src');
    expect(normalized[0]).not.toHaveProperty('media.poster');
    expect(normalized[0]).not.toHaveProperty('media.caption');
    expect(normalized[0]).not.toHaveProperty('media.mimeType');
    expect(normalized[1]).not.toHaveProperty('heading');
    expect(normalized[1]).not.toHaveProperty('items.0.poster');
    expect(normalized[1]).not.toHaveProperty('items.0.caption');
    expect(normalized[1]).not.toHaveProperty('items.0.mimeType');
    expect(normalized.every((block) => ContentBlockSchema.safeParse(block).success)).toBe(true);
  });

  it('collects src and poster references across main media and narrative blocks', () => {
    const mediaBlock = createMediaBlock();
    if (mediaBlock.type !== 'media') throw new Error('Expected a media block fixture.');
    const blocks = [{
      ...mediaBlock,
      media: {
        ...mediaBlock.media,
        assetState: 'ready' as const,
        src: '/media/block-source.webp',
        poster: canonicalProjectUrl,
        width: 1600,
        height: 900,
      },
    }];
    const references = collectStudioMediaReferenceUrls([{
      ...mediaBlock.media,
      assetState: 'ready',
      src: '/media/main-source.webp',
      poster: '/media/main-poster.webp',
      width: 1600,
      height: 900,
    }], blocks);

    expect(references).toEqual(new Set([
      '/media/main-source.webp',
      '/media/main-poster.webp',
      '/media/block-source.webp',
      canonicalProjectUrl,
    ]));
  });

  it('accepts only exact token-free Firebase URLs bound to bucket, entity, and slug', () => {
    const mediaBlock = createMediaBlock();
    if (mediaBlock.type !== 'media') throw new Error('Expected a media block fixture.');
    const block = {
      ...mediaBlock,
      media: {
        ...mediaBlock.media,
        assetState: 'ready' as const,
        src: '/media/local-source.webp',
        poster: canonicalProjectUrl,
        width: 1600,
        height: 900,
      },
    };
    const context = {
      entity: 'project' as const,
      slug: 'draw-or-die',
      storageBucket: 'test',
      blocks: [block],
    };

    expect(validateStudioMediaContext(context)).toBeNull();
    expect(validateStudioMediaContext({
      ...context,
      blocks: [{ ...block, media: { ...block.media, poster: 'https://images.googleusercontent.com/example.webp' } }],
    })).toBeNull();

    const invalidUrls = [
      canonicalProjectUrl.replace('/b/test/', '/b/other-bucket/'),
      canonicalProjectUrl.replace('%2Fdraw-or-die%2F', '%2Fother-project%2F'),
      `${canonicalProjectUrl}&token=legacy-secret`,
      canonicalProjectUrl.replace('%2Fhero.webp', '%2fnested%2Fhero.webp'),
    ];
    invalidUrls.forEach((poster) => {
      const error = validateStudioMediaContext({
        ...context,
        blocks: [{ ...block, media: { ...block.media, poster } }],
      });
      expect(error).toContain('blocks.0.media.poster');
      expect(error).toContain('farklı bucket, slug veya token kabul edilmez');
    });
  });

  it('fails closed when Firebase media exists without a configured bucket', () => {
    const mediaBlock = createMediaBlock();
    if (mediaBlock.type !== 'media') throw new Error('Expected a media block fixture.');
    expect(validateStudioMediaContext({
      entity: 'project',
      slug: 'draw-or-die',
      blocks: [{
        ...mediaBlock,
        media: { ...mediaBlock.media, poster: canonicalProjectUrl },
      }],
    })).toContain('bucket yapılandırması eksik');
  });
});
