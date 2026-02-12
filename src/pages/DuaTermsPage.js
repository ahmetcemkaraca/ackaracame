import React from 'react';
import { Shield, Book, UserCheck, Gavel, FileText, Mail } from 'lucide-react';

const DuaTermsPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

      {/* Header Section */}
      <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            Yasal Dokümantasyon
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Kullanım Koşulları
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Lütfen hizmetlerimizi kullanmadan önce bu koşulları dikkatlice okuyun. Dua App'e erişerek bu koşullara bağlı kalmayı kabul edersiniz.
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
                1. Giriş
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#user-responsibilities">
                2. Kullanıcı Sorumlulukları
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#intellectual-property">
                3. Fikri Mülkiyet
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#content-ownership">
                4. İçerik Mülkiyeti
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#disclaimers">
                5. Sorumluluk Reddi
              </a>
              <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#termination">
                6. Fesih
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-12">

            {/* 1. Introduction */}
            <section id="introduction" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">1</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Giriş</h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  Dua App'e ("Şirket", "biz", "bizim", "bizi") hoş geldiniz. Bu Hizmet Koşulları ("Koşullar", "Hizmet Koşulları"), Dua App tarafından işletilen web sitemizi ve mobil uygulamamızı (birlikte veya ayrı ayrı "Hizmet") kullanımınızı yönetir.
                </p>
                <p className="leading-relaxed mt-4">
                  Gizlilik Politikamız da Hizmetimizi kullanımınızı yönetir ve web sayfalarımızı kullanımınız sonucunda bilgileri nasıl topladığımızı, koruduğumuzu ve ifşa ettiğimizi açıklar. Bizimle yaptığınız sözleşme bu Koşulları ve Gizlilik Politikamızı ("Sözleşmeler") içerir. Sözleşmeleri okuduğunuzu ve anladığınızı kabul ediyor ve bunlara uymayı kabul ediyorsunuz.
                </p>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800/50"/>

            {/* 2. User Responsibilities */}
            <section id="user-responsibilities" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">2</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kullanıcı Sorumlulukları</h2>
              </div>
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="text-primary mt-1 w-5 h-5" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Hesap Güvenliği</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Hizmete erişmek için kullandığınız şifreyi korumaktan ve şifreniz altındaki tüm etkinliklerden veya eylemlerden siz sorumlusunuz.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <UserCheck className="text-primary mt-1 w-5 h-5" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Doğru Bilgi</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Kayıt işlemi sırasında doğru, güncel ve eksiksiz bilgi vermeyi ve doğruluğunu korumak için bu bilgileri güncellemeyi kabul edersiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Gavel className="text-primary mt-1 w-5 h-5" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Yasaklı Kullanım</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Hizmeti herhangi bir yasa dışı amaç için veya yargı bölgenizdeki herhangi bir yasayı ihlal etmek için kullanamazsınız (telif hakkı yasaları dahil ancak bunlarla sınırlı olmamak üzere).
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Book className="text-primary mt-1 w-5 h-5" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Uyumluluk</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          En az 18 yaşında olduğunuzu ve bu sözleşmeyi yapmaya yasal olarak ehil olduğunuzu beyan ve taahhüt edersiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800/50"/>

            {/* 3. Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">3</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fikri Mülkiyet</h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed mb-4">
                  Hizmet ve orijinal içeriği (kullanıcılar tarafından sağlanan İçerik hariç), özellikleri ve işlevselliği, Dua App ve lisans verenlerinin münhasır mülkiyetindedir ve öyle kalacaktır. Hizmet, telif hakkı, ticari marka ve hem Amerika Birleşik Devletleri hem de yabancı ülkelerin diğer yasalarıyla korunmaktadır.
                </p>
                <div className="bg-primary/5 dark:bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                    "Ticari markalarımız ve ticari takdim şeklimiz, Dua App'in önceden yazılı izni olmaksızın herhangi bir ürün veya hizmetle bağlantılı olarak kullanılamaz."
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Content Ownership */}
            <section id="content-ownership" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">4</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">İçerik Mülkiyeti & Portfolyolar</h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed mb-4">
                  Bir mimari portfolyo platformu olarak, kullanıcılarımızın yaratıcı haklarına saygı duyuyoruz. Dua App'te yayınlanan mimari tasarımlarınızın, fotoğraflarınızın, renderlarınızın ve proje açıklamalarınızın tüm haklarını ve mülkiyetini saklı tutarsınız.
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                  <li>Hizmete İçerik göndererek, bu İçeriği yalnızca Hizmeti işletmek amacıyla Hizmet üzerinde ve aracılığıyla kullanma, değiştirme, halka açık olarak gerçekleştirme, halka açık olarak görüntüleme, çoğaltma ve dağıtma hakkını ve lisansını bize verirsiniz.</li>
                  <li>Bu lisansın, İçeriğinizi bu Koşullara tabi olarak kullanabilecek diğer Hizmet kullanıcılarına sunma hakkını da içerdiğini kabul edersiniz.</li>
                  <li>Herhangi bir içeriği yayınlama hakkına sahip olduğunuzdan, gerektiğinde müşterilerden veya firmalardan izin aldığınızdan emin olmak sizin sorumluluğunuzdadır.</li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800/50"/>

            {/* 5. Disclaimers */}
            <section id="disclaimers" className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">5</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sorumluluk Reddi</h2>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Uyarı</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  HİZMET, "OLDUĞU GİBİ" VE "MEVCUT OLDUĞU ŞEKİLDE" SAĞLANMAKTADIR. DUA APP, HİZMETLERİNİN İŞLEYİŞİNE VEYA İÇERİĞİNE İLİŞKİN HİÇBİR AÇIK VEYA ZIMNİ BEYAN VEYA GARANTİDE BULUNMAZ.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  BU HİZMETLERİ, İÇERİKLERİNİ VE BİZDEN ALINAN HERHANGİ BİR HİZMETİ VEYA ÖĞEYİ KULLANMANIZIN RİSKİNİN TAMAMEN SİZE AİT OLDUĞUNU AÇIKÇA KABUL EDERSİNİZ.
                </p>
              </div>
            </section>

            {/* 6. Termination */}
            <section id="termination" className="scroll-mt-32 pb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">6</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fesih</h2>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  Koşulların ihlali dahil ancak bunlarla sınırlı olmamak üzere, herhangi bir nedenle ve önceden bildirimde bulunmaksızın veya yükümlülük altına girmeksizin, tamamen kendi takdirimize bağlı olarak hesabınızı feshedebilir veya askıya alabilir ve Hizmete erişimi engelleyebiliriz.
                </p>
                <p className="leading-relaxed mt-4">
                  Hesabınızı feshetmek isterseniz, Hizmeti kullanmayı bırakabilir veya kullanıcı ayarları kontrol panelinden hesabınızı silebilirsiniz.
                </p>
              </div>
            </section>

            {/* Agreement Footer Action */}
            <div className="bg-primary/5 dark:bg-slate-800/50 border border-primary/20 dark:border-slate-700 rounded-xl p-8 text-center mt-12">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Devam etmeye hazır mısınız?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">Hizmetlerimizi kullanmaya devam ederek, Kullanım Koşullarımızı okuduğunuzu ve kabul ettiğinizi beyan edersiniz.</p>
              <div className="flex justify-center gap-4">
                <button className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Reddet
                </button>
                <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5">
                  Kabul Ediyorum
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default DuaTermsPage;
