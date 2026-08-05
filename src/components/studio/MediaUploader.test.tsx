import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { deleteAdminImage, uploadAdminImage } from '../../lib/firebase/adminRepository';
import { MediaUploader } from './MediaUploader';

const stagedUpload = {
  storagePath: 'admin-media/admin-id/upload.webp',
  contentType: 'image/webp',
  size: 128,
};

vi.mock('../../lib/firebase/adminRepository', () => ({
  uploadAdminImage: vi.fn(
    (file: File, onProgress?: (percentage: number) => void) => {
      void file;
      onProgress?.(100);
      return Promise.resolve(stagedUpload);
    },
  ),
  deleteAdminImage: vi.fn(() => Promise.resolve()),
}));

describe('MediaUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const NativeURL = URL;
    class TestURL extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:staging-preview');
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', TestURL);
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({
      width: 1600,
      height: 900,
      close: vi.fn(),
    })));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('retains the staging path for server-side promotion', async () => {
    const onUploaded = vi.fn();
    render(<MediaUploader onUploaded={onUploaded} />);
    const file = new File(['RIFF____WEBP'], 'project.webp', { type: 'image/webp' });

    fireEvent.change(screen.getByLabelText(/^Görsel dosyası/), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Yükle ve ekle' }));

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith(
        expect.objectContaining({
          ...stagedUpload,
          previewUrl: expect.any(String),
          width: 1600,
          height: 900,
        }),
        'gallery',
      );
    });
    expect(screen.getByText(/public galeri aktarımı bekliyor/i)).toBeInTheDocument();
  });

  it('reports upload busy state and deletes staging that finishes after unmount', async () => {
    let resolveUpload: ((value: typeof stagedUpload) => void) | undefined;
    vi.mocked(uploadAdminImage).mockImplementationOnce(() => new Promise((resolve) => {
      resolveUpload = resolve;
    }));
    const onUploaded = vi.fn();
    const onBusyChange = vi.fn();
    const { unmount } = render(
      <MediaUploader onUploaded={onUploaded} onBusyChange={onBusyChange} />,
    );
    const file = new File(['RIFF____WEBP'], 'project.webp', { type: 'image/webp' });

    fireEvent.change(screen.getByLabelText(/^Görsel dosyası/), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Yükle ve ekle' }));
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(true));
    unmount();
    resolveUpload?.(stagedUpload);

    await waitFor(() => expect(deleteAdminImage).toHaveBeenCalledWith(stagedUpload.storagePath));
    expect(onUploaded).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:staging-preview');
  });
});
