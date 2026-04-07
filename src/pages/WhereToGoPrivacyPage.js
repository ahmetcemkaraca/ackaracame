import React from 'react';
import { Shield, Lock, Eye, Server, Trash2, Mail } from 'lucide-react';

const WhereToGoPrivacyPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

            {/* Header Section */}
            <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                        Yasal Dokümantasyon
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        WhereToGo Gizlilik Politikası
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Güveninize değer veriyoruz ve kişisel verilerinizi korumayı taahhüt ediyoruz. Bu belge, WhereToGo uygulamasının konum ve diğer bilgilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklar.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-icons text-base">schedule</span>
                        <span>Son Güncelleme: 6 Mart 2026</span>
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
                                    WhereToGo uygulamasına hoş geldiniz. Konum tabanlı hizmetler sunarken gizliliğinizi en üst düzeyde korumaya kendimizi adadık. Bu Gizlilik Politikası, uygulamanın konum verilerini, kişisel bilgileri ve diğer cihaz verilerini nasıl işlediğini açıklamaktadır.
                                </p>
                            </div>
                        </section>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        {/* Information We Collect */}
                        <section id="data-collection" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <Eye className="w-5 h-5" />
                                </div>
                                Toplanan Bilgiler
                            </h2>
                            <div className="space-y-6 text-slate-600 dark:text-slate-300">
                                <p>Size güvenilir ve doğru yönlendirmeler, harita hizmetleri ve bildirimler sunmak için aşağıdaki verileri topluyoruz:</p>
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Konum Verileri</h3>
                                    <p className="mb-4 text-sm leading-relaxed">WhereToGo, temel işlevini yerine getirmek için konum bilgilerinize ihtiyaç duyar:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-3">
                                            <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                                            <span>Anlık GPS konumu (Hizmeti kullanırken ve harita üzerinde gezinirken)</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-icons text-primary text-sm mt-1">check_circle</span>
                                            <span>Rotalar ve ziyaret edilen mekanlar (Kayıtlı kullanıcılar için)</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Hesap Verileri</h3>
                                    <p className="mb-4 text-sm leading-relaxed">Kayıtlı bir kullanıcı iseniz, kişiselleştirilmiş deneyim için şu bilgileri saklarız:</p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                                            <span>Ad, soyad ve e-posta adresi</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                                            <span>Favori mekanlar ve kaydedilmiş rotalar</span>
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
                            <p className="text-slate-600 dark:text-slate-300 mb-6">Toplanan veriler yalnızca aşağıdaki temel işlevleri yerine getirmek için kullanılır:</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Harita Hizmetleri</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Size en yakın turistik, tarihi ve önemli noktaları göstermek.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Rota Planlama</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Gideceğiniz yere olan ideal rotayı ve tahmini süreyi hesaplamak.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Kişiselleştirme</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Daha önceki tercihlerinize ve favorilerinize göre size özel öneriler sunmak.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-transparent dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Uygulama İyileştirme</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Hata tespiti yapmak ve uygulamanın genel performansını artırmak.</p>
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
                                    Özellikle konum verilerinizin güvenliği bizim için kritiktir. Konum bilgileriniz şifrelenerek aktarılır ve üçüncü şahıslara (anonimleştirilmiş istatistiki veriler hariç) pazarlama amacıyla satılmaz veya paylaşılmaz.
                                </p>
                            </div>
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
                                Harita altyapısı ve analiz süreçleri için aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Google Maps / Mapbox</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Harita Sağlayıcısı ve Rota Oluşturma</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Firebase</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Kullanıcı Veritabanı</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Google Analytics</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">Anonim Kullanım Analizi</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section id="contact" className="scroll-mt-32 pt-8">
                            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold text-white mb-4">Sorularınız mı Var?</h2>
                                    <p className="text-slate-300 mb-8 max-w-lg">
                                        WhereToGo uygulamasının gizlilik uygulamaları ile ilgili herhangi bir sorunuz varsa bize ulaşabilirsiniz.
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

export default WhereToGoPrivacyPage;
