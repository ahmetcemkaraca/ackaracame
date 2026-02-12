import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { featuredProjects, loadFeaturedProjects, loading } = useProject();
  const { t } = useLanguage();

  useEffect(() => {
    loadFeaturedProjects();
  }, [loadFeaturedProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-screen">
        {/* Architectural Background Render */}
        <img
          alt="Minimalist concrete architectural structure with dramatic shadows"
          className="w-full h-full object-cover opacity-60 dark:opacity-40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSlVvG9zu4SOSdcNi-3T27agyc07V5ihz5uySCVPqMcGPjfhnlkM1pVujnBp2r0Ubx5r7zR8GUlbA1JCHEb1QDXocrsheMG4ztrLpZvXvPcdZEd6Jc66H9p7KuoPFvlsuXVlHj42cLV0hG3pXO5N0Vm8qPj9RE6rGPQ_fsU6XduODF97vHuCTCw42mI-lx-vvwkgCwNVAIYBX2y-3WTdAR5wQyHdaiHaeJBXZdhkZlMfXCmWDwLrG6OL4L4NIkmi65Y25S9OC01N8"
        />
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background-light/80 via-background-light/60 to-background-light/90 dark:from-background-dark/80 dark:via-background-dark/60 dark:to-background-dark/90 mix-blend-multiply"></div>
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 md:px-0 h-screen mt-[-4rem]">
        {/* Decorative Line */}
        <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-primary to-primary mb-8 opacity-70"></div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-slate-900 dark:text-white mb-6 tracking-tight leading-tight"
        >
          Ahmet Cem <span className="text-primary italic">Karaca</span>
        </motion.h1>

        {/* Subheading / Poetic Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display font-light text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-10"
        >
          Sadeliği takdir eden bir mimar ve geliştirici. Karmaşıklık yerine özü bularak, anlamlı mekanlar ve kullanışlı araçlar yaratıyorum.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="group relative inline-flex items-center justify-center"
        >
          {/* Button Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <a href="#selected-works" className="relative px-8 py-4 bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-lg leading-none flex items-center divide-x divide-slate-200 dark:divide-white/10 overflow-hidden group-hover:border-primary/50 transition-colors">
            <span className="flex items-center pr-6 text-slate-900 dark:text-white font-medium tracking-wide">
              {t('common.projects') || "Explore Works"}
            </span>
            <span className="pl-6 text-primary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <span className="material-icons transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
          </a>
        </motion.div>
      </main>

      {/* Bottom UI Elements */}
      <div className="absolute bottom-0 w-full px-6 md:px-12 pb-8 flex justify-between items-end z-10 pointer-events-none">
        {/* Coordinates / Location */}
        <div className="hidden md:block text-xs font-mono text-slate-500">
          <p>LAT: 36.8969° N</p>
          <p>LON: 30.7133° E</p>
          <p class="mt-2 text-slate-400">BASED IN ANTALYA</p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-12 flex flex-col items-center animate-bounce duration-1000">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent"></div>
        </div>

        {/* Social Links (Right side) */}
        <div className="flex space-x-6 pointer-events-auto">
          {/* Add social links here if needed, consistent with Footer */}
        </div>
      </div>

      {/* Featured Projects Grid Teaser */}
      <section id="selected-works" className="relative z-10 w-full bg-background-light dark:bg-background-dark py-20 px-6 md:px-12 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Selected Works</h2>
              <div className="h-1 w-24 bg-primary rounded-full"></div>
            </div>
            <Link to="/portfolio" className="mt-4 md:mt-0 text-sm text-primary hover:text-slate-900 dark:hover:text-white transition-colors flex items-center">
              View Full Portfolio <span className="material-icons text-base ml-1">arrow_right_alt</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.length > 0 ? (
              featuredProjects.slice(0, 3).map((project) => (
                <Link to={`/project/${project.id}`} key={project.id} className="group relative overflow-hidden rounded-lg cursor-pointer h-96 block">
                  <img
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out"
                    src={project.images?.[0] || "https://placehold.co/600x400"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p className="text-xs text-primary font-mono mb-1 uppercase">{project.category || "Architecture"}</p>
                    <h3 className="text-xl text-white font-serif mb-2">{project.title}</h3>
                    <p className="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                      {project.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
                // Fallback / Mock Projects if no data
                <>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer h-96">
                        <img alt="Modern glass residential building" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9dSFID6G6gTV6_3GvP-HEA-Vl_3h5jqT6FJ9ZX7X3NZl3pluQMWiz_snhymrk4WgmFTtku1ZjIz2fZlqp0bqFk3OKysu7p6IDoSk35m6a5WXI4Isz12a9D14Ai_p1pbtWOO_RyOue4W1S6RCXLTEG4Few93f4b6-k57zBAcBhxbR7kgBzDATt3Kp8wPT3H3c_awWpqhhFSVM1ZjV0zOiz9cYA5vSpUahIDI571CFA1cttA7UfCdV-spTXCvqVtmPdULJIMbdJqfY"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div class="absolute bottom-0 left-0 p-6 w-full">
                            <p class="text-xs text-primary font-mono mb-1">RESIDENTIAL</p>
                            <h3 class="text-xl text-white font-serif mb-2">The Glass Pavilion</h3>
                            <p class="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                                A study in transparency and seamless integration with the natural environment.
                            </p>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer h-96">
                        <img alt="Minimalist art gallery interior" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAKZLB4D0YUKUpvN0SOMxt73TKzhq8yTAFcFAPTNdsQK6zS9E8kjHMGH1O-feZSeBjhw5jHBOGfup33x3jwzsaM9oSkWwftIqTf6OplFo-bnBMNMafsYarVvna_D1W5erwoGaabrbBupaiOvihaFs2YcmgVgkn1-xxOpo_fTN_PdPfYaiTWP2DuTmNatxWGGUVgOv51TrNLk-YYvr0R5U7cH2eTTFU9Yd_RbMZ6v9KDoZi-YiJxvTyuNUlkUbXMeuJ7Gmyc0kMvi0"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div class="absolute bottom-0 left-0 p-6 w-full">
                            <p class="text-xs text-primary font-mono mb-1">CULTURAL</p>
                            <h3 class="text-xl text-white font-serif mb-2">Kyoto Art Center</h3>
                            <p class="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                                Revitalizing heritage through brutalist concrete interventions and light control.
                            </p>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-lg cursor-pointer h-96">
                        <img alt="Abstract skyscraper facade" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjeOog1pk8Yvh-mABM1FRWjDFw4KlpKs81HUISm1ceP01aE2BpS1oyHnna8JhzagRcQsyttgp7Gcw4lGCWfOe0PZC6hjn80RpFVyaZ80zXAvyiRkCDj5eaI2U0_lxOjf-bT27K-UgvjLS4TOzKq9lXj2vFKRQ1U2ikgMMNbGoNnD2YSVmtDGQZoETnjEm9yxvpL_dXcQ86tAlw2tETFca4hS8R3bYD99t4CGY84P-ZUrkcM4QBP6pMPxc1zB9TrIxe0t3mdFXOFl8"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div class="absolute bottom-0 left-0 p-6 w-full">
                            <p class="text-xs text-primary font-mono mb-1">CONCEPTUAL</p>
                            <h3 class="text-xl text-white font-serif mb-2">Vertical Horizon</h3>
                            <p class="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500">
                                Reimagining urban density with modular, sustainable skyscraper concepts.
                            </p>
                        </div>
                    </div>
                </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
