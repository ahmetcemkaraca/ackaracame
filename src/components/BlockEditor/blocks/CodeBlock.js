import React from 'react';

const CodeBlock = ({ content, onChange }) => {
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'php',
    'ruby', 'go', 'rust', 'html', 'css', 'json', 'sql', 'bash', 'yaml'
  ];

  return (
    <div className="space-y-2">
      <select
        value={content.language || 'javascript'}
        onChange={(e) => onChange({ ...content, language: e.target.value })}
        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>

      <textarea
        value={content.code || ''}
        onChange={(e) => onChange({ ...content, code: e.target.value })}
        placeholder="Kodunuzu buraya yapıştırın..."
        className="w-full min-h-[200px] p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-y focus:ring-2 focus:ring-primary focus:border-transparent"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeBlock;

