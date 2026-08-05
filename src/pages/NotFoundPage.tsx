import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFoundPage() {
  const { locale } = useAppPreferences();
  useDocumentMeta({ title: locale === 'tr' ? 'Sayfa bulunamadı — ACKaraca' : 'Page not found — ACKaraca', description: '404', path: '/404', locale, noIndex: true });
  return (
    <main id="main-content" tabIndex={-1} className="page not-found shell">
      <span className="not-found__code" aria-hidden="true">404</span>
      <span className="eyebrow">{locale === 'tr' ? 'Arşiv dışında' : 'Outside the archive'}</span>
      <h1>{locale === 'tr' ? 'Burada bir yüzey yok.' : 'There is no surface here.'}</h1>
      <p>{locale === 'tr' ? 'Bağlantı değişmiş olabilir. Seçili işlere dönün veya hızlı aramayı kullanın.' : 'The link may have moved. Return to selected work or use quick search.'}</p>
      <div><Link href="/" className="button button--primary"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'Ana sayfa' : 'Home'}</Link><Link href="/work" className="button button--ghost"><Search aria-hidden="true" />{locale === 'tr' ? 'İşleri aç' : 'Open work'}</Link></div>
    </main>
  );
}
