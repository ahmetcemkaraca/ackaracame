import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle, Loader } from 'lucide-react';
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

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-posta',
      value: 'info@ackaraca.me',
      link: 'mailto:info@ackaraca.me'
    },
    {
      icon: MapPin,
      title: 'Konum',
      value: 'Antalya, Türkiye',
      link: 'https://maps.app.goo.gl/fewk9JMcgUdpB5Ny5'
    }
  ];

  return (
    <main className="flex flex-col gap-10 sm:gap-16 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-text-light dark:text-text-dark text-4xl font-bold leading-tight tracking-tighter">İletişime Geçin</h1>
        <p className="text-muted-light dark:text-muted-dark text-base font-normal leading-relaxed max-w-2xl">
          Projeleriniz hakkında konuşmak, işbirliği yapmak veya sadece bir merhaba demek için aşağıdaki formu doldurabilir ya da iletişim bilgilerimi kullanabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* İletişim Bilgileri */}
        <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">İletişim Bilgileri</h2>
            {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                    <a key={index} href={info.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-light dark:text-text-dark">{info.title}</h3>
                            <p className="text-muted-light dark:text-muted-dark">{info.value}</p>
                        </div>
                    </a>
                )
            })}
             <a 
              href="https://find-and-update.company-information.service.gov.uk/company/14560445" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 p-6 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-border-light dark:border-border-dark hover:shadow-lg hover:border-primary/50 transition-all duration-200 block"
            >
              <h3 className="text-lg font-bold mb-3 text-text-light dark:text-text-dark">
                ACKARACA LIMITED ŞİRKETİ
              </h3>
              <div className="space-y-2 text-muted-light dark:text-muted-dark text-sm">
                <p>Company number 14560445</p>
                <p>Registered office address: Piccadilly Business Centre, Aldow Enterprise Park,</p>
                <p>Manchester, England, M12 6AE</p>
              </div>
            </a>
        </div>

        {/* İletişim Formu */}
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 md:p-8">
            {submitted ? (
                <div className="text-center flex flex-col items-center justify-center h-full">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Mesajınız Gönderildi!</h2>
                    <p className="text-muted-light dark:text-muted-dark mb-6">En kısa sürede size dönüş yapacağım.</p>
                    <button onClick={() => setSubmitted(false)} className="btn-primary">Yeni Mesaj Gönder</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Mesaj Gönderin</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Ad Soyad *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">E-posta *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Konu *</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Mesajınız *</label>
                        <textarea name="message" value={formData.message} onChange={handleInputChange} rows={5} className="input-field" required placeholder="Projenizden bahsedin..."></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? <><Loader className="animate-spin" size={20} /><span>Gönderiliyor...</span></> : <><Send size={16} /><span>Mesajı Gönder</span></>}
                    </button>
                </form>
            )}
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
