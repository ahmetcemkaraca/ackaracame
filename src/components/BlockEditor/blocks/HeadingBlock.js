import React from 'react';

const HeadingBlock = ({ content, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={content.level || 2}
          onChange={(e) => onChange({ ...content, level: parseInt(e.target.value) })}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
        </select>
      </div>
      <input
        type="text"
        value={content.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Başlık yazın..."
        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
};

export default HeadingBlock;

