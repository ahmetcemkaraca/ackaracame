import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, ArrowRight, BookOpen, GraduationCap, Map, School } from 'lucide-react';

const SemesterProjectsPage = () => {
  const { paftas, loadPaftas, loading } = useProject();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (paftas.length === 0) {
      loadPaftas();
    }
  }, [paftas, loadPaftas]);

  // Mock data structure to match Screen 9 design if no real data
  const mockProjects = {
    'Year 5': [
      {
        id: 'thesis-1',
        title: 'The Urban Bio-Filter',
        category: 'Thesis Studio',
        code: 'ARC 501',
        instructor: 'Prof. Sarah Jenks',
        description: 'A proposal for a metabolic architecture that integrates algae filtration systems within the building façade to purify urban air while providing public green space in downtown Seattle.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtS-LltYJo9-ZMpJrpVoD3GexenGoKnApEX9AdrI5MSlp2mmB-GdgP86BQD9hz23LLRmavpfup2_076Wvwi0Ih1Nq4yNmrB22mK4rgBod8eGd5UlbaK8ekMZqLfJtat0VtVwCt2Ul2gf8XtHZky_M-m_eztZPCk_UF6myVvf68paA-F3F4Yf5ZOa1jMMj3x9i06nfyec4vzKatA2IRfUikyzMVhSQYo1iN6RYlqjzQ4KSUow7ymNbz8weghXSLYgK9TeLQkwsKKFk',
        isFeatured: true
      },
      {
        id: 'research-1',
        title: 'Mycelium Composites',
        category: 'Research Seminar',
        code: 'ARC 512',
        instructor: 'Dr. Alan Moore',
        description: 'Detailed material research exploring the structural viability of mycelium-based bricks for temporary disaster relief housing structures. Includes 1:1 prototype testing results.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-21OwabQdVZ5IPx_A2L77RqylF-H0vPvtzImqRufnmDFzI4H7TCfjf1aZQNkdGZTamtClunH2kPcAqZRBQfjzGdltxffd_LrbwJL_yc3SDLwDmZTHUHSo-MakqNIII2Y0MUvbSne9aRusx5mN04Xfh085JEz0uchNQtIxE5nWxJT-_dVsJgza7xSzUW0OKaIyUdBe57NPllIMAFd3hoK_2DJ2wn7LvNWUZOwXVgA4UK0MeqStj4FtJvmOpH5qNYKRteDg1BL1lHU',
        isFeatured: false
      }
    ],
    'Year 4': [
        {
            id: 'housing-1',
            title: 'Intergenerational Living',
            category: 'Housing Studio',
            code: 'ARC 402',
            instructor: 'Instr. David Liu',
            description: 'A high-density housing complex in Vancouver designed to foster community interaction between seniors and young families through shared circulation cores and vertical gardens.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCv2f4pt4yRDcAqkVtlPDS7o8gV1l6gpa8G0PiXxiJkzrcF-j3Qgg2-7xmw9W5jcPlA4yywDEZzxALIyzRMWnY_n7RlKR4F2QeRDyTYd7jFeMShuBN9GkYgnAFrCBl1TAiebRWBbS9OnrBV6p4iYZzm0lj7S7z8qTVxwwqNdso-5xWtreVm17RI0yCGOaxd3KUN-a8KC6Wo6ON0je-88RJhINTaoP5DlkYzjw-GD3WNDXxr9KJ2mRKfqGzRY_5MX-DdoTECtuJTqM',
            isFeatured: false
        },
        {
            id: 'adaptive-1',
            title: 'The Foundry Arts Center',
            category: 'Adaptive Reuse',
            code: 'ARC 401',
            instructor: 'Instr. Maria Gonzalez',
            description: 'Transforming a derelict 1920s steel mill into a contemporary performing arts center. The intervention preserves the industrial patina while inserting acoustically isolated timber volumes.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEe0CQj05arNhR_-qtAtZMZzXMv44qtA-IDSyL_IcH5kKCxdpak0d-p9dodh79fttBy6sG9nZ7bBuu2ONCOcXp2mok70f0TbHlV0hjr7JZdX3k0wRHu-ds0hksqeAtRR73FgVRfIror3zo-8B5hIVeYoktCs14bFEVKHocUWqZoB1pbWoqFEuMYt_DbtCf4c9zj1Fael1jCbhRWsI-fFxyA5NaTbQspds6pHYFRHlK8C-8WEA6a2FFwZ7dE91az3yrvHCEy85vOJY',
            isFeatured: false
        },
        {
            id: 'urban-1',
            title: 'Waterfront Masterplan',
            category: 'Urban Planning',
            code: 'ARC 450',
            instructor: 'Prof. James Wu',
            description: 'A comprehensive 20-year masterplan for the revitalization of the Eastern Waterfront, focusing on flood resilience, public transit connectivity, and mixed-income density.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfmUpSiwVHQdbLfWixcOwr0d9PHrXsObKauOraR1IMG05eZDWpl7CVZNKLNzX1m-PxTxYPutFvJ8-BKcyQKrHZeVZAahMjgGn6HQ04t9lwgxMVmJ_Q5eHOreNhbmL0utL03vrQTn-_zjf5NPudQTDcIx2vUzi3bJ_gmGjvi4WPw7cZwOxTidgttHexIOYGEoucGYxzJl3H1L96U5x7-i_JeqxydZ8ANaVE-1VNYkZGoz_7fJbSfv-gHHd_OrdNdLc7bYrYrDPYuIA',
            isFeatured: false,
            isGroup: true
        }
    ]
  };

  // Group real paftas by Year if available, otherwise use mock
  // Logic to group paftas by year property
  const projectGroups = paftas.length > 0 ? paftas.reduce((acc, pafta) => {
      const yearKey = `Year ${pafta.year || '?'}`;
      if (!acc[yearKey]) acc[yearKey] = [];
      acc[yearKey].push(pafta);
      return acc;
  }, {}) : mockProjects;

  if (loading && paftas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <LoadingSpinner text="Projeler yükleniyor..." />
      </div>
    );
  }

  const sections = Object.keys(projectGroups).sort().reverse();

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-lexend min-h-screen flex flex-col pt-20">

      {/* Header Section */}
      <header className="relative pt-12 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5 bg-[radial-gradient(#197fe6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-sm text-primary font-medium mb-4">
              <Link to="/">Home</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span>Academic Work</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Semester Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              5 yıllık Mimarlık Lisans programım boyunca geliştirilen stüdyo çalışmaları, teknik çizimler ve tasarım keşiflerinin kronolojik bir arşivi.
            </p>
          </div>

          {/* Filters */}
          <div className="mt-12 flex flex-wrap gap-3">
            <button
                onClick={() => setFilter('All')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105 ${filter === 'All' ? 'bg-primary text-white shadow-primary/25' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
              All Projects
            </button>
            {sections.map(year => (
                <button
                    key={year}
                    onClick={() => setFilter(year)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 ${filter === year ? 'bg-primary text-white shadow-primary/25' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 hover:text-primary'}`}
                >
                    {year}
                </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {sections.map(year => {
            if (filter !== 'All' && filter !== year) return null;

            return (
                <section key={year} className="relative">
                    {/* Timeline Connector */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden xl:block -ml-8"></div>

                    <div className="flex items-center justify-between mb-10 group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 xl:-ml-[52px] z-10 bg-background-light dark:bg-background-dark">
                                <span className="font-bold text-sm">Y{year.replace('Year ', '')}</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{year}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Academic Year</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projectGroups[year].map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
                                        <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700">
                                            {project.category || 'Studio'}
                                        </span>
                                        {project.isGroup && (
                                            <span className="bg-primary/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded text-white border border-primary">
                                                Group
                                            </span>
                                        )}
                                    </div>
                                    <Link to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}>
                                        <img
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            src={project.image || project.images?.[0] || '/placeholder.jpg'}
                                        />
                                    </Link>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <School className="w-3 h-3 text-primary" /> {project.code || 'ARC'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" /> {project.instructor || 'Staff'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                        <Link to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}>
                                            {project.title}
                                        </Link>
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3">
                                        {project.description}
                                    </p>
                                    <Link
                                        to={project.qrCodeData ? `/pafta/${project.qrCodeData}` : `/project/${project.id}`}
                                        className="inline-flex items-center text-sm font-semibold text-primary hover:text-blue-600 transition-colors"
                                    >
                                        Görüntüle <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            );
          })}

        </div>
      </main>
    </div>
  );
};

export default SemesterProjectsPage;
