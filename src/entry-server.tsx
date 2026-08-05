import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { Route, Router, Switch, useRouter } from 'wouter';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { AppPreferencesProvider, localize, type Locale } from './context/AppPreferences';
import { ContentProvider, useContent } from './context/Content';
import { allEntries, portfolioProjects, siteSettings } from './data/portfolio';
import { journalEntryPath, type JournalEntry } from './domain/content';
import {
  ENGLISH_PREFIX,
  absoluteLocaleUrl,
  isLocaleNeutralPublicPath,
  localeAlternates,
  localeFromPath,
  localePath,
  stripLocalePrefix,
  type LocaleAlternates,
} from './lib/localeRouting';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import JournalEntryPage from './pages/JournalEntryPage';
import JournalPage from './pages/JournalPage';
import LabPage from './pages/LabPage';
import LegalPage from './pages/LegalPage';
import LegalDirectoryPage from './pages/LegalDirectoryPage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectPage from './pages/ProjectPage';
import WorkPage from './pages/WorkPage';

export interface StaticMeta {
  title: string;
  description: string;
  canonical: string;
  locale: Locale;
  alternates?: LocaleAlternates;
  type: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

const StaticRoutes = () => {
  const { base } = useRouter();
  const permanentRoutes = base !== ENGLISH_PREFIX;
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/work" component={WorkPage} />
      <Route path="/work/:slug" component={ProjectPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/lab" component={LabPage} />
      <Route path="/lab/:slug">{() => <JournalEntryPage base="lab" />}</Route>
      <Route path="/journal" component={JournalPage} />
      <Route path="/journal/:slug">{() => <JournalEntryPage base="journal" />}</Route>
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy">{() => <LegalPage kind="privacy" />}</Route>
      <Route path="/terms">{() => <LegalPage kind="terms" />}</Route>
      {permanentRoutes ? <Route path="/account-delete">{() => <LegalPage kind="account-deletion" />}</Route> : null}
      {permanentRoutes ? <Route path="/dua/news">{() => <LegalPage kind="dua-news" />}</Route> : null}
      {permanentRoutes ? <Route path="/wheretogo/news">{() => <LegalPage kind="wheretogo-news" />}</Route> : null}
      {permanentRoutes ? <Route path="/wheretogo/csam">{() => <LegalPage kind="wheretogo-csam" />}</Route> : null}
      {permanentRoutes ? <Route path="/wheretogo/privacy">{() => <LegalPage kind="wheretogo-privacy" />}</Route> : null}
      {permanentRoutes ? <Route path="/wheretogo/terms">{() => <LegalPage kind="wheretogo-terms" />}</Route> : null}
      {permanentRoutes ? <Route path="/all/privacy">{() => <LegalDirectoryPage documentType="privacy" />}</Route> : null}
      {permanentRoutes ? <Route path="/all/terms">{() => <LegalDirectoryPage documentType="terms" />}</Route> : null}
      <Route component={NotFoundPage} />
    </Switch>
  );
};

const StaticFrame = () => {
  const { settings, projects, journal } = useContent();
  return (
    <>
      <a className="skip-link" href="#main-content">İçeriğe geç / Skip to content</a>
      <SiteHeader settings={settings} projects={projects} journal={journal} />
      <StaticRoutes />
      <SiteFooter settings={settings} showJournal={journal.length > 0} />
    </>
  );
};

export const render = (path: string) => {
  const locale = localeFromPath(path);
  const localeNeutral = isLocaleNeutralPublicPath(path);
  return renderToString(
    <Router ssrPath={path}>
      <Router base={locale === 'en' ? ENGLISH_PREFIX : ''}>
        <AppPreferencesProvider routeLocale={localeNeutral ? undefined : locale} defaultLocale={siteSettings.defaultLocale}>
          <ContentProvider>
            <Suspense fallback={<div className="route-loading" role="status"><span aria-hidden="true" /><span className="sr-only">Loading</span></div>}>
              <StaticFrame />
            </Suspense>
          </ContentProvider>
        </AppPreferencesProvider>
      </Router>
    </Router>,
  );
};

type StaticMetaCopy = Pick<StaticMeta, 'title' | 'description' | 'type' | 'noIndex'>;
type LocalizedStaticMetaCopy = Record<Locale, StaticMetaCopy>;

const localizedMeta = (tr: StaticMetaCopy, en: StaticMetaCopy): LocalizedStaticMetaCopy => ({ tr, en });

const basicMeta: Record<string, LocalizedStaticMetaCopy> = {
  '/work': localizedMeta(
    { title: 'İşler — Ahmet Cem Karaca', description: 'Mimarlık, yazılım ve deneysel üretim arasında geliştirilen ürünler, sistemler ve vaka çalışmaları.', type: 'website' },
    { title: 'Work — Ahmet Cem Karaca', description: 'Products, systems, and case studies built across architecture, software, and experimental practice.', type: 'website' },
  ),
  '/about': localizedMeta(
    { title: 'Profil — Ahmet Cem Karaca', description: localize(siteSettings.introduction, 'tr'), type: 'profile' },
    { title: 'Profile — Ahmet Cem Karaca', description: localize(siteSettings.introduction, 'en'), type: 'profile' },
  ),
  '/lab': localizedMeta(
    { title: 'Laboratuvar — Ahmet Cem Karaca', description: 'Küçük araçlar, prototipler, teknik araştırmalar ve yaratıcı sistemler için yaşayan bir kayıt.', type: 'website' },
    { title: 'Lab — Ahmet Cem Karaca', description: 'A living record of small tools, prototypes, technical research, and creative systems.', type: 'website' },
  ),
  '/journal': localizedMeta(
    { title: 'Journal — Ahmet Cem Karaca', description: 'Mimarlık, ürün geliştirme ve çalışan sistemler üzerine süreçleri, kısıtları ve öğrenilenleri görünür kılan yazılar.', type: 'website' },
    { title: 'Journal — Ahmet Cem Karaca', description: 'Writing on architecture, product development, and working systems that keeps processes, constraints, and lessons visible.', type: 'website' },
  ),
  '/contact': localizedMeta(
    { title: 'İletişim — Ahmet Cem Karaca', description: 'Bir rol, dijital ürün, mimarlık aracı veya işbirliği üzerine Ahmet Cem Karaca ile iletişime geçin.', type: 'website' },
    { title: 'Contact — Ahmet Cem Karaca', description: 'Contact Ahmet Cem Karaca about a role, digital product, architecture tool, or collaboration.', type: 'website' },
  ),
  '/privacy': localizedMeta(
    { title: 'Gizlilik politikası — ACKaraca', description: 'ACKaraca.me üzerinden hangi verilerin neden işlendiğini ve haklarınızı açıklayan gizlilik politikası.', type: 'website' },
    { title: 'Privacy policy — ACKaraca', description: 'How and why ACKaraca.me processes information, including the choices and rights available to you.', type: 'website' },
  ),
  '/terms': localizedMeta(
    { title: 'Kullanım koşulları — ACKaraca', description: 'ACKaraca.me portfolyosunun ve herkese açık içeriklerinin kullanım koşulları.', type: 'website' },
    { title: 'Terms of use — ACKaraca', description: 'Terms that apply to the ACKaraca.me portfolio and its publicly available content.', type: 'website' },
  ),
};

const permanentMeta: Record<string, LocalizedStaticMetaCopy> = {
  '/account-delete': localizedMeta(
    { title: 'Hesap silme talebi — ACKaraca', description: 'ACKARACA ürünlerindeki hesabınızı ve ilişkili verilerinizi silmek için doğrulanabilir talep süreci.', type: 'website', noIndex: true },
    { title: 'Account deletion request — ACKaraca', description: 'The verifiable process for deleting your account and associated data from ACKARACA products.', type: 'website', noIndex: true },
  ),
  '/wheretogo/csam': localizedMeta(
    { title: 'Çocuk güvenliği standartları — WhereToGo', description: 'WhereToGo çocuk güvenliği, bildirim ve yaptırım standartları.', type: 'website' },
    { title: 'Child safety standards — WhereToGo', description: 'WhereToGo standards for child safety, reporting, and enforcement.', type: 'website' },
  ),
  '/wheretogo/privacy': localizedMeta(
    { title: 'WhereToGo gizlilik politikası', description: 'WhereToGo konum, hesap, iki kişilik oturum ve eşleşme verilerinin işlenmesine ilişkin gizlilik politikası.', type: 'website' },
    { title: 'WhereToGo privacy policy', description: 'How WhereToGo processes location, account, two-person session, and match data.', type: 'website' },
  ),
  '/wheretogo/terms': localizedMeta(
    { title: 'WhereToGo kullanım koşulları', description: 'WhereToGo konum keşfi, oturum, eşleşme ve güvenli kullanım koşulları.', type: 'website' },
    { title: 'WhereToGo terms of use', description: 'Terms for WhereToGo location discovery, sessions, matching, and safe use.', type: 'website' },
  ),
  '/all/privacy': localizedMeta(
    { title: 'Gizlilik politikaları — ACKaraca', description: 'ACKARACA ürünleri için güncel gizlilik politikaları dizini.', type: 'website', noIndex: true },
    { title: 'Privacy policies — ACKaraca', description: 'Current privacy-policy directory for ACKARACA products.', type: 'website', noIndex: true },
  ),
  '/all/terms': localizedMeta(
    { title: 'Kullanım koşulları — ACKaraca', description: 'ACKARACA ürünleri için güncel kullanım koşulları dizini.', type: 'website', noIndex: true },
    { title: 'Terms of use — ACKaraca', description: 'Current terms-of-use directory for ACKARACA products.', type: 'website', noIndex: true },
  ),
  '/dua/news': localizedMeta(
    { title: 'DuaAPP güncellemeleri', description: 'DuaAPP hizmet, güvenlik ve politika duyuruları.', type: 'website', noIndex: true },
    { title: 'DuaAPP updates', description: 'DuaAPP service, security, and policy notices.', type: 'website', noIndex: true },
  ),
  '/wheretogo/news': localizedMeta(
    { title: 'WhereToGo güncellemeleri', description: 'WhereToGo hizmet, güvenlik ve politika duyuruları.', type: 'website', noIndex: true },
    { title: 'WhereToGo updates', description: 'WhereToGo service, security, and policy notices.', type: 'website', noIndex: true },
  ),
};

export const resolveMeta = (path: string): StaticMeta => {
  const locale = isLocaleNeutralPublicPath(path) ? siteSettings.defaultLocale : localeFromPath(path);
  const logicalPath = stripLocalePrefix(path);
  const canonical = absoluteLocaleUrl(logicalPath, locale);
  const shared = { canonical, locale, alternates: localeAlternates(logicalPath, siteSettings.defaultLocale) };

  if (logicalPath === '/') {
    return {
      title: localize(siteSettings.defaultSeo.title, locale),
      description: localize(siteSettings.defaultSeo.description, locale),
      ...shared,
      type: 'profile',
      noIndex: siteSettings.defaultSeo.noIndex,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: localize(siteSettings.ownerName, locale),
        url: canonical,
        email: `mailto:${siteSettings.contactEmail}`,
        sameAs: siteSettings.socialLinks.map((link) => link.href),
        knowsAbout: ['Architecture', 'Product design', 'TypeScript', 'Firebase', 'Artificial intelligence'],
      },
    };
  }

  const project = logicalPath.startsWith('/work/')
    ? portfolioProjects.find((item) => `/work/${item.slug}` === logicalPath && item.status === 'published')
    : undefined;
  if (project) return {
    title: localize(project.seo.title, locale),
    description: localize(project.seo.description, locale),
    ...shared,
    type: 'article',
    noIndex: siteSettings.defaultSeo.noIndex || project.seo.noIndex,
  };

  const entry = findPublishedEntryForPath(allEntries, logicalPath);
  if (entry) return {
    title: localize(entry.seo.title, locale),
    description: localize(entry.seo.description, locale),
    ...shared,
    type: 'article',
    noIndex: siteSettings.defaultSeo.noIndex || entry.seo.noIndex,
  };

  const basic = basicMeta[logicalPath]?.[locale] ?? permanentMeta[logicalPath]?.[locale];
  if (basic) return { ...basic, ...shared, noIndex: siteSettings.defaultSeo.noIndex || basic.noIndex };
  return {
    title: locale === 'tr' ? 'Sayfa bulunamadı — ACKaraca' : 'Page not found — ACKaraca',
    description: locale === 'tr' ? 'İstenen sayfa bulunamadı.' : 'The requested page could not be found.',
    ...shared,
    type: 'website',
    noIndex: true,
  };
};

export const findPublishedEntryForPath = (entries: readonly JournalEntry[], path: string) => entries
  .find((entry) => entry.status === 'published' && journalEntryPath(entry) === path);

export const publishedEntryPaths = (entries: readonly JournalEntry[]) => entries
  .filter((entry) => entry.status === 'published')
  .map(journalEntryPath);

const localizablePaths = [
  '/', '/work', '/about', '/lab', '/journal', '/contact', '/privacy', '/terms',
  ...portfolioProjects.filter((project) => project.status === 'published').map((project) => `/work/${project.slug}`),
  ...publishedEntryPaths(allEntries),
];

export const staticPaths = [
  ...localizablePaths,
  ...localizablePaths.map((path) => localePath(path, 'en')),
  '/account-delete', '/dua/news', '/wheretogo/news', '/wheretogo/csam', '/wheretogo/privacy', '/wheretogo/terms', '/all/privacy', '/all/terms',
];
