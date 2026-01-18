import React from 'react';
import { Link } from 'react-router-dom';
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
            <p className="text-secondary-300 mb-4">
              DuaApp is a mobile application focused on spiritual practices and
              daily prayers. It provides a curated collection of duas, translations,
              transliterations and audio where available. The app also includes
              personalization, favorites, recitation tracking, AI-assisted guidance,
              community features and a premium subscription for extra content.
            </p>

            <ul className="list-disc ml-5 text-secondary-300 space-y-2 mb-3">
              <li>Dua ve zikir içerikleri (çok dilli çeviri & transliterasyon)</li>
              <li>Favorilere ekleme ve okundu/okunmadı işaretleme</li>
              <li>Sesli oynatma & dua stüdyosu</li>
              <li>AI destekli rehberlik ve eğitim içerikleri</li>
              <li>Topluluk paylaşımları ve kullanıcı etkileşimi</li>
              <li>Premium içerik ve abonelik yönetimi</li>
              <li>Profil ve hesap yönetimi (hesap silme seçeneği mevcuttur)</li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link to="/account-delete" className="text-primary-500 hover:underline">
                Hesap Silme
              </Link>
              <Link to="/dua/privacy" className="text-primary-500 hover:underline">
                Gizlilik Politikası
              </Link>
              <Link to="/dua/terms" className="text-primary-500 hover:underline">
                Kullanım Koşulları
              </Link>
              <a href="mailto:destek@duaapp.com" className="text-primary-500 hover:underline">
                Destek
              </a>
            </div>
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
