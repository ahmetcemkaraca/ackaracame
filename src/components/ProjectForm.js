import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { FileService } from '../firebase/services';
import LoadingSpinner from './LoadingSpinner';

const emptyEntry = { version: '', date: '', title: '', description: '' };

const inputClass = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40';

const ProjectForm = ({ project, onClose }) => {
  const { createProject, updateProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mimari',
    images: [],
    technologies: [],
    year: new Date().getFullYear().toString(),
    semester: '',
    featured: false,
    order: 0,
    status: 'active',
    location: 'Antalya, TR',
    websiteUrl: '',
    websiteLabel: 'Website',
    githubUrl: '',
    changelogEntries: []
  });

  useEffect(() => {
    if (!project) return;
    setFormData((prev) => ({
      ...prev,
      ...project,
      changelogEntries: project.changelogEntries || []
    }));
  }, [project]);

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((file) => FileService.uploadImage(file, 'projects')));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } finally {
      setUploading(false);
    }
  };

  const addTechnology = () => {
    const tech = newTech.trim();
    if (!tech || formData.technologies.includes(tech)) return;
    setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, tech] }));
    setNewTech('');
  };

  const updateEntry = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      changelogEntries: prev.changelogEntries.map((entry, entryIndex) => (
        entryIndex === index ? { ...entry, [field]: value } : entry
      ))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        changelogEntries: formData.changelogEntries.filter((entry) => entry.title || entry.description || entry.version)
      };
      if (project?.source === 'admin') {
        await updateProject(project.id, payload);
      } else {
        await createProject(payload);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-5 backdrop-blur">
          <h2 className="text-2xl font-semibold">{project ? 'Proje Duzenle' : 'Yeni Proje'}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.title} onChange={(e) => setField('title', e.target.value)} placeholder="Proje basligi" required />
            <select className={inputClass} value={formData.category} onChange={(e) => setField('category', e.target.value)}>
              <option value="mimari">Mimari</option>
              <option value="yazilim">Yazilim</option>
            </select>
          </div>

          <textarea className={inputClass} rows={4} value={formData.description} onChange={(e) => setField('description', e.target.value)} placeholder="Aciklama" required />

          <div className="grid gap-4 md:grid-cols-2">
            <input className={inputClass} value={formData.websiteUrl || ''} onChange={(e) => setField('websiteUrl', e.target.value)} placeholder="Website URL" />
            <input className={inputClass} value={formData.githubUrl || ''} onChange={(e) => setField('githubUrl', e.target.value)} placeholder="GitHub repo URL" />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <input className={inputClass} value={formData.websiteLabel || ''} onChange={(e) => setField('websiteLabel', e.target.value)} placeholder="Website etiketi" />
            <input className={inputClass} value={formData.location || ''} onChange={(e) => setField('location', e.target.value)} placeholder="Konum" />
            <input className={inputClass} value={formData.year} onChange={(e) => setField('year', e.target.value)} placeholder="Yil" />
            <input className={inputClass} type="number" value={formData.order} onChange={(e) => setField('order', Number(e.target.value))} placeholder="Siralama" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gorseller</h3>
                <p className="text-sm text-slate-400">Koyu modda okunabilir form ve kart gorunumu burada da korunuyor.</p>
              </div>
              <label htmlFor="project-images" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
                <Upload className="w-4 h-4" />
                {uploading ? 'Yukleniyor...' : 'Gorsel Yukle'}
              </label>
              <input id="project-images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {formData.images.map((image, index) => (
                <div key={image} className="relative overflow-hidden rounded-xl border border-slate-800">
                  <img src={image} alt={`project-${index}`} className="h-28 w-full object-cover" />
                  <button type="button" onClick={() => setField('images', formData.images.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h3 className="mb-4 text-lg font-semibold">Teknolojiler</h3>
            <div className="mb-3 flex gap-2">
              <input className={inputClass} value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="Teknoloji adi" />
              <button type="button" onClick={addTechnology} className="rounded-xl border border-slate-700 px-4 text-slate-200 hover:bg-slate-800">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <span key={tech} className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {tech}
                  <button type="button" onClick={() => setField('technologies', formData.technologies.filter((_, techIndex) => techIndex !== index))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Changelog / Patch Notes</h3>
                <p className="text-sm text-slate-400">Manuel release notlari burada tutulur. GitHub verisi ayrica changelog sayfasinda cekilir.</p>
              </div>
              <button type="button" onClick={() => setField('changelogEntries', [...formData.changelogEntries, { ...emptyEntry }])} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm">
                <Plus className="w-4 h-4" />
                Not Ekle
              </button>
            </div>

            <div className="space-y-4">
              {formData.changelogEntries.map((entry, index) => (
                <div key={`${entry.version}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="mb-3 grid gap-3 md:grid-cols-3">
                    <input className={inputClass} value={entry.version} onChange={(e) => updateEntry(index, 'version', e.target.value)} placeholder="Versiyon" />
                    <input className={inputClass} value={entry.date} onChange={(e) => updateEntry(index, 'date', e.target.value)} placeholder="Tarih" />
                    <div className="flex gap-2">
                      <input className={inputClass} value={entry.title} onChange={(e) => updateEntry(index, 'title', e.target.value)} placeholder="Baslik" />
                      <button type="button" onClick={() => setField('changelogEntries', formData.changelogEntries.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-red-500/40 px-3 text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea className={inputClass} rows={3} value={entry.description} onChange={(e) => updateEntry(index, 'description', e.target.value)} placeholder="Neler degisti?" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setField('featured', e.target.checked)} />
              One cikan proje
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={formData.status === 'active'} onChange={(e) => setField('status', e.target.checked ? 'active' : 'archived')} />
              Aktif
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300">Iptal</button>
            <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-white">
              {loading ? <LoadingSpinner size="small" text="" /> : (project ? 'Guncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProjectForm;
