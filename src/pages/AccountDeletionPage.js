import React, { useState } from 'react';
import { Mail, CheckCircle, Loader } from 'lucide-react';
import { ContactService } from '../firebase/services';

const AccountDeletionPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ContactService.sendMessage({
        name: 'Hesap Silme Talebi',
        email: email || 'Belirtilmedi',
        subject: 'DuaApp - Hesap Silme Talebi',
        message: message || `Hesap silme talebi. Kayıtlı e-posta: ${email || 'Belirtilmedi'}`,
        createdAt: new Date()
      });
      setSent(true);
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Hesap silme talebi gönderme hatası:', err);
      setError('Talep gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-10 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">DuaApp — Hesap Silme Talebi</h1>
        <p className="text-muted-light dark:text-muted-dark max-w-2xl mx-auto">
          Bu sayfa DuaApp (ACKARACA LIMITED) kullanıcılarının hesaplarını silme
          talebi göndermeleri için hazırlanmıştır. Aşağıdaki adımlardan birini seçebilirsiniz.
        </p>
      </div>

      <section className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">Hesabımı Nasıl Silerim?</h2>
        <ol className="list-decimal list-inside space-y-3 text-muted-light dark:text-muted-dark">
          <li>
            <strong>Uygulama içinden:</strong> (Varsa) Uygulama > Ayarlar > Veri > <em>Hesabımı Sil</em> seçeneğini kullanın.
          </li>
          <li>
            <strong>Web-formu ile:</strong> Bu sayfadan aşağıdaki formu doldurarak hesap silme talebi
            gönderebilirsiniz. Talebiniz incelenecek ve onaylandığında hesabınız silinecektir.
          </li>
          <li>
            <strong>E-posta:</strong> info@ackaraca.me adresine
            "DuaApp - Hesap Silme Talebi" konu başlığıyla kayıtlı e-posta adresinizi ekleyerek talep gönderin.
          </li>
        </ol>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Form ile Talep Gönder</h3>

          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">Talebiniz alındı!</h3>
              <p className="text-muted-light dark:text-muted-dark">Talebinizi en kısa sürede işleme alacağız.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Kayıtlı E-posta (zorunlu)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">İsteğiniz veya açıklama (opsiyonel)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input-field"></textarea>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <><Loader className="animate-spin" size={20} /><span>Gönderiliyor...</span></> : <span>Talebi Gönder</span>}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-sm text-muted-light dark:text-muted-dark">
          <h4 className="font-semibold mb-2">Hangi veriler silinecek / saklanabilir?</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Silinecek:</strong> Hesap bilgileri (e-posta, kullanıcı adı), profil bilgileri, uygulama içi içerikler (dua geçmişi, gönderiler, yorumlar), favoriler, mesajlar, bildirim tercihleri.</li>
            <li><strong>Saklanabilecek:</strong> Yedeklemeler ve hukuki zorunluluklar nedeniyle bazı kayıtlar kısa süreli (en fazla 30 gün) saklanabilir. Ödeme/abonelik kayıtları üçüncü taraf ödeme sağlayıcılarında tutuluyor olabilir ve onların saklama politikalarına tabi olabilir.</li>
          </ul>

          <p className="mt-4">Soru veya itirazlar için <a href="mailto:info@ackaraca.me" className="text-primary">info@ackaraca.me</a> adresine yazabilirsiniz.</p>
        </div>

      </section>

      <div className="text-center text-sm text-muted-light dark:text-muted-dark">Geliştirici: <strong>ACKARACA LIMITED</strong> — <a href="https://ackaraca.me" target="_blank" rel="noopener noreferrer" className="text-primary">https://ackaraca.me</a></div>
    </main>
  );
};

export default AccountDeletionPage;
