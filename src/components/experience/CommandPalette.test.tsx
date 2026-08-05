import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

const projects = [
  {
    slug: 'ic-mimarlik',
    title: 'İç Mimarlık',
    description: 'Antalya iç mekân araştırması',
    category: 'Mimari',
    tags: ['tasarım'],
  },
  {
    slug: 'mailcrush',
    title: 'MailCrush',
    description: 'E-posta özetleme ürünü',
    category: 'Product',
  },
] as const;

const navigationItems = [
  { id: 'home', label: 'Ana sayfa', href: '/', keywords: ['başlangıç'] },
  { id: 'about', label: 'Hakkımda', href: '/about', description: 'Profil ve deneyim' },
] as const;

describe('CommandPalette', () => {
  it('opens with Cmd/Ctrl+K, focuses the combobox, and normalizes Turkish search text', async () => {
    const user = userEvent.setup();
    render(<CommandPalette navigationItems={navigationItems} projects={projects} />);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(screen.getByRole('dialog', { name: 'Site içinde hızlı arama' })).toBeInTheDocument();
    const input = screen.getByRole('combobox', { name: 'Proje veya sayfa ara' });
    expect(input).toHaveFocus();

    await user.type(input, 'ic mimarlik');
    expect(screen.getByRole('option', { name: /İç Mimarlık/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /MailCrush/i })).not.toBeInTheDocument();
  });

  it('supports arrow-key selection and Enter navigation', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <CommandPalette
        navigationItems={[navigationItems[0]]}
        onNavigate={onNavigate}
        projects={[projects[1]]}
      />,
    );

    fireEvent.keyDown(document, { ctrlKey: true, key: 'k' });
    const input = screen.getByRole('combobox', { name: 'Proje veya sayfa ara' });
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onNavigate).toHaveBeenCalledWith(
      '/projects/mailcrush',
      expect.objectContaining({ kind: 'project', label: 'MailCrush' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).not.toBeInTheDocument();
  });

  it('traps focus while open, closes on Escape, and restores the previous focus', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <CommandPalette navigationItems={navigationItems} projects={projects} />
      </div>,
    );

    const trigger = screen.getByRole('button', { name: 'Hızlı arama' });
    await user.click(trigger);
    const input = screen.getByRole('combobox', { name: 'Proje veya sayfa ara' });
    expect(input).toHaveFocus();

    screen.getByRole('button', { name: 'Outside' }).focus();
    expect(input).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('neutralizes unsafe CMS navigation URLs', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <CommandPalette
        navigationItems={[{ label: 'Unsafe', href: 'javascript:alert(1)' }]}
        onNavigate={onNavigate}
        projects={[]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Hızlı arama' }));
    const result = screen.getByRole('option', { name: /Unsafe/i });
    expect(result).toHaveAttribute('href', '#');
    await user.click(result);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
