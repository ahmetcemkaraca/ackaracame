import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Code2, Laptop2, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const filterOptions = [
  { id: 'all', label: 'Tum Icerikler' },
  { id: 'project', label: 'Projeler' },
  { id: 'application', label: 'Uygulamalar' }
];

const getItemDateValue = (item) => {
  if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
  if (item.date) return new Date(item.date).getTime();
  if (item.year) return new Date(`${item.year}-01-01`).getTime();
  return 0;
};

const PortfolioPage = () => {
  const { portfolioItems, loadPortfolioItems, loading } = useProject();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadPortfolioItems();
  }, [loadPortfolioItems]);

  const filteredItems = useMemo(() => {
    const items = portfolioItems.filter((item) => activeFilter === 'all' || item.kind === activeFilter);
    return [...items].sort((left, right) => getItemDateValue(left) - getItemDateValue(right));
  }, [activeFilter, portfolioItems]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[filteredItems.length - 1].id);
    }
  }, [filteredItems, selectedId]);

  const selectedItem = filteredItems.find((item) => item.id === selectedId) || null;

  if (loading && portfolioItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark pt-20">
        <LoadingSpinner text="Portfolyo yukleniyor..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark pt-20 text-slate-800 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.35),_transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Birlesik Portfolyo
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.02] text-slate-950 dark:text-white">
              Uygulamalar ve projeler
              <span className="block text-primary">tek bir canli vitrin icinde.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
              Tum uretilen icerikler ayni akista listeleniyor. Zaman cizelgesi artik ust bolumde;
              soldan saga ilerleyerek yeni isleri secip detay ve changelog sayfalarina gecis yapabilirsiniz.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  activeFilter === option.id
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                    : 'border-slate-300 bg-white/80 text-slate-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <CalendarDays className="w-4 h-4" />
                Zaman Cizelgesi
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Soldan saga ilerleyen bu akista son secilen oge detay paneline yansir. Sag taraf yeni icerikleri temsil eder.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Secili Icerik</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedItem?.title || 'Secim yapin'}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto pb-3">
            <div className="min-w-max px-2">
              <div className="relative flex items-start gap-6 pb-10">
                <div className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
                {filteredItems.map((item, index) => {
                  const isSelected = item.id === selectedId;
                  const isApplication = item.kind === 'application';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="relative z-10 w-72 shrink-0 text-left"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`rounded-[1.75rem] border p-5 transition ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-2xl shadow-primary/20'
                            : 'border-slate-200 bg-slate-50/90 text-slate-900 hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            isSelected
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {isApplication ? <Laptop2 className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                            {isApplication ? 'Uygulama' : 'Proje'}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {item.year || item.version || 'Guncel'}
                          </span>
                        </div>
                        <div className={`mt-6 h-3 w-3 rounded-full border-4 ${
                          isSelected ? 'border-white bg-white' : 'border-primary/20 bg-primary'
                        }`} />
                        <h3 className="mt-6 text-2xl font-semibold leading-tight">{item.title}</h3>
                        <p className={`mt-3 line-clamp-3 text-sm leading-6 ${isSelected ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.description}
                        </p>
                        <p className={`mt-6 text-xs uppercase tracking-[0.18em] ${isSelected ? 'text-white/75' : 'text-slate-400'}`}>
                          Adim {String(index + 1).padStart(2, '0')}
                        </p>
                      </motion.div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            {selectedItem ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Secili Oge
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{selectedItem.title}</h2>
                  </div>
                  <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                    {selectedItem.category || selectedItem.type || selectedItem.kind}
                  </span>
                </div>

                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
                  <img
                    src={selectedItem.images?.[0] || selectedItem.image || 'https://placehold.co/1600x900/0f172a/f8fafc?text=Portfolio'}
                    alt={selectedItem.title}
                    className="h-[320px] w-full object-cover"
                  />
                </div>

                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                  {selectedItem.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {(selectedItem.technologies || selectedItem.techStack?.map((tech) => tech.name) || []).map((tech) => (
                    <span key={tech} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to={`/portfolio/${selectedItem.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-lg shadow-primary/20"
                  >
                    Detay Sayfasi
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/portfolio/${selectedItem.id}/changelog`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
                  >
                    Changelog
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Bu filtrede gosterilecek icerik yok.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Liste</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Tum Kartlar</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {filteredItems.length} oge
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    item.id === selectedId
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 hover:border-primary/40 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.year || item.version || 'Guncel'}</p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {item.kind}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PortfolioPage;
