import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences, localize } from '../../context/AppPreferences';
import type { PortfolioProject } from '../../domain/content';
import { ProjectArtwork } from '../experience/ProjectArtwork';

interface ProjectCardProps {
  project: PortfolioProject;
  index?: number;
  compact?: boolean;
}

const disciplineLabels = {
  tr: {
    architecture: 'Mimarlık',
    software: 'Yazılım',
    hybrid: 'Hibrit pratik',
    research: 'Araştırma',
  },
  en: {
    architecture: 'Architecture',
    software: 'Software',
    hybrid: 'Hybrid practice',
    research: 'Research',
  },
} as const;

const MAX_TILT = 5;

export const ProjectCard = ({ project, index = 0, compact = false }: ProjectCardProps) => {
  const { locale } = useAppPreferences();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const title = localize(project.title, locale);
  const dek = localize(project.dek, locale);
  const primaryMetric = project.metrics.find((metric) => metric.verified);

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const element = linkRef.current;
    if (!element || event.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty('--spot-x', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    element.style.setProperty('--spot-y', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
    element.style.setProperty('--tilt-x', (px * MAX_TILT).toFixed(2));
    element.style.setProperty('--tilt-y', (-py * MAX_TILT * 0.8).toFixed(2));
  };

  const handlePointerLeave = () => {
    const element = linkRef.current;
    if (!element) return;
    element.style.setProperty('--tilt-x', '0');
    element.style.setProperty('--tilt-y', '0');
  };

  return (
    <article className={`project-card${compact ? ' project-card--compact' : ''}`} style={{ '--project-index': index } as React.CSSProperties}>
      <Link
        href={`/work/${project.slug}`}
        ref={linkRef}
        className="project-card__link"
        aria-label={`${title}: ${locale === 'tr' ? 'vaka çalışmasını aç' : 'open case study'}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <ProjectArtwork
          slug={project.slug}
          variant={project.cover.visualVariant}
          palette={project.cover.palette}
          title={title}
          caption={localize(project.cover.alt, locale)}
          className="project-card__artwork"
        />
        <div className="project-card__body">
          <div className="project-card__meta">
            <span>{disciplineLabels[locale][project.discipline]}</span>
            <span aria-hidden="true">/</span>
            <span>{project.year ?? '—'}</span>
          </div>
          <div className="project-card__heading-row">
            <h3>{title}</h3>
            <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.6} />
          </div>
          <p>{dek}</p>
          <div className="project-card__footer">
            <ul aria-label={locale === 'tr' ? 'Teknolojiler' : 'Technologies'}>
              {project.technologies.slice(0, compact ? 2 : 4).map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
            {primaryMetric ? (
              <span className="project-card__metric">
                <strong>{localize(primaryMetric.value, locale)}</strong>
                {localize(primaryMetric.label, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
};
