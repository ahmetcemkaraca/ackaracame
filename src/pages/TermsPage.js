import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-sm sm:text-base">
          Diger uygulamalarin kullanim kosullarini ariyorsaniz
          {' '}
          <Link to="/all/terms" className="font-semibold text-primary hover:underline">
            buraya tiklayin
          </Link>
          .
        </div>

        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            ACKaraca.me Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Kullanim Kosullari</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Bu kosullar, ACKaraca.me uzerindeki web icerikleri, portfolyo yayinlari ve baglantili sayfalarin kullanimina iliskin temel kurallari aciklar.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Son guncelleme: 7 Nisan 2026</p>
        </header>

        <section className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Hizmet Kapsami</h2>
          <p>
            ACKaraca.me, kisisel portfolyo, yazi ve dijital urun tanitim icerikleri sunar. Sitede yer alan bilgiler genel bilgilendirme amaciyla yayinlanir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Kabul ve Kullanici Sorumlulugu</h2>
          <p>
            Siteyi kullanarak bu kosullari kabul etmis sayilirsiniz. Hukuka aykiri kullanim, otomatik veri cekme ve hizmeti aksatan girisimler yasaktir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Fikri Mulkiyet</h2>
          <p>
            Aksi belirtilmedikce metinler, gorseller ve tasarim unsurlari ACKaraca.me sahibine aittir. Izinsiz kopyalama ve ticari kullanim yapilamaz.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Ucuncu Taraf Baglantilar</h2>
          <p>
            Sitede harici uygulama ve servis baglantilari bulunabilir. Ucuncu taraf icerik ve politikalarindan ilgili servis saglayicisi sorumludur.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Sorumlulugun Sinirlandirilmasi</h2>
          <p>
            Site icerigi oldugu gibi sunulur. Teknik kesinti, veri kaybi veya dolayli zararlardan dogabilecek sorumluluk, yasal sinirlar cercevesinde sinirlidir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Iletisim</h2>
          <p>
            Sorulariniz icin
            {' '}
            <a href="mailto:info@ackaraca.me" className="text-primary hover:underline">info@ackaraca.me</a>
            {' '}
            adresinden iletisime gecebilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsPage;
