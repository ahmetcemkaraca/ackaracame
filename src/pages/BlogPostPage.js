import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, Clock, Share2, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockRenderer from '../components/BlockEditor/BlockRenderer';

const BlogPostPage = () => {
  const { id } = useParams();
  const { blogPosts, loadBlogPosts, loading } = useProject();

  useEffect(() => {
    if (blogPosts.length === 0) {
      loadBlogPosts();
    }
  }, [blogPosts, loadBlogPosts]);

  // Mock post for design fidelity if id not found or empty
  const mockPost = {
    id: 'mock-1',
    title: 'Modern Kampüs Tasarımında Brütalizmin Evrimi',
    category: 'Mimari Teori',
    author: 'Ahmet Cem Karaca',
    date: '24 Eki 2023',
    readTime: '5 dk okuma',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMAHCL9duBD0N3MlCOpBcQjOCAjuyxSTHPEKgOqV_AG1H8H7fwNHEtV0JhelPiGuAa-1jpMEUfO9wtK7itZaV4WS8cYIgW9Z5ay3P8XBgcGTVlx7CE9CdgDpxBIZ2lRczwAkmEEXM07FVo-nAba-wVAp5Sys4N94-HqThnFHuyqPc9uDcZpY3aUfhImhzTbGMec86t1eU7UKHEUXvn1YW6ktGTykbTQNcNduMD8c0LOlowiaCVtg49-16G1IRuRgg0CjAQ7ux7uc8',
    intro: 'Betonun ham dürüstlüğü akademik çevrelerde uzun süredir tartışma konusudur. Genellikle "acımasız" olarak yanlış anlaşılan brütalizm, aslında Fransızca "béton brut" yani "ham beton" teriminden gelir. 1950\'lerden 1970\'lerin ortalarına kadar gelişen bu mimari stil, süsleme yerine malzemeye sadakati ve biçim yerine işlevi önceliklendirdi.',
    content: `Son yıllarda, özellikle üniversite kampüs genişletmelerinde bu ilkelerin büyüleyici bir yeniden canlanışına tanık oluyoruz. Soru artık yapıyı gizlemek değil, iskelet bütünlüğünü kutlamakla ilgili.

    Modern kampüsler esnek alanlar gerektirir. Brütalist mimarinin monolitik doğası bunun için sağlam bir tuval sağlar. Geniş açıklıklı beton kirişler kullanarak, aşırı iç kolon ihtiyacını ortadan kaldırıyor ve geniş, uyarlanabilir öğrenme alanları yaratıyoruz.

    Frank Gehry'nin dediği gibi: "Mimari, zamanı ve yeri hakkında konuşmalı, ancak zamansızlık için can atmalıdır."

    Sürdürülebilir uygulamalara doğru ilerlerken, betonun termal kütle özellikleri bir yükümlülükten ziyade bir varlık haline geliyor. "Yeni brütalizm", iradeyi manzaraya dayatmakla ilgili değil, eğitim kurumlarımızı kalıcı, dokunsal ve derinden insani bir şeye dayandırmakla ilgilidir.`
  };

  const post = blogPosts.find(p => p.id === id) || mockPost;

  if (loading && blogPosts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Gönderi yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-noto min-h-screen flex flex-col pt-20">

      {/* Main Content Wrapper */}
      <main className="flex-grow">
        {/* Hero Section */}
        <header className="relative w-full h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10"></div>
          <img
            alt={post.title}
            className="w-full h-full object-cover object-center"
            src={post.imageUrl || post.image || "https://placehold.co/1200x600"}
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-12 sm:pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold mb-6 backdrop-blur-sm uppercase tracking-wider">
                {post.category || 'Architecture'}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight font-display">
                {post.title}
              </h1>
              <div className="flex items-center justify-center space-x-6 text-slate-300 text-sm md:text-base font-sans">
                <div className="flex items-center">
                  <User className="text-primary mr-2 w-4 h-4" />
                  <span>{post.author || 'Ahmet Cem Karaca'}</span>
                </div>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <div className="flex items-center">
                  <Calendar className="text-primary mr-2 w-4 h-4" />
                  <span>{post.date || (post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : 'Date')}</span>
                </div>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <div className="flex items-center">
                  <Clock className="text-primary mr-2 w-4 h-4" />
                  <span>{post.readTime || '5 dk okuma'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Intro Text */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
             <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]">
               {post.intro || (post.description ? post.description : '')}
             </p>

             {/* Content Rendering */}
             {post.blocks ? (
                <BlockRenderer blocks={post.blocks} />
             ) : (
                <div className="whitespace-pre-line">
                    {post.content}
                </div>
             )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-12"></div>

          {/* Tags & Share */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-6 font-sans">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">#Brutalism</span>
              <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">#SustainableDesign</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Paylaş</span>
              <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Post Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20 font-sans">
            <Link to="/blog" className="group block p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-300">
              <span className="text-xs text-slate-500 uppercase tracking-widest group-hover:text-primary transition flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Önceki Yazı
              </span>
              <h4 className="mt-2 text-lg text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white font-medium">Savaş Sonrası Berlin'de Kentsel Dönüşüm</h4>
            </Link>
            <Link to="/blog" className="group block p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-300 text-right">
              <span className="text-xs text-slate-500 uppercase tracking-widest group-hover:text-primary transition flex items-center justify-end gap-1">
                Sonraki Yazı <ArrowRight className="w-3 h-3" />
              </span>
              <h4 className="mt-2 text-lg text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white font-medium">Eskiz 101: Temel Araçlar</h4>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPostPage;
