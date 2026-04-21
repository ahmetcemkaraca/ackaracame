import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from './LoadingSpinner';

const inputClass = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40';

const ApplicationForm = ({ application, onClose }) => {
  const { createApplication, updateApplication } = useProject();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    version: '',
    type: '',
    iconName: 'Monitor',
    image: '',
    description: '',
    techStack: [],
    link: '',
    linkText: 'Uygulamayi Ac',
    websiteUrl: '',
    websiteLabel: 'Website',
    githubUrl: '',
    order: 0,
    status: 'active',
    accountDeletionEnabled: false,
    changelogEntries: []
  });

  useEffect(() => {
    if (!application) return;
    setFormData((prev) => ({ ...prev, ...application, changelogEntries: application.changelogEntries || [] }));
  }, [application]);

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await FileService.uploadImage(file, 'applications');
      setField('image', url);
    } finally {
      setUploading(false);
    }
  };

  const addTechnology = () => {
    const name = newTechName.trim();
    if (!name) return;
    setField('techStack', [...formData.techStack, { name, color: 'bg-blue-500' }]);
    setNewTechName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (application?.source === 'admin') await updateApplication(application.id, formData);
      else await createApplication(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-5 backdrop-blur">
          <h2 className="text-2xl font-semibold">{application ? 'Uygulama Duzenle' : 'Yeni Uygulama'}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.title} onChange={(e) => setField('title', e.target.value)} placeholder="Uygulama basligi" required />
            <input className={inputClass} value={formData.version} onChange={(e) => setField('version', e.target.value)} placeholder="Versiyon" required />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input className={inputClass} value={formData.type} onChange={(e) => setField('type', e.target.value)} placeholder="Platform / Tur" required />
            <input className={inputClass} value={formData.iconName} onChange={(e) => setField('iconName', e.target.value)} placeholder="Lucide ikon adi" />
            <input className={inputClass} type="number" value={formData.order || 0} onChange={(e) => setField('order', Number(e.target.value))} placeholder="Siralama" />
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

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kapak Gorseli</h3>
              <label htmlFor="application-image" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
                <Upload className="w-4 h-4" />
                {uploading ? 'Yukleniyor...' : 'Gorsel Yukle'}
              </label>
              <input id="application-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {formData.image && <img src={formData.image} alt={formData.title} className="h-40 w-full rounded-xl object-cover" />}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h3 className="mb-4 text-lg font-semibold">Teknoloji Yigini</h3>
            <div className="mb-3 flex gap-2">
              <input className={inputClass} value={newTechName} onChange={(e) => setNewTechName(e.target.value)} placeholder="Teknoloji" />
              <button type="button" onClick={addTechnology} className="rounded-xl border border-slate-700 px-4 text-slate-200"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech, index) => (
                <span key={`${tech.name}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {tech.name}
                  <button type="button" onClick={() => setField('techStack', formData.techStack.filter((_, techIndex) => techIndex !== index))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Changelog</h3>
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
                    <div className="flex gap-2">
                      <input className={inputClass} value={entry.title || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))} placeholder="Baslik" />
                      <button type="button" onClick={() => setField('changelogEntries', formData.changelogEntries.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-red-500/40 px-3 text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <textarea className={inputClass} rows={3} value={entry.description || ''} onChange={(e) => setField('changelogEntries', formData.changelogEntries.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item))} placeholder="Degisiklik notu" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={formData.accountDeletionEnabled} onChange={(e) => setField('accountDeletionEnabled', e.target.checked)} />
              Hesap silme sayfasinda goster
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={formData.status === 'active'} onChange={(e) => setField('status', e.target.checked ? 'active' : 'archived')} />
              Aktif
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Iptal</button>
            <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-white">
              {loading ? <LoadingSpinner size="small" text="" /> : (application ? 'Guncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ApplicationForm;
