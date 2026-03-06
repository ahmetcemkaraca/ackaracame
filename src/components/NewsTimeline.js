import React from 'react';
import { motion } from 'framer-motion';
import { Github, FileText, Star, AlertCircle, Rocket } from 'lucide-react';

const getIconForType = (type) => {
    switch (type) {
        case 'github_release':
            return <Github className="w-5 h-5" />;
        case 'github_commit':
            return <Github className="w-5 h-5 text-slate-400" />;
        case 'feature':
            return <Star className="w-5 h-5 text-yellow-500" />;
        case 'announcement':
            return <Rocket className="w-5 h-5 text-primary" />;
        case 'warning':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        default:
            return <FileText className="w-5 h-5 text-slate-400" />;
    }
};

const NewsTimeline = ({ items = [], title = "Güncellemeler", subtitle = "En son haberler ve geliştirmeler" }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col pt-20">

            {/* Header Section */}
            <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                        Haberler & Güncellemeler
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </div>
            </header>

            {/* Timeline Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                {items.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                        Henüz gösterilecek bir haber yok.
                    </div>
                ) : (
                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 sm:ml-0">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="mb-10 ml-8 sm:ml-12 relative"
                            >
                                {/* Timeline Dot/Icon */}
                                <span className="absolute flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full -left-[54px] sm:-left-[70px] ring-4 ring-white dark:ring-slate-900 border border-slate-200 dark:border-slate-700">
                                    {getIconForType(item.type)}
                                </span>

                                {/* Date */}
                                <time className="block mb-2 text-sm font-medium leading-none text-slate-400 dark:text-slate-500">
                                    {item.date}
                                </time>

                                {/* Content Card */}
                                <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-xl border ${item.type === 'github_release' || item.type === 'github_commit' ? 'border-dashed border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'} shadow-sm hover:shadow-md transition-shadow`}>
                                    <h3 className="flex items-center text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {item.title}
                                        {item.tag && (
                                            <span className="ml-3 bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
                                                {item.tag}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4 whitespace-pre-line">
                                        {item.description}
                                    </p>

                                    {item.linkText && item.linkUrl && (
                                        <a
                                            href={item.linkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-row items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                                        >
                                            {item.linkText}
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsTimeline;
