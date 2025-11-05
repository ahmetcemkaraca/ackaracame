import React from 'react';

const VideoBlock = ({ content, onChange }) => {
  // YouTube ve Vimeo embed URL'lerini otomatik dönüştür
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    return url;
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={content.url || ''}
        onChange={(e) => onChange({ ...content, url: e.target.value })}
        placeholder="Video URL (YouTube, Vimeo veya doğrudan video linki)"
        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      {content.url && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
          <iframe
            src={getEmbedUrl(content.url)}
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
        placeholder="Video açıklaması (opsiyonel)"
        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-sm"
      />
    </div>
  );
};

export default VideoBlock;

