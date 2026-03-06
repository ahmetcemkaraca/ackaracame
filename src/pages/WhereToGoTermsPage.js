import React from 'react';
import { FileText, Navigation, UserCheck, AlertOctagon, Mail } from 'lucide-react';

const WhereToGoTermsPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased min-h-screen flex flex-col pt-20">

            {/* Header Section */}
            <header className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                        Yasal Dokümantasyon
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        WhereToGo Kullanım Şartları
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Lütfen WhereToGo harita ve konum servislerini kullanmadan önce bu kullanım şartlarını dikkatlice okuyunuz. Uygulamamızı kullanarak bu şartları kabul etmiş sayılırsınız.
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

                    {/* Sidebar Navigation */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <nav aria-label="Table of Contents" className="sticky top-28 space-y-1">
                            <h5 className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">İçerik</h5>
                            <a className="group flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg border-l-2 border-primary transition-all" href="#agreement">
                                Sözleşmenin Kabulü
                            </a>
                            <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#usage">
                                Kullanım Kuralları
                            </a>
                            <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#liability">
                                Sorumluluk Reddi
                            </a>
                            <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#modifications">
                                Değişiklikler
                            </a>
                            <a className="group flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border-l-2 border-transparent transition-all" href="#contact">
                                İletişim
                            </a>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9 space-y-16">

                        {/* Agreement */}
                        <section id="agreement" className="scroll-mt-32">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    Bu Kullanım Şartları ("Şartlar"), sizinle ackaraca.me / WhereToGo ("biz", veya "bizim") arasında hukuki olarak bağlayıcı bir anlaşmadır. Uygulamaya erişerek ve konum/harita özelliklerimizi kullanarak, bu şartlara uymayı kabul etmiş olursunuz.
                                </p>
                            </div>
                        </section>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        {/* Usage Rules */}
                        <section id="usage" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <Navigation className="w-5 h-5" />
                                </div>
                                Kullanım Kuralları
                            </h2>
                            <div className="space-y-6 text-slate-600 dark:text-slate-300">
                                <p>Uygulamayı kullanırken güvenliğinizi tehlikeye atacak durumlardan kaçınmalısınız. Lütfen şu maddelere dikkat ediniz:</p>
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Trafikte Kullanım</h3>
                                    <p className="mb-4 text-sm leading-relaxed">WhereToGo rotalama ve konum hizmetlerini, aracınızı güvenli bir şekilde park etmeden, bisiklet veya yaya olarak trafiği tehlikeye atacak koşullarda kullanmayınız. Gerçek dünya şartlarında trafik kurallarına ve güvenlik yönlendirmelerine uymak her zaman birincil önceliğiniz olmalıdır.</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Doğruluk</h3>
                                    <p className="mb-4 text-sm leading-relaxed">Uygulamanın sağladığı harita noktaları, mekan çalışma saatleri ve rotalar tahmini veriler içerir. Özellikle hava durumu, yol çalışmaları ve trafiğe kapalı alanlar gibi durumlarda veriler gerçek dünya ile %100 örtüşmeyebilir.</p>
                                </div>
                            </div>
                        </section>

                        {/* Liability */}
                        <section id="liability" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                                    <AlertOctagon className="w-5 h-5" />
                                </div>
                                Sorumluluk Reddi
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                WhereToGo uygulamasında verilen yol tarifleri, mekan bilgileri ve harita servisleri "olduğu gibi" sunulur. Yanlış yol tarifleri, rota değişiklikleri veya yollardaki fiziksel sorunlar nedeniyle karşılaşabileceğiniz kazalar, gecikmeler, doğrudan veya dolaylı zararlardan WhereToGo sorumlu tutulamaz.
                            </p>
                        </section>

                        {/* Modifications */}
                        <section id="modifications" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Değişiklikler
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300">
                                Bu Kullanım Şartları'nı dilediğimiz zaman değiştirme veya yenileme hakkımızı saklı tutuyoruz. Önemli bir değişiklik olması durumunda, uygulamamız veya web sitemiz üzerinden en az 30 gün önceden bildirim yapmaya çalışacağız.
                            </p>
                        </section>

                        {/* Contact Section */}
                        <section id="contact" className="scroll-mt-32 pt-8">
                            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold text-white mb-4">İletişime Geçin</h2>
                                    <p className="text-slate-300 mb-8 max-w-lg">
                                        Bu Kullanım Şartları hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz.
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

export default WhereToGoTermsPage;
