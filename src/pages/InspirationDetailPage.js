import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Maximize, Download, Share2, Layers, Lightbulb } from 'lucide-react';
import { InspirationService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';

const InspirationDetailPage = () => {
  const { id } = useParams();
  const [inspiration, setInspiration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        setLoading(true);
        // Using getById if available, otherwise defaulting to a mock for demo fidelity
        // In a real app with proper data, this would just use the fetched data
        const data = await InspirationService.getById(id);
        setInspiration(data);
      } catch (error) {
        console.error("İlham yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInspiration();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="İlham yükleniyor..." />
      </div>
    );
  }

  // Fallback mock if data is missing or empty (for visual fidelity of the design)
  const item = inspiration || {
    title: 'Geisel Library Study',
    category: 'Brutalism',
    year: '1965',
    architect: 'William Pereira',
    location: 'San Diego, USA',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRYWOqIn1kbDRaqKPbVzPQPgnVEpfL-Dw0Y6l65jMZvt0_ttHpVDn5QPI_h3skueQ_9yDvBfLvFx6HOIhrBOzI-eAcdsiDbBgIi4suYM-AobfaBmBYwL7WF9ijBTQ964uutx8YLA7ZUyRrBbaxY4I9Imyr0E_fntsPZ70mA4oniPNHg2MkK5MjxT8j9Tpo70Qf8gzmHTXo39ijUd2SVyx1zgurI9khFNobBxDBkdjCZmGJfOnCWDLT3VNSX-J5vDENM9PHvj83Vnk',
    description: 'The structural daring of the cantilevered floors creates a sense of weightlessness despite the heavy concrete material. This dichotomy between form and material is something I want to explore in my "Urban Sanctuary" project.',
    notes: 'The central core houses the elevators and stairs, allowing the floor plates to be open and free of columns.',
    palette: ['#4a5568', '#718096', '#a0aec0', '#e2e8f0', '#1a202c']
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-hidden pt-20">

      {/* Navbar Overlay - Back Link */}
      <nav className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-50 shrink-0">
        <Link to="/inspiration-gallery" className="group flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Galeriye Dön
        </Link>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-primary transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area: Split View */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-9rem)] overflow-hidden relative">

        {/* Left Column: Immersive Image */}
        <div className="lg:w-7/12 xl:w-2/3 h-1/2 lg:h-full bg-black relative group overflow-hidden">
          <img
            src={item.imageUrl || item.image}
            alt={item.title}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
          />

          {/* Overlay Controls */}
          <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <button className="bg-black/50 hover:bg-primary/90 backdrop-blur-sm text-white p-3 rounded-full transition-colors flex items-center justify-center shadow-lg border border-white/10" title="Tam Ekran">
              <Maximize className="w-5 h-5" />
            </button>
            <button className="bg-black/50 hover:bg-primary/90 backdrop-blur-sm text-white p-3 rounded-full transition-colors flex items-center justify-center shadow-lg border border-white/10" title="İndir">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Analysis & Content */}
        <div className="lg:w-5/12 xl:w-1/3 h-1/2 lg:h-full overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark border-l border-slate-200 dark:border-slate-800">
          <div className="p-8 lg:p-10 max-w-2xl mx-auto flex flex-col gap-10">

            {/* Header */}
            <header className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 rounded border border-primary/20">{item.category || 'Architecture'}</span>
                  {item.year && <span className="px-2 py-1 text-xs font-semibold tracking-wider uppercase text-slate-500 bg-slate-200 dark:bg-slate-800 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700">{item.year}</span>}
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {item.title}
              </h1>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="material-icons text-base">person</span>
                  {item.architect || 'Unknown Architect'}
                </span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                  <span className="material-icons text-base">place</span>
                  {item.location || 'Unknown Location'}
                </span>
              </div>
            </header>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Analysis */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Neden ilham veriyor?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white dark:bg-surface-dark p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <Lightbulb className="text-primary mb-2 w-5 h-5" />
                  <h4 className="font-medium text-sm text-slate-900 dark:text-white">Aydınlatma Stratejisi</h4>
                  <p className="text-xs text-slate-500 mt-1">Köşeli cephe ile doğal difüzyon.</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <Layers className="text-primary mb-2 w-5 h-5" />
                  <h4 className="font-medium text-sm text-slate-900 dark:text-white">Form Faktörü</h4>
                  <p className="text-xs text-slate-500 mt-1">Ters piramit yapısal mantığı.</p>
                </div>
              </div>
            </section>

            {/* Technical Notes (Accordion-like) */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary/50 rounded-full"></span>
                    Teknik Detaylar
                </h2>
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.notes || 'No technical notes available.'}</p>
                </div>
            </section>

            {/* Palette */}
            {item.palette && (
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Çıkarılan Renk Paleti</h3>
                    <div className="flex h-12 rounded-lg overflow-hidden w-full shadow-sm">
                        {item.palette.map(color => (
                            <div key={color} className="flex-1" style={{ backgroundColor: color }} title={color}></div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer Nav */}
            <div className="pt-8 pb-4 flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-800 lg:pb-12">
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <div>
                        <span className="block text-xs uppercase tracking-wider opacity-70">Önceki</span>
                    </div>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-right group">
                    <div>
                        <span className="block text-xs uppercase tracking-wider opacity-70">Sonraki</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default InspirationDetailPage;
