import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LoginPanel, MfaPanel, MisconfiguredPanel } from './StudioAuth';

describe('studio authentication panels', () => {
  it('submits email and password through the protected login action', async () => {
    const user = userEvent.setup();
    const login = vi.fn(async () => undefined);
    render(<LoginPanel error={null} onLogin={login} />);

    await user.type(screen.getByLabelText('E-posta'), 'admin@ackaraca.me');
    await user.type(screen.getByLabelText('Parola'), 'correct-horse-battery-staple');
    await user.click(screen.getByRole('button', { name: 'Güvenli giriş' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        'admin@ackaraca.me',
        'correct-horse-battery-staple',
      );
    });
  });

  it('normalizes and submits a six-digit MFA code', async () => {
    const user = userEvent.setup();
    const verify = vi.fn(async () => undefined);
    render(
      <MfaPanel
        label="ACK Authenticator"
        error={null}
        onVerify={verify}
        onCancel={() => undefined}
      />,
    );

    await user.type(screen.getByLabelText('Tek kullanımlık kod'), '123 456');
    await user.click(screen.getByRole('button', { name: 'Kodu doğrula' }));

    await waitFor(() => expect(verify).toHaveBeenCalledWith('123456'));
  });

  it('fails closed with actionable configuration guidance', () => {
    render(<MisconfiguredPanel />);
    expect(
      screen.getByRole('heading', { name: 'Firebase bağlantısı yapılandırılmamış' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Authentication + MFA')).toBeInTheDocument();
  });
});
