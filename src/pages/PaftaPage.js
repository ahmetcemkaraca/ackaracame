import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Share2, ZoomIn, ZoomOut, Maximize, Eye } from 'lucide-react';

const PaftaPage = () => {
  const { qrCode } = useParams();
  const { currentPafta, loadPaftaByQR, loading } = useProject();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (qrCode) {
      loadPaftaByQR(qrCode);
    }
  }, [qrCode, loadPaftaByQR]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <LoadingSpinner text="Pafta yükleniyor..." />
      </div>
    );
  }

  // Fallback if not found or while loading initial state (though loading handles that)
  const item = currentPafta || {
    title: 'Urban Fragmentation',
    semester: 'Fall 2023',
    course: 'Studio V',
    professor: 'Prof. Yilmaz',
    description: 'A detailed exploration of urban density and void spaces. This project investigates the "in-between" zones of Istanbul\'s chaotic urban fabric.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCq7H1NqoP_PSoiHvUYkZRxBEuXO_vKpzgh3xWLjWnZJXHFMlG1xvDSZ4Dhudunp9ofdkmaxZpoT7SukBCVI7oWcC7Ohf1qcrjF9IimkTTISnmHbFj4gYtfFcHhMhUVf0WgnNZibab_hmbbDhIIaZ29ij8StBmtpyh4YbDjgV7iPhWvvY9K9V1HAOHj95dD_3DmZamEF7INRYEnlw_fTLjEZszQ_ae48zzXB3LNVTAGNIq_pR8GQ82LvFFW0OwzItWo95yxq-ozPms']
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-mono text-gray-900 dark:text-gray-100 flex flex-col md:flex-row h-[calc(100vh-5rem)] overflow-hidden pt-0 mt-20 md:mt-0"> {/* Adjust for global navbar height if needed, or overlay it */}

      {/* Sidebar (Collapsible on mobile, fixed on desktop) */}
      <aside className="w-full md:w-96 bg-white dark:bg-[#1a2530] border-r border-gray-200 dark:border-gray-800 flex flex-col z-20 shadow-xl h-full relative">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">{item.course || 'Studio'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.semester || 'Year 2023'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{item.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Danışman: {item.professor || 'Unknown'}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {item.description}
            </p>
          </div>

          {/* Board Navigator */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Sunum Paftaları</h3>
            <div className="space-y-3">
              {/* Active Board Item */}
              <button className="w-full group flex items-start space-x-3 p-2 rounded-lg bg-primary/10 border border-primary/50 transition-all text-left">
                <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-800 relative">
                  <img alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={item.images?.[0]} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Eye className="text-white w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-semibold text-primary">01. Ana Pafta</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">1:500 Vaziyet & Planlar</p>
                </div>
              </button>

              {/* More items would go here */}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Özellikler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <span className="block text-xs text-gray-400 mb-1">Boyut</span>
                <span className="block text-sm font-medium dark:text-gray-200">A0 (841x1189)</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <span className="block text-xs text-gray-400 mb-1">Ölçek</span>
                <span className="block text-sm font-medium dark:text-gray-200">1:200 / 1:50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2530] space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/20">
            <Download className="w-5 h-5" />
            <span>PDF İndir</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Paylaş</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport (Deep Zoom Canvas) */}
      <main className="flex-1 relative bg-background-dark overflow-hidden select-none">

        {/* Canvas Background / The Image */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
          <div className="relative transform origin-center transition-transform duration-75 ease-out shadow-2xl" style={{ transform: `scale(${zoom / 100})` }}>
            <img
                alt="Pafta"
                className="max-w-none h-[80vh] md:h-[90vh] opacity-90 filter contrast-125"
                src={item.images?.[0] || "https://placehold.co/841x1189"}
            />
          </div>
        </div>

        {/* Floating Controls: Top Right */}
        <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
          <div className="bg-[#1a2530]/80 backdrop-blur-md border border-gray-700/50 rounded-lg px-4 py-2 flex items-center space-x-3 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-gray-300">Canlı Görünüm</span>
          </div>
        </div>

        {/* Floating Controls: Bottom Center (Zoom/Pan) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center space-x-1 bg-[#1a2530]/90 backdrop-blur-md border border-gray-700 p-1.5 rounded-xl shadow-2xl">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" title="Uzaklaş">
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <div className="px-3 min-w-[60px] text-center">
              <span className="text-sm font-mono text-white">{zoom}%</span>
            </div>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => setZoom(z => Math.min(300, z + 10))} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" title="Yakınlaş">
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => setZoom(100)} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" title="Ekrana Sığdır">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Minimap: Bottom Right */}
        <div className="absolute bottom-8 right-8 z-10 hidden lg:block">
          <div className="w-48 h-32 bg-[#1a2530]/90 backdrop-blur border border-gray-700 rounded-lg shadow-2xl overflow-hidden relative group">
            <img alt="Minimap" className="w-full h-full object-cover opacity-50" src={item.images?.[0] || "https://placehold.co/841x1189"} />
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-primary bg-primary/10 cursor-move hover:bg-primary/20 transition-colors"></div>
          </div>
          <div className="text-right mt-2">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Navigator</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PaftaPage;
