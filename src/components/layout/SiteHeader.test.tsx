import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'wouter';
import { AppPreferencesProvider } from '../../context/AppPreferences';
import { journalEntries, portfolioProjects, siteSettings } from '../../data/portfolio';
import { SiteHeader } from './SiteHeader';

const renderEnglishHeader = () => render(
  <Router base="/en">
    <AppPreferencesProvider routeLocale="en">
      <SiteHeader settings={siteSettings} projects={portfolioProjects} journal={journalEntries} />
    </AppPreferencesProvider>
  </Router>,
);

describe('SiteHeader locale-aware navigation', () => {
  it('keeps navigation destinations inside /en', async () => {
    renderEnglishHeader();

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/en/work');
  });

  it('restores focus to the actual mobile-menu button after Escape', async () => {
    const user = userEvent.setup();
    renderEnglishHeader();
    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    await user.click(menuButton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuButton).toHaveFocus();
  });
});
