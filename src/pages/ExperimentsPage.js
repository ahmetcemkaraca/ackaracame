import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ExperimentsPage = () => {
  const { experiments, loadExperiments, loading } = useProject();

  useEffect(() => {
    if (experiments.length === 0) {
      loadExperiments();
    }
  }, [experiments.length, loadExperiments]);

  if (loading && experiments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Deneyler yükleniyor..." />
      </div>
    );
  }

  const featuredExperiments = experiments.filter(exp => exp.featured && exp.type === 'featured').slice(0, 4);
  const digitalExplorations = experiments.filter(exp => exp.type === 'digital').slice(0, 4);
  const failedExperiments = experiments.filter(exp => exp.type === 'failed');
  return (
    <main className="flex flex-col gap-10 md:gap-16 mt-8 md:mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Yaratıcı Deneyler</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-2xl mx-auto">
          Ticari olmayan, soyut veya sanatsal çabaları içeren yaratıcı keşiflerin görsel bir günlüğü.
        </p>
      </div>

      <div className="flex flex-col">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3">Öne Çıkan Deneyler</h3>
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-stretch p-4 gap-4">
                {featuredExperiments.map(exp => (
                    <div key={exp.id} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{ backgroundImage: `url("${exp.imageUrl || '/placeholder.jpg'}")`}}></div>
                        <div>
                            <p className="text-slate-800 dark:text-white text-base font-medium leading-normal">{exp.title}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{exp.date || (exp.createdAt ? new Date(exp.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 border-t border-slate-200/10 dark:border-white/10">Dijital Keşifler</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4 px-4">
          {digitalExplorations.map(exp => (
               <div key={exp.id} className="group relative cursor-pointer overflow-hidden rounded-lg">
                    <div className="bg-cover bg-center flex flex-col justify-end p-4 aspect-[3/4] transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url("${exp.imageUrl || '/placeholder.jpg'}")`}}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <p className="absolute bottom-4 left-4 text-white text-base font-bold leading-tight w-4/5 line-clamp-3">{exp.title}</p>
                </div>
          ))}
      </div>
      
      {failedExperiments.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 border-t border-slate-200/10 dark:border-white/10">Başarısız Projeler & Alınan Dersler</h2>
          {failedExperiments.map(exp => (
            <div key={exp.id} className="grid md:grid-cols-2 gap-8 px-4">
              <div className="flex flex-col gap-4">
                <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{ backgroundImage: `url("${exp.imageUrl || '/placeholder.jpg'}")`}}></div>
                <h4 className="text-slate-800 dark:text-white text-lg font-bold">{exp.title}</h4>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/20 p-6 rounded-lg flex flex-col justify-center">
                <h5 className="text-primary text-sm font-bold tracking-wider uppercase mb-2">Alınan Ders</h5>
                <p className="text-slate-600 dark:text-slate-300">{exp.lesson || exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {experiments.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Henüz deney eklenmemiş.</p>
        </div>
      )}

    </main>
  );
};

export default ExperimentsPage;
