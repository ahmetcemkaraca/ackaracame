import { useEffect, useRef, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAppPreferences, localize } from '../../context/AppPreferences';
import type { JournalEntry, PortfolioProject, SiteSettings } from '../../domain/content';
import { useLocaleHref } from '../../hooks/useLocaleHref';
import { availabilityLabel } from '../../lib/availability';

interface SiteHeaderProps {
  settings: SiteSettings;
  projects: PortfolioProject[];
  journal: JournalEntry[];
}

const navigation = [
  { href: '/work', tr: 'İşler', en: 'Work', keywords: ['projects', 'portfolio', 'ürünler'] },
  { href: '/about', tr: 'Profil', en: 'Profile', keywords: ['about', 'bio', 'hakkında'] },
  { href: '/lab', tr: 'Laboratuvar', en: 'Lab', keywords: ['experiments', 'notes', 'deneyler'] },
  { href: '/journal', tr: 'Journal', en: 'Journal', keywords: ['writing', 'essays', 'yazılar'] },
  { href: '/contact', tr: 'İletişim', en: 'Contact', keywords: ['hire', 'email', 'iş'] },
] as const;

export const SiteHeader = ({ settings }: SiteHeaderProps) => {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale, resolvedTheme, setTheme } = useAppPreferences();
  const localeHref = useLocaleHref();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 16);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      headerRef.current?.style.setProperty('--scroll-progress', progress.toFixed(4));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    if (!menuOpen) return () => document.body.classList.remove('nav-open');

    const background = [document.querySelector<HTMLElement>('#main-content'), document.querySelector<HTMLElement>('.site-footer')].filter(Boolean) as HTMLElement[];
    const menuButton = menuButtonRef.current;
    background.forEach((element) => element.setAttribute('inert', ''));
    const focusable = () => [
      menuButton,
      ...Array.from(mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []),
    ].filter(Boolean) as HTMLElement[];
    window.requestAnimationFrame(() => focusable()[1]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('nav-open');
      background.forEach((element) => element.removeAttribute('inert'));
      document.removeEventListener('keydown', handleKeyDown);
      menuButton?.focus();
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header__inner shell">
        <Link href={localeHref('/')} className="brand" aria-label={`${localize(settings.ownerName, locale)} — ${locale === 'tr' ? 'ana sayfa' : 'home'}`}>
          <img className="brand__mark" src="/AC-KARACA.svg" alt="" aria-hidden="true" />
          <span className="brand__name">Ahmet Cem<br />Karaca</span>
        </Link>

        <nav className="site-header__nav" aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Primary navigation'}>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={localeHref(item.href)}
              className={location === item.href || location.startsWith(`${item.href}/`) ? 'is-active' : ''}
            >
              {item[locale]}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="icon-button site-header__theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={locale === 'tr' ? 'Renk temasını değiştir' : 'Toggle colour theme'}
          >
            {resolvedTheme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="locale-button"
            onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')}
            aria-label={locale === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
          >
            {locale === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button site-header__menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? (locale === 'tr' ? 'Menüyü kapat' : 'Close menu') : (locale === 'tr' ? 'Menüyü aç' : 'Open menu')}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <span className="site-header__progress" aria-hidden="true" />

      <div ref={mobileMenuRef} id="mobile-navigation" className={`mobile-nav${menuOpen ? ' mobile-nav--open' : ''}`} hidden={!menuOpen} role="dialog" aria-modal="true" aria-label={locale === 'tr' ? 'Mobil navigasyon' : 'Mobile navigation'}>
        <nav className="shell" aria-label={locale === 'tr' ? 'Mobil navigasyon' : 'Mobile navigation'}>
          {navigation.map((item, index) => (
            <Link key={item.href} href={localeHref(item.href)} onClick={() => setMenuOpen(false)} style={{ '--nav-i': index } as React.CSSProperties}>
              <span>0{index + 1}</span>{item[locale]}
            </Link>
          ))}
          <div className="mobile-nav__status">
            <i aria-hidden="true" />
            {availabilityLabel(settings.availability, locale)}
          </div>
        </nav>
      </div>
    </header>
  );
};
