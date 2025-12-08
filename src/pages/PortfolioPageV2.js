import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PortfolioPageV2 = () => {
  const { projects, paftas, loadAllProjects, loadAllPaftas, loading } = useProject();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if(loadAllProjects) loadAllProjects();
    if(loadAllPaftas) loadAllPaftas();
  }, [loadAllProjects, loadAllPaftas]);

  const allItems = useMemo(() => {
    const combined = [];
    if (projects) combined.push(...projects.map(p => ({ ...p, type: 'project' })));
    if (paftas) combined.push(...paftas.map(p => ({ ...p, type: 'pafta' })));
    return combined;
  }, [projects, paftas]);

  const tags = useMemo(() => {
    const allTags = new Set(['All']);
    allItems.forEach(item => {
      item.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') {
      return allItems;
    }
    return allItems.filter(item => item.tags?.includes(activeFilter));
  }, [allItems, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Yükleniyor..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Header Section */}
      <section className="relative px-6 py-24 md:py-32 max-w-[1600px] mx-auto">
        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight mb-6">
            Selected Works
          </h1>
          <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
            A curated collection of architectural designs, digital experiments, and code explorations.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mt-16 flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                activeFilter === tag
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Masonry Grid */}
      <section className="px-6 pb-24 max-w-[1600px] mx-auto">
        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredItems.map((item, index) => (
            <Link
              to={item.type === 'project' ? `/project/${item.id}` : `/pafta/${item.qrCodeData}`}
              key={item.id}
              className="group block break-inside-avoid relative mb-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                  initial={{ opacity: 0, scale: 1.05 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="aspect-w-16 aspect-h-9 md:aspect-auto"
                >
                  <img
                    src={item.images?.[0] || '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>

                {/* Overlay on Desktop / Caption on Mobile */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <span className="text-white/60 text-sm font-mono mb-2 tracking-wider uppercase">
                    {item.tags?.[0] || 'Portfolio'}
                  </span>
                  <h3 className="text-white text-2xl font-serif font-medium mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2 font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Mobile-only text (visible only on small screens if we wanted, but keeping it simple for now)
                  Actually, let's keep the overlay for all sizes for a clean look,
                  or maybe show text below on mobile?
                  Let's stick to overlay for a "Gallery" feel as intended.
              */}
            </Link>
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
            <div className="text-center py-20">
                <p className="text-neutral-500 text-lg">Bu kategoride henüz proje bulunmuyor.</p>
            </div>
        )}
      </section>
    </main>
  );
};

export default PortfolioPageV2;
