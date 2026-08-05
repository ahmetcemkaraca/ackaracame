import { useId, type CSSProperties, type ReactNode } from 'react';
import './experience.css';

export type ProjectArtworkVariant =
  | 'auto'
  | 'architectural-grid'
  | 'canvas'
  | 'code-canvas'
  | 'dashboard'
  | 'directory'
  | 'editorial'
  | 'editorial-collage'
  | 'mail'
  | 'map'
  | 'mobile'
  | 'music'
  | 'product-orbit'
  | 'signal-field'
  | 'spatial-gradient'
  | 'spatial';

type ProjectArtworkCompositionVariant =
  | 'canvas'
  | 'dashboard'
  | 'directory'
  | 'editorial'
  | 'mail'
  | 'map'
  | 'mobile'
  | 'music'
  | 'spatial';

export interface ProjectArtworkProps {
  slug: string;
  variant: ProjectArtworkVariant;
  palette: readonly string[];
  title: string;
  caption?: string;
  className?: string;
}

type ArtworkStyle = CSSProperties & Record<`--experience-artwork-${string}`, string>;

const DEFAULT_PALETTE = ['#111827', '#7ee7c4', '#f3b66f', '#f6f1e8'] as const;

const AUTO_VARIANTS: Readonly<Record<string, ProjectArtworkCompositionVariant>> = {
  'arch-builder': 'spatial',
  archbuilder: 'spatial',
  beatforge: 'music',
  'draw-or-die': 'canvas',
  duaapp: 'mobile',
  hocapuanla: 'directory',
  mailcrush: 'mail',
  peakactivity: 'dashboard',
  'where-to-go': 'map',
};

function normalizeModifier(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'project';
}

function safeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;

  const candidate = value.trim();
  const isHex = /^#[\da-f]{3,8}$/i.test(candidate);
  const isFunction = /^(?:color|hsl|hsla|lab|lch|oklab|oklch|rgb|rgba)\([\da-z.,%+\-/\s]+\)$/i.test(
    candidate,
  );
  const isNamedColor = /^[a-z]{3,24}$/i.test(candidate);

  return isHex || isFunction || isNamedColor ? candidate : fallback;
}

function resolveVariant(
  slug: string,
  variant: ProjectArtworkVariant,
): ProjectArtworkCompositionVariant {
  const projectSpecificVariant = AUTO_VARIANTS[normalizeModifier(slug)];
  switch (variant) {
    case 'auto':
    case 'signal-field':
      return projectSpecificVariant ?? 'dashboard';
    case 'architectural-grid':
    case 'spatial-gradient':
      return 'spatial';
    case 'code-canvas':
      return 'canvas';
    case 'editorial-collage':
      return 'editorial';
    case 'product-orbit':
      return projectSpecificVariant ?? 'mobile';
    default:
      return variant;
  }
}

function WindowControls() {
  return (
    <span className="experience-artwork-window-controls">
      <i className="experience-artwork-window-dot" />
      <i className="experience-artwork-window-dot" />
      <i className="experience-artwork-window-dot" />
    </span>
  );
}

function DashboardComposition() {
  return (
    <div className="experience-artwork-dashboard">
      <div className="experience-artwork-browser-bar">
        <WindowControls />
        <span className="experience-artwork-address" />
      </div>
      <div className="experience-artwork-dashboard-body">
        <span className="experience-artwork-sidebar" />
        <div className="experience-artwork-dashboard-main">
          <span className="experience-artwork-heading-line" />
          <div className="experience-artwork-stat-row">
            <i className="experience-artwork-stat-card experience-artwork-stat-card--wide" />
            <i className="experience-artwork-stat-card" />
            <i className="experience-artwork-stat-card" />
          </div>
          <div className="experience-artwork-chart">
            <i className="experience-artwork-chart-line experience-artwork-chart-line--one" />
            <i className="experience-artwork-chart-line experience-artwork-chart-line--two" />
            <i className="experience-artwork-chart-marker" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MailComposition() {
  return (
    <div className="experience-artwork-mail">
      <div className="experience-artwork-mail-nav">
        <span className="experience-artwork-mail-logo" />
        <span className="experience-artwork-mail-compose" />
        <i className="experience-artwork-mail-nav-line" />
        <i className="experience-artwork-mail-nav-line" />
        <i className="experience-artwork-mail-nav-line" />
      </div>
      <div className="experience-artwork-mail-list">
        <span className="experience-artwork-mail-search" />
        <i className="experience-artwork-mail-item experience-artwork-mail-item--active" />
        <i className="experience-artwork-mail-item" />
        <i className="experience-artwork-mail-item" />
        <i className="experience-artwork-mail-item" />
      </div>
      <div className="experience-artwork-mail-message">
        <span className="experience-artwork-mail-subject" />
        <span className="experience-artwork-mail-meta" />
        <i className="experience-artwork-mail-copy experience-artwork-mail-copy--long" />
        <i className="experience-artwork-mail-copy" />
        <i className="experience-artwork-mail-copy experience-artwork-mail-copy--short" />
        <span className="experience-artwork-mail-summary" />
      </div>
    </div>
  );
}

function MusicComposition() {
  return (
    <div className="experience-artwork-music">
      <div className="experience-artwork-music-toolbar">
        <WindowControls />
        <span className="experience-artwork-music-time">01:24:08</span>
        <span className="experience-artwork-music-play" />
      </div>
      <div className="experience-artwork-music-grid">
        {Array.from({ length: 5 }, (_, row) => (
          <div className="experience-artwork-track" key={row}>
            <span className="experience-artwork-track-label" />
            <i className={`experience-artwork-clip experience-artwork-clip--${(row % 3) + 1}`} />
            <i className={`experience-artwork-clip experience-artwork-clip--${((row + 1) % 3) + 1}`} />
          </div>
        ))}
        <span className="experience-artwork-playhead" />
      </div>
    </div>
  );
}

function CanvasComposition() {
  return (
    <div className="experience-artwork-canvas">
      <div className="experience-artwork-canvas-toolbar">
        <i className="experience-artwork-tool experience-artwork-tool--active" />
        <i className="experience-artwork-tool" />
        <i className="experience-artwork-tool" />
        <i className="experience-artwork-tool" />
      </div>
      <div className="experience-artwork-canvas-sheet">
        <span className="experience-artwork-sketch experience-artwork-sketch--arc" />
        <span className="experience-artwork-sketch experience-artwork-sketch--line" />
        <span className="experience-artwork-sketch experience-artwork-sketch--circle" />
        <span className="experience-artwork-sketch experience-artwork-sketch--note" />
      </div>
      <div className="experience-artwork-canvas-panel">
        <i className="experience-artwork-panel-line" />
        <i className="experience-artwork-panel-line experience-artwork-panel-line--short" />
        <span className="experience-artwork-swatch-row">
          <i className="experience-artwork-swatch" />
          <i className="experience-artwork-swatch" />
          <i className="experience-artwork-swatch" />
        </span>
      </div>
    </div>
  );
}

function MobileComposition({ map = false }: { map?: boolean }) {
  return (
    <div className={`experience-artwork-phone-stage${map ? ' experience-artwork-phone-stage--map' : ''}`}>
      <div className="experience-artwork-phone experience-artwork-phone--back">
        <span className="experience-artwork-phone-island" />
        <div className="experience-artwork-phone-screen">
          {map ? (
            <>
              <i className="experience-artwork-map-route" />
              <i className="experience-artwork-map-pin experience-artwork-map-pin--one" />
              <i className="experience-artwork-map-pin experience-artwork-map-pin--two" />
            </>
          ) : (
            <>
              <span className="experience-artwork-mobile-orbit" />
              <i className="experience-artwork-mobile-card" />
            </>
          )}
        </div>
      </div>
      <div className="experience-artwork-phone experience-artwork-phone--front">
        <span className="experience-artwork-phone-island" />
        <div className="experience-artwork-phone-screen">
          <span className="experience-artwork-mobile-greeting" />
          <i className="experience-artwork-mobile-hero" />
          <span className="experience-artwork-mobile-actions">
            <i className="experience-artwork-mobile-action" />
            <i className="experience-artwork-mobile-action" />
            <i className="experience-artwork-mobile-action" />
          </span>
        </div>
      </div>
    </div>
  );
}

function SpatialComposition() {
  return (
    <div className="experience-artwork-spatial">
      <span className="experience-artwork-spatial-grid" />
      <span className="experience-artwork-spatial-axis experience-artwork-spatial-axis--x" />
      <span className="experience-artwork-spatial-axis experience-artwork-spatial-axis--y" />
      <div className="experience-artwork-massing">
        <i className="experience-artwork-mass experience-artwork-mass--one" />
        <i className="experience-artwork-mass experience-artwork-mass--two" />
        <i className="experience-artwork-mass experience-artwork-mass--three" />
      </div>
      <span className="experience-artwork-spatial-note experience-artwork-spatial-note--one">A–01</span>
      <span className="experience-artwork-spatial-note experience-artwork-spatial-note--two">+4.20</span>
    </div>
  );
}

function DirectoryComposition() {
  return (
    <div className="experience-artwork-directory">
      <div className="experience-artwork-directory-header">
        <span className="experience-artwork-directory-mark" />
        <span className="experience-artwork-directory-search" />
      </div>
      <div className="experience-artwork-directory-results">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="experience-artwork-directory-card" key={index}>
            <span className="experience-artwork-directory-avatar" />
            <span className="experience-artwork-directory-copy">
              <i className="experience-artwork-directory-name" />
              <i className="experience-artwork-directory-meta" />
            </span>
            <span className="experience-artwork-directory-score">{`4.${9 - index}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorialComposition() {
  return (
    <div className="experience-artwork-editorial">
      <div className="experience-artwork-editorial-page experience-artwork-editorial-page--left">
        <span className="experience-artwork-editorial-kicker" />
        <span className="experience-artwork-editorial-title" />
        <i className="experience-artwork-editorial-rule" />
        <span className="experience-artwork-editorial-columns" />
      </div>
      <div className="experience-artwork-editorial-page experience-artwork-editorial-page--right">
        <span className="experience-artwork-editorial-object" />
        <i className="experience-artwork-editorial-page-number">24</i>
      </div>
    </div>
  );
}

function renderComposition(variant: ProjectArtworkCompositionVariant): ReactNode {
  switch (variant) {
    case 'canvas':
      return <CanvasComposition />;
    case 'directory':
      return <DirectoryComposition />;
    case 'editorial':
      return <EditorialComposition />;
    case 'mail':
      return <MailComposition />;
    case 'map':
      return <MobileComposition map />;
    case 'mobile':
      return <MobileComposition />;
    case 'music':
      return <MusicComposition />;
    case 'spatial':
      return <SpatialComposition />;
    case 'dashboard':
    default:
      return <DashboardComposition />;
  }
}

export function ProjectArtwork({
  slug,
  variant,
  palette,
  title,
  caption,
  className = '',
}: ProjectArtworkProps) {
  const captionId = `experience-artwork-${useId().replace(/:/g, '')}`;
  const resolvedVariant = resolveVariant(slug, variant);
  const modifier = normalizeModifier(slug);
  const colors = [
    safeColor(palette[0], DEFAULT_PALETTE[0]),
    safeColor(palette[1], DEFAULT_PALETTE[1]),
    safeColor(palette[2], DEFAULT_PALETTE[2]),
    safeColor(palette[3], DEFAULT_PALETTE[3]),
  ] as const;
  const style: ArtworkStyle = {
    '--experience-artwork-primary': colors[0],
    '--experience-artwork-accent': colors[1],
    '--experience-artwork-highlight': colors[2],
    '--experience-artwork-surface': colors[3],
  };

  return (
    <figure
      aria-labelledby={captionId}
      className={[
        'experience-project-artwork',
        `experience-project-artwork--${resolvedVariant}`,
        `experience-project-artwork--${modifier}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-slug={slug}
      data-variant={resolvedVariant}
      style={style}
    >
      <div className="experience-project-artwork-frame" aria-hidden="true">
        <span className="experience-project-artwork-glow" />
        <div className="experience-project-artwork-composition">{renderComposition(resolvedVariant)}</div>
        <span className="experience-project-artwork-grain" />
      </div>
      <figcaption className="experience-project-artwork-caption" id={captionId}>
        <span className="experience-project-artwork-title">{title}</span>
        {caption ? (
          <>
            {' '}
            <span className="experience-project-artwork-description">{caption}</span>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default ProjectArtwork;
