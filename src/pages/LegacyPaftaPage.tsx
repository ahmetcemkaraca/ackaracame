import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Maximize2, Minus, Plus } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { z } from 'zod';
import { useAppPreferences, type Locale } from '../context/AppPreferences';
import { AssetHrefSchema, sanitizeText } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocaleHref } from '../hooks/useLocaleHref';
import '../styles/legacy-pafta.css';

const LEGACY_PAFTA_CODE = /^pafta-[0-9]{13}-[a-z0-9]{9}$/;

export const isValidLegacyPaftaCode = (value: unknown): value is string =>
  typeof value === 'string' && LEGACY_PAFTA_CODE.test(value);

const plainText = (minimum: number, maximum: number) => z
  .string()
  .max(maximum)
  .transform(sanitizeText)
  .pipe(z.string().min(minimum).max(maximum));

const optionalPlainText = (maximum: number) => plainText(0, maximum).optional();

const LegacyPaftaImageSchema = AssetHrefSchema.refine((value) => {
  if (value.startsWith('/')) return true;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === 'firebasestorage.googleapis.com' || hostname.endsWith('.googleusercontent.com');
  } catch {
    return false;
  }
}, { message: 'Legacy pafta media must use an approved first-party media host.' });

const LegacyPaftaSchema = z.object({
  title: plainText(1, 180),
  description: optionalPlainText(10_000),
  semester: optionalPlainText(80),
  year: optionalPlainText(16),
  course: optionalPlainText(120),
  professor: optionalPlainText(120),
  technologies: z.array(plainText(1, 60)).max(20),
  images: z.array(LegacyPaftaImageSchema).max(20),
}).strict();

const LegacyPaftaResponseSchema = z.object({
  ok: z.literal(true),
  pafta: LegacyPaftaSchema.nullable(),
}).strict();

export type LegacyPafta = z.output<typeof LegacyPaftaSchema>;

export const parseLegacyPaftaResponse = (value: unknown): LegacyPafta | null => {
  const parsed = LegacyPaftaResponseSchema.safeParse(value);
  if (!parsed.success) throw new Error('The legacy pafta service returned an invalid response.');
  return parsed.data.pafta;
};

class LegacyPaftaConfigurationError extends Error {}

export const loadPublishedPafta = async (code: string): Promise<LegacyPafta | null> => {
  if (!isValidLegacyPaftaCode(code)) throw new Error('Invalid legacy pafta code.');

  const [firebaseFunctions, firebaseClient] = await Promise.all([
    import('firebase/functions'),
    import('../lib/firebase/publicClient'),
  ]);
  const services = firebaseClient.getPublicFirebaseServices();
  if (!services) throw new LegacyPaftaConfigurationError('Firebase is not configured.');

  const callable = firebaseFunctions.httpsCallable<{ code: string }, unknown>(
    services.functions,
    'getPublishedPafta',
    { limitedUseAppCheckTokens: true },
  );
  const result = await callable({ code });
  return parseLegacyPaftaResponse(result.data);
};

type PaftaLoadState =
  | { status: 'invalid' }
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; kind: 'configuration' | 'service' }
  | { status: 'ready'; pafta: LegacyPafta };

const copy = {
  tr: {
    back: 'Seçili işlere dön',
    loading: 'Dijital pafta yükleniyor…',
    invalidEyebrow: 'Geçersiz QR bağlantısı',
    invalidTitle: 'Bu QR kod biçimi tanınmıyor.',
    invalidBody: 'Bağlantı eksik veya değiştirilmiş olabilir. Fiziksel paftadaki QR kodu yeniden okutun.',
    missingEyebrow: 'Pafta bulunamadı',
    missingTitle: 'Bu dijital pafta artık yayında değil.',
    missingBody: 'Kayıt kaldırılmış, arşivlenmiş veya bağlantı geçerliliğini yitirmiş olabilir.',
    errorEyebrow: 'Bağlantı kurulamadı',
    errorTitle: 'Dijital pafta güvenli biçimde yüklenemedi.',
    errorBody: 'Bağlantınızı kontrol edip yeniden deneyin. Sorun sürerse QR kodun sahibiyle iletişime geçin.',
    configBody: 'Dijital pafta servisi şu anda yapılandırılmamış. Daha sonra yeniden deneyin.',
    retry: 'Yeniden dene',
    archive: 'Fiziksel pafta / dijital katman',
    details: 'Proje bilgileri',
    semester: 'Dönem',
    year: 'Yıl',
    course: 'Ders',
    professor: 'Danışman',
    tools: 'Araçlar',
    boards: 'Sunum paftaları',
    noMedia: 'Bu kayıt için yayımlanmış bir dijital görsel bulunmuyor.',
    openImage: 'Görseli yeni sekmede aç',
    zoomOut: 'Görseli küçült',
    zoomIn: 'Görseli büyüt',
    resetZoom: 'Görseli alana sığdır',
    image: 'Pafta görseli',
  },
  en: {
    back: 'Back to selected work',
    loading: 'Loading the digital presentation board…',
    invalidEyebrow: 'Invalid QR link',
    invalidTitle: 'This QR code format is not recognised.',
    invalidBody: 'The link may be incomplete or altered. Scan the QR code on the physical board again.',
    missingEyebrow: 'Board not found',
    missingTitle: 'This digital presentation board is no longer published.',
    missingBody: 'The record may have been removed, archived, or its link may no longer be valid.',
    errorEyebrow: 'Connection unavailable',
    errorTitle: 'The digital board could not be loaded securely.',
    errorBody: 'Check your connection and try again. If the problem continues, contact the owner of the QR code.',
    configBody: 'The digital board service is not configured right now. Please try again later.',
    retry: 'Try again',
    archive: 'Physical board / digital layer',
    details: 'Project information',
    semester: 'Semester',
    year: 'Year',
    course: 'Course',
    professor: 'Advisor',
    tools: 'Tools',
    boards: 'Presentation boards',
    noMedia: 'There is no published digital image for this record.',
    openImage: 'Open image in a new tab',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    resetZoom: 'Fit image to viewport',
    image: 'Presentation board image',
  },
} as const;

const StateSurface = ({
  eyebrow,
  title,
  body,
  retryLabel,
  onRetry,
  backHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
  backHref: string;
}) => (
  <section className="legacy-pafta-state shell" role={onRetry ? 'alert' : 'status'}>
    <span className="eyebrow">{eyebrow}</span>
    <h1>{title}</h1>
    <p>{body}</p>
    <div>
      <Link href={backHref} className="button button--ghost"><ArrowLeft aria-hidden="true" />ACKaraca</Link>
      {retryLabel && onRetry ? <button type="button" className="button button--primary" onClick={onRetry}>{retryLabel}</button> : null}
    </div>
  </section>
);

const metadataFor = (pafta: LegacyPafta, locale: Locale) => {
  const labels = copy[locale];
  const items: Array<{ label: string; value: string }> = [];
  if (pafta.semester) items.push({ label: labels.semester, value: pafta.semester });
  if (pafta.year) items.push({ label: labels.year, value: pafta.year });
  if (pafta.course) items.push({ label: labels.course, value: pafta.course });
  if (pafta.professor) items.push({ label: labels.professor, value: pafta.professor });
  if (pafta.technologies.length) items.push({ label: labels.tools, value: pafta.technologies.join(', ') });
  return items;
};

const LegacyPaftaRoute = ({ code, locale }: { code: string; locale: Locale }) => {
  const labels = copy[locale];
  const localeHref = useLocaleHref();
  const workHref = localeHref('/work');
  const validCode = isValidLegacyPaftaCode(code);
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<PaftaLoadState>(() => (
    validCode ? { status: 'loading' } : { status: 'invalid' }
  ));
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!validCode) return undefined;

    let disposed = false;
    void loadPublishedPafta(code)
      .then((pafta) => {
        if (disposed) return;
        setState(pafta ? { status: 'ready', pafta } : { status: 'not-found' });
      })
      .catch((error: unknown) => {
        if (disposed) return;
        if (import.meta.env.DEV) console.warn('Legacy pafta load failed.', error);
        setState({
          status: 'error',
          kind: error instanceof LegacyPaftaConfigurationError ? 'configuration' : 'service',
        });
      });

    return () => {
      disposed = true;
    };
  }, [code, retryKey, validCode]);

  const pafta = state.status === 'ready' ? state.pafta : null;
  const metaDescription = pafta?.description || (
    locale === 'tr' ? 'QR kodla erişilen dijital mimari pafta.' : 'A digital architecture board accessed through a QR code.'
  );

  useDocumentMeta({
    title: pafta ? `${pafta.title} — ACKaraca` : `${labels.image} — ACKaraca`,
    description: metaDescription,
    path: validCode ? `/pafta/${encodeURIComponent(code)}` : '/pafta/invalid',
    locale,
    noIndex: true,
    type: 'article',
  });

  const metadata = useMemo(() => pafta ? metadataFor(pafta, locale) : [], [locale, pafta]);

  if (state.status === 'invalid') {
    return <main id="main-content" tabIndex={-1} className="page legacy-pafta-page"><StateSurface eyebrow={labels.invalidEyebrow} title={labels.invalidTitle} body={labels.invalidBody} backHref={workHref} /></main>;
  }

  if (state.status === 'loading') {
    return (
      <main id="main-content" tabIndex={-1} className="page legacy-pafta-page" aria-busy="true">
        <section className="legacy-pafta-loading shell" role="status" aria-live="polite">
          <span aria-hidden="true" />
          <p>{labels.loading}</p>
        </section>
      </main>
    );
  }

  if (state.status === 'not-found') {
    return <main id="main-content" tabIndex={-1} className="page legacy-pafta-page"><StateSurface eyebrow={labels.missingEyebrow} title={labels.missingTitle} body={labels.missingBody} backHref={workHref} /></main>;
  }

  if (state.status === 'error') {
    return (
      <main id="main-content" tabIndex={-1} className="page legacy-pafta-page">
        <StateSurface
          eyebrow={labels.errorEyebrow}
          title={labels.errorTitle}
          body={state.kind === 'configuration' ? labels.configBody : labels.errorBody}
          retryLabel={labels.retry}
          backHref={workHref}
          onRetry={() => {
            setState({ status: 'loading' });
            setSelectedImage(0);
            setZoom(1);
            setRetryKey((value) => value + 1);
          }}
        />
      </main>
    );
  }

  const readyPafta = state.pafta;
  const activeImage = readyPafta.images[selectedImage];
  const context = [readyPafta.semester, readyPafta.year].filter(Boolean).join(' / ');

  return (
    <main id="main-content" tabIndex={-1} className="page legacy-pafta-page">
      <header className="legacy-pafta-hero shell">
        <Link href={workHref} className="legacy-pafta-back"><ArrowLeft aria-hidden="true" />{labels.back}</Link>
        <div className="legacy-pafta-hero__copy">
          <span className="eyebrow">{labels.archive}{context ? ` / ${context}` : ''}</span>
          <h1>{readyPafta.title}</h1>
          {readyPafta.description ? <p>{readyPafta.description}</p> : null}
        </div>
        {metadata.length ? (
          <section className="legacy-pafta-metadata" aria-labelledby="legacy-pafta-details">
            <h2 id="legacy-pafta-details">{labels.details}</h2>
            <dl>{metadata.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          </section>
        ) : null}
      </header>

      <section className="legacy-pafta-viewer shell" aria-labelledby="legacy-pafta-boards">
        <div className="legacy-pafta-viewer__heading">
          <span>QR / {String(readyPafta.images.length).padStart(2, '0')}</span>
          <h2 id="legacy-pafta-boards">{labels.boards}</h2>
        </div>

        {activeImage ? (
          <div className="legacy-pafta-stage">
            {readyPafta.images.length > 1 ? (
              <nav className="legacy-pafta-thumbnails" aria-label={labels.boards}>
                {readyPafta.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${index}-${image}`}
                    aria-label={`${labels.image} ${index + 1}`}
                    aria-current={selectedImage === index ? 'true' : undefined}
                    onClick={() => { setSelectedImage(index); setZoom(1); }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </nav>
            ) : null}

            <figure className="legacy-pafta-canvas">
              <div>
                <img
                  src={activeImage}
                  alt={`${readyPafta.title} — ${labels.image} ${selectedImage + 1}`}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
              <figcaption>
                <span>{String(selectedImage + 1).padStart(2, '0')} / {String(readyPafta.images.length).padStart(2, '0')}</span>
                <div className="legacy-pafta-controls" aria-label={labels.image}>
                  <button type="button" aria-label={labels.zoomOut} disabled={zoom <= 0.75} onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}><Minus aria-hidden="true" /></button>
                  <output aria-live="polite">{Math.round(zoom * 100)}%</output>
                  <button type="button" aria-label={labels.zoomIn} disabled={zoom >= 2.5} onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}><Plus aria-hidden="true" /></button>
                  <button type="button" aria-label={labels.resetZoom} onClick={() => setZoom(1)}><Maximize2 aria-hidden="true" /></button>
                </div>
                <a href={activeImage} target="_blank" rel="noreferrer" referrerPolicy="no-referrer">{labels.openImage}<ExternalLink aria-hidden="true" /></a>
              </figcaption>
            </figure>
          </div>
        ) : <div className="legacy-pafta-media-empty" role="status"><span>00</span><p>{labels.noMedia}</p></div>}
      </section>
    </main>
  );
};

export default function LegacyPaftaPage() {
  const [, params] = useRoute('/pafta/:qrCode');
  const { locale } = useAppPreferences();
  const code = params?.qrCode ?? '';
  return <LegacyPaftaRoute key={code} code={code} locale={locale} />;
}
