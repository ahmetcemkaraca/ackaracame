import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { InspirationService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';

const InspirationGalleryPage = () => {
  const [featuredInspirations, setFeaturedInspirations] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [culturalInspirations, setCulturalInspirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        // Tüm ilhamları çek
        const allInspirations = await InspirationService.getAll();
        
        // Kategorilere göre ayır
        const featured = allInspirations.filter(item => item.category === 'featured');
        const influencer = allInspirations.filter(item => item.category === 'influencer');
        const cultural = allInspirations.filter(item => item.category === 'cultural');
        
        setFeaturedInspirations(featured);
        setInfluencers(influencer);
        setCulturalInspirations(cultural);
      } catch (error) {
        console.error("Error fetching inspirations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="flex flex-col gap-12 md:gap-16 lg:gap-20 py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Kültür / Etkileyenler / İlham Kaynakları</h1>
        <p className="text-slate-500 dark:text-[#9398c8] text-base font-normal leading-normal max-w-2xl mx-auto">
          Çalışmalarımı şekillendiren mimarlar, hareketler ve kültürel fenomenler aracılığıyla yaratıcı ve entelektüel sürecimin temellerini keşfetmek.
        </p>
      </div>

      <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] snap-x snap-mandatory">
        <div className="flex w-full flex-shrink-0 items-stretch p-4 gap-4 snap-center">
            {featuredInspirations.map(item => (
                 <Link key={item.id} to={`/inspiration/${item.id}`} className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-slate-100 dark:bg-[#1a1c32] shadow-sm min-w-[280px] hover:shadow-lg transition-shadow">
                    <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-xl" style={{ backgroundImage: `url("${item.imageUrl}")`}}></div>
                    <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                        <div>
                            <p className="text-slate-900 dark:text-white text-lg font-bold leading-normal">{item.title}</p>
                            <p className="text-slate-500 dark:text-[#9398c8] text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex min-w-[84px] w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-[#242747] text-slate-800 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            <span className="truncate">Daha Fazla Bilgi</span>
                        </div>
                    </div>
                 </Link>
            ))}
        </div>
      </div>

      <section>
        <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 border-b border-slate-200 dark:border-slate-800">Mimari Etkiler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            {influencers.map(item => (
                <Link key={item.id} to={`/inspiration/${item.id}`} className="flex flex-col gap-3 pb-3 group cursor-pointer">
                    <div className="w-full overflow-hidden rounded-lg">
                        <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url("${item.imageUrl}")`}}></div>
                    </div>
                    <div>
                        <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">{item.name || item.title}</p>
                        <p className="text-slate-500 dark:text-[#9398c8] text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                    </div>
                </Link>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 border-b border-slate-200 dark:border-slate-800">Kültürel Esinlenmeler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
             {culturalInspirations.map(item => (
                <Link key={item.id} to={`/inspiration/${item.id}`} className="flex flex-col gap-3 pb-3 group cursor-pointer">
                    <div className="w-full overflow-hidden rounded-lg">
                        <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url("${item.imageUrl}")`}}></div>
                    </div>
                    <div>
                        <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">{item.name || item.title}</p>
                        <p className="text-slate-500 dark:text-[#9398c8] text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                    </div>
                </Link>
            ))}
        </div>
      </section>

    </main>
  );
};

export default InspirationGalleryPage;
