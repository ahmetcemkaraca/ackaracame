import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowRight, School, GraduationCap } from 'lucide-react';

const SemesterProjectsPage = () => {
  const { paftas, loadPaftas, loading } = useProject();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (paftas.length === 0) {
      loadPaftas();
    }
  }, [paftas, loadPaftas]);

  // Paftaları yıllara göre grupla
  const projectGroups = paftas.reduce((acc, pafta) => {
    const yearKey = `Year ${pafta.year || '?'}`;
    if (!acc[yearKey]) acc[yearKey] = [];
    acc[yearKey].push(pafta);
    return acc;
  }, {});

  const sections = Object.keys(projectGroups).sort().reverse();

  if (loading && paftas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Projeler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-lexend min-h-screen flex flex-col pt-20">

      {/* Header Section */}
      <header className="relative pt-12 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 bg-[radial-gradient(#197fe6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-sm text-primary font-medium mb-4">
              <Link to="/">Home</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span>Academic Work</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Semester Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              5 yıllık Mimarlık Lisans programım boyunca geliştirilen stüdyo çalışmaları, teknik çizimler ve tasarım keşiflerinin kronolojik bir arşivi.
            </p>
          </div>

          {/* Filters */}
          {sections.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-3">
              <button
                  onClick={() => setFilter('All')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105 ${filter === 'All' ? 'bg-primary text-white shadow-primary/25' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                All Projects
              </button>
              {sections.map(year => (
                  <button
                      key={year}
                      onClick={() => setFilter(year)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 ${filter === year ? 'bg-primary text-white shadow-primary/25' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 hover:text-primary'}`}
                  >
                      {year}
                  </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {paftas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 text-lg">Henüz dönem projesi bulunmuyor.</p>
              <Link to="/admin" className="text-primary hover:underline mt-2 inline-block">Admin panelinden proje ekleyebilirsiniz.</Link>
            </div>
          ) : (
            sections.map(year => {
              if (filter !== 'All' && filter !== year) return null;

              return (
                  <section key={year} className="relative">
                      {/* Timeline Connector */}
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden xl:block -ml-8"></div>

                      <div className="flex items-center justify-between mb-10 group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 xl:-ml-[52px] z-10 bg-background-light dark:bg-background-dark">
                                  <span className="font-bold text-sm">Y{year.replace('Year ', '')}</span>
                              </div>
                              <div>
                                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{year}</h2>
                                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Academic Year</p>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {projectGroups[year].map((project) => (
                              <motion.div
                                  key={project.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
                              >
                                  <div className="relative h-64 overflow-hidden">
                                      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
                                          <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700">
                                              {project.category || 'Studio'}
                                          </span>
                                          {project.isGroup && (
                                              <span className="bg-primary/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded text-white border border-primary">
                                                  Group
                                              </span>
                                          )}
                                      </div>
                                      <Link to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}>
                                          <img
                                              alt={project.title}
                                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                              src={project.image || project.images?.[0] || '/placeholder.jpg'}
                                          />
                                      </Link>
                                  </div>
                                  <div className="p-6 flex flex-col flex-grow">
                                      <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                          <span className="flex items-center gap-1">
                                              <School className="w-3 h-3 text-primary" /> {project.code || 'ARC'}
                                          </span>
                                          <span className="flex items-center gap-1">
                                              <GraduationCap className="w-3 h-3" /> {project.instructor || 'Staff'}
                                          </span>
                                      </div>
                                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                          <Link to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}>
                                              {project.title}
                                          </Link>
                                      </h3>
                                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3">
                                          {project.description}
                                      </p>
                                      <Link
                                          to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}
                                          className="inline-flex items-center text-sm font-semibold text-primary hover:text-blue-600 transition-colors"
                                      >
                                          Görüntüle <ArrowRight className="w-4 h-4 ml-1" />
                                      </Link>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </section>
              );
            })
          )}

        </div>
      </main>
    </div>
  );
};

export default SemesterProjectsPage;
