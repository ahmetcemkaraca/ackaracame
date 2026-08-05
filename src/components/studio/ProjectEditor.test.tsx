import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { portfolioProjects } from '../../data/portfolio';
import {
  deletePromotedAdminImage,
  promoteAdminImage,
  saveProject,
  uploadAdminImage,
} from '../../lib/firebase/adminRepository';
import { ProjectEditor } from './ProjectEditor';

const deletionCapability = 'p'.repeat(43);
const promotedUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fprojects%2Fdraw-or-die%2Fproject.webp?alt=media';

vi.mock('../../lib/firebase/config', () => ({
  firebaseConfig: { storageBucket: 'test' },
}));

vi.mock('../../lib/firebase/adminRepository', () => ({
  saveProject: vi.fn((input: unknown) => Promise.resolve(input)),
  uploadAdminImage: vi.fn(() => Promise.resolve({
    storagePath: 'admin-media/admin-id/project.webp',
    contentType: 'image/webp',
    size: 128,
  })),
  promoteAdminImage: vi.fn(() => Promise.resolve({
    ok: true,
    url: promotedUrl,
    storagePath: 'media/projects/draw-or-die/project.webp',
    contentType: 'image/webp',
    size: 128,
    promotedNow: true,
    deletionCapability,
  })),
  deleteAdminImage: vi.fn(() => Promise.resolve()),
  deletePromotedAdminImage: vi.fn(() => Promise.resolve({ ok: true, deleted: true })),
  promotedAdminImageStoragePath: vi.fn(() => 'media/projects/draw-or-die/project.webp'),
}));

const stageProjectImage = async () => {
  const file = new File(['RIFF____WEBP'], 'project.webp', { type: 'image/webp' });
  fireEvent.change(screen.getByLabelText(/^Görsel dosyası/), {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Yükle ve ekle' }));
  await screen.findByText(/güvenli staging alanında bekliyor/i);
  await waitFor(() => expect(
    screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0],
  ).toBeEnabled());
};

describe('ProjectEditor', () => {
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

  it('locks an existing slug, tracks changes, and saves structured fields', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const onSaved = vi.fn();
    const onDirtyChange = vi.fn();
    render(
      <ProjectEditor
        initial={project}
        onSaved={onSaved}
        onDirtyChange={onDirtyChange}
        onRequestClose={() => undefined}
      />,
    );

    const basics = screen.getByRole('heading', { name: 'Temel bilgiler' }).closest('section');
    if (!basics) throw new Error('Expected project basics section.');
    expect(within(basics).getByLabelText(/^Slug/)).toHaveAttribute('readonly');

    const title = within(basics).getByLabelText('Başlık · TR');
    fireEvent.change(title, { target: { value: 'Draw Or Die — Jury Lab' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    await waitFor(() => expect(saveProject).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(saveProject).mock.calls[0]?.[0];
    expect(savedInput?.title.tr).toBe('Draw Or Die — Jury Lab');
    expect(savedInput?.slug).toBe(project.slug);
    expect(screen.getByRole('status')).toHaveTextContent('rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı');
    expect(screen.getByRole('status')).toHaveTextContent('canlı dağıtım onayı değildir');
    expect(onSaved).toHaveBeenCalled();
  });

  it('adds an editable callout without exposing raw JSON', () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Vurgu' }));
    expect(screen.getByText('callout')).toBeInTheDocument();
    expect(screen.queryByLabelText(/raw json/i)).not.toBeInTheDocument();
  });

  it('persists project metadata and normalizes blank optional values', async () => {
    const fixture = portfolioProjects[0];
    if (!fixture) throw new Error('Expected a project fixture.');
    const project = {
      ...fixture,
      context: { tr: ' ', en: '' },
      location: { tr: '', en: ' ' },
      releaseStage: undefined,
      metrics: [{
        id: 'delivery-count',
        label: { tr: 'Teslim', en: 'Deliveries' },
        value: { tr: '4', en: '4' },
        context: { tr: '', en: ' ' },
        evidenceUrl: ' ',
        verified: false,
      }],
      relatedSlugs: [],
    } satisfies typeof fixture;

    render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    fireEvent.change(screen.getByLabelText('Yayın aşaması'), { target: { value: 'prototype' } });
    fireEvent.change(screen.getByLabelText('İlgili proje slug’ı'), { target: { value: 'Arch Builder' } });
    fireEvent.click(screen.getByRole('button', { name: 'Projeyi ekle' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    await waitFor(() => expect(saveProject).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(saveProject).mock.calls[0]?.[0];
    expect(savedInput).toMatchObject({
      releaseStage: 'prototype',
      relatedSlugs: ['arch-builder'],
      metrics: [expect.objectContaining({ id: 'delivery-count', verified: false })],
    });
    expect(savedInput).not.toHaveProperty('context');
    expect(savedInput).not.toHaveProperty('location');
    expect(savedInput?.metrics[0]).not.toHaveProperty('context');
    expect(savedInput?.metrics[0]).not.toHaveProperty('evidenceUrl');
  });

  it('promotes staged media before allowing its public URL into saved content', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const repository = await import('../../lib/firebase/adminRepository');
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();

    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await waitFor(() => {
      expect(repository.promoteAdminImage).toHaveBeenCalledWith(
        'admin-media/admin-id/project.webp',
        'project',
        'draw-or-die',
      );
    });
    expect(await screen.findByText(/public kitaplığa aktarıldı/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);
    await waitFor(() => expect(saveProject).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(saveProject).mock.calls[0]?.[0];
    expect(savedInput?.media.some((item) => item.src?.includes('staging-token'))).toBe(false);
    expect(savedInput?.media.some((item) => item.src?.startsWith('https://firebasestorage.googleapis.com/'))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Medyayı kaldır' }));
    expect(await screen.findByText(/sunucu temizliğine kadar/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Medyayı kaldır' })).not.toBeInTheDocument();
    unmount();
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });

  it('transfers a promotion retained as a block poster after its main media reference is detached', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await screen.findByText(/public kitaplığa aktarıldı/i);

    fireEvent.click(screen.getByRole('button', { name: '+ Medya' }));
    const mediaBlock = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaBlock) throw new Error('Expected a project media block.');
    fireEvent.change(within(mediaBlock).getByLabelText('Varlık durumu'), { target: { value: 'ready' } });
    fireEvent.change(within(mediaBlock).getByLabelText(/^Kaynak URL/), { target: { value: '/media/project-alternate.webp' } });
    fireEvent.change(within(mediaBlock).getByLabelText('Poster URL'), { target: { value: promotedUrl } });
    fireEvent.change(within(mediaBlock).getByLabelText('Genişlik · px'), { target: { value: '1600' } });
    fireEvent.change(within(mediaBlock).getByLabelText('Yükseklik · px'), { target: { value: '900' } });
    fireEvent.click(screen.getByRole('button', { name: 'Medyayı kaldır' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    await waitFor(() => expect(saveProject).toHaveBeenCalledTimes(1));
    const saved = vi.mocked(saveProject).mock.calls[0]?.[0];
    expect(saved?.media).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ src: promotedUrl }),
    ]));
    expect(saved?.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'media',
        media: expect.objectContaining({
          src: '/media/project-alternate.webp',
          poster: promotedUrl,
        }),
      }),
    ]));
    unmount();
    await Promise.resolve();
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });

  it('fences navigation, submit, and beforeunload while an upload is active', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    let resolveUpload: ((value: Awaited<ReturnType<typeof uploadAdminImage>>) => void) | undefined;
    vi.mocked(uploadAdminImage).mockImplementationOnce(() => new Promise((resolve) => {
      resolveUpload = resolve;
    }));
    const onBusyChange = vi.fn();
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onBusyChange={onBusyChange}
        onRequestClose={() => undefined}
      />,
    );

    const file = new File(['RIFF____WEBP'], 'project.webp', { type: 'image/webp' });
    fireEvent.change(screen.getByLabelText(/^Görsel dosyası/), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Yükle ve ekle' }));
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(true));
    expect(screen.getByRole('button', { name: '← Projelere dön' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Medya yükleniyor…' })[0]).toBeDisabled();
    expect(document.querySelector('form.studio-editor')).toHaveAttribute('aria-busy', 'true');
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    resolveUpload?.({
      storagePath: 'admin-media/admin-id/project.webp',
      contentType: 'image/webp',
      size: 128,
    });
    await screen.findByText(/güvenli staging alanında bekliyor/i);
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
    unmount();
  });

  it('rejects Firebase media bound to another bucket before repository access', () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Medya' }));
    const mediaBlock = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaBlock) throw new Error('Expected a project media block.');
    fireEvent.change(within(mediaBlock).getByLabelText('Varlık durumu'), { target: { value: 'ready' } });
    fireEvent.change(within(mediaBlock).getByLabelText(/^Kaynak URL/), {
      target: {
        value: promotedUrl.replace('/b/test/', '/b/attacker-bucket/'),
      },
    });
    fireEvent.change(within(mediaBlock).getByLabelText('Genişlik · px'), { target: { value: '1600' } });
    fireEvent.change(within(mediaBlock).getByLabelText('Yükseklik · px'), { target: { value: '900' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    expect(screen.getByRole('alert')).toHaveTextContent('farklı bucket, slug veya token kabul edilmez');
    expect(saveProject).not.toHaveBeenCalled();
  });

  it('keeps a current-session deletion capability when save fails and cleans it on abandon', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const onSaved = vi.fn();
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={onSaved}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await screen.findByText(/public kitaplığa aktarıldı/i);
    vi.mocked(saveProject).mockRejectedValueOnce(new Error('Firestore write rejected.'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    expect(await screen.findByRole('alert')).toHaveTextContent('Firestore write rejected.');
    expect(onSaved).not.toHaveBeenCalled();
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();

    unmount();
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledWith(
      'media/projects/draw-or-die/project.webp',
      'project',
      'draw-or-die',
      deletionCapability,
    ));
  });

  it('retries retained cleanup when the editor unmounts during a successful save', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    let resolveSave: ((value: Awaited<ReturnType<typeof saveProject>>) => void) | undefined;
    vi.mocked(saveProject).mockImplementationOnce(() => new Promise((resolve) => {
      resolveSave = resolve;
    }));
    vi.mocked(deletePromotedAdminImage)
      .mockRejectedValueOnce(new Error('First cleanup attempt failed.'))
      .mockResolvedValueOnce({ ok: true, deleted: true });
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await screen.findByText(/public kitaplığa aktarıldı/i);
    fireEvent.click(screen.getByRole('button', { name: 'Medyayı kaldır' }));
    fireEvent.change(screen.getAllByLabelText('Başlık · TR')[0]!, {
      target: { value: 'Draw Or Die — save in flight' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);
    await waitFor(() => expect(saveProject).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(saveProject).mock.calls[0]?.[0];
    if (!savedInput) throw new Error('Expected a pending project save.');

    unmount();
    resolveSave?.(savedInput);

    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(2));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      1,
      'media/projects/draw-or-die/project.webp',
      'project',
      'draw-or-die',
      deletionCapability,
    );
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      2,
      'media/projects/draw-or-die/project.webp',
      'project',
      'draw-or-die',
      deletionCapability,
    );
  });

  it('serializes cleanup and retains only failed unreferenced promotions for retry', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const firstPath = 'media/projects/draw-or-die/first.webp';
    const secondPath = 'media/projects/draw-or-die/second.webp';
    const firstUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fprojects%2Fdraw-or-die%2Ffirst.webp?alt=media';
    const secondUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fprojects%2Fdraw-or-die%2Fsecond.webp?alt=media';
    const firstCapability = 'a'.repeat(43);
    const secondCapability = 'b'.repeat(43);
    vi.mocked(uploadAdminImage)
      .mockResolvedValueOnce({ storagePath: 'admin-media/admin-id/first.webp', contentType: 'image/webp', size: 128 })
      .mockResolvedValueOnce({ storagePath: 'admin-media/admin-id/second.webp', contentType: 'image/webp', size: 128 });
    vi.mocked(promoteAdminImage)
      .mockResolvedValueOnce({
        ok: true,
        url: firstUrl,
        storagePath: firstPath,
        contentType: 'image/webp',
        size: 128,
        promotedNow: true,
        deletionCapability: firstCapability,
      })
      .mockResolvedValueOnce({
        ok: true,
        url: secondUrl,
        storagePath: secondPath,
        contentType: 'image/webp',
        size: 128,
        promotedNow: true,
        deletionCapability: secondCapability,
      });
    let rejectFirstCleanup: ((reason?: unknown) => void) | undefined;
    vi.mocked(deletePromotedAdminImage)
      .mockImplementationOnce(() => new Promise((_, reject) => {
        rejectFirstCleanup = reject;
      }))
      .mockResolvedValueOnce({ ok: true, deleted: false })
      .mockResolvedValueOnce({ ok: true, deleted: true });
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await waitFor(() => expect(promoteAdminImage).toHaveBeenCalledTimes(1));
    await screen.findByText(/public kitaplığa aktarıldı/i);
    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await waitFor(() => expect(promoteAdminImage).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getAllByRole('button', { name: 'Medyayı kaldır' })[0]!);
    fireEvent.click(screen.getAllByRole('button', { name: 'Medyayı kaldır' })[0]!);
    fireEvent.change(screen.getAllByLabelText('Başlık · TR')[0]!, {
      target: { value: 'Draw Or Die — cleanup checkpoint' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Projeyi kaydet' })[0]!);

    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(1));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      1,
      firstPath,
      'project',
      'draw-or-die',
      firstCapability,
    );
    rejectFirstCleanup?.(new Error('Transient cleanup failure.'));
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(2));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      2,
      secondPath,
      'project',
      'draw-or-die',
      secondCapability,
    );
    await screen.findByText(/rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı/i);

    unmount();
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(3));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      3,
      firstPath,
      'project',
      'draw-or-die',
      firstCapability,
    );
  }, 15_000);

  it('never tracks a previously promoted object without a deletion capability', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    vi.mocked(promoteAdminImage).mockResolvedValueOnce({
      ok: true,
      url: promotedUrl,
      storagePath: 'media/projects/draw-or-die/project.webp',
      contentType: 'image/webp',
      size: 128,
      promotedNow: false,
      deletionCapability: null,
    });
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await screen.findByText(/yeniden bağlandı/i);
    unmount();
    await Promise.resolve();

    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });

  it('cleans media promoted during an abandoned unsaved session', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    const { unmount } = render(
      <ProjectEditor
        initial={project}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    await stageProjectImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public kitaplığa aktar' }));
    await screen.findByText(/public kitaplığa aktarıldı/i);

    unmount();
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledWith(
      'media/projects/draw-or-die/project.webp',
      'project',
      'draw-or-die',
      deletionCapability,
    ));
  });
});
