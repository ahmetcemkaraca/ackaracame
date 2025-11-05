import React from 'react';
import { Mail, Globe, Compass, Info } from 'lucide-react';

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
          },
          {
            degree: 'Lise',
            institution: 'Muratpaşa Türktelekom Anadolu Lisesi',
            years: '2015 - 2019',
          }
        ],
        experience: [
          {
            role: 'Stajyer Mimar (Ofis Stajı)',
            company: 'Betemu Mimarlık',
            duration: 'Temmuz 2025 – Eylül 2025',
            description: 'Mimar gözetiminde ofis ortamında mimari tasarım ve projelendirme süreçlerinin takip edilmesi. Avan proje taslaklarının hazırlanması, ruhsat projesi çizimlerinde görev alma, belediye–mimar ilişkilerinin gözlemlenmesi.',
          },
          {
            role: 'Stajyer Mimar (Şantiye Stajı)',
            company: 'Alperen Türkmen İnşaat',
            duration: 'Temmuz 2024 – Ağustos 2024',
            description: 'İnşaat mühendisi gözetiminde kaba ve ince yapı imalatlarının incelenmesi. Şantiyede aplikasyon, yapısal imalat, malzeme kullanımı ve iş programı süreçlerinin gözlemlenmesi.',
          },
          {
            role: 'Stajyer Mimar (Alan Araştırması Stajı)',
            company: 'Cenk Doğan Mimarlık',
            duration: 'Temmuz 2023 – Ağustos 2023',
            description: 'Birinci sınıfta edinilen mimarlık kavramlarının sahada incelenmesi ve raporlanması. Geleneksel ve çağdaş yapıların gözlemlenmesi, ölçümlendirilmesi ve mimari çizimlerle ilişkilendirilmesi.',
          },
          {
            role: 'Kurucu / CEO',
            company: 'ACKARACA LIMITED (UK)',
            duration: 'Aralık 2022 - Devam',
            description: 'Perakende Satış, Yazılım Geliştirme ve Mimari Çizim alanlarında faaliyet gösteren şirketin yönetimi.',
          }
        ],
        skills: {
            architecturalSoftware: [
                { name: 'AutoCAD', speed: 6, proficiency: 6 },
                { name: 'Revit', speed: 7, proficiency: 8 },
                { name: 'ArchiCAD', speed: 5, proficiency: 4 },
                { name: 'Photoshop', speed: 4, proficiency: 6 },
                { name: 'Twinmotion', speed: 9, proficiency: 10 },
                { name: 'Lumion', speed: 6, proficiency: 6 },
                { name: 'QGIS', speed: 4, proficiency: 3 },
                { name: 'Office365 Programları', proficiencyText: "İleri Seviye (2009'dan beri)" }
            ],
            programming: [
                { name: 'Unreal Engine', speed: 6, proficiency: 2, proficiencyText: "Blueprint (Orta), C++ (Temel)" },
                { name: 'Visual Studio Code', proficiencyText: "Aktif Kullanıcı" },
                { name: 'Cursor', proficiencyText: "Aktif Kullanıcı" },
                { name: 'Python', proficiencyText: 'Temel Seviye' },
                { name: 'JavaScript', proficiencyText: 'Temel Seviye' },
                { name: 'React.js', proficiencyText: 'Temel Seviye' },
                { name: 'Node.js', proficiencyText: 'Temel Seviye' },
                { name: 'HTML & CSS', proficiencyText: 'Temel Seviye' },
                { name: 'C#', proficiencyText: 'Temel Seviye' },
                { name: 'C++', proficiencyText: 'Temel Seviye' },
                { name: 'SQL', proficiencyText: 'Temel Seviye' },
                { name: 'Firebase', proficiencyText: 'Orta Seviye' },
                { name: 'Google Cloud', proficiencyText: 'Temel-Orta Seviye' },
            ],
            languages: [
                { name: 'Türkçe', proficiencyText: 'Ana Dil' },
                { name: 'İngilizce', proficiencyText: 'B1-B2' }
            ],
        },
        competencies: [
            "Yeni bilgileri hızla öğrenme ve kısa sürede uyum sağlama.",
            "Takım çalışmasına yatkınlık ve disiplinli çalışma.",
            "Liderlik ve proje yönetimi (MOLA Kuruculuğu, ACKaraca Limited Yönetimi).",
            "Disiplinler arası işbirliği ve mesleki ağ oluşturma."
        ]
      };

    return (
        <main className="flex flex-col gap-10 sm:gap-16 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="flex w-full flex-col gap-6 @container md:flex-row md:items-center">
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <img 
                        src="/logo.svg" 
                        alt="AK Logo" 
                        className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex flex-col gap-4 text-center md:text-left">
                    <h1 className="text-text-light dark:text-text-dark text-4xl font-bold leading-tight tracking-tighter">{aboutMeData.name}</h1>
                    <div className="text-muted-light dark:text-muted-dark text-lg font-semibold">
                        <p>Mimar | <a href="https://ackaraca.me" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">ackaraca.me</a></p>
                    </div>
                    <p className="text-muted-light dark:text-muted-dark text-base font-normal leading-relaxed max-w-xl">
                        {aboutMeData.bio}
                    </p>
                    <div className="flex w-full items-center justify-center md:justify-start gap-3 pt-2">
                        <a href={`mailto:${aboutMeData.contact.email}`} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors">
                            <span className="truncate">İletişime Geç</span>
                        </a>
                        <a href={aboutMeData.contact.website} target="_blank" rel="noopener noreferrer" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="truncate">Web Sitesi</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Education & Experience */}
                <div className="lg:col-span-2 flex flex-col gap-10">
                    {/* Experience Section */}
                    <div>
                        <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Deneyim</h2>
                        <div className="relative">
                            <div className="absolute left-3 top-0 h-full w-0.5 bg-border-light dark:bg-border-dark"></div>
                            {aboutMeData.experience.map((item, index) => (
                                <div key={index} className="pl-10 pb-8 relative">
                                    <div className="absolute left-0 top-0 -ml-1.5 mt-0.5 w-4 h-4 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
                                    <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">{item.role}</p>
                                    <p className="text-muted-light dark:text-muted-dark text-sm font-normal leading-normal">{item.company}, {item.duration}</p>
                                    <p className="text-muted-light dark:text-muted-dark text-sm font-normal leading-relaxed mt-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div>
                        <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Eğitim</h2>
                        <div className="relative">
                            <div className="absolute left-3 top-0 h-full w-0.5 bg-border-light dark:bg-border-dark"></div>
                            {aboutMeData.education.map((item, index) => (
                                <div key={index} className="pl-10 pb-8 relative">
                                    <div className="absolute left-0 top-0 -ml-1.5 mt-0.5 w-4 h-4 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
                                    <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">{item.degree}</p>
                                    <p className="text-muted-light dark:text-muted-dark text-sm font-normal leading-normal">{item.institution}, {item.years}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Skills & Info */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">Yetenekler</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-light dark:text-muted-dark animate-pulse">
                                <Info size={14} />
                                <span>Detaylar için üzerine gelin</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-light dark:text-muted-dark mb-2">Mimari Yazılımlar</h4>
                                <div className="flex flex-wrap gap-2">
                                    {aboutMeData.skills.architecturalSoftware.map(skill => (
                                        <div key={skill.name} className="relative group">
                                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full cursor-pointer">{skill.name}</span>
                                            <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-3 z-10 whitespace-nowrap">
                                                {skill.proficiencyText ? (
                                                    skill.proficiencyText
                                                ) : (
                                                    <>
                                                        <span>Hız: {skill.speed}/10</span>, <span>Yetkinlik: {skill.proficiency}/10</span>
                                                    </>
                                                )}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-muted-light dark:text-muted-dark mb-2">Programlama & Geliştirme</h4>
                                <div className="flex flex-wrap gap-2">
                                    {aboutMeData.skills.programming.map(skill => (
                                       <div key={skill.name} className="relative group">
                                            <span className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded-full cursor-pointer">{skill.name}</span>
                                            <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-3 z-10 whitespace-nowrap">
                                                {skill.proficiencyText ? (
                                                    skill.proficiencyText
                                                ) : (
                                                    <>
                                                        <span>Hız: {skill.speed}/10</span>, <span>Yetkinlik: {skill.proficiency}/10</span>
                                                    </>
                                                )}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-muted-light dark:text-muted-dark mb-2">Diller</h4>
                                <div className="flex flex-wrap gap-2">
                                    {aboutMeData.skills.languages.map(skill => (
                                        <div key={skill.name} className="relative group">
                                            <span className="px-3 py-1 text-sm bg-green-500/10 text-green-500 rounded-full cursor-pointer">{skill.name}</span>
                                             <div className="absolute bottom-full mb-2 w-max left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-3 z-10 whitespace-nowrap">
                                                {skill.proficiencyText}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Yetkinlikler</h3>
                        <ul className="space-y-3 text-sm text-muted-light dark:text-muted-dark list-disc list-inside">
                            {aboutMeData.competencies.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">İletişim</h3>
                        <ul className="space-y-3 text-sm text-muted-light dark:text-muted-dark">
                            <li className="flex items-center gap-3"><Compass size={18} /><span>{aboutMeData.contact.location}</span></li>
                            <li className="flex items-center gap-3"><Mail size={18} /><a className="hover:text-primary" href={`mailto:${aboutMeData.contact.email}`}>{aboutMeData.contact.email}</a></li>
                            <li className="flex items-center gap-3"><Globe size={18} /><a className="hover:text-primary" href={aboutMeData.contact.website} target="_blank" rel="noopener noreferrer">{aboutMeData.contact.website.replace('https://', '')}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AboutMePage;

