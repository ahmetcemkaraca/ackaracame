import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageCard from '../components/ImageCard'; // Import the new component

const HomePage = () => {
  const { featuredProjects, paftas, loadFeaturedProjects, loadPaftas, loading } = useProject();

  useEffect(() => {
    loadFeaturedProjects();
    loadPaftas();
  }, [loadFeaturedProjects, loadPaftas]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Projeler yükleniyor..." />
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <motion.section
        className="relative @container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full">
          <div
            className="flex min-h-[70vh] md:min-h-[80vh] flex-col gap-6 rounded-none bg-cover bg-center bg-no-repeat p-6 sm:p-10 md:gap-8 items-start justify-end"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEkEJk5Py8i7XJ3hx74GUBSR3649RhQbtsZ6QoW2FPi6h-7-0DJrqJOD0m4_dKUJyB9vqoyhz9j6hi752mCZTlylH7eYIiyOQTbA3b9Uh8xv1tiC3xuNmkOMIceE0kmOiHpU1FTCP3d9W-HwIZCZ0vpc9x2nuOFZhC_MraqAgl_oM4CObKxv1aKucIeI7-PEzGtHEho2IMq60Vbujtk_WsBP_9sVdc4N5WFK5G-DdQIi-fNwwU716S6Ne_dscFfWTakRyPnSkBhuU0")`,
            }}
          >
            <div className="mt-auto flex flex-col gap-4 text-left max-w-4xl">
              <motion.h1 
                className="text-5xl font-black leading-tight tracking-[-0.033em] text-white sm:text-6xl md:text-8xl"
                variants={itemVariants}
              >
                Ahmet Karaca
              </motion.h1>
              <motion.h2 
                className="font-serif text-xl font-normal leading-relaxed text-white sm:text-2xl md:text-3xl"
                variants={itemVariants}
              >
                Vizyoner bir mimar ve yenilikçi bir geliştirici olarak, ilham veren mekanlar ve güç veren araçlar yaratıyorum. Tasarım ve kod arasında küratörlüğünü yaptığım bir yolculuğu keşfedin.
              </motion.h2>
            </div>
            <motion.a 
              href="#projects"
              className="flex w-fit min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] bg-primary text-white hover:bg-primary/90 mt-4 sm:h-14 sm:px-8 sm:text-lg"
              variants={itemVariants}
            >
              <span className="truncate">Yolculuğa Başla</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.section>

      <div className="px-4 py-10 sm:px-6 md:px-10 bg-background-light dark:bg-background-dark">
        <div className="flex w-full max-w-7xl mx-auto flex-col gap-12 md:gap-24">
          {/* Architectural Projects Section */}
          <motion.section 
            id="projects"
            className="flex w-full flex-col gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
              Mimari Projeler
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <ImageCard 
                  key={project.id}
                  linkTo={`/project/${project.id}`}
                  imageUrl={project.images?.[0]}
                  title={project.title}
                />
              ))}
            </div>
          </motion.section>

          {/* Semester Boards & AI Designs Section */}
          <motion.section 
            className="flex w-full flex-col gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
              Dönem Paftaları & AI Tasarımları
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paftas.map((pafta) => (
                <ImageCard 
                  key={pafta.id}
                  linkTo={`/pafta/${pafta.qrCodeData}`}
                  imageUrl={pafta.images?.[0]}
                  title={pafta.title}
                />
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
