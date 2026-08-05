import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PortfolioProject } from '../../domain/content';
import { portfolioProjects } from '../../data/portfolio';
import { ProjectMetadataEditor } from './ProjectMetadataEditor';

const baseProject = (): PortfolioProject => {
  const fixture = portfolioProjects[0];
  if (!fixture) throw new Error('Expected a project fixture.');
  return {
    ...fixture,
    context: undefined,
    location: undefined,
    releaseStage: undefined,
    metrics: [],
    relatedSlugs: [],
  };
};

const Harness = () => {
  const [project, setProject] = useState(baseProject);
  return (
    <>
      <ProjectMetadataEditor project={project} onChange={setProject} />
      <output data-testid="project-state">{JSON.stringify(project)}</output>
    </>
  );
};

const projectState = () => JSON.parse(
  screen.getByTestId('project-state').textContent || '{}',
) as PortfolioProject;

describe('ProjectMetadataEditor', () => {
  it('controls optional bilingual metadata and normalizes empty pairs to undefined', () => {
    render(<Harness />);

    fireEvent.change(screen.getByLabelText('Bağlam · TR'), { target: { value: 'Kişisel çalışma' } });
    fireEvent.change(screen.getByLabelText('Context · EN'), { target: { value: 'Personal work' } });
    fireEvent.change(screen.getByLabelText('Konum · TR'), { target: { value: 'İstanbul' } });
    fireEvent.change(screen.getByLabelText('Location · EN'), { target: { value: 'Istanbul' } });
    fireEvent.change(screen.getByLabelText('Yayın aşaması'), { target: { value: 'live' } });

    expect(projectState()).toMatchObject({
      context: { tr: 'Kişisel çalışma', en: 'Personal work' },
      location: { tr: 'İstanbul', en: 'Istanbul' },
      releaseStage: 'live',
    });

    fireEvent.change(screen.getByLabelText('Bağlam · TR'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Context · EN'), { target: { value: ' ' } });
    fireEvent.change(screen.getByLabelText('Konum · TR'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Location · EN'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Yayın aşaması'), { target: { value: '' } });

    expect(projectState()).not.toHaveProperty('context');
    expect(projectState()).not.toHaveProperty('location');
    expect(projectState()).not.toHaveProperty('releaseStage');
  });

  it('supports metric CRUD without remounting editable ID or URL inputs', () => {
    render(<Harness />);
    const addMetric = screen.getByRole('button', { name: '+ Metrik' });
    fireEvent.click(addMetric);

    const idInput = screen.getByLabelText('Metrik ID');
    const evidenceInput = screen.getByLabelText('Kanıt URL’si');
    fireEvent.change(idInput, { target: { value: 'Completed Flows' } });
    fireEvent.change(screen.getByLabelText('Etiket · TR'), { target: { value: 'Tamamlanan akış' } });
    fireEvent.change(screen.getByLabelText('Label · EN'), { target: { value: 'Completed flows' } });
    fireEvent.change(screen.getByLabelText('Değer · TR'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Value · EN'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Kaynak bağlamı · TR'), {
      target: { value: 'Yayınlanan sürümde ölçülen tamamlanmış akış sayısı.' },
    });
    fireEvent.change(screen.getByLabelText('Source context · EN'), {
      target: { value: 'Completed flow count measured in the published release.' },
    });
    fireEvent.change(evidenceInput, { target: { value: 'https://example.com/evidence' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Doğrulandı' }));

    expect(screen.getByLabelText('Metrik ID')).toBe(idInput);
    expect(screen.getByLabelText('Kanıt URL’si')).toBe(evidenceInput);
    expect(projectState().metrics[0]).toEqual({
      id: 'completed-flows',
      label: { tr: 'Tamamlanan akış', en: 'Completed flows' },
      value: { tr: '12', en: '12' },
      context: {
        tr: 'Yayınlanan sürümde ölçülen tamamlanmış akış sayısı.',
        en: 'Completed flow count measured in the published release.',
      },
      evidenceUrl: 'https://example.com/evidence',
      verified: true,
    });

    fireEvent.change(screen.getByLabelText('Kaynak bağlamı · TR'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Source context · EN'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Kanıt URL’si'), { target: { value: ' ' } });
    expect(projectState().metrics[0]).not.toHaveProperty('context');
    expect(projectState().metrics[0]).not.toHaveProperty('evidenceUrl');

    for (let index = 1; index < 8; index += 1) fireEvent.click(addMetric);
    expect(projectState().metrics).toHaveLength(8);
    expect(addMetric).toBeDisabled();

    fireEvent.click(screen.getAllByRole('button', { name: 'Metriği sil' })[0]!);
    expect(projectState().metrics).toHaveLength(7);
    expect(addMetric).toBeEnabled();
  });

  it('sanitizes, deduplicates, limits, and removes related project slugs', () => {
    render(<Harness />);
    const input = screen.getByLabelText('İlgili proje slug’ı');
    const addRelated = screen.getByRole('button', { name: 'Projeyi ekle' });

    fireEvent.change(input, { target: { value: ' Project One ' } });
    fireEvent.click(addRelated);
    expect(projectState().relatedSlugs).toEqual(['project-one']);
    expect(input).toHaveValue('');

    fireEvent.change(input, { target: { value: 'project one' } });
    fireEvent.click(addRelated);
    expect(screen.getByRole('alert')).toHaveTextContent('zaten ilişkili');
    expect(projectState().relatedSlugs).toEqual(['project-one']);

    fireEvent.change(input, { target: { value: baseProject().slug } });
    fireEvent.click(addRelated);
    expect(screen.getByRole('alert')).toHaveTextContent('kendisiyle ilişkilendirilemez');

    for (const slug of ['Two', 'Three', 'Four', 'Five', 'Six']) {
      fireEvent.change(input, { target: { value: slug } });
      fireEvent.click(addRelated);
    }
    expect(projectState().relatedSlugs).toEqual([
      'project-one',
      'two',
      'three',
      'four',
      'five',
      'six',
    ]);
    expect(addRelated).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Seven' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('alert')).toHaveTextContent('En fazla 6');
    expect(projectState().relatedSlugs).toHaveLength(6);

    fireEvent.click(screen.getAllByRole('button', { name: 'İlişkiyi kaldır' })[0]!);
    expect(projectState().relatedSlugs).toEqual(['two', 'three', 'four', 'five', 'six']);
    expect(addRelated).toBeEnabled();
  });
});
