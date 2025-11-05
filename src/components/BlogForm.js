import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { FileService } from '../firebase/services';
import { useProject } from '../context/ProjectContext';

const BlogForm = ({ blogPost, onClose }) => {
  const { createBlogPost, updateBlogPost } = useProject();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Genel',
    imageUrl: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (blogPost) {
      setFormData({
        title: blogPost.title || '',
        description: blogPost.description || '',
        content: blogPost.content || blogPost.description || '',
        category: blogPost.category || 'Genel',
        imageUrl: blogPost.imageUrl || '',
        summary: blogPost.summary || blogPost.description || '',
        date: blogPost.date || (blogPost.createdAt ? new Date(blogPost.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      });
    }
  }, [blogPost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const url = await FileService.uploadImage(file, 'blog');
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
      const blogData = {
        ...formData,
        createdAt: blogPost?.createdAt || new Date(),
      };

      if (blogPost) {
        await updateBlogPost(blogPost.id, blogData);
      } else {
        await createBlogPost(blogData);
      }
      onClose();
    } catch (err) {
      setError('Blog gönderisi kaydedilirken hata oluştu');
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
            {blogPost ? 'Blog Gönderisini Düzenle' : 'Yeni Blog Gönderisi'}
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
              Kategori
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Genel">Genel</option>
              <option value="Mimarlık">Mimarlık</option>
              <option value="Teknoloji">Teknoloji</option>
              <option value="Tasarım">Tasarım</option>
              <option value="Düşünceler">Düşünceler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Özet
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              İçerik *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="10"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

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
              {blogPost ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BlogForm;

