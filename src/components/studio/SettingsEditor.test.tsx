import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { siteSettings } from '../../data/portfolio';
import { saveSiteSettings } from '../../lib/firebase/adminRepository';
import { SettingsEditor } from './SettingsEditor';

vi.mock('../../lib/firebase/adminRepository', () => ({
  saveSiteSettings: vi.fn(async () => undefined),
}));

describe('SettingsEditor', () => {
  it('edits the complete public identity and locale settings without exposing palette controls', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <SettingsEditor
        initial={siteSettings}
        source="firestore"
        onSaved={onSaved}
        onDirtyChange={() => undefined}
      />,
    );

    const supportedLocales = screen.getByLabelText('Desteklenen diller');
    expect(supportedLocales).toHaveValue('Türkçe (TR) + English (EN)');
    expect(supportedLocales).toHaveAttribute('readonly');
    expect(screen.getByText(/illustration accent only/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/accent hex/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Site adı · TR'), { target: { value: 'ACKaraca Studio' } });
    fireEvent.change(screen.getByLabelText('Footer notu · TR'), { target: { value: 'Mimarlık ve yazılım arasında seçilmiş işler.' } });
    await user.selectOptions(screen.getByLabelText('Varsayılan dil'), 'en');
    await user.click(screen.getAllByRole('button', { name: 'Ayarları kaydet' })[0]!);

    await waitFor(() => expect(saveSiteSettings).toHaveBeenCalledTimes(1));
    const saved = vi.mocked(saveSiteSettings).mock.calls[0]?.[0];
    expect(vi.mocked(saveSiteSettings).mock.calls[0]?.[1]).toBe(siteSettings);
    expect(saved).toMatchObject({
      siteName: { tr: 'ACKaraca Studio' },
      footerNote: { tr: 'Mimarlık ve yazılım arasında seçilmiş işler.' },
      defaultLocale: 'en',
      supportedLocales: ['tr', 'en'],
      palette: siteSettings.palette,
    });
    expect(screen.getByRole('status')).toHaveTextContent('rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı');
    expect(screen.getByRole('status')).toHaveTextContent('canlı dağıtım onayı değildir');
    expect(onSaved).toHaveBeenCalledWith(saved);
  });
});
