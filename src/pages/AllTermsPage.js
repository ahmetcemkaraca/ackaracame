import React from 'react';
import { Link } from 'react-router-dom';

const termsLinks = [
  {
    name: 'ACKaraca.me',
    description: 'Bu sitenin genel kullanim kosullari',
    url: '/terms',
  },
  {
    name: 'WhereToGo',
    description: 'WhereToGo uygulamasi kullanim sartlari',
    url: '/wheretogo/terms',
  },
];

const AllTermsPage = () => {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Tum Uygulamalar - Kullanim Kosullari</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Bu sayfada projeler ve uygulamalar icin mevcut kullanim kosullari baglantilarini bulabilirsiniz.
          </p>
        </header>

        <div className="grid gap-4">
          {termsLinks.map((item) => (
            <Link
              key={item.name}
              to={item.url}
              className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AllTermsPage;
