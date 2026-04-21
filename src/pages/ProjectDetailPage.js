import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Github, Globe, Grid, History, MapPin } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSafeHttpUrl, getSafeGitHubRepoUrl } from '../utils/urlSafety';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { currentPortfolioItem, loadPortfolioItem, loading } = useProject();

  useEffect(() => {
    if (id) loadPortfolioItem(id);
  }, [id, loadPortfolioItem]);

  if (loading || !currentPortfolioItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Icerik yukleniyor..." />
      </div>
    );
  }

  const item = currentPortfolioItem;
  const images = item.images || (item.image ? [item.image] : []);
  const technologies = item.technologies || item.techStack?.map((tech) => tech.name) || [];
  const isApplication = item.kind === 'application';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 pt-20">
      <header className="relative min-h-[56vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={images[0] || 'https://placehold.co/1920x1080'} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-primary/15 text-primary border border-primary/30">
                {isApplication ? 'Uygulama' : 'Proje'}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.year || item.version || 'Guncel'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">{item.title}</h1>
            <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">{item.description}</p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">Bilgiler</p>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Kategori</p>
                    <p className="font-medium text-slate-900 dark:text-white">{item.category || item.type || 'Portfolio'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Konum</p>
                    <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {item.location || 'Antalya, TR'}
                    </p>
                  </div>
                  {item.websiteUrl && (
                    <div>
                      <p className="text-slate-500">Website</p>
                      <a href={getSafeHttpUrl(item.websiteUrl)} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline inline-flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        {item.websiteLabel || 'Website'}
                      </a>
                    </div>
                  )}
                  {item.githubUrl && (
                    <div>
                      <p className="text-slate-500">GitHub Repo</p>
                      <a href={getSafeGitHubRepoUrl(item.githubUrl)} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline inline-flex items-center gap-2">
                        <Github className="w-3.5 h-3.5" />
                        Repo baglantisi
                      </a>
                    </div>
                  )}
                  {item.link && (
                    <div>
                      <p className="text-slate-500">Birincil baglanti</p>
                      <a href={getSafeHttpUrl(item.link)} target={getSafeHttpUrl(item.link) ? '_blank' : '_self'} rel="noreferrer" className="font-medium text-primary hover:underline">
                        {item.linkText || 'Incele'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <Link to={`/portfolio/${item.id}/changelog`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                <History className="w-4 h-4" />
                Release notes / changelog
              </Link>
              <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Portfolyoya don
              </Link>
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-10">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Genel Bakis</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.slice(1).map((img, index) => (
                  <div key={index} className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={img} alt={`${item.title} ${index + 2}`} className="w-full h-72 object-cover" />
                  </div>
                ))}
              </div>
            )}

            {technologies.length > 0 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 md:p-8">
                <h2 className="text-2xl font-semibold mb-4">Teknolojiler</h2>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {item.link && (
                <a href={getSafeHttpUrl(item.link)} target={getSafeHttpUrl(item.link) ? '_blank' : '_self'} rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20 hover:opacity-95">
                  {item.linkText || 'Baglantiyi Ac'}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              <Link to={`/portfolio/${item.id}/changelog`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-colors">
                <History className="w-4 h-4" />
                Changelog
              </Link>
              <Link to="/portfolio" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-colors">
                <Grid className="w-4 h-4" />
                Tum Portfolyo
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
