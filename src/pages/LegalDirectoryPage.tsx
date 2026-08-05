import { ArrowLeft, ArrowUpRight, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLocaleHref } from '../hooks/useLocaleHref';

export default function LegalDirectoryPage({ documentType }: { documentType: 'privacy' | 'terms' }) {
  const { locale } = useAppPreferences();
  const privacy = documentType === 'privacy';
  const localeHref = useLocaleHref();
  const title = privacy
    ? (locale === 'tr' ? 'Gizlilik politikaları' : 'Privacy policies')
    : (locale === 'tr' ? 'Kullanım koşulları' : 'Terms of use');
  const entries = [
    {
      name: 'ACKaraca.me',
      description: privacy
        ? (locale === 'tr' ? 'Kişisel portfolyo ve iletişim formu' : 'Personal portfolio and contact form')
        : (locale === 'tr' ? 'Portfolyo ve herkese açık içerikler' : 'Portfolio and public content'),
      href: privacy ? '/privacy' : '/terms',
    },
    {
      name: 'WhereToGo',
      description: privacy
        ? (locale === 'tr' ? 'Konum keşfi, iki kişilik oturum ve eşleşmeler' : 'Location discovery, two-person sessions, and matches')
        : (locale === 'tr' ? 'Konum keşfi ve güvenli kullanım sınırları' : 'Location discovery and safe-use boundaries'),
      href: privacy ? '/wheretogo/privacy' : '/wheretogo/terms',
    },
  ];

  useDocumentMeta({
    title: `${title} — ACKaraca`,
    description: locale === 'tr' ? 'ACKARACA ürünleri için güncel yasal doküman dizini.' : 'Current legal document directory for ACKARACA products.',
    path: privacy ? '/all/privacy' : '/all/terms',
    locale,
    noIndex: true,
  });

  return (
    <main id="main-content" tabIndex={-1} className="page legal-directory">
      <header className="legal-hero shell">
        <Link href={localeHref('/')} className="legal-back"><ArrowLeft aria-hidden="true" />{locale === 'tr' ? 'Portfolyoya dön' : 'Back to portfolio'}</Link>
        <span className="eyebrow">{locale === 'tr' ? 'Yasal doküman dizini' : 'Legal document directory'}</span>
        <h1>{title}</h1>
        <p>{locale === 'tr' ? 'Kullandığınız ürünü seçerek geçerli dokümana ulaşın.' : 'Choose the product you use to open the applicable document.'}</p>
      </header>
      <section className="shell legal-directory__grid" aria-label={title}>
        {entries.map((entry) => (
          <Link key={entry.href} href={localeHref(entry.href)}>
            {privacy ? <ShieldCheck aria-hidden="true" /> : <FileText aria-hidden="true" />}
            <span>{entry.name}</span>
            <h2>{entry.description}</h2>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}
