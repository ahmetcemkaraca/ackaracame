import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageCard from '../components/ImageCard'; // Import the new component

const ArchivedWorksPage = () => {
    // Assuming a function getArchivedProjects exists in your context
    // If not, you'll need to filter all projects client-side
    const { projects, loadProjects, loading } = useProject();
    const [archivedProjects, setArchivedProjects] = useState([]);

    useEffect(() => {
        if (!projects.length) {
            loadProjects();
        }
    }, [projects, loadProjects]);
    
    useEffect(() => {
        // This simulates fetching only archived projects. 
        // Replace with specific context function if available e.g., loadArchivedProjects()
        const filtered = projects.filter(p => p.status === 'archived');
        setArchivedProjects(filtered);
    }, [projects]);


    if (loading && !archivedProjects.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner text="Arşiv yükleniyor..." />
            </div>
        );
    }

    // Slice projects for the stacked layout, taking the most recent 5 from the archive
    const stackedProjects = [...archivedProjects].reverse().slice(0, 5);

    return (
        <main className="flex-grow">
            <div className="flex flex-wrap justify-between gap-3 p-4 pt-16 pb-8 text-center">
                <div className="flex w-full flex-col items-center gap-3">
                    <p className="text-black dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">Yolculuk</p>
                    <p className="text-gray-600 dark:text-[#9398c8] text-base font-normal leading-normal max-w-xl">
                        Geçmiş projelerden oluşan bir koleksiyon, katmanlı bir arşiv aracılığıyla mimarideki büyüme ve keşif yolunun izini sürüyor.
                    </p>
                </div>
            </div>

            {/* Layered Project Cards */}
            {stackedProjects.length > 0 && (
                 <div className="relative flex h-[600px] items-center justify-center p-4 my-12">
                    <div className="relative w-full max-w-4xl h-full">
                        {stackedProjects.map((project, index) => (
                             <motion.div
                                key={project.id}
                                className="group absolute w-[40%] h-[60%] transition-all duration-300 ease-in-out"
                                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
                                animate={{
                                    opacity: 1 - (index * 0.15),
                                    scale: 1 - (index * 0.05),
                                    top: `${45 + index * 5}%`,
                                    left: `${45 + index * 5}%`,
                                    zIndex: stackedProjects.length - index,
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    zIndex: stackedProjects.length + 1,
                                    x: '-50%',
                                    y: '-50%',
                                    boxShadow: '0px 10px 30px rgba(0,0,0,0.3)'
                                }}
                             >
                                <Link to={`/project/${project.id}`} className="block w-full h-full">
                                    <div 
                                        className="bg-cover bg-center flex flex-col justify-end p-4 rounded-xl shadow-lg w-full h-full"
                                        style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%), url("${project.images?.[0] || '/placeholder.jpg'}")` }}
                                    >
                                        <p className="text-white text-base font-bold leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">{project.title}</p>
                                    </div>
                                </Link>
                             </motion.div>
                        ))}
                    </div>
                 </div>
            )}
           
            <div className="mt-24 mb-16 px-4">
                <h2 className="text-black dark:text-white text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5 text-center">Büyüme Üzerine Bir Yansıma</h2>
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-gray-700 dark:text-gray-300 text-base font-normal leading-relaxed pb-3 pt-4">
                        Bu arşiv, geçmiş projelerin bir koleksiyonundan daha fazlasını temsil ediyor; mimari yolculuğumun görsel bir günlüğü. En eski kavramsal eskizlerden daha karmaşık yapısal çalışmalara kadar her giriş, gelişimimde önemli bir adımı işaret ediyor.
                    </p>
                </div>
            </div>

            <div className="py-16">
                <h2 className="text-black dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Tüm Arşivlenmiş Çalışmalar</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4">
                    {archivedProjects.map(project => (
                        <ImageCard
                            key={project.id}
                            linkTo={`/project/${project.id}`}
                            imageUrl={project.images?.[0]}
                            title={project.title}
                            aspectRatio="aspect-[3/4]"
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ArchivedWorksPage;
