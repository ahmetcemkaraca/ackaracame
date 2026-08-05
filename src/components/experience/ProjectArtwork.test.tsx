import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectArtwork } from './ProjectArtwork';

describe('ProjectArtwork', () => {
  it('renders an accessible, image-free composition with a semantic caption', () => {
    const { container } = render(
      <ProjectArtwork
        caption="Deterministic music workspace"
        palette={['#101827', '#68e0c2', '#f0b36b', '#f8f4eb']}
        slug="beatforge"
        title="BeatForge"
        variant="signal-field"
      />,
    );

    const artwork = screen.getByRole('figure', { name: /beatforge deterministic music workspace/i });
    expect(artwork).toHaveClass('experience-project-artwork--music');
    expect(artwork).toHaveAttribute('data-slug', 'beatforge');
    expect(screen.getByText('BeatForge')).toBeInstanceOf(HTMLElement);
    expect(screen.getByText('Deterministic music workspace').closest('figcaption')).toBeTruthy();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.experience-artwork-music-grid')).toBeInTheDocument();
  });

  it('maps CMS visual variants to a slug-specific composition and sanitizes CSS modifiers', () => {
    render(
      <ProjectArtwork
        palette={['#111827', '#7ee7c4']}
        slug="Where To-Go"
        title="Where To-Go"
        variant="product-orbit"
      />,
    );

    const artwork = screen.getByRole('figure', { name: 'Where To-Go' });
    expect(artwork).toHaveAttribute('data-variant', 'map');
    expect(artwork).toHaveClass('experience-project-artwork--where-to-go');
  });

  it('does not place arbitrary CSS payloads into palette variables', () => {
    render(
      <ProjectArtwork
        palette={['url(https://tracker.invalid/pixel)', '#abcdef']}
        slug="secure-artwork"
        title="Secure artwork"
        variant="editorial"
      />,
    );

    const artwork = screen.getByRole('figure', { name: 'Secure artwork' });
    expect(artwork.style.getPropertyValue('--experience-artwork-primary')).toBe('#111827');
    expect(artwork.style.getPropertyValue('--experience-artwork-accent')).toBe('#abcdef');
  });
});
