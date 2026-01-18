import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ApplicationsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-16 bg-slate-900 text-white">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-6">{t('common.applications')}</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2">archbuilder.app</h2>
            <p className="text-secondary-300 mb-2">
              ArchBuilder.AI, yapay zeka destekli bir mimari proje geliştirme platformudur. Kullanıcılar, chatbot aracılığıyla adım adım sorulara cevap vererek tam kapsamlı mimari projeler oluşturabilir.
            </p>
            <a
              href="https://archbuilder.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:underline"
            >
              archbuilder.app
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">DuaAPP</h2>
            <p className="text-secondary-300 mb-2">
              DuaAPP — mobil uygulama. Uygulama bilgileri ve yararlı linkler burada listelenecek.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">PeakActivity</h2>
            <p className="text-secondary-300">Açıklama ve linkler daha sonra eklenecek.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
