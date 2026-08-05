import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { journalEntries } from '../../data/portfolio';
import {
  deleteAdminImage,
  deletePromotedAdminImage,
  promoteAdminImage,
  saveJournalEntry,
  uploadAdminImage,
} from '../../lib/firebase/adminRepository';
import { JournalEditor } from './JournalEditor';

const stagingPath = 'admin-media/admin-id/journal.webp';
const promotedPath = 'media/journal/new-journal-story/journal.webp';
const promotedUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fjournal%2Fnew-journal-story%2Fjournal.webp?alt=media';
const deletionCapability = 'j'.repeat(43);

vi.mock('../../lib/firebase/config', () => ({
  firebaseConfig: { storageBucket: 'test' },
}));

vi.mock('../../lib/firebase/adminRepository', () => ({
  saveJournalEntry: vi.fn((input: unknown) => Promise.resolve(input)),
  uploadAdminImage: vi.fn(() => Promise.resolve({
    storagePath: stagingPath,
    contentType: 'image/webp',
    size: 128,
  })),
  promoteAdminImage: vi.fn(() => Promise.resolve({
    ok: true,
    url: promotedUrl,
    storagePath: promotedPath,
    contentType: 'image/webp',
    size: 128,
    promotedNow: true,
    deletionCapability,
  })),
  deleteAdminImage: vi.fn(() => Promise.resolve()),
  deletePromotedAdminImage: vi.fn(() => Promise.resolve({ ok: true, deleted: true })),
}));

const journalFixture = () => {
  const entry = journalEntries[0];
  if (!entry) throw new Error('Expected a journal fixture.');
  return entry;
};

const renderEditor = () => {
  const onSaved = vi.fn();
  const onDirtyChange = vi.fn();
  render(
    <JournalEditor
      initial={journalFixture()}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      onRequestClose={() => undefined}
    />,
  );
  return { onSaved, onDirtyChange };
};

const renderNewEditor = () => {
  const onSaved = vi.fn();
  const onDirtyChange = vi.fn();
  const onBusyChange = vi.fn();
  const result = render(
    <JournalEditor
      initial={null}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      onBusyChange={onBusyChange}
      onRequestClose={() => undefined}
    />,
  );
  return { ...result, onSaved, onDirtyChange, onBusyChange };
};

const stageImage = async () => {
  const file = new File(['RIFF____WEBP'], 'journal.webp', { type: 'image/webp' });
  fireEvent.change(screen.getByLabelText(/^Görsel dosyası/), {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Yükle ve ekle' }));
  await screen.findByText(/1 görsel güvenli staging alanında bekliyor/i);
  await waitFor(() => expect(
    screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0],
  ).toBeEnabled());
};

describe('JournalEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const NativeURL = URL;
    class TestURL extends NativeURL {
      static createObjectURL = vi.fn(() => 'blob:journal-staging-preview');
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

  it('updates the permanent URL and preview immediately when entry type changes', () => {
    const entry = journalFixture();
    renderEditor();

    const preview = screen.getByRole('link', { name: 'Dağıtılmış sürüm ↗' });
    expect(screen.getByText(`Kalıcı URL: /journal/${entry.slug}`)).toBeInTheDocument();
    expect(preview).toHaveAttribute('href', `/journal/${entry.slug}`);

    fireEvent.change(screen.getByLabelText('Tür'), { target: { value: 'lab-note' } });
    expect(screen.getByText(`Kalıcı URL: /lab/${entry.slug}`)).toBeInTheDocument();
    expect(preview).toHaveAttribute('href', `/lab/${entry.slug}`);

    fireEvent.change(screen.getByLabelText('Tür'), { target: { value: 'release-note' } });
    expect(screen.getByText(`Kalıcı URL: /journal/${entry.slug}`)).toBeInTheDocument();
    expect(preview).toHaveAttribute('href', `/journal/${entry.slug}`);
  });

  it('normalizes, deduplicates, saves, and baselines linked project slugs', async () => {
    const entry = journalFixture();
    const { onSaved, onDirtyChange } = renderEditor();
    const saveButton = screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0];
    const linkedProjects = screen.getByRole('textbox', { name: /^Bağlı proje slug’ları/ });

    expect(saveButton).toBeDisabled();
    fireEvent.change(linkedProjects, {
      target: { value: 'Draw Or Die, archbuilder, draw-or-die, BeatForge' },
    });
    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton!);

    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalledTimes(1));
    expect(saveJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedProjectSlugs: ['draw-or-die', 'archbuilder', 'beatforge'],
      }),
      entry,
    );
    await waitFor(() => expect(linkedProjects).toHaveValue('draw-or-die, archbuilder, beatforge'));
    expect(screen.getByRole('status')).toHaveTextContent('rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı');
    expect(screen.getByRole('status')).toHaveTextContent('canlı dağıtım onayı değildir');
    expect(onSaved).toHaveBeenCalled();
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    expect(saveButton).toBeDisabled();
  });

  it('rejects more than eight normalized linked projects before repository access', () => {
    renderEditor();
    const linkedProjects = screen.getByRole('textbox', { name: /^Bağlı proje slug’ları/ });
    fireEvent.change(linkedProjects, {
      target: { value: 'one, two, three, four, five, six, seven, eight, nine' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);

    expect(screen.getByRole('alert')).toHaveTextContent('En fazla 8 bağlı proje slug’ı');
    expect(saveJournalEntry).not.toHaveBeenCalled();
  });

  it('blocks staging saves, promotes an image block, locks its slug, and transfers ownership on save', async () => {
    const { unmount, onSaved, onDirtyChange } = renderNewEditor();
    const slug = screen.getByLabelText(/^Slug/);
    fireEvent.change(slug, { target: { value: 'new-journal-story' } });
    await stageImage();
    fireEvent.change(screen.getByLabelText('Medya alt · TR'), {
      target: { value: 'Journal anlatısını gösteren çalışma görseli' },
    });
    fireEvent.change(screen.getByLabelText('Media alt · EN'), {
      target: { value: 'Working image illustrating the journal narrative' },
    });

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    const saveButton = screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0];
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton!);
    expect(await screen.findByRole('alert')).toHaveTextContent('henüz public journal kitaplığına aktarılmadı');
    expect(saveJournalEntry).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await waitFor(() => expect(promoteAdminImage).toHaveBeenCalledWith(
      stagingPath,
      'journal',
      'new-journal-story',
    ));
    expect(await screen.findByText(/public journal kitaplığına aktarıldı/i)).toBeInTheDocument();
    expect(slug).toHaveAttribute('readonly');

    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected promoted journal media block.');
    expect(within(mediaCard).getByLabelText(/Kaynak URL/)).toHaveValue(promotedUrl);
    expect(within(mediaCard).getByLabelText('Genişlik · px')).toHaveValue(1600);
    expect(within(mediaCard).getByLabelText('Yükseklik · px')).toHaveValue(900);
    expect(within(mediaCard).getByLabelText('MIME türü')).toHaveValue('image/webp');

    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);
    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalledTimes(1));
    const saved = vi.mocked(saveJournalEntry).mock.calls[0]?.[0];
    expect(saved?.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'media',
        media: expect.objectContaining({
          assetState: 'ready',
          src: promotedUrl,
          width: 1600,
          height: 900,
          mimeType: 'image/webp',
          alt: {
            tr: 'Journal anlatısını gösteren çalışma görseli',
            en: 'Working image illustrating the journal narrative',
          },
        }),
      }),
    ]));
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
    expect(onSaved).toHaveBeenCalled();
    unmount();
    await Promise.resolve();
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });

  it('reports promotion as busy and preserves the before-unload guard until it completes', async () => {
    let resolvePromotion: ((value: Awaited<ReturnType<typeof promoteAdminImage>>) => void) | undefined;
    vi.mocked(promoteAdminImage).mockImplementationOnce(() => new Promise((resolve) => {
      resolvePromotion = resolve;
    }));
    const { unmount, onBusyChange } = renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });
    await stageImage();

    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(true));
    expect(screen.getByRole('button', { name: '← Journal’a dön' })).toBeDisabled();
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);

    resolvePromotion?.({
      ok: true,
      url: promotedUrl,
      storagePath: promotedPath,
      contentType: 'image/webp',
      size: 128,
      promotedNow: true,
      deletionCapability,
    });
    await screen.findByText(/public journal kitaplığına aktarıldı/i);
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
    unmount();
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledWith(
      promotedPath,
      'journal',
      'new-journal-story',
      deletionCapability,
    ));
  });

  it('best-effort deletes abandoned staging uploads and unsaved promotions', async () => {
    const staged = renderNewEditor();
    await stageImage();
    staged.unmount();
    await waitFor(() => expect(deleteAdminImage).toHaveBeenCalledWith(stagingPath));

    vi.clearAllMocks();
    const promoted = renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });
    await stageImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await screen.findByText(/public journal kitaplığına aktarıldı/i);
    promoted.unmount();
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledWith(
      promotedPath,
      'journal',
      'new-journal-story',
      deletionCapability,
    ));
  });

  it('cleans a current-session promotion detached before save', async () => {
    renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });
    await stageImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await screen.findByText(/public journal kitaplığına aktarıldı/i);

    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected promoted journal media block.');
    fireEvent.click(within(mediaCard).getByRole('button', { name: 'Bloğu sil' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);

    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledWith(
      promotedPath,
      'journal',
      'new-journal-story',
      deletionCapability,
    ));
  });

  it('transfers a current-session promotion retained only as a media poster', async () => {
    const { unmount } = renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });
    await stageImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await screen.findByText(/public journal kitaplığına aktarıldı/i);

    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected promoted journal media block.');
    fireEvent.change(within(mediaCard).getByLabelText(/^Kaynak URL/), {
      target: { value: '/media/alternate-journal-image.webp' },
    });
    fireEvent.change(within(mediaCard).getByLabelText('Poster URL'), {
      target: { value: promotedUrl },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);

    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalledTimes(1));
    expect(vi.mocked(saveJournalEntry).mock.calls[0]?.[0].blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'media',
          media: expect.objectContaining({
            src: '/media/alternate-journal-image.webp',
            poster: promotedUrl,
          }),
        }),
      ]),
    );
    unmount();
    await Promise.resolve();
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });

  it('rejects token-bearing Firebase media before repository access', () => {
    renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Medya' }));
    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected a journal media block.');
    fireEvent.change(within(mediaCard).getByLabelText('Varlık durumu'), { target: { value: 'ready' } });
    fireEvent.change(within(mediaCard).getByLabelText(/^Kaynak URL/), {
      target: { value: `${promotedUrl}&token=legacy-secret` },
    });
    fireEvent.change(within(mediaCard).getByLabelText('Genişlik · px'), { target: { value: '1600' } });
    fireEvent.change(within(mediaCard).getByLabelText('Yükseklik · px'), { target: { value: '900' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);

    expect(screen.getByRole('alert')).toHaveTextContent('farklı bucket, slug veya token kabul edilmez');
    expect(saveJournalEntry).not.toHaveBeenCalled();
  });

  it('cleans multiple detached promotions sequentially and forgets idempotent deletes', async () => {
    const firstPath = 'media/journal/new-journal-story/first.webp';
    const secondPath = 'media/journal/new-journal-story/second.webp';
    const firstUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fjournal%2Fnew-journal-story%2Ffirst.webp?alt=media';
    const secondUrl = 'https://firebasestorage.googleapis.com/v0/b/test/o/media%2Fjournal%2Fnew-journal-story%2Fsecond.webp?alt=media';
    const firstCapability = 'c'.repeat(43);
    const secondCapability = 'd'.repeat(43);
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
    let resolveFirstCleanup: ((value: { ok: true; deleted: boolean }) => void) | undefined;
    vi.mocked(deletePromotedAdminImage)
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveFirstCleanup = resolve;
      }))
      .mockResolvedValueOnce({ ok: true, deleted: false });
    const { unmount } = renderNewEditor();
    fireEvent.change(screen.getByLabelText(/^Slug/), { target: { value: 'new-journal-story' } });

    await stageImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await waitFor(() => expect(promoteAdminImage).toHaveBeenCalledTimes(1));
    await screen.findByText(/public journal kitaplığına aktarıldı/i);
    await stageImage();
    fireEvent.click(screen.getByRole('button', { name: 'Public journal kitaplığına aktar' }));
    await waitFor(() => expect(promoteAdminImage).toHaveBeenCalledTimes(2));

    let mediaCards = screen.getAllByText('media', { selector: 'strong' });
    fireEvent.click(within(mediaCards[0]!.closest('article')!).getByRole('button', { name: 'Bloğu sil' }));
    mediaCards = screen.getAllByText('media', { selector: 'strong' });
    fireEvent.click(within(mediaCards[0]!.closest('article')!).getByRole('button', { name: 'Bloğu sil' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);

    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(1));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      1,
      firstPath,
      'journal',
      'new-journal-story',
      firstCapability,
    );
    resolveFirstCleanup?.({ ok: true, deleted: true });
    await waitFor(() => expect(deletePromotedAdminImage).toHaveBeenCalledTimes(2));
    expect(deletePromotedAdminImage).toHaveBeenNthCalledWith(
      2,
      secondPath,
      'journal',
      'new-journal-story',
      secondCapability,
    );
    await screen.findByText(/rebuild sunucu tarafında dayanıklı olarak kuyruğa alındı/i);
    unmount();
    await Promise.resolve();
    expect(deletePromotedAdminImage).toHaveBeenCalledTimes(2);
  });

  it('detaches saved media without physically deleting deployed storage', async () => {
    const fixture = journalFixture();
    const entry = {
      ...fixture,
      blocks: [
        ...fixture.blocks,
        {
          id: 'saved-media-block',
          type: 'media' as const,
          media: {
            id: 'saved-journal-media',
            kind: 'image' as const,
            role: 'gallery' as const,
            assetState: 'ready' as const,
            src: '/media/saved-journal-media.webp',
            alt: { tr: 'Kaydedilmiş journal görseli', en: 'Saved journal image' },
            width: 1600,
            height: 900,
            mimeType: 'image/webp',
          },
        },
      ],
    };
    render(
      <JournalEditor
        initial={entry}
        onSaved={() => undefined}
        onDirtyChange={() => undefined}
        onRequestClose={() => undefined}
      />,
    );

    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected saved media block.');
    fireEvent.click(within(mediaCard).getByRole('button', { name: 'Bloğu sil' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Yazıyı kaydet' })[0]!);
    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalledTimes(1));
    expect(deletePromotedAdminImage).not.toHaveBeenCalled();
  });
});
