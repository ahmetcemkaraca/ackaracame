import React from 'react';

// Frontend için blokları render et
const BlockRenderer = ({ blocks = [] }) => {
  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {block.content.text}
            </p>
          </div>
        );

      case 'heading':
        const HeadingTag = `h${block.content.level || 2}`;
        const headingClasses = {
          1: 'text-4xl md:text-5xl',
          2: 'text-3xl md:text-4xl',
          3: 'text-2xl md:text-3xl',
          4: 'text-xl md:text-2xl',
        };
        return (
          <HeadingTag
            key={index}
            className={`font-bold text-slate-900 dark:text-white mb-4 ${headingClasses[block.content.level || 2]}`}
          >
            {block.content.text}
          </HeadingTag>
        );

      case 'image':
        return (
          <figure key={index} className="my-8">
            <img
              src={block.content.url}
              alt={block.content.alt || ''}
              className="w-full rounded-xl shadow-lg"
            />
            {block.content.caption && (
              <figcaption className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'gallery':
        return (
          <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
            {block.content.images?.map((url, imgIndex) => (
              <img
                key={imgIndex}
                src={url}
                alt={`Gallery ${imgIndex + 1}`}
                className="w-full aspect-square object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        );

      case 'quote':
        return (
          <blockquote
            key={index}
            className="my-8 border-l-4 border-primary pl-6 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg"
          >
            <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-2">
              "{block.content.text}"
            </p>
            {block.content.author && (
              <footer className="text-sm text-slate-600 dark:text-slate-400">
                — {block.content.author}
              </footer>
            )}
          </blockquote>
        );

      case 'video':
        return (
          <div key={index} className="my-8">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-900">
              <iframe
                src={block.content.url}
                title={`Video: ${block.content.url}`}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {block.content.caption && (
              <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
                {block.content.caption}
              </p>
            )}
          </div>
        );

      case 'code':
        return (
          <div key={index} className="my-8">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400 font-mono">
                  {block.content.language}
                </span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 font-mono">
                  {block.content.code}
                </code>
              </pre>
            </div>
          </div>
        );

      case 'divider':
        return (
          <hr
            key={index}
            className="my-8 border-t-2 border-slate-200 dark:border-slate-700"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="block-content space-y-6">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default BlockRenderer;

