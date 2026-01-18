import React, { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
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
        name: 'Account Deletion Request / Hesap Silme Talebi',
        email: email || 'Not Provided / Belirtilmedi',
        subject: 'DuaApp - Account Deletion / Hesap Silme',
        message: message || `Account deletion request. Registered email: ${email || 'Not Provided / Belirtilmedi'}`,
        createdAt: new Date()
      });
      setSent(true);
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Account deletion request error / Hesap silme talebi gönderme hatası:', err);
      setError('An error occurred while sending your request. Please try again later. / Talep gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-10 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">DuaApp — Account & Data Deletion / Hesap Silme</h1>
        <p className="text-muted-light dark:text-muted-dark max-w-2xl mx-auto">
          <strong>EN:</strong> This page allows DuaApp (ACKARACA LIMITED) users to request account and data deletion. Please follow one of the steps below.<br />
          <strong>TR:</strong> Bu sayfa DuaApp (ACKARACA LIMITED) kullanıcılarının hesap ve veri silme talebi göndermeleri için hazırlanmıştır. Aşağıdaki adımlardan birini seçebilirsiniz.
        </p>
      </div>

      <section className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">How to Delete Your Account? / Hesabımı Nasıl Silerim?</h2>
        <ol className="list-decimal list-inside space-y-3 text-muted-light dark:text-muted-dark">
          <li>
            <strong>In-app / Uygulama içinden:</strong> (If available) App {'>'} Settings {'>'} Data {'>'} <em>Delete My Account / Hesabımı Sil</em> option.
          </li>
          <li>
            <strong>Web form / Web formu ile:</strong> Fill out the form below to request account deletion. Your request will be reviewed and your account will be deleted once approved.<br />
            Aşağıdaki formu doldurarak hesap silme talebi gönderebilirsiniz. Talebiniz incelenecek ve onaylandığında hesabınız silinecektir.
          </li>
          <li>
            <strong>Email / E-posta:</strong> Send an email to info@ackaraca.me with the subject "DuaApp - Account Deletion Request / Hesap Silme Talebi" and include your registered email address.<br />
            info@ackaraca.me adresine "DuaApp - Hesap Silme Talebi" konu başlığıyla kayıtlı e-posta adresinizi ekleyerek talep gönderebilirsiniz.
          </li>
        </ol>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Send Request via Form / Form ile Talep Gönder</h3>
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">Your request has been received! / Talebiniz alındı!</h3>
              <p className="text-muted-light dark:text-muted-dark">We will process your request as soon as possible. / Talebinizi en kısa sürede işleme alacağız.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Email (required) / E-posta (zorunlu)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-light dark:text-muted-dark mb-2">Request or explanation (optional) / İsteğiniz veya açıklama (opsiyonel)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input-field"></textarea>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <><Loader className="animate-spin" size={20} /><span>Sending... / Gönderiliyor...</span></> : <span>Send Request / Talebi Gönder</span>}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-sm text-muted-light dark:text-muted-dark">
          <h4 className="font-semibold mb-2">Which data will be deleted or retained? / Hangi veriler silinecek veya saklanabilir?</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Will be deleted / Silinecek:</strong> Account info (email, username), profile info, in-app content (prayer history, posts, comments), favorites, messages, notification preferences.<br />Hesap bilgileri (e-posta, kullanıcı adı), profil bilgileri, uygulama içi içerikler (dua geçmişi, gönderiler, yorumlar), favoriler, mesajlar, bildirim tercihleri.</li>
            <li><strong>May be retained / Saklanabilecek:</strong> Some records may be retained for backup or legal reasons for up to 30 days. Payment/subscription records may be held by third-party payment providers and are subject to their retention policies.<br />Yedekleme ve hukuki zorunluluklar nedeniyle bazı kayıtlar kısa süreli (en fazla 30 gün) saklanabilir. Ödeme/abonelik kayıtları üçüncü taraf ödeme sağlayıcılarında tutuluyor olabilir ve onların saklama politikalarına tabi olabilir.</li>
          </ul>
          <p className="mt-4">For questions or objections, contact <a href="mailto:info@ackaraca.me" className="text-primary">info@ackaraca.me</a>.<br />Soru veya itirazlar için <a href="mailto:info@ackaraca.me" className="text-primary">info@ackaraca.me</a> adresine yazabilirsiniz.</p>
        </div>
      </section>
      <div className="text-center text-sm text-muted-light dark:text-muted-dark">Developer: <strong>ACKARACA LIMITED</strong> — <a href="https://ackaraca.me" target="_blank" rel="noopener noreferrer" className="text-primary">https://ackaraca.me</a></div>
    </main>
  );
}

export default AccountDeletionPage;
