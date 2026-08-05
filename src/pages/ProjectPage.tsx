import { ArrowLeft, ArrowRight, CheckCircle2, Code2, ExternalLink, GitBranch } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { ProjectArtwork } from '../components/experience/ProjectArtwork';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import type { ContentBlock, Media } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocaleHref } from '../hooks/useLocaleHref';

const textParagraphs = (value: string) => value.split(/\n{2,}/).filter(Boolean);

const disciplineLabels = {
  tr: { architecture: 'Mimarlık', software: 'Yazılım', hybrid: 'Hibrit', research: 'Araştırma' },
  en: { architecture: 'Architecture', software: 'Software', hybrid: 'Hybrid', research: 'Research' },
} as const;

const stageLabels = {
  tr: { concept: 'Konsept', prototype: 'Prototip', 'in-development': 'Geliştirme aşamasında', live: 'Yayında', maintained: 'Aktif bakımda', archived: 'Arşivlendi' },
  en: { concept: 'Concept', prototype: 'Prototype', 'in-development': 'In development', live: 'Live', maintained: 'Actively maintained', archived: 'Archived' },
} as const;

const toneLabels = {
  tr: { note: 'Not', decision: 'Karar', constraint: 'Kısıt', outcome: 'Sonuç' },
  en: { note: 'Note', decision: 'Decision', constraint: 'Constraint', outcome: 'Outcome' },
} as const;

const safeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
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

const MediaView = ({ media, locale }: { media: Media; locale: 'tr' | 'en' }) => {
  const alt = localize(media.alt, locale);
  if (media.assetState !== 'ready' || !media.src) {
    return (
      <div className="case-media case-media--planned" role="img" aria-label={alt}>
        <span>{locale === 'tr' ? 'Görsel dokümantasyon hazırlanıyor' : 'Visual documentation in progress'}</span>
      </div>
    );
  }

  if (media.kind === 'image') {
    return <img src={media.src} alt={alt} loading="lazy" width={media.width} height={media.height} />;
  }
  if (media.kind === 'video') {
    return <video src={media.src} poster={media.poster} controls preload="metadata" aria-label={alt} width={media.width} height={media.height} />;
  }
  if (media.kind === 'audio') {
    return <audio src={media.src} controls preload="none" aria-label={alt} />;
  }
  if (media.kind === 'embed') {
    const embed = safeEmbedUrl(media.src);
    return embed ? (
      <iframe
        src={embed}
        title={alt}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allow="fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    ) : <a href={media.src} target="_blank" rel="noreferrer">{alt}<ExternalLink aria-hidden="true" /></a>;
  }
  return <a href={media.src} target="_blank" rel="noreferrer">{alt}<ExternalLink aria-hidden="true" /></a>;
};

const ContentBlockView = ({ block, locale }: { block: ContentBlock; locale: 'tr' | 'en' }) => {
  if (block.type === 'text') {
    return (
      <section className="case-block case-block--text">
        {block.eyebrow ? <span className="eyebrow">{localize(block.eyebrow, locale)}</span> : null}
        <h2>{localize(block.heading, locale)}</h2>
        <div>{textParagraphs(localize(block.body, locale)).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>
    );
  }
  if (block.type === 'facts') {
    return (
      <section className="case-block case-block--facts">
        <h2>{localize(block.heading, locale)}</h2>
        <dl>{block.items.map((item) => <div key={localize(item.label, locale)}><dt>{localize(item.label, locale)}</dt><dd>{localize(item.value, locale)}</dd></div>)}</dl>
      </section>
    );
  }
  if (block.type === 'media') {
    return <figure className="case-block case-block--media">{block.heading ? <h2>{localize(block.heading, locale)}</h2> : null}<MediaView media={block.media} locale={locale} />{block.media.caption ? <figcaption>{localize(block.media.caption, locale)}</figcaption> : null}</figure>;
  }
  if (block.type === 'gallery') {
    return <section className="case-block case-block--gallery">{block.heading ? <h2>{localize(block.heading, locale)}</h2> : null}<div>{block.items.map((item) => <figure key={item.id}><MediaView media={item} locale={locale} />{item.caption ? <figcaption>{localize(item.caption, locale)}</figcaption> : null}</figure>)}</div></section>;
  }
  if (block.type === 'quote') {
    return <blockquote className="case-block case-block--quote"><p>“{localize(block.quote, locale)}”</p>{block.attribution ? <cite>{localize(block.attribution, locale)}</cite> : null}</blockquote>;
  }
  if (block.type === 'code') {
    return <figure className="case-block case-block--code"><div><Code2 aria-hidden="true" /><span>{block.language}</span></div><pre tabIndex={0}><code>{block.code}</code></pre>{block.caption ? <figcaption>{localize(block.caption, locale)}</figcaption> : null}</figure>;
  }
  return (
    <aside className={`case-block case-block--callout case-block--${block.tone}`}>
      <CheckCircle2 aria-hidden="true" />
      <div><span>{toneLabels[locale][block.tone]}</span><h2>{localize(block.heading, locale)}</h2><p>{localize(block.body, locale)}</p></div>
    </aside>
  );
};

export default function ProjectPage() {
  const [, params] = useRoute('/work/:slug');
  const { projects, findProject } = useContent();
  const { locale } = useAppPreferences();
  const localeHref = useLocaleHref();
  const project = params?.slug ? findProject(params.slug) : undefined;

  useDocumentMeta({
    title: project ? localize(project.seo.title, locale) : (locale === 'tr' ? 'Proje bulunamadı' : 'Project not found'),
    description: project ? localize(project.seo.description, locale) : (locale === 'tr' ? 'İstenen çalışma bulunamadı.' : 'The requested work could not be found.'),
    path: project ? `/work/${project.slug}` : '/work/not-found',
    locale,
    noIndex: !project || project.seo.noIndex,
    type: 'article',
  });

  if (!project) {
    return (
      <main id="main-content" tabIndex={-1} className="page not-found shell">
        <span className="eyebrow">404</span>
        <h1>{locale === 'tr' ? 'Bu çalışma arşivde yok.' : 'This work is not in the archive.'}</h1>
        <p>{locale === 'tr' ? 'URL değişmiş veya içerik henüz yayınlanmamış olabilir.' : 'The URL may have changed, or the content may not be published yet.'}</p>
        <Link href="/work" className="button button--primary"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'İşlere dön' : 'Back to work'}</Link>
      </main>
    );
  }

  const title = localize(project.title, locale);
  const coverMedia = project.media.find((item) => item.role === 'cover' && item.assetState === 'ready' && item.src);
  const galleryMedia = project.media.filter((item) => item !== coverMedia && item.assetState === 'ready' && item.src);
  const related = project.relatedSlugs.map(findProject).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 2);
  const fallbackNext = projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length];
  const relatedProjects = related.length ? related : (fallbackNext && fallbackNext.slug !== project.slug ? [fallbackNext] : []);

  return (
    <main id="main-content" tabIndex={-1} className="page project-page">
      <header className="case-hero shell">
        <Link href="/work" className="case-hero__back"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'Tüm işler' : 'All work'}</Link>
        <div className="case-hero__title-row">
          <div>
            <span className="eyebrow">{project.context ? localize(project.context, locale) : disciplineLabels[locale][project.discipline]} / {project.year}</span>
            <h1>{title}</h1>
            <p>{localize(project.dek, locale)}</p>
          </div>
          {project.links.length ? (
            <div className="case-hero__links">
              {project.links.map((link) => {
                const label = (
                  <>
                    {link.kind === 'source' ? <GitBranch aria-hidden="true" /> : <ExternalLink aria-hidden="true" />}
                    {localize(link.label, locale)}
                  </>
                );
                return link.href.startsWith('/') ? (
                  <Link key={link.href} href={localeHref(link.href)}>{label}</Link>
                ) : (
                  <a key={link.href} href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noreferrer' : undefined}>{label}</a>
                );
              })}
            </div>
          ) : null}
        </div>
        {coverMedia ? (
          <figure className="case-hero__media">
            <MediaView media={coverMedia} locale={locale} />
            {coverMedia.caption ? <figcaption>{localize(coverMedia.caption, locale)}</figcaption> : null}
          </figure>
        ) : (
          <ProjectArtwork slug={project.slug} variant={project.cover.visualVariant} palette={project.cover.palette} title={title} caption={localize(project.cover.alt, locale)} className="case-hero__artwork" />
        )}
        <dl className="case-overview">
          <div><dt>{locale === 'tr' ? 'Alan' : 'Discipline'}</dt><dd>{disciplineLabels[locale][project.discipline]}</dd></div>
          <div><dt>{locale === 'tr' ? 'Durum' : 'Stage'}</dt><dd>{project.releaseStage ? stageLabels[locale][project.releaseStage] : (locale === 'tr' ? 'Devam ediyor' : 'Ongoing')}</dd></div>
          <div><dt>{locale === 'tr' ? 'Yıl' : 'Year'}</dt><dd>{project.year ?? '—'}</dd></div>
          <div><dt>{locale === 'tr' ? 'Araçlar' : 'Tools'}</dt><dd>{project.technologies.slice(0, 5).join(', ')}</dd></div>
        </dl>
      </header>

      {galleryMedia.length ? (
        <section className="case-project-media shell" aria-label={locale === 'tr' ? 'Proje görselleri' : 'Project media'}>
          {galleryMedia.map((media) => (
            <figure key={media.id}>
              <MediaView media={media} locale={locale} />
              {media.caption ? <figcaption>{localize(media.caption, locale)}</figcaption> : null}
            </figure>
          ))}
        </section>
      ) : null}

      {project.metrics.length ? (
        <section className="case-metrics shell" aria-label={locale === 'tr' ? 'Proje kapsamı' : 'Project scope'}>
          {project.metrics.map((metric) => <div key={metric.id}><strong>{localize(metric.value, locale)}</strong><span>{localize(metric.label, locale)}</span>{metric.context ? <small>{localize(metric.context, locale)}</small> : null}</div>)}
        </section>
      ) : null}

      <div className="case-content shell">
        {project.blocks.map((block) => <ContentBlockView key={block.id} block={block} locale={locale} />)}
      </div>

      {relatedProjects.length ? (
        <section className="section related-work shell">
          <header><span className="eyebrow">{locale === 'tr' ? 'Sıradaki' : 'Continue exploring'}</span><h2>{locale === 'tr' ? 'Arşivde ilerle.' : 'Move through the archive.'}</h2></header>
          <div className="project-grid">{relatedProjects.map((item, index) => <ProjectCard key={item.slug} project={item} index={index} compact />)}</div>
          <Link href="/work" className="text-link">{locale === 'tr' ? 'Tüm işleri aç' : 'Open all work'}<ArrowRight aria-hidden="true" /></Link>
        </section>
      ) : null}
    </main>
  );
}
