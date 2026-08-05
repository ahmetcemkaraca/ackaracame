import { Component, Suspense, lazy, useCallback, useEffect, useRef, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { Redirect, Route, Router, Switch, useLocation, useRouter } from 'wouter';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { AppPreferencesProvider, useAppPreferences } from './context/AppPreferences';
import { ContentProvider, useContent } from './context/Content';
import { siteSettings } from './data/portfolio';
import { ENGLISH_PREFIX, isLocaleNeutralPublicPath, localeFromPath, localePath, stripLocalePrefix } from './lib/localeRouting';

const HomePage = lazy(() => import('./pages/HomePage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LabPage = lazy(() => import('./pages/LabPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const JournalEntryPage = lazy(() => import('./pages/JournalEntryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const LegalDirectoryPage = lazy(() => import('./pages/LegalDirectoryPage'));
const LegacyPaftaPage = lazy(() => import('./pages/LegacyPaftaPage'));
const StudioRoute = lazy(() => import('./pages/StudioRoute'));
const StudioMfaSetupPage = lazy(() => import('./pages/StudioMfaSetupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const LoadingSurface = () => <main id="main-content" className="route-loading" tabIndex={-1} aria-busy="true" aria-live="polite"><span aria-hidden="true" /><span className="sr-only">Loading</span></main>;

export const decodeHashTargetId = (hash: string): string | null => {
  if (!hash.startsWith('#') || hash.length < 2) return null;
  try {
    return decodeURIComponent(hash.slice(1)) || null;
  } catch {
    return null;
  }
};

class AppErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Portfolio route failed to render.', error, info);
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="fatal-error shell">
          <span className="eyebrow">Render recovery</span>
          <h1>Bu yüzey yüklenemedi.</h1>
          <p>Sayfayı güvenli biçimde yeniden yükleyerek devam edebilirsiniz.</p>
          <button type="button" className="button button--primary" onClick={() => window.location.reload()}>Yeniden yükle</button>
        </main>
      );
    }
    return this.props.children;
  }
}

const ScrollManager = () => {
  const [location] = useLocation();
  const initialRender = useRef(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const hash = window.location.hash;
    const hashTargetId = decodeHashTargetId(hash);
    if (!hashTargetId) window.scrollTo({ top: 0, behavior: 'instant' });

    let lastTarget: Element | null = null;
    const syncRouteTarget = () => {
      const target = hashTargetId
        ? document.getElementById(hashTargetId)
        : document.querySelector<HTMLElement>('#main-content');
      if (!target || target === lastTarget) return;
      lastTarget = target;
      if (hashTargetId) target.scrollIntoView();
      else (target as HTMLElement).focus({ preventScroll: true });
    };
    const frame = window.requestAnimationFrame(syncRouteTarget);
    // Lazy routes can replace the Suspense surface after the pathname effect
    // has run. Observe that commit so focus reaches the actual page as well.
    const observer = new MutationObserver(syncRouteTarget);
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 10_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [location]);
  return null;
};

const PublicRoutes = () => {
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
      {permanentRoutes ? <Route path="/pafta/:qrCode" component={LegacyPaftaPage} /> : null}
      <Route path="/portfolio">{() => <Redirect to="/work" replace />}</Route>
      <Route path="/portfolio/:slug/changelog">{(params) => <Redirect to={`/work/${params.slug}`} replace />}</Route>
      <Route path="/portfolio/:slug">{(params) => <Redirect to={`/work/${params.slug}`} replace />}</Route>
      <Route path="/project/:slug">{(params) => <Redirect to={`/work/${params.slug}`} replace />}</Route>
      <Route path="/applications/:slug">{(params) => <Redirect to={`/work/${params.slug}`} replace />}</Route>
      <Route path="/applications">{() => <Redirect to="/work" replace />}</Route>
      <Route path="/archived-works">{() => <Redirect to="/work" replace />}</Route>
      <Route path="/experiments">{() => <Redirect to="/lab" replace />}</Route>
      <Route path="/inspiration-gallery">{() => <Redirect to="/lab" replace />}</Route>
      <Route path="/inspiration/:slug">{() => <Redirect to="/lab" replace />}</Route>
      <Route path="/semester-projects">{() => <Redirect to="/work" replace />}</Route>
      <Route path="/blog">{() => <Redirect to="/journal" replace />}</Route>
      <Route path="/blog/:slug">{(params) => <Redirect to={`/journal/${params.slug}`} replace />}</Route>
      <Route path="/services">{() => <Redirect to="/about" replace />}</Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
};

const PublicFrame = () => {
  const { settings, projects, journal } = useContent();
  return (
    <>
      <a className="skip-link" href="#main-content">İçeriğe geç / Skip to content</a>
      <SiteHeader settings={settings} projects={projects} journal={journal} />
      <PublicRoutes />
      <SiteFooter settings={settings} showJournal={journal.length > 0} />
    </>
  );
};

const RoutedApp = () => {
  const [location] = useLocation();
  const { base } = useRouter();
  const { motionEnabled } = useAppPreferences();
  const studioRoute = base !== ENGLISH_PREFIX && (location === '/studio' || location.startsWith('/studio/') || location === '/admin');
  return (
    <MotionConfig reducedMotion={motionEnabled ? 'user' : 'always'}>
      <ScrollManager />
      <AppErrorBoundary>
        <Suspense fallback={<LoadingSurface />}>
          {studioRoute ? (
            <Switch>
              <Route path="/admin">{() => <Redirect to="/studio" replace />}</Route>
              <Route path="/studio/setup" component={StudioMfaSetupPage} />
              <Route path="/studio" component={StudioRoute} />
              <Route path="/studio/:rest*" component={StudioRoute} />
            </Switch>
          ) : <PublicFrame />}
        </Suspense>
      </AppErrorBoundary>
    </MotionConfig>
  );
};

const LocaleBoundary = () => {
  const [absoluteLocation, navigate] = useLocation();
  const locale = localeFromPath(absoluteLocation);
  const base = locale === 'en' ? ENGLISH_PREFIX : '';
  const localeNeutral = isLocaleNeutralPublicPath(absoluteLocation);
  const changeLocale = useCallback((nextLocale: 'tr' | 'en') => {
    const target = localePath(stripLocalePrefix(absoluteLocation), nextLocale);
    const suffix = typeof window === 'undefined' ? '' : `${window.location.search}${window.location.hash}`;
    if (target !== absoluteLocation) navigate(`${target}${suffix}`);
  }, [absoluteLocation, navigate]);

  return (
    <Router base={base}>
      <AppPreferencesProvider
        routeLocale={localeNeutral ? undefined : locale}
        defaultLocale={siteSettings.defaultLocale}
        onLocaleChange={changeLocale}
      >
        <ContentProvider>
          <RoutedApp />
        </ContentProvider>
      </AppPreferencesProvider>
    </Router>
  );
};

export default function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <Router ssrPath={ssrPath}>
      <LocaleBoundary />
    </Router>
  );
}
