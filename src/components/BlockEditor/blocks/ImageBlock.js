import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { FileService } from '../../../firebase/services';

const ImageBlock = ({ content, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await FileService.uploadImage(file, 'blocks');
      onChange({ ...content, url });
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange({ ...content, url: '' });
  };

  return (
    <div className="space-y-3">
      {content.url ? (
        <div className="relative group">
          <img
            src={content.url}
            alt={content.alt || ''}
            className="w-full rounded-lg"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}
            </span>
          </label>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={content.alt || ''}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          placeholder="Alt metin (SEO için önemli)"
          className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-sm"
        />
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Görsel açıklaması (opsiyonel)"
          className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-white text-sm"
        />
      </div>
    </div>
  );
};

export default ImageBlock;

