import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Hexagon } from 'lucide-react';

const ExperimentsPage = () => {
  const { experiments, loadExperiments, loading } = useProject();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (experiments.length === 0) {
      loadExperiments();
    }
  }, [experiments.length, loadExperiments]);

  const filteredItems = filter === 'All'
    ? experiments
    : experiments.filter(item => item.category === filter);

  // Kategorileri experiments'tan çıkar
  const categories = ['All', ...new Set(experiments.map(e => e.category).filter(Boolean))];

  if (loading && experiments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Deneyler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col pt-20">

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <main className="flex-1 h-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
          {/* Page Title Section */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h5 className="text-primary font-mono text-sm tracking-wider mb-2">LABORATORY / 001</h5>
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                  Experimental<br/>
                  <span className="text-slate-500">Studies</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-light leading-relaxed">
                  Standart mimari tipolojilere meydan okuyan parametrik hatalar, malzeme testleri ve kavramsal formların küratörlü bir koleksiyonu.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 md:justify-end">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full border text-xs font-medium uppercase tracking-wide transition-all ${
                      filter === cat
                        ? 'bg-primary border-primary text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-500 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Boş veri durumu */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 text-lg">Henüz deney bulunmuyor.</p>
              <Link to="/admin" className="text-primary hover:underline mt-2 inline-block">Admin panelinden deney ekleyebilirsiniz.</Link>
            </div>
          ) : (
            /* Masonry Gallery */
            <div className="masonry-grid">
              {filteredItems.map((item, index) => {
                const Icon = item.icon || Hexagon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="masonry-item group relative bg-white dark:bg-surface-dark rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-slate-200 dark:border-slate-800"
                  >
                    <div className={`relative overflow-hidden ${item.type === 'square' ? 'aspect-square' : ''}`}>
                      <img
                        alt={item.title}
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500 ease-out grayscale-[20%] group-hover:grayscale-0"
                        src={item.image || item.imageUrl || '/placeholder.jpg'}
                      />

                      {item.type === 'square' && (
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full">
                          <Icon className="text-white w-4 h-4 block" />
                        </div>
                      )}

                      {/* Overlay Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-primary font-mono text-xs mb-1">{item.code || `EXP-0${index}`}</span>
                        <h3 className="text-white text-xl font-medium mb-1">{item.title}</h3>
                        <p className="text-slate-300 text-sm font-light line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="h-1 w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer / Terminal Style (Page Specific Footer element) */}
          <div className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>System Status: Online</span>
            </div>
            <div className="flex gap-6">
              <a className="hover:text-primary transition-colors" href="#">&gt; Instagram</a>
              <a className="hover:text-primary transition-colors" href="#">&gt; LinkedIn</a>
              <a className="hover:text-primary transition-colors" href="#">&gt; GitHub</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperimentsPage;
