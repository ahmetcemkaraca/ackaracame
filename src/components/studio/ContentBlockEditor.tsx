import { sanitizeSlug, type ContentBlock, type LocalizedText, type Media } from '../../domain/content';
import {
  createCalloutBlock,
  createCodeBlock,
  createFactsBlock,
  createGalleryBlock,
  createMediaBlock,
  createMediaMetadata,
  createQuoteBlock,
  createTextBlock,
} from './editorUtils';

type EditableBlockType = 'text' | 'facts' | 'callout' | 'quote' | 'code' | 'media' | 'gallery';
type CodeLanguage = Extract<ContentBlock, { type: 'code' }>['language'];

const mediaKinds = [
  ['image', 'Görsel'],
  ['video', 'Video'],
  ['audio', 'Ses'],
  ['document', 'Belge'],
  ['embed', 'Embed'],
] as const satisfies ReadonlyArray<readonly [Media['kind'], string]>;

const mediaRoles = [
  ['cover', 'Kapak'],
  ['gallery', 'Galeri'],
  ['diagram', 'Diyagram'],
  ['demo', 'Demo'],
  ['thumbnail', 'Küçük görsel'],
  ['download', 'İndirme'],
] as const satisfies ReadonlyArray<readonly [Media['role'], string]>;

const codeLanguages = [
  ['typescript', 'TypeScript'],
  ['javascript', 'JavaScript'],
  ['python', 'Python'],
  ['dart', 'Dart'],
  ['json', 'JSON'],
  ['bash', 'Bash'],
  ['text', 'Düz metin'],
] as const satisfies ReadonlyArray<readonly [CodeLanguage, string]>;

const isCodeLanguage = (value: string): value is CodeLanguage =>
  codeLanguages.some(([language]) => language === value);

const blockFactories: Record<EditableBlockType, () => ContentBlock> = {
  text: createTextBlock,
  facts: createFactsBlock,
  callout: createCalloutBlock,
  quote: createQuoteBlock,
  code: createCodeBlock,
  media: createMediaBlock,
  gallery: createGalleryBlock,
};

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  allowedTypes: EditableBlockType[];
  minimumBlocks: number;
}

const replaceAt = <T,>(values: T[], index: number, value: T) =>
  values.map((item, itemIndex) => (itemIndex === index ? value : item));

const moveAt = <T,>(values: T[], from: number, to: number) => {
  if (to < 0 || to >= values.length) return values;
  const next = [...values];
  const [moved] = next.splice(from, 1);
  if (!moved) return values;
  next.splice(to, 0, moved);
  return next;
};

const BlockControls = ({
  index,
  count,
  canDelete,
  onMove,
  onDelete,
}: {
  index: number;
  count: number;
  canDelete: boolean;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) => (
  <div className="studio-block-controls" aria-label="Blok işlemleri">
    <button type="button" className="studio-icon-button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Bloğu yukarı taşı">↑</button>
    <button type="button" className="studio-icon-button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Bloğu aşağı taşı">↓</button>
    <button type="button" className="studio-icon-button studio-icon-button--danger" onClick={onDelete} disabled={!canDelete} aria-label="Bloğu sil">×</button>
  </div>
);

const TextBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'text' }>;
  onChange: (block: ContentBlock) => void;
}) => (
  <div className="studio-form-grid">
    <label className="studio-field">
      <span>Üst başlık · TR</span>
      <input value={block.eyebrow?.tr || ''} onChange={(event) => onChange({ ...block, eyebrow: { tr: event.target.value, en: block.eyebrow?.en || '' } })} />
    </label>
    <label className="studio-field">
      <span>Eyebrow · EN</span>
      <input value={block.eyebrow?.en || ''} onChange={(event) => onChange({ ...block, eyebrow: { tr: block.eyebrow?.tr || '', en: event.target.value } })} />
    </label>
    <label className="studio-field">
      <span>Başlık · TR</span>
      <input required value={block.heading.tr} onChange={(event) => onChange({ ...block, heading: { ...block.heading, tr: event.target.value } })} />
    </label>
    <label className="studio-field">
      <span>Heading · EN</span>
      <input required value={block.heading.en} onChange={(event) => onChange({ ...block, heading: { ...block.heading, en: event.target.value } })} />
    </label>
    <label className="studio-field studio-field--full">
      <span>Metin · TR</span>
      <textarea required rows={5} value={block.body.tr} onChange={(event) => onChange({ ...block, body: { ...block.body, tr: event.target.value } })} />
    </label>
    <label className="studio-field studio-field--full">
      <span>Body · EN</span>
      <textarea required rows={5} value={block.body.en} onChange={(event) => onChange({ ...block, body: { ...block.body, en: event.target.value } })} />
    </label>
  </div>
);

const FactsBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'facts' }>;
  onChange: (block: ContentBlock) => void;
}) => {
  const updateItem = (index: number, key: 'label' | 'value', locale: keyof LocalizedText, value: string) => {
    const item = block.items[index];
    if (!item) return;
    onChange({
      ...block,
      items: replaceAt(block.items, index, {
        ...item,
        [key]: { ...item[key], [locale]: value },
      }),
    });
  };

  return (
    <div className="studio-stack">
      <div className="studio-form-grid">
        <label className="studio-field">
          <span>Blok başlığı · TR</span>
          <input required value={block.heading.tr} onChange={(event) => onChange({ ...block, heading: { ...block.heading, tr: event.target.value } })} />
        </label>
        <label className="studio-field">
          <span>Block heading · EN</span>
          <input required value={block.heading.en} onChange={(event) => onChange({ ...block, heading: { ...block.heading, en: event.target.value } })} />
        </label>
      </div>
      {block.items.map((item, index) => (
        <fieldset className="studio-fact-row" key={`${block.id}-${index.toString()}`}>
          <legend>Bilgi {index + 1}</legend>
          <label className="studio-field"><span>Etiket · TR</span><input required value={item.label.tr} onChange={(event) => updateItem(index, 'label', 'tr', event.target.value)} /></label>
          <label className="studio-field"><span>Label · EN</span><input required value={item.label.en} onChange={(event) => updateItem(index, 'label', 'en', event.target.value)} /></label>
          <label className="studio-field"><span>Değer · TR</span><input required value={item.value.tr} onChange={(event) => updateItem(index, 'value', 'tr', event.target.value)} /></label>
          <label className="studio-field"><span>Value · EN</span><input required value={item.value.en} onChange={(event) => updateItem(index, 'value', 'en', event.target.value)} /></label>
          <button
            type="button"
            className="studio-text-button studio-text-button--danger"
            disabled={block.items.length === 1}
            onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })}
          >
            Bilgiyi sil
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="studio-button studio-button--quiet"
        disabled={block.items.length >= 12}
        onClick={() => onChange({
          ...block,
          items: [
            ...block.items,
            { label: { tr: 'Etiket', en: 'Label' }, value: { tr: 'Değer', en: 'Value' } },
          ],
        })}
      >
        + Bilgi satırı
      </button>
    </div>
  );
};

const CalloutBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'callout' }>;
  onChange: (block: ContentBlock) => void;
}) => (
  <div className="studio-form-grid">
    <label className="studio-field studio-field--full">
      <span>Ton</span>
      <select value={block.tone} onChange={(event) => onChange({ ...block, tone: event.target.value as typeof block.tone })}>
        <option value="note">Not</option>
        <option value="decision">Karar</option>
        <option value="constraint">Kısıt</option>
        <option value="outcome">Sonuç</option>
      </select>
    </label>
    <label className="studio-field"><span>Başlık · TR</span><input required value={block.heading.tr} onChange={(event) => onChange({ ...block, heading: { ...block.heading, tr: event.target.value } })} /></label>
    <label className="studio-field"><span>Heading · EN</span><input required value={block.heading.en} onChange={(event) => onChange({ ...block, heading: { ...block.heading, en: event.target.value } })} /></label>
    <label className="studio-field"><span>Metin · TR</span><textarea required rows={4} value={block.body.tr} onChange={(event) => onChange({ ...block, body: { ...block.body, tr: event.target.value } })} /></label>
    <label className="studio-field"><span>Body · EN</span><textarea required rows={4} value={block.body.en} onChange={(event) => onChange({ ...block, body: { ...block.body, en: event.target.value } })} /></label>
  </div>
);

const QuoteBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'quote' }>;
  onChange: (block: ContentBlock) => void;
}) => {
  const attribution = block.attribution || { tr: '', en: '' };

  return (
    <div className="studio-form-grid">
      <label className="studio-field studio-field--full">
        <span>Alıntı · TR</span>
        <textarea required minLength={12} maxLength={360} rows={4} value={block.quote.tr} onChange={(event) => onChange({ ...block, quote: { ...block.quote, tr: event.target.value } })} />
      </label>
      <label className="studio-field studio-field--full">
        <span>Quote · EN</span>
        <textarea required minLength={12} maxLength={360} rows={4} value={block.quote.en} onChange={(event) => onChange({ ...block, quote: { ...block.quote, en: event.target.value } })} />
      </label>
      <label className="studio-field">
        <span>Atıf · TR</span>
        <input maxLength={80} value={attribution.tr} onChange={(event) => onChange({ ...block, attribution: { ...attribution, tr: event.target.value } })} />
      </label>
      <label className="studio-field">
        <span>Attribution · EN</span>
        <input maxLength={80} value={attribution.en} onChange={(event) => onChange({ ...block, attribution: { ...attribution, en: event.target.value } })} />
      </label>
    </div>
  );
};

const CodeBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'code' }>;
  onChange: (block: ContentBlock) => void;
}) => {
  const caption = block.caption || { tr: '', en: '' };

  return (
    <div className="studio-form-grid">
      <label className="studio-field studio-field--full">
        <span>Kod dili</span>
        <select
          value={block.language}
          onChange={(event) => {
            if (!isCodeLanguage(event.target.value)) return;
            onChange({ ...block, language: event.target.value });
          }}
        >
          {codeLanguages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="studio-field studio-field--full">
        <span>Kod</span>
        <textarea required maxLength={50_000} rows={14} spellCheck={false} value={block.code} onChange={(event) => onChange({ ...block, code: event.target.value })} />
        <small>Yalnız seçili güvenli dil etiketi ve düz metin kod saklanır; HTML çalıştırılmaz.</small>
      </label>
      <label className="studio-field studio-field--full">
        <span>Açıklama · TR</span>
        <textarea minLength={12} maxLength={360} rows={3} value={caption.tr} onChange={(event) => onChange({ ...block, caption: { ...caption, tr: event.target.value } })} />
      </label>
      <label className="studio-field studio-field--full">
        <span>Caption · EN</span>
        <textarea minLength={12} maxLength={360} rows={3} value={caption.en} onChange={(event) => onChange({ ...block, caption: { ...caption, en: event.target.value } })} />
        <small>Açıklama opsiyoneldir; kullanıyorsanız iki dili de doldurun.</small>
      </label>
    </div>
  );
};

const optionalNumber = (value: string) => value === '' ? undefined : Number(value);

const OptionalBlockHeadingFields = ({
  heading,
  onChange,
}: {
  heading?: LocalizedText;
  onChange: (heading: LocalizedText) => void;
}) => {
  const value = heading || { tr: '', en: '' };
  return (
    <div className="studio-form-grid">
      <label className="studio-field">
        <span>Opsiyonel başlık · TR</span>
        <input minLength={2} maxLength={120} value={value.tr} onChange={(event) => onChange({ ...value, tr: event.target.value })} />
      </label>
      <label className="studio-field">
        <span>Optional heading · EN</span>
        <input minLength={2} maxLength={120} value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} />
        <small>Başlık kullanılıyorsa iki dil de doldurulmalıdır.</small>
      </label>
    </div>
  );
};

const MediaMetadataFields = ({
  media,
  onChange,
}: {
  media: Media;
  onChange: (media: Media) => void;
}) => {
  const caption = media.caption || { tr: '', en: '' };
  const dimensionsRequired = media.assetState === 'ready'
    && (media.kind === 'image' || media.kind === 'video');

  const setAssetState = (assetState: Media['assetState']) => {
    const next: Media = { ...media, assetState };
    if (assetState === 'planned') {
      delete next.src;
      delete next.poster;
    }
    onChange(next);
  };

  return (
    <>
      <label className="studio-field">
        <span>Varlık kimliği</span>
        <input required minLength={2} maxLength={80} value={media.id} onChange={(event) => onChange({ ...media, id: sanitizeSlug(event.target.value) })} />
        <small>Küçük harf, sayı ve tire; kayıtta normalize edilir.</small>
      </label>
      <label className="studio-field">
        <span>Tür</span>
        <select value={media.kind} onChange={(event) => onChange({ ...media, kind: event.target.value as Media['kind'] })}>
          {mediaKinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="studio-field">
        <span>Rol</span>
        <select value={media.role} onChange={(event) => onChange({ ...media, role: event.target.value as Media['role'] })}>
          {mediaRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="studio-field">
        <span>Varlık durumu</span>
        <select value={media.assetState} onChange={(event) => setAssetState(event.target.value as Media['assetState'])}>
          <option value="planned">Planlandı</option>
          <option value="ready">Hazır</option>
        </select>
      </label>
      <label className="studio-field studio-field--full">
        <span>Kaynak URL</span>
        <input
          required={media.assetState === 'ready'}
          disabled={media.assetState === 'planned'}
          maxLength={2048}
          placeholder={media.assetState === 'planned' ? 'Hazır durumuna geçtiğinizde etkinleşir' : '/media/example.webp'}
          value={media.src || ''}
          onChange={(event) => onChange({ ...media, src: event.target.value || undefined })}
        />
        <small>Site içi yol, onaylı Firebase/Google medya adresi; embed için YouTube veya Vimeo.</small>
      </label>
      <label className="studio-field studio-field--full">
        <span>Poster URL</span>
        <input
          disabled={media.assetState === 'planned'}
          maxLength={2048}
          placeholder={media.assetState === 'planned' ? 'Hazır durumuna geçtiğinizde etkinleşir' : '/media/poster.webp'}
          value={media.poster || ''}
          onChange={(event) => onChange({ ...media, poster: event.target.value || undefined })}
        />
      </label>
      <label className="studio-field">
        <span>Alt · TR</span>
        <input required maxLength={80} value={media.alt.tr} onChange={(event) => onChange({ ...media, alt: { ...media.alt, tr: event.target.value } })} />
      </label>
      <label className="studio-field">
        <span>Alt · EN</span>
        <input required maxLength={80} value={media.alt.en} onChange={(event) => onChange({ ...media, alt: { ...media.alt, en: event.target.value } })} />
      </label>
      <label className="studio-field studio-field--full">
        <span>Açıklama · TR</span>
        <textarea minLength={12} maxLength={360} rows={3} value={caption.tr} onChange={(event) => onChange({ ...media, caption: { ...caption, tr: event.target.value } })} />
      </label>
      <label className="studio-field studio-field--full">
        <span>Caption · EN</span>
        <textarea minLength={12} maxLength={360} rows={3} value={caption.en} onChange={(event) => onChange({ ...media, caption: { ...caption, en: event.target.value } })} />
        <small>Açıklama opsiyoneldir; kullanılıyorsa iki dil de doldurulmalıdır.</small>
      </label>
      <label className="studio-field">
        <span>Genişlik · px</span>
        <input type="number" required={dimensionsRequired} min={1} max={12000} value={media.width ?? ''} onChange={(event) => onChange({ ...media, width: optionalNumber(event.target.value) })} />
      </label>
      <label className="studio-field">
        <span>Yükseklik · px</span>
        <input type="number" required={dimensionsRequired} min={1} max={12000} value={media.height ?? ''} onChange={(event) => onChange({ ...media, height: optionalNumber(event.target.value) })} />
      </label>
      <label className="studio-field studio-field--wide">
        <span>MIME türü</span>
        <input minLength={3} maxLength={100} placeholder="image/webp" value={media.mimeType || ''} onChange={(event) => onChange({ ...media, mimeType: event.target.value || undefined })} />
      </label>
    </>
  );
};

const MediaBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'media' }>;
  onChange: (block: ContentBlock) => void;
}) => (
  <div className="studio-stack">
    <OptionalBlockHeadingFields heading={block.heading} onChange={(heading) => onChange({ ...block, heading })} />
    <fieldset className="studio-media-editor-row">
      <legend>Medya metadata</legend>
      <MediaMetadataFields media={block.media} onChange={(media) => onChange({ ...block, media })} />
    </fieldset>
  </div>
);

const GalleryBlockFields = ({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'gallery' }>;
  onChange: (block: ContentBlock) => void;
}) => {
  const updateItem = (index: number, media: Media) => {
    onChange({ ...block, items: replaceAt(block.items, index, media) });
  };

  return (
    <div className="studio-stack">
      <OptionalBlockHeadingFields heading={block.heading} onChange={(heading) => onChange({ ...block, heading })} />
      {block.items.map((item, index) => (
        <fieldset className="studio-media-editor-row" key={`${block.id}-item-${index.toString()}`}>
          <legend>Galeri öğesi {index + 1}</legend>
          <div className="studio-block-controls studio-media-editor-row__controls" aria-label={`Galeri öğesi ${index + 1} işlemleri`}>
            <button type="button" className="studio-icon-button" disabled={index === 0} onClick={() => onChange({ ...block, items: moveAt(block.items, index, index - 1) })} aria-label="Öğeyi yukarı taşı">↑</button>
            <button type="button" className="studio-icon-button" disabled={index === block.items.length - 1} onClick={() => onChange({ ...block, items: moveAt(block.items, index, index + 1) })} aria-label="Öğeyi aşağı taşı">↓</button>
            <button type="button" className="studio-icon-button studio-icon-button--danger" disabled={block.items.length <= 2} onClick={() => onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) })} aria-label="Galeri öğesini sil">×</button>
          </div>
          <MediaMetadataFields media={item} onChange={(media) => updateItem(index, media)} />
        </fieldset>
      ))}
      <button
        type="button"
        className="studio-button studio-button--quiet"
        disabled={block.items.length >= 12}
        onClick={() => onChange({ ...block, items: [...block.items, createMediaMetadata()] })}
      >
        + Galeri öğesi
      </button>
    </div>
  );
};

export const ContentBlockEditor = ({
  blocks,
  onChange,
  allowedTypes,
  minimumBlocks,
}: ContentBlockEditorProps) => {
  const addBlock = (type: EditableBlockType) => {
    onChange([...blocks, blockFactories[type]()]);
  };

  return (
    <section className="studio-editor-section" aria-labelledby="content-blocks-title">
      <div className="studio-section-heading">
        <div>
          <p className="studio-kicker">Narrative system</p>
          <h3 id="content-blocks-title">İçerik blokları</h3>
          <p>Blokları düzenleyin, sıralayın ve iki dilde eksiksiz tutun.</p>
        </div>
        <div className="studio-add-menu" aria-label="Blok ekle">
          {allowedTypes.includes('text') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('text')}>+ Metin</button> : null}
          {allowedTypes.includes('facts') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('facts')}>+ Bilgiler</button> : null}
          {allowedTypes.includes('callout') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('callout')}>+ Vurgu</button> : null}
          {allowedTypes.includes('quote') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('quote')}>+ Alıntı</button> : null}
          {allowedTypes.includes('code') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('code')}>+ Kod</button> : null}
          {allowedTypes.includes('media') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('media')}>+ Medya</button> : null}
          {allowedTypes.includes('gallery') ? <button type="button" className="studio-button studio-button--quiet" onClick={() => addBlock('gallery')}>+ Galeri</button> : null}
        </div>
      </div>

      <div className="studio-block-list">
        {blocks.map((block, index) => (
          <article className="studio-block-card" key={block.id}>
            <header className="studio-block-card__header">
              <div>
                <span className="studio-block-index">{String(index + 1).padStart(2, '0')}</span>
                <strong>{block.type}</strong>
                <code>{block.id}</code>
              </div>
              <BlockControls
                index={index}
                count={blocks.length}
                canDelete={blocks.length > minimumBlocks}
                onMove={(direction) => onChange(moveAt(blocks, index, index + direction))}
                onDelete={() => onChange(blocks.filter((_, blockIndex) => blockIndex !== index))}
              />
            </header>
            {block.type === 'text' ? (
              <TextBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : block.type === 'facts' ? (
              <FactsBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : block.type === 'callout' ? (
              <CalloutBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : block.type === 'quote' ? (
              <QuoteBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : block.type === 'code' ? (
              <CodeBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : block.type === 'media' ? (
              <MediaBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            ) : (
              <GalleryBlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, index, next))} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
