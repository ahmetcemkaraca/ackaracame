import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences, localize } from '../../context/AppPreferences';
import type { SiteSettings } from '../../domain/content';
import { useLocaleHref } from '../../hooks/useLocaleHref';
import { isAcceptingInquiries } from '../../lib/availability';

export const SiteFooter = ({ settings, showJournal = false }: { settings: SiteSettings; showJournal?: boolean }) => {
  const { locale } = useAppPreferences();
  const year = new Date().getFullYear();
  const localeHref = useLocaleHref();
  const acceptingInquiries = isAcceptingInquiries(settings.availability);

  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div className="site-footer__lead">
          <span className="eyebrow">{acceptingInquiries ? (locale === 'tr' ? 'Birlikte çalışalım' : 'Let’s work together') : (locale === 'tr' ? 'Şu anda müsait değilim' : 'Currently unavailable')}</span>
          <p>{acceptingInquiries ? (locale === 'tr' ? 'İyi bir problem mi var?' : 'Have a problem worth solving?') : (locale === 'tr' ? 'Yine de işlerimi ve çalışma biçimimi inceleyebilirsiniz.' : 'You can still explore my work and how I think.')}</p>
          <Link href={localeHref(acceptingInquiries ? '/contact' : '/work')} className="text-link text-link--large">
            {acceptingInquiries ? (locale === 'tr' ? 'Bir konuşma başlat' : 'Start a conversation') : (locale === 'tr' ? 'İşleri incele' : 'Explore the work')} <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <div className="site-footer__links">
          <div>
            <span>{locale === 'tr' ? 'Gezin' : 'Navigate'}</span>
            <Link href={localeHref('/work')}>{locale === 'tr' ? 'İşler' : 'Work'}</Link>
            <Link href={localeHref('/about')}>{locale === 'tr' ? 'Profil' : 'Profile'}</Link>
            <Link href={localeHref('/lab')}>Lab</Link>
            {showJournal ? <Link href={localeHref('/journal')}>Journal</Link> : null}
          </div>
          <div>
            <span>{locale === 'tr' ? 'Bağlantılar' : 'Links'}</span>
            {settings.socialLinks.map((link) => (
              <a key={link.href} href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noreferrer' : undefined}>
                {localize(link.label, locale)}
              </a>
            ))}
            <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </div>
        </div>
      </div>
      <div className="shell">
        <span className="site-footer__wordmark" aria-hidden="true">ACKARACA</span>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {year} {localize(settings.ownerName, locale)} - bruv 🥀🥀🥀</span>
        <span>{localize(settings.footerNote, locale)}</span>
        <div>
          <Link href={localeHref('/privacy')}>{locale === 'tr' ? 'Gizlilik' : 'Privacy'}</Link>
          <Link href={localeHref('/terms')}>{locale === 'tr' ? 'Koşullar' : 'Terms'}</Link>
        </div>
      </div>
    </footer>
  );
};
