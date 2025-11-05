import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import HeadingBlock from './blocks/HeadingBlock';
import QuoteBlock from './blocks/QuoteBlock';
import GalleryBlock from './blocks/GalleryBlock';
import VideoBlock from './blocks/VideoBlock';
import CodeBlock from './blocks/CodeBlock';
import DividerBlock from './blocks/DividerBlock';

const BLOCK_TYPES = [
  { type: 'text', label: 'Metin', icon: '📝' },
  { type: 'heading', label: 'Başlık', icon: '📰' },
  { type: 'image', label: 'Görsel', icon: '🖼️' },
  { type: 'gallery', label: 'Galeri', icon: '🎨' },
  { type: 'quote', label: 'Alıntı', icon: '💬' },
  { type: 'video', label: 'Video', icon: '🎥' },
  { type: 'code', label: 'Kod', icon: '💻' },
  { type: 'divider', label: 'Ayırıcı', icon: '➖' },
];

const BlockEditor = ({ value = [], onChange }) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blocks, setBlocks] = useState(value);

  // Blok değiştiğinde parent'a bildir
  const updateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    if (onChange) {
      onChange(newBlocks);
    }
  };

  // Yeni blok ekle
  const addBlock = (type) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: getDefaultContent(type),
    };
    updateBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
  };

  // Varsayılan içerik
  const getDefaultContent = (type) => {
    switch (type) {
      case 'text':
        return { text: '' };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'gallery':
        return { images: [] };
      case 'quote':
        return { text: '', author: '' };
      case 'video':
        return { url: '', caption: '' };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'divider':
        return {};
      default:
        return {};
    }
  };

  // Blok güncelle
  const updateBlock = (index, content) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    updateBlocks(newBlocks);
  };

  // Blok sil
  const deleteBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    updateBlocks(newBlocks);
  };

  // Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newBlocks = Array.from(blocks);
    const [removed] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, removed);
    updateBlocks(newBlocks);
  };

  // Blok render
  const renderBlock = (block, index) => {
    const commonProps = {
      content: block.content,
      onChange: (content) => updateBlock(index, content),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} />;
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      case 'gallery':
        return <GalleryBlock {...commonProps} />;
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'video':
        return <VideoBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock {...commonProps} />;
      default:
        return <div>Bilinmeyen blok tipi</div>;
    }
  };

  return (
    <div className="block-editor space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group relative bg-white dark:bg-slate-800 border-2 rounded-lg transition-all ${
                        snapshot.isDragging
                          ? 'border-primary shadow-lg'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {/* Drag Handle & Delete */}
                      <div className="absolute -left-12 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          {...provided.dragHandleProps}
                          className="p-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Sürükle"
                        >
                          <GripVertical className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button
                          onClick={() => deleteBlock(index)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>

                      {/* Block Content */}
                      <div className="p-4">
                        {renderBlock(block, index)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Block Button */}
      <div className="relative">
        <button
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Blok Ekle</span>
        </button>

        {/* Block Type Menu */}
        {showBlockMenu && (
          <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BLOCK_TYPES.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-2xl">{blockType.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {blockType.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockEditor;

