import React, { useState } from 'react';
import { CheckCircle, Loader, AlertTriangle, ArrowLeft, Trash2, Undo } from 'lucide-react';
import { ContactService } from '../firebase/services';
import { Link } from 'react-router-dom';

const AccountDeletionPage = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) {
        setError('Please confirm that you understand the consequences.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      await ContactService.sendMessage({
        name: 'Account Deletion Request',
        email: email || 'Not Provided',
        subject: 'DuaApp - Account Deletion Request',
        message: `DELETION REQUEST - MANUAL VERIFICATION REQUIRED.\n\nUser Email: ${email}\nReason: ${reason}\n\nNote: This is a request. Please verify user identity via email correspondence before taking action.`,
        createdAt: new Date()
      });
      setSent(true);
      setEmail('');
      setReason('');
    } catch (err) {
      console.error('Error sending request:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display antialiased transition-colors duration-300 pt-20">

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg mx-auto">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Ana Sayfaya Dön
            </Link>
          </div>

          {/* Main Deletion Card */}
          <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            {/* Subtle Top Accent (Red for Danger) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

            <div className="p-8">
              {sent ? (
                 <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Talep Alındı</h3>
                    <p className="text-slate-500 dark:text-slate-400">Hesap silme talebiniz başarıyla iletildi. İşleminiz en kısa sürede gerçekleştirilecektir.</p>
                    <Link to="/" className="btn-primary mt-6 inline-block">Ana Sayfaya Dön</Link>
                 </div>
              ) : (
                <>
                  {/* Header Section */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="text-red-600 dark:text-red-500 text-2xl" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hesabı Sil</h1>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Hesabınızı kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>

                  {/* Impact Warning Box */}
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 mb-8">
                    <h3 className="text-red-800 dark:text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                      <span className="material-icons text-base">info</span>
                      Silme işlemi sonucunda:
                    </h3>
                    <ul className="space-y-2 text-sm text-red-700 dark:text-red-300 ml-1">
                      <li className="flex items-start gap-2">
                        <span className="block w-1 h-1 rounded-full bg-red-400 mt-2"></span>
                        <span>Profiliniz ve tüm kişisel verileriniz sistemden kaldırılacaktır.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="block w-1 h-1 rounded-full bg-red-400 mt-2"></span>
                        <span>Kaydettiğiniz projeler ve favoriler kalıcı olarak silinecektir.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="block w-1 h-1 rounded-full bg-red-400 mt-2"></span>
                        <span>Abonelik geçmişiniz temizlenecektir.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Deletion Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                            E-posta Adresi
                        </label>
                        <input
                            type="email"
                            className="block w-full px-4 py-2.5 text-base border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm transition-shadow"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    {/* Reason Select */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="reason">
                        Neden ayrılıyorsunuz? <span className="text-slate-400 font-normal">(Opsiyonel)</span>
                      </label>
                      <div className="relative">
                        <select
                            className="block w-full px-3 py-2.5 text-base border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm transition-shadow"
                            id="reason"
                            name="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                          <option disabled value="">Bir neden seçin...</option>
                          <option>Artık ihtiyacım yok</option>
                          <option>Başka bir platform buldum</option>
                          <option>Teknik sorunlar</option>
                          <option>Gizlilik endişeleri</option>
                          <option>Diğer</option>
                        </select>
                      </div>
                    </div>

                    {/* Verify Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                      <div className="flex items-center h-5">
                        <input
                            className="focus:ring-red-500 h-4 w-4 text-red-600 border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-background-dark cursor-pointer"
                            id="confirm-delete"
                            name="confirm-delete"
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                        />
                      </div>
                      <div className="text-sm">
                        <label className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer" htmlFor="confirm-delete">Sonuçları anlıyorum</label>
                        <p className="text-slate-500 dark:text-slate-500">Hesap silme talebi göndermek istediğimi onaylıyorum. Yönetici onayı için e-posta ile iletişime geçileceğini anlıyorum.</p>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link to="/" className="w-full sm:w-2/3 inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-surface-dark transition-all">
                        <Undo className="w-4 h-4 mr-2" />
                        İptal ve Geri Dön
                      </Link>
                      <button
                        type="submit"
                        disabled={loading || !confirmed}
                        className="w-full sm:w-1/3 inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-surface-dark transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin mr-2" /> Gönderiliyor...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">Talep Gönder</span>
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Footer Help Link */}
          <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            Yardıma mı ihtiyacınız var? <Link to="/contact" className="text-primary hover:underline">Destek ile İletişime Geçin</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default AccountDeletionPage;
