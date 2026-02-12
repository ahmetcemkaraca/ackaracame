import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Download, Grid, MapPin } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { currentProject, loadProject, loading } = useProject();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Proje yükleniyor..." />
      </div>
    );
  }

  const {
    title,
    description,
    images = [],
    category,
    year,
    location,
    technologies = []
  } = currentProject;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

      {/* Hero Section */}
      <header className="relative w-full h-[60vh] min-h-[400px] flex items-end pb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt={title}
            className="w-full h-full object-cover"
            src={images[0] || "https://placehold.co/1920x1080"}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 rounded">{year || '2023'}</span>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{category || 'Academic'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light text-white tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed line-clamp-2">
              {description}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sticky Sidebar / Navigation (Left Column on Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-8">
              <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">İçerik</h3>
                <a href="#metadata" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Proje Verileri</a>
                <a href="#concept" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Konsept</a>
                <a href="#gallery" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Galeri</a>
              </div>

              <div className="pt-8">
                <button className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wide text-slate-500 hover:text-primary transition-colors group">
                  <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  <span>PDF Özeti İndir</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area (Right Column on Desktop) */}
          <div className="lg:col-span-9 space-y-24">

            {/* Metadata Grid */}
            <section id="metadata" className="border-y border-slate-200 dark:border-slate-800 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Konum</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {location || 'Antalya, TR'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Tip</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{category || 'Project'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Yıl</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{year || '2023'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Araçlar</h4>
                  <div className="flex flex-wrap gap-2">
                    {technologies.length > 0 ? technologies.map(tech => (
                        <span key={tech} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">{tech}</span>
                    )) : (
                        <>
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">Revit</span>
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">Lumion</span>
                        </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Concept Section */}
            <section id="concept" className="scroll-mt-32">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="md:w-1/2">
                  <h2 className="text-3xl font-light text-slate-900 dark:text-white mb-6">Konsept</h2>
                  <div className="prose prose-slate dark:prose-invert">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-light">
                      {description}
                    </p>
                  </div>
                </div>
                {images.length > 1 && (
                    <div className="md:w-1/2 grid gap-4">
                        <div className="group relative overflow-hidden rounded-lg">
                            <img alt="Detail 1" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700" src={images[1]} />
                        </div>
                    </div>
                )}
              </div>
            </section>

            {/* Gallery Section */}
            {images.length > 2 && (
                <section id="gallery" className="scroll-mt-32">
                    <div className="flex items-end justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <h2 className="text-3xl font-light text-slate-900 dark:text-white">Proje Galerisi</h2>
                        <span className="font-mono text-xs uppercase text-slate-500">Görseller</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {images.slice(2).map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/30 cursor-pointer h-80">
                                <img alt={`Project view ${idx}`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" src={img} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Navigation Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-16 flex justify-between items-center">
              <Link to="/portfolio" className="group flex flex-col items-start text-left">
                <span className="text-xs font-mono uppercase text-slate-500 mb-1 group-hover:text-primary transition-colors">Portfolyoya Dön</span>
                <span className="text-lg md:text-xl font-medium text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Tüm Projeler
                </span>
              </Link>

              <Link to="/portfolio" className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-all">
                <Grid className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
