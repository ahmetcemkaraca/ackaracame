import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, ZoomIn, Share2 } from 'lucide-react';

const PaftaPage = () => {
  const { qrCode } = useParams();
  const { currentPafta, loadPaftaByQR, loading } = useProject();

  useEffect(() => {
    if (qrCode) {
      loadPaftaByQR(qrCode);
    }
  }, [qrCode, loadPaftaByQR]);

  if (loading || !currentPafta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Pafta yükleniyor..." />
      </div>
    );
  }

  const { title, description, images, year, semester, technologies, course, professor } = currentPafta;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6 md:mb-10">
        <Link to="/semester-projects" className="flex items-center gap-2 text-gray-500 dark:text-[#92a4c9] hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors">
            <ArrowLeft size={16} />
            <span>Tüm Dönem Projelerine Geri Dön</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Viewer */}
        <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
          <div className="aspect-[3/4] w-full bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${images?.[0] || '/placeholder.jpg'}")` }}></div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
              <ZoomIn size={20} />
            </button>
            <button className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>
        {/* Right Column: Project Details */}
        <motion.div 
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal mb-2">{`${semester} ${year}`}</p>
            <h1 className="text-gray-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">{title}</h1>
          </div>
          <div className="space-y-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed whitespace-pre-line">
            <p>{description}</p>
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Proje Detayları</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {course && professor &&
                    <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Ders / Profesör</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{`${course} / ${professor}`}</span>
                    </div>
                }
                 {technologies && technologies.length > 0 &&
                    <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Kullanılan Araçlar</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">{technologies.join(', ')}</span>
                    </div>
                }
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default PaftaPage;
