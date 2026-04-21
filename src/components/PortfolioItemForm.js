import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from './LoadingSpinner';

const inputClass = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40';

const PortfolioItemForm = ({ item, onClose }) => {
  const { createPortfolioItem, updatePortfolioItem } = useProject();
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
    image: '',
    techStack: [],
    link: '',
    linkText: 'Detayi Ac',
    websiteUrl: '',
    websiteLabel: 'Website',
    githubUrl: '',
    changelogEntries: [],
    order: 0,
    status: 'active',
    accountDeletionEnabled: false
  });

  useEffect(() => {
    if (!item) return;
    setFormData((prev) => ({ ...prev, ...item, changelogEntries: item.changelogEntries || [] }));
  }, [item]);

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await FileService.uploadImage(file, 'portfolio');
      setFormData((prev) => (
        prev.kind === 'application'
          ? { ...prev, image: url }
          : { ...prev, images: [...prev.images, url] }
      ));
    } finally {
      setUploading(false);
    }
  };

  const addTechnology = () => {
    const value = newTech.trim();
    if (!value) return;
    if (formData.kind === 'application') setField('techStack', [...formData.techStack, { name: value, color: 'bg-blue-500' }]);
    else setField('technologies', [...formData.technologies, value]);
    setNewTech('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item?.source === 'admin') await updatePortfolioItem(item.id, formData);
      else await createPortfolioItem(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const tags = formData.kind === 'application' ? formData.techStack.map((item) => item.name) : formData.technologies;

  return (
    <motion.div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 text-slate-100" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-5 backdrop-blur">
          <h2 className="text-2xl font-semibold">{item ? 'Icerik Duzenle' : 'Yeni Portfolyo Icerigi'}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.title} onChange={(e) => setField('title', e.target.value)} placeholder="Baslik" required />
            <select className={inputClass} value={formData.kind} onChange={(e) => setField('kind', e.target.value)}>
              <option value="project">Proje</option>
              <option value="application">Uygulama</option>
            </select>
          </div>

          <textarea className={inputClass} rows={4} value={formData.description} onChange={(e) => setField('description', e.target.value)} placeholder="Aciklama" required />

          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.websiteUrl || ''} onChange={(e) => setField('websiteUrl', e.target.value)} placeholder="Website URL" />
            <input className={inputClass} value={formData.githubUrl || ''} onChange={(e) => setField('githubUrl', e.target.value)} placeholder="GitHub repo URL" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.link || ''} onChange={(e) => setField('link', e.target.value)} placeholder="Birincil baglanti URL" />
            <input className={inputClass} value={formData.linkText || ''} onChange={(e) => setField('linkText', e.target.value)} placeholder="Birincil baglanti metni" />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <input className={inputClass} value={formData.year || ''} onChange={(e) => setField('year', e.target.value)} placeholder="Yil" />
            <input className={inputClass} value={formData.location || ''} onChange={(e) => setField('location', e.target.value)} placeholder="Konum" />
            <input className={inputClass} value={formData.version || ''} onChange={(e) => setField('version', e.target.value)} placeholder="Versiyon" />
            <input className={inputClass} type="number" value={formData.order || 0} onChange={(e) => setField('order', Number(e.target.value))} placeholder="Siralama" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gorseller</h3>
              <label htmlFor="portfolio-item-image" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
                <Upload className="w-4 h-4" />
                {uploading ? 'Yukleniyor...' : 'Gorsel Yukle'}
              </label>
              <input id="portfolio-item-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(formData.kind === 'application' ? [formData.image].filter(Boolean) : formData.images).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${formData.title}-${index}`} className="h-28 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-3 flex gap-2">
              <input className={inputClass} value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="Teknoloji" />
              <button type="button" onClick={addTechnology} className="rounded-xl border border-slate-700 px-4 text-slate-200"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="rounded-full bg-slate-800 px-3 py-1 text-sm">{tag}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manual Changelog</h3>
              <button type="button" onClick={() => setField('changelogEntries', [...(formData.changelogEntries || []), { version: '', date: '', title: '', description: '' }])} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm">
                <Plus className="w-4 h-4" />
                Not Ekle
              </button>
            </div>
            <div className="space-y-4">
              {(formData.changelogEntries || []).map((entry, index) => (
                <div key={`${entry.version}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="mb-3 grid gap-3 md:grid-cols-3">
                    <input className={inputClass} value={entry.version || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, version: e.target.value } : item))} placeholder="Versiyon" />
                    <input className={inputClass} value={entry.date || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, date: e.target.value } : item))} placeholder="Tarih" />
                    <input className={inputClass} value={entry.title || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} placeholder="Baslik" />
                  </div>
                  <textarea className={inputClass} rows={3} value={entry.description || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item))} placeholder="Notlar" />
                </div>
              ))}
            </div>
          </div>

          {formData.kind === 'application' && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.accountDeletionEnabled} onChange={(e) => setField('accountDeletionEnabled', e.target.checked)} />
              Hesap silme sayfasinda goster
            </label>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Iptal</button>
            <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-white">
              {loading ? <LoadingSpinner size="small" text="" /> : 'Kaydet'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioItemForm;
