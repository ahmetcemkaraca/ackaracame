import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Mock Data for blog posts - This will be removed
// const blogPosts = [ ... ];

const BlogPage = () => {
    const { blogPosts, loadBlogPosts, loading } = useProject();
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        if (blogPosts.length === 0) {
            loadBlogPosts();
        }
    }, [blogPosts, loadBlogPosts]);

    const categories = useMemo(() => {
        const allCategories = new Set(blogPosts.map(p => p.category));
        return ['All', ...Array.from(allCategories)];
    }, [blogPosts]);

    const filteredPosts = useMemo(() => {
        if (activeCategory === 'All') {
            return blogPosts;
        }
        return blogPosts.filter(p => p.category === activeCategory);
    }, [activeCategory, blogPosts]);

    if (loading && blogPosts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Blog gönderileri yükleniyor..." />
            </div>
        );
    }

    return (
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex flex-col gap-4 mb-12 text-center">
                <h1 className="text-charcoal dark:text-off-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">Blog</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-normal leading-normal">Mimarlık, teknoloji ve tasarım üzerine düşünceler, keşifler ve hikayeler.</p>
            </div>

            <div className="flex justify-center flex-wrap gap-4 mb-12">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeCategory === category ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-charcoal dark:text-off-white hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        {category === 'All' ? 'Tümü' : category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <motion.div
                        key={post.id}
                        className="bg-white dark:bg-charcoal/50 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to={`/blog/${post.id}`} className="block">
                            <img className="w-full h-48 object-cover" src={post.imageUrl || '/placeholder.jpg'} alt={post.title} />
                        </Link>
                        <div className="p-6 flex flex-col flex-grow">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {post.date || (post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '')} - 
                              <span className="font-semibold text-primary ml-1">{post.category || 'Genel'}</span>
                            </p>
                            <h2 className="text-lg font-bold text-charcoal dark:text-off-white mb-3 flex-grow">
                                <Link to={`/blog/${post.id}`} className="hover:underline">{post.title}</Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{post.summary || post.description}</p>
                            <Link to={`/blog/${post.id}`} className="mt-auto text-sm font-semibold text-architectural-blue hover:underline">
                                Devamını Oku
                            </Link>
                        </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Henüz blog gönderisi eklenmemiş.</p>
                  </div>
                )}
            </div>
        </main>
    );
};

export default BlogPage;
