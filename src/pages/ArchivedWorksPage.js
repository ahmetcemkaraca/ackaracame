import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArchivedWorksPage = () => {
  // Mock data representing the chronological archive
  const archiveData = [
    {
      year: '22',
      title: 'Senior Year & Thesis Prep',
      items: [
        {
          id: '1',
          title: 'Urban Infill Study: void/SOLID',
          type: 'Academic',
          season: 'Spring 2022',
          description: 'An exploration of negative space in dense urban environments. This project focuses on utilizing leftover alleyways in downtown Chicago to create modular micro-housing units.',
          tools: ['Rhino 7', 'V-Ray', 'Illustrator'],
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4Qu1-Q09MSPD9CjvoqFLN_hitCIdDVQRctuAPE1qtAsZy4XHwu9P9flkavVDTgGRu2GU5f3JuMVWuZCWJuapcxn0SOw44Q3zUAnmiomABVy38B_cdZJxAsrAPeI4Re4NzVrxyxigydTV404J47ny_jWCL2RvZrKPMw0_FEv5Mi8vrnWxZJMv67DuW4p3PA4z79e9Lc2mXwUbJ2BXB7lN3-ZaSodw7Hv9t9jXTsqFOnH3kW_OfE3bo5wOx6ZbWHTi2XIbCrV_ClWo'
        },
        {
          id: '2',
          title: 'The Hangar Library',
          type: 'Competition',
          season: 'Winter 2022',
          description: 'Finalist entry for the generic Adaptive Reuse competition. Transforming a decommissioned aircraft hangar into a public library and digital archive center using lightweight timber framing.',
          tools: ['Revit', 'Photoshop'],
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Rdka41N8NkHTqAdo-AiMhIZJP1Bsaemu4g8kcWCOSfYE06_B77Dy5w8AOBhlLSrv-ggP-B_XFYwS2uGEm7ro1I0YfT8EafWuLtOlK7-SDBk-_-gP8PJbVvlB_p5PKj5e2hlekbByabrl-_XQaTM1tvxM0sNhCawqymahO352Y6Xo08jNfYjCzeD2p8Q5D62r8FO4oCIJGtDasEgYmAZCSb93kbnD2v7xA65KTcSjR9MKeoLPeGxlHnKROCKnPALDtnBUvj2j4x8',
          typeColor: 'text-emerald-500 bg-emerald-500/10'
        }
      ]
    },
    {
      year: '21',
      title: 'Junior Studio & Experiments',
      items: [
        {
          id: '3',
          title: 'Vertical Farms: Structure Study',
          type: 'Academic',
          season: 'Fall 2021',
          description: 'A structural analysis project focusing on hydroponic systems integration within high-rise structural grids. Investigated water load distribution and natural light penetration.',
          tools: ['Grasshopper', 'Rhino'],
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtaGlBmtIky7GOahgpV6a8rsQlElm2VOywZ2AlOfKnYv-FLdvv0nviK_LcpVuv7Hd1eFfOZdn6yHckshRyyUE7KeGfPoMnnyQ62fD4yPKC3nHqw-1rjNCe1LRRaXvkBHyS20cyfxEj2rwwhMAgwrTBs_d6tuH5l66L1Q0BQ4NQon4DGAv4lpaPg2rFw4cHl948KhifpzOU_fQQjo8Rmmgcp3bFgg4W5ZDKkYuNEpmFvg367q6Ew8veT6GCJRvwzrvGb_sUEBAVJJw'
        },
        {
          id: '4',
          title: 'Parametric Bench Series',
          type: 'Personal',
          season: 'Summer 2021',
          description: 'Self-initiated exploration into CNC fabrication techniques. Designed a series of interlocking plywood benches using algorithmic generation.',
          tools: ['CNC', 'Fabrication'],
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfsAQu5We6zuNHIlfNzuV7aEEIUb1qbGyJb2aL-b26R753F07OFRUiKRCJ5JozJHhiYKxuTW4bP9YiCpOCGvIFPmr3TMLl7BDm7jWtEs470XLxn1c9vsQq47jsWh5zZe5zeXvL4NBMGU1PMJ-x4dY2jKmAeVcRfTG9clwyrXPsQunwanv67ep4UAsHz5mYnlR_Q0AzUQguLgtT8ZrQyio8kWcLlr7sqxHu_r3CxWm7nv7XAq162q5BKDkbco9zbYG-icMc6PaMlME',
          typeColor: 'text-purple-400 bg-purple-400/10'
        }
      ]
    },
    {
      year: '20',
      title: 'Sophomore Year',
      opacity: 'opacity-75',
      items: [
        {
          id: '5',
          title: 'Form & Massing: The Cube',
          type: 'Academic',
          season: 'Fall 2020',
          description: 'Foundational study on subtractive boolean operations. Created a complex interior spatial experience starting from a solid 10x10m cube.',
          tools: ['Physical Model', 'SketchUp'],
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmnXBgdgfK4Ssp8rdfB2hu72KNmLY6kyluTemmdP4LT5XfXBK1QBR0w6Op_Nhzbwt4tHEKMwwXCmM9EFBMsVO2KergfLUIVGIPQap37N2FF5fqIOjyoIkeSxGjIn3JFfnxIDYyhdoKzwYZzQkshORRypY50YUO8otg8K7PPNbkSoLt3pPw9KSJmZCJh5zwIqk3mjd3eAIeEDJeJrOYXGZSBmuJwbDWbhrkcFa0Uu7ks6dARzjEbC3lwFt_1GMtkRnDI7MUWhsM-Go'
        }
      ]
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col pt-20">

      {/* Main Content */}
      <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <header className="mb-12">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Main Portfolio
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Archived Works</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                A chronological collection of academic exercises, early explorations, and competition entries from 2020 to 2022.
              </p>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors">
                  <span>Year: All</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:border-primary dark:hover:border-primary transition-colors">
                  <span>Type: All</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Archive List Container */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-8 md:pl-12 space-y-10">

          {archiveData.map((yearGroup, yearIndex) => (
            <div key={yearGroup.year} className={`relative ${yearIndex > 0 ? 'pt-8' : ''} ${yearGroup.opacity || ''}`}>
              <span className={`absolute -left-10 md:-left-[3.75rem] ${yearIndex > 0 ? 'top-8' : 'top-0'} flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-surface-dark border-2 border-white dark:border-background-dark text-xs font-bold text-slate-500`}>
                '{yearGroup.year}
              </span>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 mt-1">{yearGroup.title}</h3>
              <div className="space-y-4">
                {yearGroup.items.map((item) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group relative bg-white dark:bg-surface-dark rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border border-transparent hover:border-primary/30"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Thumbnail */}
                      <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        <img
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                          src={item.image}
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.typeColor || 'text-primary bg-primary/10'}`}>{item.type}</span>
                              <span className="text-xs text-slate-500">{item.season}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h2>
                          </div>
                          <a href="#" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-background-dark text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5" />
                          </a>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono">
                          {item.tools.map((tool, i) => (
                            <React.Fragment key={tool}>
                              <span>{tool}</span>
                              {i < item.tools.length - 1 && <span className="w-1 h-1 bg-slate-700 rounded-full"></span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          <div className="pt-8 pb-12 flex justify-center">
            <button className="px-8 py-3 bg-slate-200 dark:bg-surface-dark text-slate-600 dark:text-slate-300 rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-sm font-medium">
              Load Older Projects (2019)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchivedWorksPage;
