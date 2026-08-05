import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SeedDialog } from './StudioNotices';

describe('SeedDialog', () => {
  it('requires an explicit risk phrase before calling the secure seed action', () => {
    const confirm = vi.fn();
    render(
      <SeedDialog
        open
        pending={false}
        error={null}
        onConfirm={confirm}
        onClose={() => undefined}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Eksik başlangıç içeriğini oluştur' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const submit = screen.getByRole('button', { name: 'Riski kabul et ve yaz' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Onay ifadesi'), { target: { value: 'SEED' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
