import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { InspirationService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockRenderer from '../components/BlockEditor/BlockRenderer';

const InspirationDetailPage = () => {
  const { id } = useParams();
  const [inspiration, setInspiration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        setLoading(true);
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="İlham yükleniyor..." />
      </div>
    );
  }

  if (!inspiration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">İlham bulunamadı</h2>
        <Link to="/inspiration-gallery" className="text-primary hover:underline">
          Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6 md:mb-10">
        <Link to="/inspiration-gallery" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          <span>İlham Galerisine Geri Dön</span>
        </Link>
      </div>

      <motion.article
        className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Başlık */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full w-fit">
            <span className="text-sm font-medium capitalize">{inspiration.category || 'İlham'}</span>
          </div>
          <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            {inspiration.title || inspiration.name}
          </h1>
        </div>

        {/* Ana Görsel */}
        {inspiration.imageUrl && (
          <motion.div
            className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={inspiration.imageUrl}
              alt={inspiration.title || inspiration.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* İçerik */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Kısa Açıklama */}
          {inspiration.description && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Açıklama</h2>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">
                {inspiration.description}
              </p>
            </div>
          )}

          {/* Block İçeriği */}
          {inspiration.blocks && inspiration.blocks.length > 0 && (
            <div className="my-8">
              <BlockRenderer blocks={inspiration.blocks} />
            </div>
          )}

          {/* Ek Bilgiler (eski sistem uyumluluğu) */}
          {inspiration.additionalInfo && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 mt-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Ek Bilgiler</h2>
              <div className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">
                {inspiration.additionalInfo}
              </div>
            </div>
          )}

          {/* Etiketler */}
          {inspiration.tags && inspiration.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {inspiration.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* İlgili Linkler */}
        {inspiration.links && inspiration.links.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">İlgili Linkler</h2>
            <ul className="space-y-2">
              {inspiration.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.article>
    </main>
  );
};

export default InspirationDetailPage;

