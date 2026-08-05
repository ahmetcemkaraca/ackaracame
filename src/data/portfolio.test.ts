import { contentBundle } from './portfolio';

describe('public portfolio fixture', () => {
  it('contains only published content records', () => {
    expect(contentBundle.projects.length).toBeGreaterThan(0);
    expect(contentBundle.projects.every((project) => project.status === 'published')).toBe(true);
    expect(contentBundle.journal.every((entry) => entry.status === 'published')).toBe(true);
  });
});
