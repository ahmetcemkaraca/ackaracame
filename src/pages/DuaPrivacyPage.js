import React from 'react';
import { Shield, Lock, Eye, Server, Trash2, Mail } from 'lucide-react';

const DuaPrivacyPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

      {/* Header Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            Yasal Dokümantasyon
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Gizlilik Politikası
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Güveninize değer veriyoruz ve kişisel verilerinizi korumayı taahhüt ediyoruz. Bu belge, Dua App'in bilgilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-icons text-base">schedule</span>
            <span>Son Güncelleme: 24 Ekim 2023</span>
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
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg border-l-2 border-primary transition-all" href="#introduction">
                Giriş
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#data-collection">
                Toplanan Bilgiler
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#how-we-use">
                Veri Kullanımı
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#security">
                Güvenlik
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#third-party">
                Üçüncü Taraflar
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#contact">
                İletişim
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-16">

            {/* Introduction */}
            <section id="introduction" className="scroll-mt-32">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  Dua App'e hoş geldiniz. Gizliliğinizi korurken size mümkün olan en iyi deneyimi sunmaya kendimizi adadık. Bu Gizlilik Politikası, Dua App web sitesi ve mobil uygulaması (toplu olarak "Hizmet") için geçerlidir. Hizmetimize erişerek veya kullanarak, bilgilerin bu politikaya uygun olarak toplanmasını ve kullanılmasını kabul edersiniz.
                </p>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800"/>

            {/* Information We Collect */}
            <section id="data-collection" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                Toplanan Bilgiler
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <p>Hizmetimizi size sunmak ve geliştirmek için çeşitli amaçlarla farklı türde bilgiler topluyoruz.</p>
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Kişisel Veriler</h3>
                  <p className="mb-4 text-sm leading-relaxed">Hizmetimizi kullanırken, sizi iletişim kurmak veya tanımlamak için kullanılabilecek belirli kişisel olarak tanımlanabilir bilgileri bize sağlamanızı isteyebiliriz ("Kişisel Veriler"). Bunlar şunları içerebilir, ancak bunlarla sınırlı değildir:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                      <span>E-posta adresi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                      <span>Ad ve soyad</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                      <span>Çerezler ve Kullanım Verileri</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Kullanım Verileri</h3>
                  <p className="mb-4 text-sm leading-relaxed">Hizmetimizi her ziyaret ettiğinizde veya Hizmete bir mobil cihaz aracılığıyla eriştiğinizde tarayıcınızın gönderdiği bilgileri de toplayabiliriz ("Kullanım Verileri").</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                      <span>İnternet Protokolü (IP) adresi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                      <span>Tarayıcı türü ve sürümü</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                      <span>Sayfalarda geçirilen süre</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                      <span>Benzersiz cihaz tanımlayıcıları</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Data */}
            <section id="how-we-use" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                Verilerinizi Nasıl Kullanıyoruz
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">Dua App toplanan verileri çeşitli amaçlar için kullanır:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Hizmet Bakımı</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hizmeti sağlamak, sürdürmek ve kullanımını izlemek.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Bildirimler</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hizmetimizdeki veya politikalarımızdaki değişiklikler hakkında sizi bilgilendirmek.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Müşteri Desteği</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sorunlarla karşılaştığınızda müşteri hizmetleri ve destek sağlamak.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Analiz</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hizmeti iyileştirebilmemiz için analiz veya değerli bilgiler sağlamak.</p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                Veri Güvenliği
              </h2>
              <div className="bg-blue-50 dark:bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Verilerinizin güvenliği bizim için önemlidir, ancak İnternet üzerinden hiçbir iletim yönteminin veya elektronik depolama yönteminin %100 güvenli olmadığını unutmayın. Kişisel Verilerinizi korumak için ticari olarak kabul edilebilir araçları kullanmaya çalışsak da, mutlak güvenliğini garanti edemeyiz.
                </p>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-300">
                Kişisel bilgilerinizi girdiğinizde, gönderdiğinizde veya bunlara eriştiğinizde kişisel bilgilerinizin güvenliğini sağlamak için çeşitli güvenlik önlemleri uyguluyoruz.
              </p>
            </section>

            {/* Third Party Services */}
            <section id="third-party" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                Üçüncü Taraf Hizmetleri
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Hizmetimizi kolaylaştırmak ("Hizmet Sağlayıcılar"), Hizmeti bizim adımıza sağlamak, Hizmetle ilgili hizmetleri gerçekleştirmek veya Hizmetimizin nasıl kullanıldığını analiz etmemize yardımcı olmak için üçüncü taraf şirketleri ve bireyleri istihdam edebiliriz.
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Hizmet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Amaç</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Google Analytics</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Trafik Analizi</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Firebase</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Kimlik Doğrulama & Veritabanı</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Stripe</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Ödeme İşleme</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="scroll-mt-32 pt-8">
              <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-4">Bu Politika Hakkında Sorularınız mı Var?</h2>
                  <p className="text-slate-300 mb-8 max-w-lg">
                    Bu Gizlilik Politikası hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçmekten çekinmeyin. Tüm sorulara 48 saat içinde yanıt vermeyi hedefliyoruz.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Mail className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">E-posta</p>
                        <a className="text-white hover:text-primary transition-colors text-lg font-medium" href="mailto:info@ackaraca.me">info@ackaraca.me</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default DuaPrivacyPage;
