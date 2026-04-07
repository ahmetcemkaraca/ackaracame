import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { FileService } from '../../../firebase/services';

const GalleryBlock = ({ content, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        FileService.uploadImage(file, 'blocks/gallery')
      );
      const urls = await Promise.all(uploadPromises);
      const images = content.images || [];
      onChange({ ...content, images: [...images, ...urls] });
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görseller yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = content.images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  return (
    <div className="space-y-3">
      {content.images && content.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {content.images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="gallery-upload"
          disabled={uploading}
        />
        <label
          htmlFor="gallery-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="w-6 h-6 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {uploading ? 'Yükleniyor...' : 'Görseller eklemek için tıklayın'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default GalleryBlock;

