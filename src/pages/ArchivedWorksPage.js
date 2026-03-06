import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ArchivedWorksPage = () => {
  const { projects, loadProjects, loading } = useProject();
  const [filterYear, setFilterYear] = useState('All');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
  }, [projects.length, loadProjects]);

  // Arşivlenmiş projeleri filtrele (eski yıllara ait olanlar)
  const archivedProjects = projects.filter(p => p.isArchived || p.status === 'archived');

  // Yıllara göre grupla
  const archiveData = archivedProjects.reduce((acc, project) => {
    const year = project.year || project.createdAt?.toDate?.()?.getFullYear()?.toString().slice(-2) || '?';
    const yearKey = year;
    if (!acc[yearKey]) {
      acc[yearKey] = {
        year: yearKey,
        title: `${yearKey} Projects`,
        items: []
      };
    }
    acc[yearKey].items.push({
      id: project.id,
      title: project.title,
      type: project.category || 'Project',
      season: project.season || '',
      description: project.description || '',
      tools: project.tools || [],
      image: project.thumbnail || project.images?.[0] || '/placeholder.jpg',
      typeColor: project.typeColor
    });
    return acc;
  }, {});

  const sortedYears = Object.keys(archiveData).sort((a, b) => b - a);
  const archiveDataArray = sortedYears.map(year => archiveData[year]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Arşiv yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col pt-20">

      {/* Main Content */}
      <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <header className="mb-12">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Main Portfolio
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Archived Works</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                A chronological collection of academic exercises, early explorations, and competition entries from 2020 to 2022.
              </p>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors">
                  <span>Year: All</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors">
                  <span>Type: All</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Archive List Container */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-8 md:pl-12 space-y-10">

          {archiveDataArray.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 text-lg">Henüz arşivlenmiş proje bulunmuyor.</p>
              <Link to="/admin" className="text-primary hover:underline mt-2 inline-block">Admin panelinden proje ekleyebilirsiniz.</Link>
            </div>
          ) : (
            archiveDataArray.map((yearGroup, yearIndex) => (
            <div key={yearGroup.year} className={`relative ${yearIndex > 0 ? 'pt-8' : ''} ${yearGroup.opacity || ''}`}>
              <span className={`absolute -left-10 md:-left-[3.75rem] ${yearIndex > 0 ? 'top-8' : 'top-0'} flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-surface-dark border-2 border-white dark:border-background-dark text-xs font-bold text-slate-500`}>
                '{yearGroup.year}
              </span>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 mt-1">{yearGroup.title}</h3>
              <div className="space-y-4">
                {yearGroup.items.map((item) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group relative bg-white dark:bg-surface-dark rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border border-transparent hover:border-primary/30"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Thumbnail */}
                      <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        <img
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                          src={item.image}
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.typeColor || 'text-primary bg-primary/10'}`}>{item.type}</span>
                              <span className="text-xs text-slate-500">{item.season}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h2>
                          </div>
                          <a href="#" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-background-dark text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                          </a>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono">
                          {item.tools.map((tool, i) => (
                            <React.Fragment key={tool}>
                              <span>{tool}</span>
                              {i < item.tools.length - 1 && <span className="w-1 h-1 bg-slate-700 rounded-full"></span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ArchivedWorksPage;
