import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Globe, Layers, Mail, MonitorSmartphone, Sparkles, Workflow } from 'lucide-react';

const AboutMePage = () => {
  const aboutMeData = {
    name: 'S. Ahmet Cem Karaca',
    title: 'Mimar | ackaraca.blog',
    bio: 'Mimarlik egitimim suresince edindigim bilgi ve becerileri staj ve is deneyimleriyle gelistirmek istiyorum. Kendimi farkli olceklerdeki mimari projelerde deneyimleyerek mesleki vizyonumu genisletmeyi hedefliyorum.',
    contact: {
      location: 'Antalya/Kepez',
      email: 'ahmcemkaraca@gmail.com',
      website: 'https://ackaraca.me'
    },
    education: [
      {
        degree: 'Lisans, Mimarlik',
        institution: 'Akdeniz Universitesi',
        years: '2022 - 2026',
        desc: 'Mimari tasarim ve teknoloji odakli egitim.'
      },
      {
        degree: 'Lise',
        institution: 'Muratpasa Turktelekom Anadolu Lisesi',
        years: '2015 - 2019',
        desc: 'Matematik-Fen alani.'
      }
    ],
    skills: {
      tools: [
        {
          name: 'Revit',
          summary: 'BIM mantigiyla duzenli model kurma, pafta mantigini disiplinli ilerletme ve studyo teslimlerini toparlama konusunda ana aracim.',
          strength: 'Proje omurgasi',
          icon: Layers
        },
        {
          name: 'Twinmotion',
          summary: 'Hizli atmosfer kurma, gunisigi ve malzeme testi yapma, fikirleri okunur bir sunuma donusturme tarafinda gunluk kullandigim gorsel motor.',
          strength: 'Sunum ve sahneleme',
          icon: Sparkles
        },
        {
          name: 'AutoCAD',
          summary: 'Detay duzenleme, teknik temizlik ve hizli cizim duzeltmeleri icin guvenilir bir altyapi olarak kullaniyorum.',
          strength: 'Teknik dokumantasyon',
          icon: Workflow
        },
        {
          name: 'Rhino 3D',
          summary: 'Daha serbest geometri ve kutle arastirmalarinda devreye aliyorum; kavramsal denemelerde esnek bir modelleme alani sagliyor.',
          strength: 'Bicim arastirmasi',
          icon: Compass
        }
      ],
      others: ['Photoshop', 'Unreal Engine', 'React.js', 'Python', 'Firebase', 'Node.js']
    }
  };

  return (
    <main className="min-h-screen relative bg-background-light dark:bg-background-dark pt-20">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none hidden lg:block max-w-7xl mx-auto px-6 border-x border-gray-200 dark:border-slate-800 opacity-30">
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-200 dark:bg-slate-800" />
        <div className="absolute top-0 bottom-0 right-1/3 w-px bg-gray-200 dark:bg-slate-800" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10">
        <header className="mb-16 lg:mb-24 lg:w-2/3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white"
          >
            Form ve mekan yoluyla <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">anlati kurmak.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            Merhaba, ben <span className="text-slate-900 dark:text-white font-semibold">{aboutMeData.name}</span>. {aboutMeData.bio}
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-8 lg:col-start-3 space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary w-12" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">Egitim</h2>
              </div>
              <div className="space-y-8 relative border-l border-gray-200 dark:border-slate-800 ml-3 pl-8 pb-2">
                {aboutMeData.education.map((edu, idx) => (
                  <div key={edu.degree} className="relative">
                    <span className={`absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-background-dark shadow-sm ${idx === 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{edu.years}</span>
                    </div>
                    <p className="text-primary font-medium mb-2">{edu.institution}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{edu.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary w-12" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">Dijital Araclar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aboutMeData.skills.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5 shadow-sm"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-transparent" />
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">Kullanim yeterliligi</p>
                          <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{tool.name}</h4>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                        {tool.summary}
                      </p>
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 px-4 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Odak</span>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                          <MonitorSmartphone className="w-4 h-4 text-primary" />
                          {tool.strength}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {aboutMeData.skills.others.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-200 dark:bg-surface-dark text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 rounded border border-transparent hover:border-primary transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.section>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2"
            >
              <a href={`mailto:${aboutMeData.contact.email}`} className="flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 group">
                <Mail className="w-5 h-5 group-hover:animate-bounce" />
                <span className="font-medium tracking-wide">Iletisime Gec</span>
              </a>
              <div className="flex items-center gap-4">
                <a href={aboutMeData.contact.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all">
                  <Globe size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutMePage;
