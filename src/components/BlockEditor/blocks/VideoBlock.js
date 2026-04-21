import React from 'react';
import { getSafeVideoEmbedUrl } from '../../../utils/urlSafety';

const VideoBlock = ({ content, onChange }) => {
  const embedUrl = getSafeVideoEmbedUrl(content.url);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={content.url || ''}
        onChange={(e) => onChange({ ...content, url: e.target.value })}
        placeholder="Video URL (YouTube, Vimeo veya dogrudan video baglantisi)"
        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      {embedUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
          <iframe
            src={embedUrl}
            title={`Video: ${content.url}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <input
        type="text"
        value={content.caption || ''}
        onChange={(e) => onChange({ ...content, caption: e.target.value })}
        placeholder="Video aciklamasi (opsiyonel)"
        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-sm"
      />
    </div>
  );
};

export default VideoBlock;
