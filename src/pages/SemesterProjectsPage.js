import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { School, Bot } from 'lucide-react'; // Using icons for differentiation

const SemesterProjectsPage = () => {
    const { paftas, loadPaftas, loading } = useProject();

    useEffect(() => {
        if (paftas.length === 0) {
            loadPaftas();
        }
    }, [paftas, loadPaftas]);

    // Sort paftas chronologically - assuming year and semester properties exist
    const sortedPaftas = [...paftas].sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        // Assuming semester is a string like "Fall" or "Spring"
        const semesterOrder = { 'Güz': 1, 'Bahar': 2 };
        return (semesterOrder[a.semester] || 3) - (semesterOrder[b.semester] || 3);
    });

    if (loading && sortedPaftas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Dönem projeleri yükleniyor..." />
            </div>
        );
    }
    
    return (
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="flex flex-col gap-3 mb-12 text-center">
                <h1 className="text-charcoal dark:text-off-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">Dönem Projeleri & AI Keşifleri</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-normal leading-normal">Akademik ve yaratıcı çalışmalarımdaki kronolojik bir yolculuk.</p>
            </div>

            <div className="relative">
                <div className="absolute left-4 sm:left-1/2 top-2 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2"></div>
                <div className="space-y-16">
                    {sortedPaftas.map((pafta, index) => (
                        <div key={pafta.id} className="relative flex items-start sm:items-center sm:gap-8 group">
                            <div className={`flex-shrink-0 z-10 w-8 sm:w-auto sm:self-start sm:translate-x-[calc(50%-1.5rem)] ${index % 2 !== 0 ? 'sm:order-last' : ''}`}>
                                <div className="sticky top-28 grid place-items-center w-12 h-12 rounded-full bg-background-light dark:bg-background-dark border-2 border-gray-200 dark:border-gray-700">
                                    {pafta.tags?.includes('AI') ? <Bot className="text-ai-teal" /> : <School className="text-architectural-blue" />}
                                </div>
                            </div>

                            <div className={`w-full ml-4 sm:ml-0 sm:w-1/2 ${index % 2 !== 0 ? 'sm:pl-8 sm:order-first sm:text-right' : 'sm:pr-8'}`}>
                                <motion.div 
                                    className="bg-white dark:bg-charcoal/50 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    <Link to={`/pafta/${pafta.qrCodeData}`}>
                                        <img className="w-full h-64 object-cover" src={pafta.images?.[0] || '/placeholder.jpg'} alt={pafta.title}/>
                                    </Link>
                                    <div className="p-6">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{`Yıl ${pafta.year}, ${pafta.semester}`}</p>
                                        <h3 className="text-xl font-bold text-charcoal dark:text-off-white mb-2">{pafta.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{pafta.description}</p>
                                        <Link to={`/pafta/${pafta.qrCodeData}`} className="inline-flex items-center gap-2 text-sm font-semibold text-architectural-blue hover:underline">
                                            Paftayı Görüntüle
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default SemesterProjectsPage;
