import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Monitor, Code, ExternalLink, ArrowRight } from 'lucide-react';

const ApplicationsPage = () => {
  const applications = [
    {
      id: 'archbuilder',
      title: 'archbuilder.app',
      version: 'v1.0.0 • Live',
      type: 'Web Platform',
      icon: Monitor,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_QN1cSX2TJHhACvP9TlR-Y5z71qq6T0Tkkd_NhKThY3x425CNeByqONALGvVy1seuOaLemgcvKJPjeI5MgVLZViQfsMZCF15O8BLZSx8uoyY2w2NBlNZNFUJwVmXDhPLd-dCiSv4ZXe4e5vMzL2cUgr-0Ep-V7USp9gEnkXf6b8HwE5BxIsUJO-vrXpxEj28p2ZcciCb5txkU_Lc0txcyvr2ImEUWb9UrK5Hgi4HCH-P375cnz4N2aLDKfuzogq_n7j4v9UwcnZE', // Using mock image for now
      description: 'Yapay zeka destekli bir mimari proje geliştirme platformudur. Kullanıcılar, chatbot aracılığıyla adım adım sorulara cevap vererek tam kapsamlı mimari projeler oluşturabilir.',
      techStack: [
        { name: 'React', color: 'bg-cyan-400' },
        { name: 'OpenAI API', color: 'bg-green-500' },
        { name: 'Node.js', color: 'bg-yellow-400' }
      ],
      link: 'https://archbuilder.app',
      linkText: 'Uygulamaya Git'
    },
    {
      id: 'duaapp',
      title: 'DuaAPP',
      version: 'v2.1.0 • Mobile',
      type: 'iOS / Android',
      icon: Smartphone,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm9QO26dM66V2MT2vvrmGaY0RD7F4FrqLOV4LdkFLxsRFwTkt9xxuS2BzTdfQJsLtH0zntH6q_HwbhRy25B_3NxMOJsFkdE5TgJovbyFZfnyjlBhL_DdDSH0yF3D_SMngixZWEypsj3HQM2lAg-TvSEX2Bm2CMbGN6EuX9E4RIAYN9nlGou0NfxAU0LDOJy0cWPZwN-fo8whIXH__Trm3MAmSoR4GQoDIoaZgVFZkgDeNNUGOfdjbrxB7Ikdit2bf_LpQHWRVcIzw',
      description: 'Manevi pratikler ve günlük dualar üzerine odaklanmış bir mobil uygulama. Küratörlü dua koleksiyonları, çok dilli çeviriler, yapay zeka destekli rehberlik ve topluluk özellikleri sunar.',
      techStack: [
        { name: 'React Native', color: 'bg-blue-500' },
        { name: 'Firebase', color: 'bg-orange-500' },
        { name: 'AI Integration', color: 'bg-purple-500' }
      ],
      link: '/dua/privacy', // Internal link for details/privacy for now or app store link
      linkText: 'Detaylar & Gizlilik'
    },
    {
      id: 'peakactivity',
      title: 'PeakActivity',
      version: 'Development',
      type: 'Web Tool',
      icon: Code,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApdmBCGu-xWO1Cjt8Ktz9ocz3gp_pF5WmSIgafcHXy-A1ZS5Ew5dmhLnXMPcmNMklxRREauq-Bp9uEi3tMKDm6vrDkGMavwu1kvYbdig6IjtI_Wozh2LBF5WznXTldP9j3OJ9a0lNrBCMK0MlhLtU7TmOHlJxg76Fd39M8D5cmeQzHoRB3R6zIBaRdr-YkioZQ_rEGeG_gxV2u53hdIj0utXZSI2iKFo650jcgCAs0d_vb1EEE8Pi8vc8zAcpFDvfKw3RCGDpGL84',
      description: 'Verimlilik ve aktivite takibi üzerine geliştirilmekte olan yeni nesil bir web aracı. Detaylar yakında eklenecek.',
      techStack: [
        { name: 'Next.js', color: 'bg-white' },
        { name: 'Tailwind', color: 'bg-cyan-300' }
      ],
      link: '#',
      linkText: 'Yakında'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-neutral-800 dark:text-neutral-200 antialiased min-h-screen flex flex-col transition-colors duration-300 pt-20">

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#197fe6_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wide mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Yazılım Portfolyosu
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6"
          >
            Fiziksel Mekan ile <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Dijital Arayüzler Arasında</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10"
          >
            Mimari problemleri çözmek ve tasarım iş akışlarını kolaylaştırmak için geliştirilmiş özel araçlar, mobil uygulamalar ve web platformları koleksiyonu.
          </motion.p>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 md:gap-4"
          >
            <button className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark transition-all">
                Tüm Projeler
            </button>
            <button className="group px-5 py-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary/50 hover:text-primary dark:hover:text-primary text-sm font-medium transition-all flex items-center gap-2">
                <Smartphone className="w-4 h-4 group-hover:text-primary" /> iOS / Android
            </button>
            <button className="group px-5 py-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary/50 hover:text-primary dark:hover:text-primary text-sm font-medium transition-all flex items-center gap-2">
                <Globe className="w-4 h-4 group-hover:text-primary" /> Web Apps
            </button>
          </motion.div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-grow relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {applications.map((app, index) => {
            const Icon = app.icon;
            return (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="group relative flex flex-col h-full bg-white dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* App Header Image */}
                <div className="h-40 w-full overflow-hidden bg-neutral-900 relative">
                  <img
                    alt={app.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    src={app.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-800/90 to-transparent"></div>
                  {/* App Icon */}
                  <div className="absolute bottom-4 left-6">
                    <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-700 shadow-lg flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-colors">
                      <div className="absolute inset-0 bg-primary/10"></div>
                      <Icon className="text-primary w-8 h-8" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 pt-2 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{app.title}</h3>
                      <p className="text-xs font-medium text-primary mt-0.5">{app.version}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {app.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed flex-grow">
                    {app.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500 font-semibold mb-2">Teknolojiler</p>
                    <div className="flex flex-wrap gap-2">
                      {app.techStack.map((tech, i) => (
                        <span key={i} className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/50 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${tech.color}`}></span> {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={app.link}
                    target={app.link.startsWith('http') ? "_blank" : "_self"}
                    rel="noreferrer"
                    className="inline-flex justify-center items-center w-full px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors group-hover:shadow-lg group-hover:shadow-primary/20"
                  >
                    {app.linkText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </motion.article>
            );
          })}

          {/* Card: Coming Soon */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="group relative flex flex-col h-full bg-white/50 dark:bg-neutral-800/20 backdrop-blur-sm border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 items-center justify-center text-center p-8"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-700/50 flex items-center justify-center text-neutral-400">
              <Code className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Yeni Proje</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
               Python kullanarak Rhino 7 için parametrik tasarım eklentisi üzerinde çalışıyorum.
            </p>
          </motion.article>
        </div>
      </main>
    </div>
  );
};

export default ApplicationsPage;
