import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { InboxPanel } from './InboxPanel';

const mocks = vi.hoisted(() => ({
  deleteInquiry: vi.fn(),
  updateInquiryStatus: vi.fn(),
}));

vi.mock('../../lib/firebase/adminRepository', () => ({
  deleteInquiry: mocks.deleteInquiry,
  updateInquiryStatus: mocks.updateInquiryStatus,
}));

const record = {
  documentId: 'inquiry123',
  inquiry: {
    name: 'Example Person',
    email: 'person@example.com',
    inquiryType: 'employment' as const,
    message: 'This is a sufficiently detailed employment inquiry for the portfolio owner.',
    locale: 'en' as const,
    privacyConsent: true as const,
    status: 'new' as const,
    createdAt: '2026-08-04T12:00:00.000Z',
  },
};

describe('InboxPanel retention controls', () => {
  it('requires confirmation before permanently deleting an inquiry', async () => {
    const onDeleted = vi.fn();
    mocks.deleteInquiry.mockResolvedValue(undefined);
    render(<InboxPanel inquiries={[record]} loading={false} onUpdated={vi.fn()} onDeleted={onDeleted} />);

    fireEvent.click(screen.getByRole('button', { name: /example person mesajını aç/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Kalıcı sil' }));
    expect(mocks.deleteInquiry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Mesajı sil' }));

    await waitFor(() => expect(mocks.deleteInquiry).toHaveBeenCalledWith('inquiry123'));
    expect(onDeleted).toHaveBeenCalledWith('inquiry123');
  });

  it('offers cursor pagination when older messages remain', () => {
    const onLoadMore = vi.fn();
    render(
      <InboxPanel
        inquiries={[record]}
        loading={false}
        hasMore
        onLoadMore={onLoadMore}
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Daha eski mesajları yükle' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
