import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InspirationService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Moon, Sun, Filter, Bookmark, Maximize2 } from 'lucide-react';

const InspirationGalleryPage = () => {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setLoading(true);
        const allInspirations = await InspirationService.getAll();
        setInspirations(allInspirations.length > 0 ? allInspirations : []);
      } catch (error) {
        console.error("Error fetching inspirations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, []);

  const mockInspirations = [
    { id: 'm1', title: 'National Theatre Texture', category: 'Brutalism', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDotSVX6cINAeUum9HNiYmBFVca6sCjcNgDmsI_1D18ECuEuGfKNAxp7T04h6bCp1nlaG844ny4umsnMBqlmhNESgzdTNbtsw39eFhx9pW2-JzkR73FN9qUslBRSb-o5XGos9ESaQfKwfzP8ZB_vETQvBDpaTZBF3fhZtHEBsHnJPpT6nb0KU3bHIAY55tst1JaTWgU4zY3sjSrJmS5GBUh1NLcixR2B36s2yOiZHjTnvZHS1FG9zG1EwGXzKqVyXpOWYOb9u3_yiw' },
    { id: 'm2', title: 'Elevation Study', category: 'Sketches', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBayN3X5U_ynxO4s-L2Oq7ppE3js-LYpSitwYO6dC-I5KQ-26Si-w5LhB-PhW3oXOOXWOjpcV9w2SRrxyCxdnPhsjqJGOu9Xj0SX1K_jfJ5X8AodJWnkBP8O49gLHYfp1uk8m_cIj1nMtuOq-n0XZs2bwAvsi3cIVAG_DkP0b90DtHXg3N4SSDCp8Nv7yDMYRG9UTlegWa-Pcqwg55-CpBY32pKfihe8RUEILQWfD6eHPiQTx6ZxY3-iY6tulsWts011NB7IQOjLJM' },
    { id: 'm3', title: 'Fluid Forms', category: 'Parametric', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1HaQV_CSl_TTXM2WjizPAkLqgmAh0esh6Ty2iUDlFs8dsD-tlBA302_xVXMEhy6F42VIOpNrF6x0ub-Qvl_mmesRt8ApKAw3jrRQsb4vkvFhSbBmMy5Jyq0C4SzLfcPDD0EI812Y2N1tB5Qj7jBd1Vy-C3dJ8qO2Fedg-ELe_21sbnifUyq95KI24qFzYi4Gq3UJJknOki26zc2s6qpKc63P5tlUOVs4VbuHZA8VTFK8ZMQSYyfHzEbNwls6K-oMHu4GcJ5z2jfE' },
    { id: 'm4', title: 'Perforated Facade', category: 'Facades', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGxBUnzNt6xUJXOayD9Z5nxfMbtmKAjx1zmAX6uwuh1koAg9Juuv05KD7iaRKIQKyN6DLKHPm_E5l7kez89f900hYPPM_d7rRq3ZkhSnDgh1VgrV3FGObG42QARulh6G8y7AAFANMmhJUkR6HFuhcwlKVeGtBIey9-RGG2OsBa3ziEqDI-aTGPUz_emrjFX__VVRnEFTCsRKwZ-lt1ttBKPwXzPfiLZXqFLP0E6u5DoobfgyvINPro_XTXNvZWaNmZ_1AN-s40UP4' },
    { id: 'm5', title: 'Void Space', category: 'Interiors', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-iGpKDhtEno047q9Ousf5egHbj3knTnSsdFfxyqenADcfzcfQFFBuJIMvp7arueYjDZms5dQv9oneVPW9ib2hpciaznG18pK6QRahYxEr3tkmE_ypAiUK0x1joXMeHJ6t441eTZlURRNrqjwaSA-CqjuWfUw8AXV88xCuwkTu-36HH0txrFQG7MltRQugN18hONWg1yIdiKc_9s9-ZpTUjlSn46HHupZG6-PZaVeZ655TLTXYfnh2Qg_SsKeAe3DN86ODEiQy_nI' },
    { id: 'm6', title: 'Fibonacci Spiral', category: 'Structural Detail', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMceviS54ih80LDVO2c_15NFgvrChCNG0BfLWBZtr8Y5S7Kwh6jd0_Dgh8HY0B2tEpeWxmCh7enMyFg7oYmDH0r9wY13u0hdLr74zO6n7jofL3NPCqqVmxXQimBdrlirtRH5H2hvUpvSk8DyGoHu8xgN7jELu-AcjjyL0q_9gadNXupJvun-S_bpBT--rIhbqNc8lI3-PTpIXR7i88qx1WMQv1aJLQ8uulNR7HZ8Zw9BR8qR1JFfa67F4qb_dVS5cQggA3qCWyHOs' },
    { id: 'm7', title: 'Vertical Grid', category: 'Facades', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb5leFgbaUncDXJdMK7o5u6uygKXXn-T_mBpDRoR7Vw-8ZDuFmOCu6kJ_Dl48TtEPCy0lsqgwiMTN-e4Q26pNSLeDKneNmFUE_NhNMy9PLUQe-MbKldwjw0dW3O7DQ7iAomR315uSJAt6fPt5KRBoU1Nn-KiT9B-zozhJmJEFMvzgH983tpav36uAQX9_6wzqm4R4yYeZhu4kmDVycu2Pfxmug8q3tBBwAf-3NJ2ty18N_LK3daL4IgTXztu4l4tKzEA_kT7QNBSY' },
    { id: 'm8', title: 'Raw Formwork', category: 'Materiality', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj5rEhX8GjsVPYzBRem8cmOgHweYI-3D3RYxkFGMYqn5ZDiW1VQVaPdvs1XzwXjisvoWOZtpK66znXoLTuH70jzTv6ApmiNrnjB80Vvv0Z720uSQm09fTbTtukTDscD8x9ixjVjhKgJgcW1u-L2w9sJQp0k2wkI7be0X3AMR8WcgtU-qARYTfL1_JRZtY4WNO75EbKkt4P7a9u7N5m_85KwuQQDTYVxBL5xR0yzfGFGVQ8u1NLg8nxXpg8M6W1FtVSxEfQgJ_D35o' },
    { id: 'm9', title: 'Corner Detail', category: 'Minimalism', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWTuD-zg-9x3sV0o8oYmQzv6UzLdupznauaG4XY6RLq8H1LKwzSI5u6vPcVnzWFbowZdnhW4QY1BbACOKE0jZFAvDZIRlZ4H7A10OevxVaKDY2uVSJeIdYRNNlh1aOrDHO-E-RzTrnjoKFQXwEPAgF4Hi_Fu1iU_K5dkw0zbIN0TjROtcDclAy-2I3lwsI0Q4JHE0bQFmAmNj5lyZEDeisqycCrDtG7nmiKzuxcWtdSO6K7-2nDJ1W8CrDUYzbdczmUbuHIxwJeNk' }
  ];

  const itemsToDisplay = inspirations.length > 0 ? inspirations : mockInspirations;

  const filteredItems = filter === 'All' ? itemsToDisplay : itemsToDisplay.filter(item => item.category === filter);

  if (loading && inspirations.length === 0) {
    return <LoadingSpinner text="İlhamlar yükleniyor..." />;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased min-h-screen flex flex-col pt-20">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 w-full">
        {/* Page Header & Filters */}
        <section className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Görsel Atlas</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                Tasarım sürecimi şekillendiren formlar, dokular ve mekansal deneylerin küratörlü bir koleksiyonu.
              </p>
            </div>

            {/* Search (Desktop) */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-slate-400 text-lg" />
                </span>
                <input
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-surface-dark placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors text-slate-900 dark:text-white"
                    placeholder="Etikete göre filtrele..."
                    type="text"
                />
              </div>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
                onClick={() => setFilter('All')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${filter === 'All' ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'}`}
            >
              Tüm Çalışmalar
            </button>
            {['Brutalism', 'Parametric', 'Sketches', 'Facades', 'Interiors', 'Structural Detail', 'Materiality'].map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${filter === cat ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'}`}
                >
                    {cat}
                </button>
            ))}
          </div>
        </section>

        {/* Masonry Grid */}
        <div className="masonry-grid">
            {filteredItems.map(item => (
                <div key={item.id} className="masonry-item group relative break-inside-avoid">
                    <div className="relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                        <img
                            alt={item.title}
                            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                            src={item.imageUrl || item.image || '/placeholder.jpg'}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button className="p-2 bg-white/90 dark:bg-surface-dark/90 rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors shadow-lg backdrop-blur-sm">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                                <Link to={`/inspiration/${item.id}`} className="p-2 bg-white/90 dark:bg-surface-dark/90 rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors shadow-lg backdrop-blur-sm">
                                    <Maximize2 className="w-4 h-4" />
                                </Link>
                            </div>
                            <div>
                                <span className="inline-block px-2 py-1 bg-primary/90 text-white text-xs font-semibold rounded mb-1 backdrop-blur-sm uppercase">{item.category}</span>
                                <h3 className="text-white font-medium text-lg leading-tight">{item.title}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
            <div className="mt-12 flex justify-center w-full">
                <LoadingSpinner />
            </div>
        )}
      </main>
    </div>
  );
};

export default InspirationGalleryPage;
