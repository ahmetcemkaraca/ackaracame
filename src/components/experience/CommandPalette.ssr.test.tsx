import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette server rendering', () => {
  it('renders without window or document and defers its portal to the client', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);

    const html = (() => {
      try {
        return renderToString(
          <CommandPalette
            defaultOpen
            navigationItems={[{ label: 'Home', href: '/' }]}
            projects={[{ slug: 'mailcrush', title: 'MailCrush', href: 'https://ackaraca.me/work/mailcrush' }]}
          />,
        );
      } finally {
        vi.unstubAllGlobals();
      }
    })();

    expect(html).toContain('experience-command-palette-trigger');
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('experience-command-palette-dialog');
  });
});
