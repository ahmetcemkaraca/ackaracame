import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';

const PortfolioItemForm = ({ item, onClose }) => {
  const { createPortfolioItem } = useProject();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [formData, setFormData] = useState({
    kind: 'project',
    title: '',
    description: '',
    category: 'yazilim',
    year: new Date().getFullYear().toString(),
    location: 'Antalya, TR',
    images: [],
    technologies: [],
    version: '',
    type: '',
    iconName: 'Monitor',
    image: '',
    techStack: [],
    link: '',
    linkText: '',
    order: 0,
    status: 'active'
  });

  useEffect(() => {
    if (item) setFormData((prev) => ({ ...prev, ...item }));
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await FileService.uploadImage(file, 'portfolio');
      setFormData((prev) => (prev.kind === 'application' ? { ...prev, image: url } : { ...prev, images: [...prev.images, url] }));
    } finally {
      setUploading(false);
    }
  };

  const addTechnology = () => {
    if (!newTech.trim()) return;
    if (formData.kind === 'application') {
      setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, { name: newTech.trim(), color: 'bg-blue-500' }] }));
    } else {
      setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, newTech.trim()] }));
    }
    setNewTech('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPortfolioItem(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{item ? 'İçerik Düzenle' : 'Yeni Portfolyo İçeği'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Başlık" className="input-field" required />
            <select name="kind" value={formData.kind} onChange={handleInputChange} className="input-field">
              <option value="project">Proje</option>
              <option value="application">Uygulama</option>
            </select>
          </div>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Açıklama" className="input-field" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="link" value={formData.link} onChange={handleInputChange} placeholder="Bağlantı" className="input-field" />
            <input name="linkText" value={formData.linkText} onChange={handleInputChange} placeholder="Bağlantı Metni" className="input-field" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="year" value={formData.year} onChange={handleInputChange} placeholder="Yıl" className="input-field" />
            <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Konum" className="input-field" />
            <input name="order" type="number" value={formData.order} onChange={handleInputChange} placeholder="Sıra" className="input-field" />
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="portfolio-image-upload" />
            <label htmlFor="portfolio-image-upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white cursor-pointer">
              <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
            </label>
          </div>
          <div className="flex gap-2">
            <input value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="Teknoloji" className="input-field flex-1" />
            <button type="button" onClick={addTechnology} className="px-4 py-2 rounded-lg border"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">İptal</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white">{loading ? <LoadingSpinner size="small" text="" /> : 'Kaydet'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioItemForm;
