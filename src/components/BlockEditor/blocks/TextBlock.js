import React from 'react';

const TextBlock = ({ content, onChange }) => {
  return (
    <div>
      <textarea
        value={content.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Metin yazın..."
        className="w-full min-h-[120px] p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white resize-y focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
};

export default TextBlock;

