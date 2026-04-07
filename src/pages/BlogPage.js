import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, ArrowRight, Grid, List } from 'lucide-react';

const BlogPage = () => {
  const { blogPosts, loadBlogPosts, loading } = useProject();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (blogPosts.length === 0) {
      loadBlogPosts();
    }
  }, [blogPosts, loadBlogPosts]);
  const postsToDisplay = blogPosts;

  const filteredPosts = postsToDisplay.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase()) ||
    (post.description && post.description.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading && blogPosts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Blog yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-300 font-display antialiased min-h-screen flex flex-col pt-20">

      <main className="flex-grow pt-12 pb-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <header className="mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-3">Blog</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Mimari teori, stüdyo yaşamı ve yapılı çevre üzerine keşifler. Mekan, malzeme ve sürdürülebilirlik üzerine düşünceler koleksiyonu.
            </p>
          </header>

          {postsToDisplay.length > 0 && (
            <section className="mb-16">
              <div className="relative w-full h-[420px] md:h-[520px] rounded-xl overflow-hidden group">
                <img
                  alt={postsToDisplay[0].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={postsToDisplay[0].imageUrl || postsToDisplay[0].image || '/placeholder.jpg'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 lg:w-1/2 z-10">
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-white dark:bg-slate-900 rounded-full border border-primary/20">
                    One Cikan Makale
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                    {postsToDisplay[0].title}
                  </h2>
                  <p className="text-slate-300 text-lg mb-6 line-clamp-2">
                    {postsToDisplay[0].description || postsToDisplay[0].summary || 'Makale detaylarini okumak icin devam edin.'}
                  </p>
                  <Link to={`/blog/${postsToDisplay[0].id}`} className="inline-flex items-center text-white bg-primary hover:bg-primary/90 font-medium rounded-lg text-sm px-6 py-3 transition-colors">
                    Makaleyi Oku <ArrowRight className="text-sm ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Articles Grid (Left Column) */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Son Yazılar</h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Grid className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {filteredPosts.map(post => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col group h-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/30"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={post.imageUrl || post.image || '/placeholder.jpg'}
                      />
                      <div className="absolute top-4 left-4 bg-background-dark/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded">
                        {post.category || 'Architecture'}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 space-x-2">
                        <span>{post.date || (post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : 'Date')}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                        <span>{post.readTime || '5 min read'}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                        {post.description || post.summary}
                      </p>
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center text-primary font-medium text-sm hover:underline mt-auto">
                        Devamını Oku <ArrowRight className="text-sm ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
              {filteredPosts.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
                  Henuz blog yazisi bulunmuyor.
                </div>
              )}
            </div>

            {/* Sidebar (Right Column) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Search Widget */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">Ara</h4>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Search className="text-slate-500 dark:text-slate-400 w-4 h-4" />
                  </div>
                  <input
                    type="search"
                    className="block w-full p-3 ps-10 text-sm text-slate-900 border border-slate-300 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-slate-700 dark:placeholder-slate-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                    placeholder="Makalelerde ara..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories Widget */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">Kategoriler</h4>
                <ul className="space-y-2">
                  {['Architectural Theory', 'Site Visits', 'Studio Life', 'Sustainable Design', 'Sketches'].map((cat, idx) => (
                    <li key={cat}>
                      <span className="flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group transition-colors cursor-pointer">
                        <span>{cat}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full group-hover:bg-primary/20 group-hover:text-primary">{Math.floor(Math.random() * 20) + 5}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mini About */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbJ2-hSFrzUAq2bTQ-U69cSOHx1pMunoQPgMwCXpVj20_VFpmqSa8ofjGrmjPZXezH83yrqBi99pq5K28ieAzd8Hdp0V1jKMGKcJVLuKPrJvIGTBmarARIKqg_kozRYFyZ9LWsn14Ee5jfn9F074vzoYUvMmaYscWZG0Zj6o7uwu-qmSMGmcp1xCyj4XlRCKat1iS0qPwjLSiePwWOOLqeT29vPvUreWJGGGwxIhvgIJiU4s7t1ki5MBOQWHZWTAYUKMQQ5DXZd2o" alt="Profile" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white font-serif">Ahmet Cem Karaca</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mimar & Geliştirici. Dijital zanaat ve sürdürülebilir kentleşmenin kesişim noktasını keşfediyor.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
