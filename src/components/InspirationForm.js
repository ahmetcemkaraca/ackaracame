import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { InspirationService, FileService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockEditor from './BlockEditor/BlockEditor';

const InspirationForm = ({ inspiration, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: 'featured',
    imageUrl: '',
    blocks: [], // Block editor içeriği
  });

  useEffect(() => {
    if (inspiration) {
      setFormData({
        name: inspiration.name || '',
        title: inspiration.title || '',
        description: inspiration.description || '',
        category: inspiration.category || 'featured',
        imageUrl: inspiration.imageUrl || '',
        blocks: inspiration.blocks || [],
      });
    }
  }, [inspiration]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const downloadURL = await FileService.uploadImage(file, 'inspirations');
      setFormData(prev => ({
        ...prev,
        imageUrl: downloadURL
      }));
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = {
        ...formData,
        // 'featured' kategorisi 'title' kullanırken diğerleri 'name' kullanıyor
        name: formData.category === 'featured' ? '' : formData.name,
        title: formData.category === 'featured' ? formData.title : '',
    };


    try {
      if (inspiration) {
        await InspirationService.update(inspiration.id, dataToSave);
      } else {
        await InspirationService.create(dataToSave);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('İlham kaydetme hatası:', error);
      alert('İlham kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {inspiration ? 'İlham Düzenle' : 'Yeni İlham'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="featured">Öne Çıkan</option>
              <option value="influencer">Etkileyen</option>
              <option value="cultural">Kültürel</option>
            </select>
          </div>

          {formData.category === 'featured' ? (
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Başlık *
                </label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
                />
            </div>
          ) : (
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İsim *
                </label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kısa Açıklama *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="input-field"
              placeholder="Kısa özet (listelemede görünür)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Görsel
            </label>
            
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
              </label>
            </div>

            {formData.imageUrl && (
              <div className="relative group">
                <img
                  src={formData.imageUrl}
                  alt="İlham görseli"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Block Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Detaylı İçerik (Bloklar)
            </label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
              <BlockEditor
                value={formData.blocks}
                onChange={(blocks) => setFormData(prev => ({ ...prev, blocks }))}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Metin, görsel, galeri, alıntı ve daha fazlasını ekleyerek zengin içerik oluşturun
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || uploading}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                inspiration ? 'Güncelle' : 'Oluştur'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InspirationForm;
