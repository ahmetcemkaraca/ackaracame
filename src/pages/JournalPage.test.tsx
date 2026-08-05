import { render, screen } from '@testing-library/react';
import { Router } from 'wouter';
import { AppPreferencesProvider } from '../context/AppPreferences';
import { ContentProvider } from '../context/Content';
import { journalEntries } from '../data/portfolio';
import JournalPage from './JournalPage';

describe('JournalPage', () => {
  it('exposes every published journal-family entry at its canonical route', () => {
    render(
      <Router>
        <AppPreferencesProvider routeLocale="tr">
          <ContentProvider><JournalPage /></ContentProvider>
        </AppPreferencesProvider>
      </Router>,
    );

    const published = journalEntries.find((entry) => entry.status === 'published');
    expect(published).toBeDefined();
    expect(screen.getByRole('link', { name: new RegExp(published?.title.tr ?? '') })).toHaveAttribute(
      'href',
      `/journal/${published?.slug}`,
    );
  });
});
