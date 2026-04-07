import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle, Loader, ArrowUpRight } from 'lucide-react';
import { ContactService } from '../firebase/services';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ContactService.sendMessage({ ...formData, createdAt: new Date() });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
      setError('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Background Architectural Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(25,127,230,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(25,127,230,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent dark:from-black/20 dark:to-transparent pointer-events-none z-0"></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative z-10 pt-16">
        {/* Left Column: Info & Map */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
          {/* Header Text */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                Birlikte yeni bir şeyler <br/> <span className="text-primary">inşa edelim.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                Mimari stajlar, serbest tasarım projeleri ve işbirlikleri için iletişime geçebilirsiniz.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                <Mail className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">E-posta</p>
                <a className="text-lg font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors" href="mailto:info@ackaraca.me">info@ackaraca.me</a>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                <MapPin className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sosyal Medya</p>
                <div className="flex space-x-4 mt-1">
                  <a className="text-slate-900 dark:text-white font-medium hover:text-primary transition-colors flex items-center space-x-1" href="https://www.linkedin.com/in/ahmet-cem-karaca/" target="_blank" rel="noreferrer">
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a className="text-slate-900 dark:text-white font-medium hover:text-primary transition-colors flex items-center space-x-1" href="https://github.com/ahmetcemkaraca" target="_blank" rel="noreferrer">
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stylized Map Card */}
          <div className="mt-8 relative h-48 w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 group">
            <img
                alt="Map View"
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3oXBnCe3QGRQ-bmCZPSuXWbMdCTpeN_dnR_1T0pYIvJyFTLj8j8eDfMv2y60mHNmKXrWy5cC7j6jPLiwWBSZvkP8zGtUJaVWekgnSF5Tg4utNeJSZmZ3ZoVWxPzf5OAz2nL__7pGMNFxbu8KzzEaVgMFNtO0DgRu0S7wrS4Xla7cocjdxIUlkeOHzAgMUnWslIfCHXJu8yg3ENZ1ZE4qsBC2KJqAaHiT679FVuJindex5yy_rka7wM88bgl12nk0-Wshh5eXqI6w"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
                <MapPin className="text-primary w-5 h-5" />
                <span className="font-medium tracking-wide text-sm">Antalya, Türkiye</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50">
            {submitted ? (
                <div className="text-center flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Mesajınız Gönderildi!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">En kısa sürede size dönüş yapacağım.</p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    >
                        Yeni Mesaj Gönder
                    </button>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Mesaj Gönder</h2>
                    <form action="#" className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">Ad Soyad</label>
                                <div className="relative">
                                    <input
                                        className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Adınız"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">E-posta Adresi</label>
                                <div className="relative">
                                    <input
                                        className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="subject">Konu</label>
                            <input
                                className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                                id="subject"
                                name="subject"
                                type="text"
                                placeholder="Proje, İşbirliği, vb."
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="message">Mesaj</label>
                            <textarea
                                className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
                                id="message"
                                name="message"
                                rows="5"
                                placeholder="Projenizden bahsedin..."
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="pt-2">
                            <button
                                className="w-full md:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Gönderiliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Mesajı Gönder</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
