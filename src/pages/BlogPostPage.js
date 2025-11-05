import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Mock Data - This will be removed
// const blogPosts = [ ... ];


const BlogPostPage = () => {
    const { id } = useParams();
    const { blogPosts, loadBlogPosts, loading } = useProject();

    useEffect(() => {
        if (blogPosts.length === 0) {
            loadBlogPosts();
        }
    }, [blogPosts, loadBlogPosts]);

    const post = blogPosts.find(p => p.id === id);

    if (loading || (!post && blogPosts.length === 0)) {
        return <LoadingSpinner text="Gönderi yükleniyor..." />;
    }

    if (!post) {
        return <div className="text-center py-20">Gönderi bulunamadı.</div>;
    }

    return (
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <Link to="/blog" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                        <ArrowLeft size={18} />
                        <span>Tüm Gönderilere Geri Dön</span>
                    </Link>
                </div>

                <article>
                    <header className="mb-8">
                        <p className="text-sm font-semibold text-primary mb-2">{post.category || 'Genel'}</p>
                        <h1 className="text-charcoal dark:text-off-white text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-4">{post.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base">
                          {post.date || (post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '')}
                        </p>
                    </header>
                    
                    {post.imageUrl && (
                      <img className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8" src={post.imageUrl} alt={post.title} />
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {post.content || post.description}
                    </div>
                </article>
            </motion.div>
        </main>
    );
};

export default BlogPostPage;
