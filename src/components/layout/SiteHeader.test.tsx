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
  it('keeps normal, modified-click, and command-palette destinations inside /en', async () => {
    const user = userEvent.setup();
    renderEnglishHeader();

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/en/work');
    await user.click(screen.getByRole('button', { name: 'Search work' }));
    expect(screen.getByRole('option', { name: /^Work$/i })).toHaveAttribute('href', '/en/work');
    expect(screen.getByRole('option', { name: new RegExp(portfolioProjects[0]?.title.en ?? '') })).toHaveAttribute(
      'href',
      `/en/work/${portfolioProjects[0]?.slug}`,
    );
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
