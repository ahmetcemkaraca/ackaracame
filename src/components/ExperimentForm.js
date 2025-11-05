import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { FileService } from '../firebase/services';
import { useProject } from '../context/ProjectContext';

const ExperimentForm = ({ experiment, onClose }) => {
  const { createExperiment, updateExperiment } = useProject();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    type: 'featured', // featured, digital, failed
    featured: false,
    date: new Date().toISOString().split('T')[0],
    lesson: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (experiment) {
      setFormData({
        title: experiment.title || '',
        description: experiment.description || '',
        imageUrl: experiment.imageUrl || '',
        type: experiment.type || 'featured',
        featured: experiment.featured || false,
        date: experiment.date || (experiment.createdAt ? new Date(experiment.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        lesson: experiment.lesson || '',
      });
    }
  }, [experiment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const url = await FileService.uploadImage(file, 'experiments');
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError('Görsel yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const experimentData = {
        ...formData,
        createdAt: experiment?.createdAt || new Date(),
      };

      if (experiment) {
        await updateExperiment(experiment.id, experimentData);
      } else {
        await createExperiment(experimentData);
      }
      onClose();
    } catch (err) {
      setError('Deney kaydedilirken hata oluştu');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {experiment ? 'Deneyi Düzenle' : 'Yeni Deney'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tip
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="featured">Öne Çıkan</option>
              <option value="digital">Dijital Keşif</option>
              <option value="failed">Başarısız Proje</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Öne Çıkan Olarak İşaretle
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {formData.type === 'failed' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Alınan Ders
              </label>
              <textarea
                name="lesson"
                value={formData.lesson}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tarih
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Görsel
            </label>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
            )}
            <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="w-5 h-5 mr-2 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {experiment ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExperimentForm;

