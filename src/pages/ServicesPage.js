import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Box, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col pt-20">

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="absolute right-10 top-20 w-64 h-64 border border-primary/10 rounded-full opacity-50 pointer-events-none"></div>
        <div className="absolute left-10 bottom-20 w-32 h-32 border border-primary/10 rounded-full opacity-50 pointer-events-none"></div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10 animate-fade-in-up">
          <h2 className="text-primary font-medium tracking-widest text-sm uppercase mb-3">Professional Offerings</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Küratörlü Mimari Hizmetler</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            Teknik hassasiyeti yaratıcı vizyonla birleştirerek. Titiz detaylarla mekansal kavramları gerçeğe dönüştürmek için tasarlanmış kapsamlı bir tasarım hizmetleri paketi sunuyorum.
          </p>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative z-10">

          {/* Service Card 1: Architectural Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Ruler className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Mimari Tasarım</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              İlk eskizlerden detaylı mekansal planlamaya kadar, işlevsellik ve estetiğe odaklanan kapsamlı tasarım çözümleri.
            </p>
            <div className="space-y-3 mb-8 flex-grow">
              {['Kavramsal Çizim', 'Detaylı Kat Planları', 'Saha Analizi', 'Sürdürülebilir Entegrasyon'].map(item => (
                <div key={item} className="flex items-start">
                  <span className="material-icons text-primary text-sm mt-1 mr-3">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/contact" className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white">
              Teklif İste
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>

          {/* Service Card 2: 3D Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Box className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">3D Görselleştirme</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Nihai yapılı çevreyi görselleştirmeye yardımcı olmak için yüksek kaliteli render ve sürükleyici deneyimlerle tasarımları hayata geçirmek.
            </p>
            <div className="space-y-3 mb-8 flex-grow">
              {['Fotogerçekçi Render', '3D Gezintiler', 'Işık & Gölge Çalışmaları', 'VR Entegrasyonu'].map(item => (
                <div key={item} className="flex items-start">
                  <span className="material-icons text-primary text-sm mt-1 mr-3">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/contact" className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white">
              Teklif İste
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>

          {/* Service Card 3: Technical Consulting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <FileText className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Teknik Danışmanlık</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Detaylı teknik dokümantasyon ve malzeme uzmanlığı ile yapısal bütünlük ve mevzuata uygunluk sağlama.
            </p>
            <div className="space-y-3 mb-8 flex-grow">
              {['Ruhsat Dokümantasyonu', 'Uygulama Detayları', 'Malzeme Seçimi', 'Yönetmelik Uyumu'].map(item => (
                <div key={item} className="flex items-start">
                  <span className="material-icons text-primary text-sm mt-1 mr-3">check_circle</span>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/contact" className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white">
              Teklif İste
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>

        </div>
      </main>

      {/* Footer / CTA Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Aklınızda özel bir proje mi var?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-light">
            İhtiyaçlarınız yukarıdaki kategorilere uymuyorsa, özel işbirlikleri ve benzersiz mimari zorlukları tartışmaya her zaman açığım.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25">
              İletişime Geç
            </Link>
            <Link to="/portfolio" className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Portfolyoyu İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
