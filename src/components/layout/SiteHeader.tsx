import { useEffect, useMemo, useRef, useState } from 'react';
import { Command, Menu, Moon, Sun, X } from 'lucide-react';
import { Link, useLocation, useRouter } from 'wouter';
import { useAppPreferences, localize } from '../../context/AppPreferences';
import { journalEntryPath, type JournalEntry, type PortfolioProject, type SiteSettings } from '../../domain/content';
import { useLocaleHref } from '../../hooks/useLocaleHref';
import { availabilityLabel } from '../../lib/availability';
import { ENGLISH_PREFIX, localePath, stripLocalePrefix } from '../../lib/localeRouting';
import { CommandPalette } from '../experience/CommandPalette';

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

export const SiteHeader = ({ settings, projects, journal }: SiteHeaderProps) => {
  const [location, navigate] = useLocation();
  const { base } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale, resolvedTheme, setTheme } = useAppPreferences();
  const localeHref = useLocaleHref();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
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

  const paletteProjects = useMemo(() => projects.map((project) => ({
    slug: project.slug,
    title: localize(project.title, locale),
    description: localize(project.dek, locale),
    category: project.discipline,
    tags: project.technologies,
    keywords: project.topics,
    href: localePath(`/work/${project.slug}`, locale),
  })), [projects, locale]);

  const paletteNavigation = useMemo(() => [
    ...navigation.map((item) => ({
      id: item.href,
      label: item[locale],
      href: localePath(item.href, locale),
      keywords: item.keywords as readonly string[],
    })),
    ...journal.map((entry) => ({
      id: `journal-${entry.slug}`,
      label: localize(entry.title, locale),
      description: localize(entry.excerpt, locale),
      href: localePath(journalEntryPath(entry), locale),
      keywords: entry.topics,
    })),
  ], [journal, locale]);

  const handleNavigate = (href: string) => {
    if (href.startsWith('/')) navigate(base === ENGLISH_PREFIX ? stripLocalePrefix(href) : href);
    else window.location.assign(href);
  };

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header__inner shell">
        <Link href={localeHref('/')} className="brand" aria-label={`${localize(settings.ownerName, locale)} — ${locale === 'tr' ? 'ana sayfa' : 'home'}`}>
          <span className="brand__mark" aria-hidden="true"><i>A</i><i>C</i></span>
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
          <CommandPalette
            projects={paletteProjects}
            navigationItems={paletteNavigation}
            projectHref={(project) => project.href ?? localePath(`/work/${project.slug}`, locale)}
            onNavigate={handleNavigate}
            labels={locale === 'tr' ? {
              trigger: 'Projelerde ara', shortcut: '⌘ K', dialog: 'Portfolyoda ara', input: 'Arama',
              placeholder: 'Proje, teknoloji veya sayfa ara…', close: 'Kapat', navigation: 'Sayfalar', projects: 'Projeler', empty: 'Sonuç bulunamadı.',
            } : {
              trigger: 'Search work', shortcut: '⌘ K', dialog: 'Search the portfolio', input: 'Search',
              placeholder: 'Search projects, tools, or pages…', close: 'Close', navigation: 'Pages', projects: 'Projects', empty: 'No matching result.',
            }}
          />
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

      <div ref={mobileMenuRef} id="mobile-navigation" className={`mobile-nav${menuOpen ? ' mobile-nav--open' : ''}`} hidden={!menuOpen} role="dialog" aria-modal="true" aria-label={locale === 'tr' ? 'Mobil navigasyon' : 'Mobile navigation'}>
        <nav className="shell" aria-label={locale === 'tr' ? 'Mobil navigasyon' : 'Mobile navigation'}>
          {navigation.map((item, index) => (
            <Link key={item.href} href={localeHref(item.href)} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{item[locale]}
            </Link>
          ))}
          <div className="mobile-nav__status">
            <i aria-hidden="true" />
            {availabilityLabel(settings.availability, locale)}
          </div>
          <button type="button" onClick={() => { setMenuOpen(false); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true })); }}>
            <Command aria-hidden="true" /> {locale === 'tr' ? 'Hızlı aramayı aç' : 'Open quick search'}
          </button>
        </nav>
      </div>
    </header>
  );
};
