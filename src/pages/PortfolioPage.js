import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, LayoutGrid, Monitor, Smartphone } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const filterMeta = {
  all: { label: 'Tum Icerikler', icon: LayoutGrid },
  project: { label: 'Projeler', icon: Monitor },
  application: { label: 'Uygulamalar', icon: Smartphone }
};

const PortfolioPage = () => {
  const { portfolioItems, loadPortfolioItems, loading } = useProject();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTimelineId, setActiveTimelineId] = useState(null);

  useEffect(() => {
    loadPortfolioItems();
  }, [loadPortfolioItems]);

  const items = useMemo(() => (
    [...portfolioItems]
      .filter((item) => item.status !== 'archived')
      .sort((a, b) => {
        const left = Number(a.order || 999);
        const right = Number(b.order || 999);
        if (left !== right) return left - right;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      })
  ), [portfolioItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => (item.kind || 'project') === activeFilter);
  }, [items, activeFilter]);

  const timelineItems = useMemo(() => (
    items.map((item, index) => ({
      id: item.id,
      date: item.year || item.version || item.semester || 'Yeni',
      title: item.title,
      description: item.description,
      kind: item.kind || 'project',
      index
    }))
  ), [items]);

  const activeTimelineItem = timelineItems.find((item) => item.id === activeTimelineId) || timelineItems[0];

  useEffect(() => {
    if (!activeTimelineId && timelineItems.length > 0) {
      setActiveTimelineId(timelineItems[0].id);
    }
  }, [activeTimelineId, timelineItems]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Portfolyo yukleniyor..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pt-20">
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 opacity-60 dark:opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(25,127,230,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.14),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.75),transparent)] dark:bg-[radial-gradient(circle_at_top_left,rgba(25,127,230,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.18),transparent_28%),linear-gradient(to_bottom,rgba(15,23,42,0.92),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-[0.18em] mb-6">
              Birlesik Portfolyo
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Uygulamalar ve projeler tek bir
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">yasayan vitrin icinde.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Projeler ve uygulamalar tek bir akista listeleniyor. Her kart kendi detay sayfasina acilir; zaman cizelgesi ise uretilen tum icerikleri tek bakista etkilesimli olarak gosterir.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-10 flex flex-wrap gap-3">
            {Object.entries(filterMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {meta.label}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8">
          <div>
            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-500 dark:text-slate-400 mb-6">
                Bu filtrede gosterilecek icerik bulunamadi.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <Link to={`/portfolio/${item.id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image || item.images?.[0] || 'https://placehold.co/1600x900'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
                      <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur">
                        {(item.kind || 'project') === 'application' ? 'Uygulama' : 'Proje'}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {item.year || item.version || item.semester || 'Guncel'}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(item.technologies || item.techStack?.map((tech) => tech.name) || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-4">
                <Calendar className="w-4 h-4" />
                Zaman Cizelgesi
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Olusturulan proje ve icerikleri burada tek akis halinde inceleyebilirsin. Bir ogeye tiklayinca ayni icerigin detay sayfasina gidersin.
              </p>

              <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                {timelineItems.map((item) => {
                  const active = activeTimelineItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTimelineId(item.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                        active
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/30 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.date}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary">
                          {item.kind}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeTimelineItem && (
                <div className="mt-6 rounded-xl bg-slate-950 text-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Secili Icerik</p>
                  <h3 className="text-lg font-semibold mb-2">{activeTimelineItem.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{activeTimelineItem.description}</p>
                  <Link
                    to={`/portfolio/${activeTimelineItem.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    Detay sayfasini ac
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default PortfolioPage;
