import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, Scale, RefreshCw } from 'lucide-react';

const WhereToGoCsamPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

      {/* Header Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            WhereToGo - Politikalar
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Çocuk Güvenliği Standartları
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            WhereToGo, Google Play Çocuk Güvenliği Standartları kapsamında çocukların cinsel istismarı ve çocuklara yönelik her türlü istismarı kesin olarak yasaklar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-icons text-base">schedule</span>
            <span>Yürürlük Tarihi: 5 Mart 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">

          {/* Sidebar Navigation (Sticky) */}
          <aside className="hidden lg:block lg:col-span-3">
            <nav aria-label="Table of Contents" className="sticky top-28 space-y-1">
              <h5 className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">İçerik</h5>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg border-l-2 border-primary transition-all" href="#zero-tolerance">
                Sıfır Tolerans
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#age-access">
                Yaş ve Erişim Güvenliği
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#reporting">
                Bildirim Mekanizması
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#enforcement">
                İnceleme ve Yaptırım
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#legal">
                Yasal Uyum
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#updates">
                Güncellemeler
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-16">

            {/* Zero Tolerance */}
            <section id="zero-tolerance" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                1) Sıfır Tolerans
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <p>Aşağıdaki içerik ve davranışlara kesinlikle tolerans gösterilmez:</p>
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-red-500/30 transition-colors">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-red-500 text-sm mt-1">cancel</span>
                      <span>Çocukların cinsel istismarı veya sömürüsünü içeren, teşvik eden ya da normalleştiren içerikler.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-red-500 text-sm mt-1">cancel</span>
                      <span>Çocukları cinsel amaçla kandırma, yönlendirme, tehdit etme veya şantaj.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-red-500 text-sm mt-1">cancel</span>
                      <span>Çocukların cinsel amaçla ticareti, istismarı veya buna yönelik organizasyonlar.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-red-500 text-sm mt-1">cancel</span>
                      <span>Çocuklara yönelik herhangi bir cinsel içerik talebi, paylaşımı veya yayılımı.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Age & Access */}
            <section id="age-access" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                2) Yaş ve Erişim Güvenliği
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Uygulama, reşit olmayan kullanıcıların güvenliğini korumak için yaşa uygun erişim ve güvenlik kontrolleri uygular.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Çocukların güvenliğini riske atabilecek hesaplar ve içerikler kısıtlanır, askıya alınır veya kalıcı olarak kapatılır.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Reporting Mechanism */}
            <section id="reporting" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                3) Uygulama İçi Bildirim Mekanizması
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>Kullanıcılar şüpheli içerik veya davranışları uygulama içindeki bildirim/şikayet araçları üzerinden raporlayabilir.</p>
                <div className="bg-orange-50 dark:bg-orange-500/5 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Ek İletişim Kanalı:</strong> safety@ackaraca.me
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Enforcement Support */}
            <section id="enforcement" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                4) İnceleme ve Yaptırım Süreci
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Alınan bildirimler öncelikli olarak incelenir.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Politika ihlali tespit edildiğinde içerik kaldırılır.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Hesap geçici veya kalıcı olarak kapatılır.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                    <span>Tekrarı önlemek için teknik ve operasyonel önlemler uygulanır.</span>
                  </li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Legal */}
            <section id="legal" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                5) Yasal Uyum ve Resmi Bildirim
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                  WhereToGo, geçerli çocuk güvenliği yasalarına uyar. Uygun durumlarda, ilgili mevzuat kapsamında yetkili kurumlara (gerekli olduğunda NCMEC veya yerel yetkili kurumlar dahil) bildirim yapılır ve kolluk kuvvetleriyle iş birliği sağlanır.
                </p>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Policy Updates */}
            <section id="updates" className="scroll-mt-32 pb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                6) Politika Güncellemeleri
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>
                  Bu politika mevzuat, ürün özellikleri ve Google Play gereklilikleri doğrultusunda güncellenebilir. En güncel sürüm bu sayfada yayımlanır.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default WhereToGoCsamPage;
