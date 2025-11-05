import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tag, Search } from 'lucide-react';

// You might need to create this new component
// import PortfolioCard from '../components/PortfolioCard'; 

const PortfolioPage = () => {
  const { projects, paftas, loadAllProjects, loadAllPaftas, loading } = useProject();
  const [activeFilter, setActiveFilter] = useState('All');
  
  useEffect(() => {
    // These functions might need to be created in ProjectContext
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
        <LoadingSpinner text="Portfolyo yükleniyor..." />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-10 md:gap-16 py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="flex flex-col gap-3 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-black dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">Uygulamalar & Kod</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal max-w-2xl mx-auto">Mimari, tasarım ve teknolojinin kesişim noktasını kod aracılığıyla keşfetmek.</p>
      </motion.div>

      <motion.div 
        className="flex gap-3 flex-wrap justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {tags.map(tag => (
          <button 
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors ${
              activeFilter === tag 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20'
            }`}
          >
            <p className="text-sm font-medium leading-normal">{tag}</p>
          </button>
        ))}
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredItems.map(item => (
          // Replace with the actual PortfolioCard component later
          <Link to={item.type === 'project' ? `/project/${item.id}` : `/pafta/${item.qrCodeData}`} key={item.id} className="block">
            <div className="flex flex-col gap-4 bg-white dark:bg-background-dark border border-gray-200/80 dark:border-white/10 rounded-xl p-4 transition-all hover:shadow-lg hover:dark:border-white/20">
                <div 
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                    style={{ backgroundImage: `url("${item.images?.[0] || '/placeholder.jpg'}")`}}
                ></div>
                <div className="flex flex-col gap-3">
                    <p className="text-black dark:text-white text-lg font-bold">{item.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                    <div className="flex gap-2 flex-wrap">
                        {item.tags?.map(tag => (
                            <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </main>
  );
};

export default PortfolioPage;
