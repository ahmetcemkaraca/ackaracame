import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { currentProject, loadProject, loading } = useProject();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Proje yükleniyor..." />
      </div>
    );
  }
  
  const {
    title,
    description,
    images,
    category,
    year,
    semester,
    technologies,
    projectUrl,
    githubUrl
  } = currentProject;


  return (
    <main className="w-full flex flex-1 justify-center py-5 bg-background-light dark:bg-background-dark">
      <div className="flex flex-col max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <div className="pt-4 pb-8">
            <Link to="/portfolio" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft size={18} />
                <span>Tüm Projelere Geri Dön</span>
            </Link>
        </div>

        {/* Hero Image Gallery */}
        {images && images.length > 0 && (
            <div className="w-full mb-12">
                <div className="relative w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${images[0]}")` }}></div>
                </div>
            </div>
        )}

        <div className="flex flex-wrap justify-between gap-3 mb-12">
            <div className="flex min-w-72 flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter">{title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-normal leading-normal italic">{description.split('.')[0]}.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-16">
            {/* Left Column */}
            <div className="lg:col-span-2">
                <div className="mb-10">
                    <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-tight mb-4">Proje Hakkında</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-relaxed whitespace-pre-line">
                        {description}
                    </p>
                </div>
            </div>

            {/* Right Column */}
            <div className="mt-10 lg:mt-0">
                <div className="sticky top-28 bg-gray-100 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Proje Detayları</h3>
                    <div className="space-y-4">
                        {category && <div className="flex justify-between text-sm"><span className="font-medium text-gray-500 dark:text-gray-400">Kategori</span><span className="font-normal text-gray-800 dark:text-gray-200 capitalize">{category}</span></div>}
                        {year && <div className="flex justify-between text-sm"><span className="font-medium text-gray-500 dark:text-gray-400">Yıl</span><span className="font-normal text-gray-800 dark:text-gray-200">{year}</span></div>}
                        {semester && <div className="flex justify-between text-sm"><span className="font-medium text-gray-500 dark:text-gray-400">Dönem</span><span className="font-normal text-gray-800 dark:text-gray-200">{semester}</span></div>}
                    </div>
                    
                    {technologies && technologies.length > 0 && (
                        <>
                            <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Kullanılan Teknolojiler</h3>
                            <div className="flex flex-wrap gap-2">
                                {technologies.map(tech => (
                                    <span key={tech} className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{tech}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {(projectUrl || githubUrl) && (
                         <>
                            <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                             <div className="flex flex-col gap-3">
                                {projectUrl && <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"><ExternalLink size={16} /><span>Projeyi Görüntüle</span></a>}
                                {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-800 transition-colors"><Github size={16} /><span>GitHub'da Görüntüle</span></a>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        
        {/* Additional Images */}
        {images && images.length > 1 && (
             <div className="mt-16">
                <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-tight mb-6">Proje Galerisi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {images.slice(1).map((image, index) => (
                        <motion.div
                            key={index}
                            className="relative overflow-hidden rounded-lg shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                             <img src={image} alt={`${title} - Görüntü ${index + 2}`} className="w-full h-auto object-cover" />
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
};

export default ProjectDetailPage;
