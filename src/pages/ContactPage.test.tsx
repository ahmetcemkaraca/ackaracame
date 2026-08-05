import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { SiteSettings } from '../domain/content';
import ContactPage from './ContactPage';

const mocks = vi.hoisted(() => ({
  availability: 'unavailable' as SiteSettings['availability'],
}));

vi.mock('../context/AppPreferences', () => ({
  useAppPreferences: () => ({ locale: 'tr' }),
}));

vi.mock('../context/Content', () => ({
  useContent: () => ({
    settings: {
      availability: mocks.availability,
      contactEmail: 'info@ackaraca.me',
    },
  }),
}));

vi.mock('../hooks/useDocumentMeta', () => ({ useDocumentMeta: vi.fn() }));
vi.mock('../lib/firebase/config', () => ({ publicInquiryConfigured: true }));

describe('ContactPage availability fence', () => {
  beforeEach(() => {
    mocks.availability = 'unavailable';
  });

  it('does not render an inquiry form while unavailable and preserves support and legal email access', () => {
    const { container } = render(<ContactPage />);

    expect(container.querySelector('.contact-form-panel form')).toBeNull();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mesajı güvenli gönder' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Ad soyad')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /info@ackaraca\.me|Doğrudan e-posta/ })).not.toHaveLength(0);
    expect(screen.getAllByRole('status').map((item) => item.textContent).join(' ')).toMatch(/Ürün desteği.*yasal talep/i);
  });

  it('keeps the form available for limited availability', () => {
    mocks.availability = 'limited';
    render(<ContactPage />);

    expect(screen.getByLabelText('Ad soyad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mesajı güvenli gönder' })).toBeEnabled();
    expect(screen.queryByText('Yeni görüşme formu şu anda kapalı.')).not.toBeInTheDocument();
  });
});
