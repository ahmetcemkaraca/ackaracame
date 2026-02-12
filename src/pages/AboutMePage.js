import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Globe, GraduationCap } from 'lucide-react';

const AboutMePage = () => {
    
    const aboutMeData = {
        name: "S. Ahmet Cem Karaca",
        title: "Mimar | ackaraca.blog",
        bio: "Mimarlık eğitimim süresince edindiğim bilgi ve becerileri staj ve iş deneyimleriyle geliştirmek istiyorum. Kendimi farklı ölçeklerdeki mimari projelerde deneyimleyerek mesleki vizyonumu genişletmeyi hedefliyorum.",
        contact: {
          location: "Antalya/Kepez",
          email: "ahmcemkaraca@gmail.com",
          website: "https://ackaraca.me"
        },
        education: [
          {
            degree: 'Lisans, Mimarlık',
            institution: 'Akdeniz Üniversitesi',
            years: '2022 - 2026',
            desc: 'Mimari tasarım ve teknoloji odaklı eğitim.'
          },
          {
            degree: 'Lise',
            institution: 'Muratpaşa Türktelekom Anadolu Lisesi',
            years: '2015 - 2019',
            desc: 'Fen Bilimleri alanı.'
          }
        ],
        skills: {
            // Mapping for the progress bars in design
            tools: [
                { name: 'Revit', percentage: 80 },
                { name: 'AutoCAD', percentage: 60 },
                { name: 'Rhino 3D', percentage: 40 },
                { name: 'Twinmotion', percentage: 90 },
            ],
            others: ["Photoshop", "Unreal Engine", "React.js", "Python", "Firebase", "Node.js"]
        }
      };

    return (
        <main className="min-h-screen relative bg-background-light dark:bg-background-dark pt-20">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-5 pointer-events-none"></div>

            {/* Architectural Lines Decoration */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block max-w-7xl mx-auto px-6 border-x border-gray-200 dark:border-slate-800 opacity-30">
                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-200 dark:bg-slate-800"></div>
                <div className="absolute top-0 bottom-0 right-1/3 w-px bg-gray-200 dark:bg-slate-800"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10">
                {/* Header Section */}
                <header className="mb-16 lg:mb-24 lg:w-2/3">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white"
                    >
                        Form ve mekan yoluyla <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">anlatı kurmak.</span>
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

                {/* Split Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    {/* Left Column: Portrait & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="lg:col-span-5 relative group"
                    >
                        {/* Image Card */}
                        <div className="relative rounded-xl overflow-hidden aspect-[3/4] shadow-2xl shadow-black/20 border border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-surface-dark">
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent z-10"></div>
                            <img
                                alt="Portrait"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out transform group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2bMbrDkxRfXIPfZaU6itecr6bmRafgu6ouysMWGGBb7o8yjFcNEG8tHAbXDakEJFFCN0tufF1igodftzBCIj8DrIFB3RniqEKfFAq6FuE5JNNogvVkvyBAXNAmDapB13SJIuaFnssbh4qMU1UL8xPELSyHGeg3oPawrIu1ykOuBPyqh8leVeTA2bWVJhzdssCj0sExHbe7HD1npjBKn7P7BJEKjmYK7bK4MLtIECFEhLjojWhcNOewzd9Fb5EAuRiJQoZsWi7z1s"
                            />
                            {/* Overlay Text on Image */}
                            <div className="absolute bottom-6 left-6 z-20">
                                <div className="text-xs font-mono text-primary mb-1 uppercase tracking-widest">Status</div>
                                <div className="text-white font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    İş birliğine açık
                                </div>
                            </div>
                        </div>

                        {/* Location Badge */}
                        <div className="mt-6 p-4 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-md bg-primary/10 text-primary">
                                    <MapPin size={20} />
                                </span>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Konum</div>
                                    <div className="font-semibold text-slate-900 dark:text-white">{aboutMeData.contact.location}</div>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-md bg-primary/10 text-primary">
                                    <GraduationCap size={20} />
                                </span>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Okul</div>
                                    <div className="font-semibold text-slate-900 dark:text-white">Akdeniz Üni.</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Philosophy, Education, Skills */}
                    <div className="lg:col-span-7 space-y-12 lg:pl-8">
                        {/* Philosophy Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px bg-primary w-12"></div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">Felsefe</h2>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-loose text-lg font-light">
                                Mimarlık sadece barınmaktan ibaret değildir; toplumsal değerlerimizin fiziksel tezahürüdür. Yaklaşımım, çevreye saygılı yapılar tasarlarken modern işlevselliğin sınırlarını zorlayan <span className="text-primary font-normal">bağlamsal duyarlılığa</span> dayanmaktadır. Izgaranın hassasiyetine ve onu dolduran yaşamın organik kaosuna inanıyorum.
                            </p>
                        </motion.section>

                        <div className="w-full h-px bg-gray-200 dark:bg-slate-800"></div>

                        {/* Education Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-primary w-12"></div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">Eğitim</h2>
                            </div>
                            <div className="space-y-8 relative border-l border-gray-200 dark:border-slate-800 ml-3 pl-8 pb-2">
                                {aboutMeData.education.map((edu, idx) => (
                                    <div key={idx} className="relative">
                                        <span className={`absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-background-dark shadow-sm ${idx === 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
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

                        <div className="w-full h-px bg-gray-200 dark:bg-slate-800"></div>

                        {/* Skills & Toolset */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-primary w-12"></div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 dark:text-white">Dijital Araçlar</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Yazılımlar</h4>
                                    <div className="space-y-3">
                                        {aboutMeData.skills.tools.map((tool) => (
                                            <div key={tool.name}>
                                                <div className="flex justify-between text-sm mb-1 text-slate-700 dark:text-slate-300">
                                                    <span>{tool.name}</span>
                                                    <span className="text-primary font-mono">{tool.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${tool.percentage}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tag Cloud for others */}
                            <div className="mt-8 flex flex-wrap gap-2">
                                {aboutMeData.skills.others.map((skill) => (
                                    <span key={skill} className="px-3 py-1 bg-gray-200 dark:bg-surface-dark text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300 rounded border border-transparent hover:border-primary transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.section>

                        <div className="w-full h-px bg-gray-200 dark:bg-slate-800"></div>

                        {/* Action Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2"
                        >
                            <a href={`mailto:${aboutMeData.contact.email}`} className="flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 group">
                                <Mail className="w-5 h-5 group-hover:animate-bounce" />
                                <span className="font-medium tracking-wide">İletişime Geç</span>
                            </a>
                            <div className="flex items-center gap-4">
                                <a href={aboutMeData.contact.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all">
                                    <Globe size={18} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Quote Block */}
                <div className="bg-primary/5 border-t border-gray-200 dark:border-slate-800 mt-24 rounded-2xl">
                    <div className="px-6 py-12 text-center">
                        <blockquote className="text-xl md:text-2xl font-light italic text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            "Tanrı detaylarda gizlidir."
                        </blockquote>
                        <cite className="block mt-4 text-sm font-bold uppercase tracking-widest text-primary">— Ludwig Mies van der Rohe</cite>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AboutMePage;
