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

export const ProjectCard = ({ project, index = 0, compact = false }: ProjectCardProps) => {
  const { locale } = useAppPreferences();
  const title = localize(project.title, locale);
  const dek = localize(project.dek, locale);
  const primaryMetric = project.metrics.find((metric) => metric.verified);

  return (
    <article className={`project-card${compact ? ' project-card--compact' : ''}`} style={{ '--project-index': index } as React.CSSProperties}>
      <Link href={`/work/${project.slug}`} className="project-card__link" aria-label={`${title}: ${locale === 'tr' ? 'vaka çalışmasını aç' : 'open case study'}`}>
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
