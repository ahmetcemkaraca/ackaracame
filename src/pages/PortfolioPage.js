import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PortfolioPage = () => {
  const { projects, paftas, loadFeaturedProjects, loadPaftas, loading } = useProject();
  const [activeFilter, setActiveFilter] = useState('All');
  
  useEffect(() => {
    // Assuming these fetch functions exist in context based on previous file content
    if(loadFeaturedProjects) loadFeaturedProjects();
    if(loadPaftas) loadPaftas();
  }, [loadFeaturedProjects, loadPaftas]);
  
  // Flatten and combine data
  const allItems = useMemo(() => {
    const combined = [];
    if (projects) combined.push(...projects.map(p => ({ ...p, type: 'project', category: p.category || 'Architecture' })));
    if (paftas) combined.push(...paftas.map(p => ({ ...p, type: 'pafta', category: 'Academic' })));

    // Add mock items if empty for visualization (as per "Design Reference Syntax" request)
    if (combined.length === 0 && !loading) {
       return [
           { id: 'm1', title: 'Vertex Tower', category: 'Urban Design', location: 'Chicago', year: '2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx_T6DLhUnqbS-vbteDlzViLnK2qpehEFKzSydKxDrsS9czU6Xjfx1w5eJigHi2LmuLi-UHCSQK_JTT4K2M6R6YUIoItY2rU9-I9CNJFCoks7LxfY_L9FzhfpB_aSd6Xd5tOyVnRjJAbZrUjGZ8qZ_EcmH8efOCaXZU8XKPrNRMazSgufr9XjnOuPc7my-FylMmW3AUckEJnhpRKfvWruaVy37n8h-DNm2tnlZJqG5ekjQY9JP2U_4U1xb0bL9DN2mYVlV9YxAqKE' },
           { id: 'm2', title: 'The Nordic House', category: 'Residential', location: 'Copenhagen', year: '2022', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNuR_J8r941jnuUf8xSAgVirAEWwlPLX9ujiBgyYOl72bNLAuyCUCalru8d26vveMxZnFeH329AVcP-3Vi5UcgA8o5ZHvp7icNmesrVLS3Oliu1A5Z-quqKoLx_1aCaJs_PVxFVVIM7azvgruritLTOradCG_qDbaLCZEfZaCyS_KGalI2uVrPcQLRgYbH9TeJJBy9f0_5dbw85cF-8gVr0sW3baQzDYGyrtzo7XvQm8O2JzdkJ9ywj23DtWAwqAgD4XKVpejyixg' },
           { id: 'm3', title: 'Concrete Void', category: 'Interior', location: 'Tokyo', year: '2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT251oIkEgvgX-Lu8UkweLyREnx7p-gqkuqsPWuhhtH2wc4R5fWBs99UMD4T6Lmwq7_rPgbonrUuO825K4FRCGOD55sRxnROa8wQjs1HKoIhkYF6O4y6AsVMLHcAxURtGD_UgybHAlcx3UHMb7ibwYyjCsLYFt4lhCFpTQ44XGdOl-LUmd8SUcSsZdUgpzEIzC0K6QjnZCPt9d9KHW_rllbBLD7UwRj97usvCRKZxgQfiHtVAUsI54siiUfXpkuG3xFBPwOWbf0Wg' },
           { id: 'm4', title: 'Museum of Flow', category: 'Competition', location: 'Concept', year: '2024', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkWuG11ytXmP3yox3R7LUXuv468NL-konTIrIUt0mNAskQILbX4WCf6HWRmskvWwxYTJffg_xG99_YoxCGBmssXCFPX2n_FLeiJ6_KLMGJbJSaDWSboRLJGfmy-cWK9K5QT6rKVDlyo4lzxxNHbA4ZCcFoFLLntNz8mN7Ud-BP7JEvoUQLI518AuAfaAakLEVR_Luy0iaAu39JeHHADVJ_WU1z_b6Gtk5LBAL0u5PmyOEHC6p0DY8FkBUU51Y7Hm1u7D1yTRwQ4cQ' },
           { id: 'm5', title: 'Apex Headquarters', category: 'Commercial', location: 'Seattle', year: '2021', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH23zekupW2tBWEz4Y_nPbt8i45-N25WcxaOqxsVmjnCvh-FiYcktUe7bpfOog4Yte8U9vYH5xQRR7g6ufWxgBUjbYmD3oN146Tb9vMZiBQOwChn2Xb9cyRcJhaJdvkfYZ1vON0hj4Bs3PhJ7o06TKvXicB8xsIjxpIZQ8P3vK2rFytH-xUBw3h9BCrJKCGL8WsapCvKJdygUrJ0o92I-mVBQ8W2U2vYYCwZrdFMciAthLExMFIQmctHN-hVjbWeaYEvQWpVcTtVs' }
       ];
    }
    return combined;
  }, [projects, paftas, loading]);

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    allItems.forEach(item => {
      if(item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return allItems;
    return allItems.filter(item => item.category === activeFilter);
  }, [allItems, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Portfolyo yükleniyor..." />
      </div>
    );
  }

  return (
    <main className="flex-grow pt-24 pb-12 px-6 min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="py-12 md:py-20 mb-8 border-b border-gray-200 dark:border-slate-800">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-light leading-tight text-slate-900 dark:text-white mb-6"
          >
            İnsan deneyimi için <br className="hidden md:block"/>
            <span className="text-primary font-normal">mekanlar tasarlamak.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            Sürdürülebilir kentsel gelişim, yeniden işlevlendirme ve minimal konut tipolojilerine odaklanan mimari keşifler koleksiyonu.
          </motion.p>
        </section>

        {/* Filter Bar */}
        <motion.div
          className="flex flex-wrap gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark ${
                activeFilter === category
                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover'
                : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="masonry-item group relative overflow-hidden rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-800"
            >
              <Link to={item.type === 'project' ? `/project/${item.id}` : `/pafta/${item.qrCodeData || 'mock'}`}>
                <img
                  alt={item.title}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  src={item.image || item.images?.[0] || 'https://placehold.co/600x800'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-primary text-xs font-bold tracking-wider uppercase mb-1">{item.category}</span>
                  <h3 className="text-white text-xl font-medium mb-1">{item.title}</h3>
                  <p className="text-gray-300 text-sm font-light">
                    {item.year || '2023'} • {item.location || 'Location'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-16 flex justify-center">
          <button className="group flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
            <span className="uppercase tracking-widest text-sm font-medium">Daha Fazla Yükle</span>
            <span className="material-icons text-lg group-hover:translate-y-1 transition-transform">expand_more</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default PortfolioPage;
