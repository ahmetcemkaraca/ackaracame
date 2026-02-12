import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Grid, Box, Layers, Zap, Hexagon, Maximize2 } from 'lucide-react';

const ExperimentsPage = () => {
  const { experiments, loadExperiments, loading } = useProject();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (experiments.length === 0) {
      loadExperiments();
    }
  }, [experiments.length, loadExperiments]);

  // Mock data for visual fidelity if no real data
  const mockExperiments = [
    {
      id: '1',
      title: 'Voronoi twist',
      code: 'GH-045',
      description: 'Exploring structural integrity within randomized voronoi cells applied to a twisted vertical axis.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoszk5ZW0hTcY53wxzHxCu9HtaDb91i-kYvymoxHdvepG-H8PmnF8g15DswfA71gVa9ohEhv9SxcAp8CzTyKbsCaYL_i91RVbnfJLQogCCg2_sEy2-1nhVldWMcIBzIj5UdA2ph6-_RuErK_lg9SefCv2XN_p9ehEwKApxr6DYjyY396moMMBHZvqgcimE2AveGZ9AQImqALA68OY35GHHtWJpYzsvubmdFIwXsUG03-CXKhNnmBWxYf5FXTOZsis3JSn-mvV48cw',
      category: 'Parametric',
      type: 'tall'
    },
    {
      id: '2',
      title: 'Concrete Casting',
      code: 'MAT-102',
      description: 'Study of air pockets in rapid-set cement mixtures.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaUOSMt6DYEYwKmXxE2-oIIy8IHwwlrAQkbokR1IyXb7qGtVg2Jxrj9FfdRGrrqUe20wlTVv2xjqR6mMdmZtGdVM5zn0uQHmGAc14BecHwBsv4tROzcMnGwWBrVjS4DQgAUhSr-QNhG-x09Fn2M5ulATtwnOxhvPMkE9XmP3Kb9DgRrZoK0yJn6PSYHSXvAklwj4YAfduhUGgmSN_F7xN6wJ891LlERcOixPCc2jiNUlgDuctfvQAwKPNr38RBfnkNcyehJTh6ytM',
      category: 'Materiality',
      type: 'square',
      icon: Grid
    },
    {
      id: '3',
      title: 'Negative Space',
      code: 'TYP-008',
      description: 'Analyzing void ratios in dense urban housing blocks.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXTHn6vZRml37S2_WdSpYisNTXHt54uqABDcZokzY_fszJ7JXUC5DEFNOwZuyy1sGrVAIag_ZoK2knSoKidGHmtzET6z-LALdG0utSv8KgyNfmI07i_KTz_lvvoZ-Mz6QOP2vJQXZDvMdXTxy0JySGt2RYZYxHp0F66k32K2DrkvJXmlEo5_LegIW-qg6e_2LbNTtWu-UAgpkeIjrNOkFy1TsYYWEqJUUR1woCvh7fwsXWiR_8oR6vDNY8bhe_hfa4PcUILxKsEbbiJG1aqHWntPHiCbDOS5V5YJoYTtuqXLytwZuWBVCg4u-cA',
      category: 'Structural',
      type: 'landscape'
    },
    {
      id: '4',
      title: 'Fluid Dynamics',
      code: 'FLUID-09',
      description: 'Simulating wind erosion on soft stone facades over 100 years.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjdvu-GjfyQzheVRPzuyCWaRWRf2_uhJxVo17vmatWJyCc0GQO0FcZahVSK6wsSicK7RKPcn8t_o_iOiIisR1kk2fONSKZjMr2ziM5WAXog-fB69_Ng16Ldr1uiWW1Oit59P9MPulgFKdA_0HQS55e-Pp1sTHIwpww67hk4punK1J8QPPhMiIDqSiWaWxbkSv5jEmxYaXyUNe_BkuyMyiG_nuhovwkXRKJFxU7bu_Mq82oCJENeVHAFqFE-s-uBmAA99lITSA_FbY',
      category: 'Topology',
      type: 'tall'
    },
    {
      id: '5',
      title: 'Load Bearing',
      code: 'STRUC-221',
      description: 'Cantilever stress tests using lightweight carbon fiber meshes.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7uJWyNkrYHrsfOU7dSlaN2ymwXVg824nZd0ytFf_YV6Bq_WnpWOIyCts6zvl0tBFHFmYuqsjV_-wmqvWbMjjmSnR_nX7pcofciEYUOc13NF3GreQEvJWFAMaVYJB16jomSlLseYdWjcOpFYR5Q9XyC2RYS_5hJNUe50KMYRB1gMTNHVULPCfsCjg6TZEbqHOAnfvWZFmTnQV2P2GQXon8JmquIL7zmCFVFUQDv2pK5_kjeKRXhUOxvPIpxP9oaEwL9ClM9IBmr5E',
      category: 'Structural',
      type: 'square',
      icon: Box
    },
    {
      id: '6',
      title: 'Digital Terrain',
      code: 'DIGI-88',
      description: 'Algorithmic landscape generation for virtual habitats.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCekZXk1lLX1lkG9UZlsdWhZoibfI5qL_mEvA71VxHqPFEosM7wlvVZeltTA0DFZFHs3zOtMLfB31OsZW6WEqD_0DR7iawediAzDhRXI80RakJhUO-PasAzTS_sqhfvhRN1SJo_1Wn7reGNcqsCrRk5mGMT5TRei_yt-fZbuZNKvAjPDpsD236pqf1xXOFtAmFx4XDWeYL9PdfB0ksNgK_f1WJW4LtS6-yR9XWQ2KRH7m0SXtUg69tUk7WvjjlmQ74QX1BsDKG5EU8',
      category: 'Parametric',
      type: 'tall'
    }
  ];

  const displayItems = experiments.length > 0 ? experiments : mockExperiments;

  const filteredItems = filter === 'All'
    ? displayItems
    : displayItems.filter(item => item.category === filter);

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
                {['All', 'Parametric', 'Materiality', 'Structural', 'Topology'].map(cat => (
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

          {/* Masonry Gallery */}
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
