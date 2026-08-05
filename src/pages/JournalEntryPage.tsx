import { ArrowLeft, ExternalLink, Quote } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import type { ContentBlock, Media } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const safeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop();
      return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return id && /^\d{5,15}$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};

const JournalMedia = ({ media, locale }: { media: Media; locale: 'tr' | 'en' }) => {
  if (media.assetState !== 'ready' || !media.src) return null;
  const alt = localize(media.alt, locale);
  if (media.kind === 'image') return <img src={media.src} alt={alt} loading="lazy" width={media.width} height={media.height} />;
  if (media.kind === 'video') return <video src={media.src} poster={media.poster} aria-label={alt} controls preload="metadata" width={media.width} height={media.height} />;
  if (media.kind === 'audio') return <audio src={media.src} aria-label={alt} controls preload="none" />;
  if (media.kind === 'embed') {
    const embed = safeEmbedUrl(media.src);
    if (embed) return <iframe src={embed} title={alt} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />;
  }
  return <a href={media.src} target="_blank" rel="noreferrer">{alt}<ExternalLink aria-hidden="true" /></a>;
};

const Block = ({ block, locale }: { block: ContentBlock; locale: 'tr' | 'en' }) => {
  if (block.type === 'text') return <section><span className="eyebrow">{block.eyebrow ? localize(block.eyebrow, locale) : null}</span><h2>{localize(block.heading, locale)}</h2>{localize(block.body, locale).split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>;
  if (block.type === 'facts') return <section><h2>{localize(block.heading, locale)}</h2><dl>{block.items.map((item) => <div key={localize(item.label, locale)}><dt>{localize(item.label, locale)}</dt><dd>{localize(item.value, locale)}</dd></div>)}</dl></section>;
  if (block.type === 'quote') return <blockquote><Quote aria-hidden="true" /><p>{localize(block.quote, locale)}</p>{block.attribution ? <cite>{localize(block.attribution, locale)}</cite> : null}</blockquote>;
  if (block.type === 'code') return <figure><pre tabIndex={0}><code>{block.code}</code></pre>{block.caption ? <figcaption>{localize(block.caption, locale)}</figcaption> : null}</figure>;
  if (block.type === 'callout') return <aside><h2>{localize(block.heading, locale)}</h2><p>{localize(block.body, locale)}</p></aside>;
  if (block.type === 'media' && block.media.assetState === 'ready' && block.media.src) return <figure><JournalMedia media={block.media} locale={locale} />{block.media.caption ? <figcaption>{localize(block.media.caption, locale)}</figcaption> : null}</figure>;
  if (block.type === 'gallery') return <section className="journal-gallery">{block.heading ? <h2>{localize(block.heading, locale)}</h2> : null}{block.items.filter((item) => item.assetState === 'ready' && item.src).map((item) => <figure key={item.id}><JournalMedia media={item} locale={locale} />{item.caption ? <figcaption>{localize(item.caption, locale)}</figcaption> : null}</figure>)}</section>;
  return null;
};

export default function JournalEntryPage({ base = 'lab' }: { base?: 'lab' | 'journal' }) {
  const [, params] = useRoute(`/${base}/:slug`);
  const { findEntry, findProject } = useContent();
  const { locale } = useAppPreferences();
  const entry = params?.slug ? findEntry(params.slug, base) : undefined;
  const archiveHref = base === 'journal' ? '/journal' : '/lab';
  const archiveLabel = base === 'journal' ? 'Journal' : 'Lab';

  useDocumentMeta({
    title: entry ? localize(entry.seo.title, locale) : (locale === 'tr' ? 'Not bulunamadı' : 'Note not found'),
    description: entry ? localize(entry.seo.description, locale) : (locale === 'tr' ? 'İstenen içerik bulunamadı.' : 'The requested entry could not be found.'),
    path: entry ? `/${base}/${entry.slug}` : `/${base}`,
    locale,
    noIndex: !entry || entry.seo.noIndex,
    type: 'article',
  });

  if (!entry) return <main id="main-content" tabIndex={-1} className="page not-found shell"><span className="eyebrow">404</span><h1>{locale === 'tr' ? 'Bu not henüz arşivde değil.' : 'This note is not in the archive yet.'}</h1><Link href={archiveHref} className="button button--primary"><ArrowLeft aria-hidden="true" />{archiveLabel}</Link></main>;

  const linkedProjects = entry.linkedProjectSlugs
    .map(findProject)
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  return (
    <main id="main-content" tabIndex={-1} className="page journal-entry">
      <header className="shell journal-entry__hero">
        <Link href={archiveHref} className="legal-back"><ArrowLeft aria-hidden="true" />{archiveLabel}</Link>
        <span className="eyebrow">{entry.entryType === 'lab-note' ? 'Lab note' : entry.entryType === 'release-note' ? 'Release note' : 'Journal'} / {entry.publishedAt?.slice(0, 10)}</span>
        <h1>{localize(entry.title, locale)}</h1>
        <p>{localize(entry.excerpt, locale)}</p>
        <div>{entry.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
      </header>
      <article className="shell journal-entry__body">{entry.blocks.map((block) => <Block key={block.id} block={block} locale={locale} />)}</article>
      {linkedProjects.length ? (
        <section className="section related-work shell" aria-labelledby="journal-linked-work-title">
          <header><span className="eyebrow">{locale === 'tr' ? 'İlişkili işler' : 'Related work'}</span><h2 id="journal-linked-work-title">{locale === 'tr' ? 'Düşünceden ürüne geç.' : 'Move from thinking to making.'}</h2></header>
          <div className="project-grid">{linkedProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} compact />)}</div>
        </section>
      ) : null}
    </main>
  );
}
