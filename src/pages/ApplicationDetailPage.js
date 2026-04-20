import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Smartphone, Globe, Monitor, Code, AppWindow } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const IconsMap = {
  Smartphone,
  Globe,
  Monitor,
  Code,
  AppWindow
};

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const { currentApplication, loadApplication, loading } = useProject();

  useEffect(() => {
    if (id) {
      loadApplication(id);
    }
  }, [id, loadApplication]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Uygulama yükleniyor..." />
      </div>
    );
  }

  if (!currentApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Uygulama bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400">İstenen kayıt silinmiş ya da henüz yüklenmemiş olabilir.</p>
          <Link to="/applications" className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors">
            Uygulamalara dön
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    version,
    type,
    iconName,
    image,
    description,
    techStack = [],
    link,
    linkText
  } = currentApplication;

  const Icon = IconsMap[iconName] || AppWindow;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">
      <header className="relative w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0">
          <img
            alt={title}
            className="w-full h-full object-cover opacity-30"
            src={image || 'https://placehold.co/1920x1080'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/85 to-background-light/40 dark:from-background-dark dark:via-background-dark/85 dark:to-background-dark/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-5 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Icon className="w-4 h-4" />
                Application
              </span>
              <span>{type || 'Web App'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>{version || 'v1.0.0'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{type || 'Web App'}</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-8">
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">İçerik</h3>
                <a href="#metadata" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Uygulama Bilgisi</a>
                <a href="#description" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Açıklama</a>
                <a href="#stack" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Teknolojiler</a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-20">
            <section id="metadata" className="border-y border-slate-200 dark:border-slate-800 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Versiyon</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{version || 'v1.0.0'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Tür</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{type || 'Web App'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Bağlantı</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{link || 'Özel bağlantı'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">İkon</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" /> {iconName || 'AppWindow'}
                  </p>
                </div>
              </div>
            </section>

            <section id="description" className="scroll-mt-32">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div>
                  <h2 className="text-3xl font-light text-slate-900 dark:text-white mb-6">Açıklama</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5 dark:shadow-black/20 bg-slate-100 dark:bg-slate-900">
                  <img
                    alt={title}
                    className="w-full h-full object-cover min-h-[320px]"
                    src={image || 'https://placehold.co/1200x900'}
                  />
                </div>
              </div>
            </section>

            <section id="stack" className="scroll-mt-32">
              <div className="flex items-end justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-3xl font-light text-slate-900 dark:text-white">Teknoloji Yığını</h2>
                <span className="font-mono text-xs uppercase text-slate-500">Stack</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {techStack.length > 0 ? techStack.map((tech, index) => (
                  <span key={`${tech.name}-${index}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${tech.color || 'bg-primary'}`}></span>
                    {tech.name}
                  </span>
                )) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Bu uygulama için teknoloji bilgisi henüz eklenmemiş.</p>
                )}
              </div>
            </section>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <Link to="/applications" className="group flex flex-col items-start text-left">
                <span className="text-xs font-mono uppercase text-slate-500 mb-1 group-hover:text-primary transition-colors">Uygulamalara Dön</span>
                <span className="text-lg md:text-xl font-medium text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Tüm Uygulamalar
                </span>
              </Link>

              {link && (
                <a
                  href={link}
                  target={link.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  {linkText || 'Uygulamayı Aç'}
                  <ArrowRight className="w-4 h-4" />
                  {link.startsWith('http') && <ExternalLink className="w-4 h-4" />}
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetailPage;