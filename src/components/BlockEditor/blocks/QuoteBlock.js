import React from 'react';

const QuoteBlock = ({ content, onChange }) => {
  return (
    <div className="space-y-3 border-l-4 border-primary pl-4">
      <textarea
        value={content.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Alıntı metni..."
        className="w-full min-h-[80px] p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white italic resize-y focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        type="text"
        value={content.author || ''}
        onChange={(e) => onChange({ ...content, author: e.target.value })}
        placeholder="Yazar (opsiyonel)"
        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-sm"
      />
    </div>
  );
};

export default QuoteBlock;

