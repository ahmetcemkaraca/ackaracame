import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import type { ContentBlock } from '../../domain/content';
import { ContentBlockEditor } from './ContentBlockEditor';
import { createCodeBlock, createTextBlock } from './editorUtils';

const blockTypes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.studio-block-card__header strong'))
    .map((element) => element.textContent);

const EditorHarness = () => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([createTextBlock()]);
  return (
    <>
      <ContentBlockEditor
        blocks={blocks}
        onChange={setBlocks}
        allowedTypes={['text', 'facts', 'callout', 'quote', 'code', 'media', 'gallery']}
        minimumBlocks={1}
      />
      <output data-testid="blocks-state">{JSON.stringify(blocks)}</output>
    </>
  );
};

describe('ContentBlockEditor', () => {
  it('adds, edits, reorders, and removes bilingual quote and code blocks', () => {
    const { container } = render(<EditorHarness />);

    fireEvent.click(screen.getByRole('button', { name: '+ Alıntı' }));
    fireEvent.change(screen.getByLabelText('Alıntı · TR'), {
      target: { value: 'Mekân, davranış ile teknoloji arasındaki arayüzdür.' },
    });
    fireEvent.change(screen.getByLabelText('Attribution · EN'), {
      target: { value: 'Studio note' },
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Kod' }));
    fireEvent.change(screen.getByLabelText('Kod dili'), { target: { value: 'python' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Kod/ }), { target: { value: 'result = build_idea()' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Caption · EN/ }), {
      target: { value: 'A concise implementation note for the published example.' },
    });

    const state = JSON.parse(screen.getByTestId('blocks-state').textContent || '[]') as ContentBlock[];
    expect(state[1]).toMatchObject({
      type: 'quote',
      quote: { tr: 'Mekân, davranış ile teknoloji arasındaki arayüzdür.' },
      attribution: { en: 'Studio note' },
    });
    expect(state[2]).toMatchObject({
      type: 'code',
      language: 'python',
      code: 'result = build_idea()',
      caption: { en: 'A concise implementation note for the published example.' },
    });

    const codeCard = screen.getByText('code').closest('article');
    if (!codeCard) throw new Error('Expected code block card.');
    fireEvent.click(within(codeCard).getByRole('button', { name: 'Bloğu yukarı taşı' }));
    expect(blockTypes(container)).toEqual(['text', 'code', 'quote']);

    const movedCodeCard = screen.getByText('code').closest('article');
    if (!movedCodeCard) throw new Error('Expected moved code block card.');
    fireEvent.click(within(movedCodeCard).getByRole('button', { name: 'Bloğu sil' }));
    expect(blockTypes(container)).toEqual(['text', 'quote']);

    const quoteCard = screen.getByText('quote').closest('article');
    if (!quoteCard) throw new Error('Expected quote block card.');
    fireEvent.click(within(quoteCard).getByRole('button', { name: 'Bloğu sil' }));
    expect(blockTypes(container)).toEqual(['text']);
    expect(screen.getByRole('button', { name: 'Bloğu sil' })).toBeDisabled();
  });

  it('accepts only allowlisted code language values', () => {
    const code = createCodeBlock();
    const onChange = vi.fn();
    render(
      <ContentBlockEditor
        blocks={[code]}
        onChange={onChange}
        allowedTypes={['code']}
        minimumBlocks={1}
      />,
    );

    fireEvent.change(screen.getByLabelText('Kod dili'), { target: { value: 'html' } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Kod dili'), { target: { value: 'json' } });
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ type: 'code', language: 'json' }),
    ]);
  });

  it('creates and edits complete planned or ready media metadata', () => {
    render(<EditorHarness />);

    fireEvent.click(screen.getByRole('button', { name: '+ Medya' }));
    const mediaCard = screen.getByText('media', { selector: 'strong' }).closest('article');
    if (!mediaCard) throw new Error('Expected media block card.');
    const editor = within(mediaCard);

    fireEvent.change(editor.getByLabelText('Opsiyonel başlık · TR'), { target: { value: 'Ürün demosu' } });
    fireEvent.change(editor.getByLabelText(/Optional heading · EN/), { target: { value: 'Product demo' } });
    fireEvent.change(editor.getByLabelText(/Varlık kimliği/), { target: { value: 'product-demo' } });
    fireEvent.change(editor.getByLabelText('Tür'), { target: { value: 'video' } });
    fireEvent.change(editor.getByLabelText('Rol'), { target: { value: 'demo' } });
    fireEvent.change(editor.getByLabelText('Varlık durumu'), { target: { value: 'ready' } });
    fireEvent.change(editor.getByLabelText(/Kaynak URL/), { target: { value: '/media/product-demo.mp4' } });
    fireEvent.change(editor.getByLabelText('Poster URL'), { target: { value: '/media/product-demo.webp' } });
    fireEvent.change(editor.getByLabelText('Alt · TR'), { target: { value: 'Ürünün etkileşim demosu' } });
    fireEvent.change(editor.getByLabelText('Alt · EN'), { target: { value: 'Product interaction demo' } });
    fireEvent.change(editor.getByLabelText('Açıklama · TR'), { target: { value: 'Ürünün temel etkileşim akışını gösteren kısa demo.' } });
    fireEvent.change(editor.getByLabelText(/Caption · EN/), { target: { value: 'A short demo showing the product’s primary interaction flow.' } });
    fireEvent.change(editor.getByLabelText('Genişlik · px'), { target: { value: '1920' } });
    fireEvent.change(editor.getByLabelText('Yükseklik · px'), { target: { value: '1080' } });
    fireEvent.change(editor.getByLabelText('MIME türü'), { target: { value: 'video/mp4' } });

    const state = JSON.parse(screen.getByTestId('blocks-state').textContent || '[]') as ContentBlock[];
    expect(state[1]).toMatchObject({
      type: 'media',
      heading: { tr: 'Ürün demosu', en: 'Product demo' },
      media: {
        id: 'product-demo',
        kind: 'video',
        role: 'demo',
        assetState: 'ready',
        src: '/media/product-demo.mp4',
        poster: '/media/product-demo.webp',
        width: 1920,
        height: 1080,
        mimeType: 'video/mp4',
      },
    });

    fireEvent.change(editor.getByLabelText('Varlık durumu'), { target: { value: 'planned' } });
    const plannedState = JSON.parse(screen.getByTestId('blocks-state').textContent || '[]') as ContentBlock[];
    expect(plannedState[1]).not.toHaveProperty('media.src');
    expect(plannedState[1]).not.toHaveProperty('media.poster');
    expect(editor.getByLabelText(/Kaynak URL/)).toBeDisabled();
    expect(editor.getByLabelText('Poster URL')).toBeDisabled();
  });

  it('adds, reorders, and removes gallery items while enforcing the 2–12 item bounds', () => {
    render(<EditorHarness />);
    fireEvent.click(screen.getByRole('button', { name: '+ Galeri' }));

    const galleryCard = screen.getByText('gallery', { selector: 'strong' }).closest('article');
    if (!galleryCard) throw new Error('Expected gallery block card.');
    const gallery = within(galleryCard);
    let items = gallery.getAllByRole('group', { name: /Galeri öğesi \d+/ });
    expect(items).toHaveLength(2);
    expect(within(items[0] as HTMLElement).getByRole('button', { name: 'Galeri öğesini sil' })).toBeDisabled();

    fireEvent.change(within(items[0] as HTMLElement).getByLabelText(/Varlık kimliği/), { target: { value: 'first-item' } });
    fireEvent.change(within(items[1] as HTMLElement).getByLabelText(/Varlık kimliği/), { target: { value: 'second-item' } });
    fireEvent.click(within(items[0] as HTMLElement).getByRole('button', { name: 'Öğeyi aşağı taşı' }));

    let state = JSON.parse(screen.getByTestId('blocks-state').textContent || '[]') as ContentBlock[];
    const galleryBlock = state.find((block) => block.type === 'gallery');
    expect(galleryBlock).toMatchObject({
      type: 'gallery',
      items: [{ id: 'second-item' }, { id: 'first-item' }],
    });

    fireEvent.click(gallery.getByRole('button', { name: '+ Galeri öğesi' }));
    items = gallery.getAllByRole('group', { name: /Galeri öğesi \d+/ });
    expect(items).toHaveLength(3);
    fireEvent.click(within(items[2] as HTMLElement).getByRole('button', { name: 'Galeri öğesini sil' }));
    expect(gallery.getAllByRole('group', { name: /Galeri öğesi \d+/ })).toHaveLength(2);

    for (let index = 0; index < 10; index += 1) {
      fireEvent.click(gallery.getByRole('button', { name: '+ Galeri öğesi' }));
    }
    expect(gallery.getAllByRole('group', { name: /Galeri öğesi \d+/ })).toHaveLength(12);
    expect(gallery.getByRole('button', { name: '+ Galeri öğesi' })).toBeDisabled();

    state = JSON.parse(screen.getByTestId('blocks-state').textContent || '[]') as ContentBlock[];
    expect(state.find((block) => block.type === 'gallery')).toMatchObject({ type: 'gallery' });
  });
});
