import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-sm sm:text-base">
          Diger uygulamalarin gizlilik politikalarini ariyorsaniz
          {' '}
          <Link to="/all/privacy" className="font-semibold text-primary hover:underline">
            buraya tiklayin
          </Link>
          .
        </div>

        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            ACKaraca.me Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Gizlilik Politikasi</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Bu metin ACKaraca.me web sitesi kapsaminda toplanan sinirli verilerin hangi amacla kullanildigini ve hangi haklara sahip oldugunuzu aciklar.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Son guncelleme: 7 Nisan 2026</p>
        </header>

        <section className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Toplanan Veriler</h2>
          <p>
            Iletisim formlari, hesap silme talepleri ve teknik loglar kapsaminda e-posta adresi, mesaj icerigi ve temel cihaz verileri islenebilir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Isleme Amaci</h2>
          <p>
            Veriler yalnizca talep yonetimi, guvenlik, teknik sureklilik ve yasal yukumlulukleri yerine getirmek icin kullanilir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Saklama Sureleri</h2>
          <p>
            Veriler gerektigi sure kadar saklanir ve isleme amaci ortadan kalktiginda silinir veya anonimlestirilir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Ucuncu Taraf Altyapilar</h2>
          <p>
            Barindirma, analitik ve veri depolama icin ucuncu taraf servisler kullanilabilir. Bu servisler kendi guvenlik ve gizlilik yukumluluklerine tabidir.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Haklariniz</h2>
          <p>
            Veri erisimi, duzeltme, silme ve itiraz haklariniz icin bizimle iletisime gecebilirsiniz. Hesap silme talepleri icin
            {' '}
            <Link to="/account-delete" className="text-primary hover:underline">hesap silme formunu</Link>
            {' '}
            kullanabilirsiniz.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Iletisim</h2>
          <p>
            Gizlilikle ilgili tum sorular icin
            {' '}
            <a href="mailto:info@ackaraca.me" className="text-primary hover:underline">info@ackaraca.me</a>
            {' '}
            adresine yazabilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPage;
