import { useEffect, useMemo, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Command } from 'lucide-react';
import { Link } from 'wouter';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { Marquee } from '../components/experience/Marquee';
import { ProjectConstellation } from '../components/experience/ProjectConstellation';
import { Reveal } from '../components/experience/Reveal';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { usePointerGlow } from '../hooks/usePointerGlow';
import { availabilityLabel, isAcceptingInquiries } from '../lib/availability';

const copy = {
  tr: {
    status: 'Yeni iş ve işbirliği görüşmelerine açık',
    kicker: 'Mimarlık düşüncesi × dijital ürünler',
    headlineA: 'Mekân gibi',
    headlineB: 'düşünüyor,',
    headlineC: 'ürün gibi inşa ediyorum.',
    intro: 'Mimarlıkta öğrendiğim bağlam, hiyerarşi ve sistem düşüncesini; insanların gerçekten kullanabildiği dijital ürünlere taşıyorum.',
    exploreWork: 'Seçili işleri incele',
    search: 'Projelerimde ara',
    searchHint: 'AI, mimarlık, mobil veya kullandığım araçları yazın',
    hireLens: 'İşveren görünümü',
    exploreLens: 'Keşif görünümü',
    selectedEyebrow: 'Seçili işler / 2025—2026',
    selectedTitle: 'Fikirden çalışan sisteme.',
    selectedBodyHire: 'Rolümü, kararlarımı ve teknik kapsamı hızla okuyabileceğiniz seçilmiş ürün çalışmaları.',
    selectedBodyExplore: 'Araştırma, mimari düşünce ve yazılımın birbirine karıştığı seçilmiş deneyler.',
    allWork: 'Tüm işleri gör',
    methodEyebrow: 'Çalışma biçimi',
    methodTitle: 'İki disiplin. Tek bir düşünme sistemi.',
    methodBody: 'Her projeyi önce bir çevre olarak okur, sonra akışı, sınırları ve geri bildirimi tasarlarım. Kod en son katman değil; fikri test etmenin bir yolu.',
    capability1: 'Bağlamı kur',
    capability1Body: 'İhtiyaçları, kısıtları ve gerçek kullanım anını görünür hale getiririm.',
    capability2: 'Sistemi çiz',
    capability2Body: 'Bilgi mimarisini, veri akışını ve kritik kararları tek bir omurgada toplarım.',
    capability3: 'Çalışan şeyi üret',
    capability3Body: 'Arayüzü, backend’i ve güvenlik sınırlarını birlikte ele alarak ürünü doğrularım.',
    profileEyebrow: 'Kısa profil',
    profileTitle: 'Mimarlık öğrencisi, ürün kurucusu ve bağımsız geliştirici.',
    profileBody: 'ACKARACA LIMITED çatısı altında; yapay zekâ destekli mimarlık araçlarından üretkenlik ve mobil keşif ürünlerine uzanan projeler geliştiriyorum.',
    readProfile: 'Profili oku',
    projectCount: 'seçili proje',
    disciplineCount: 'çalışma alanı',
    technologyCount: 'araç ve teknoloji',
    languages: 'TR + EN',
    languagesLabel: 'iki dilli anlatım',
    scroll: 'Kaydır',
    statsLabel: 'Pratik özeti',
  },
  en: {
    status: 'Open to work and collaboration conversations',
    kicker: 'Architectural thinking × digital products',
    headlineA: 'Thinking in',
    headlineB: 'spaces,',
    headlineC: 'building in systems.',
    intro: 'I bring the context, hierarchy, and systems thinking I learned through architecture into digital products people can actually use.',
    exploreWork: 'Explore selected work',
    search: 'Search my work',
    searchHint: 'Try AI, architecture, mobile, or a tool I use',
    hireLens: 'Hiring view',
    exploreLens: 'Explore view',
    selectedEyebrow: 'Selected work / 2025—2026',
    selectedTitle: 'From an idea to a working system.',
    selectedBodyHire: 'Selected product work designed to make my role, decisions, and technical scope quick to assess.',
    selectedBodyExplore: 'Selected experiments where research, architectural thinking, and software start to overlap.',
    allWork: 'View all work',
    methodEyebrow: 'How I work',
    methodTitle: 'Two disciplines. One system of thought.',
    methodBody: 'I read every project as an environment first, then design its flow, boundaries, and feedback. Code is not the last layer; it is a way to test the idea.',
    capability1: 'Frame the context',
    capability1Body: 'I make needs, constraints, and the real moment of use visible.',
    capability2: 'Draw the system',
    capability2Body: 'I bring information architecture, data flow, and critical decisions into one spine.',
    capability3: 'Build the working thing',
    capability3Body: 'I validate interface, backend, and security boundaries as one product.',
    profileEyebrow: 'Short profile',
    profileTitle: 'Architecture student, product founder, and independent developer.',
    profileBody: 'Through ACKARACA LIMITED, I build projects spanning AI-assisted architecture tools, productivity systems, and mobile discovery products.',
    readProfile: 'Read the profile',
    projectCount: 'selected projects',
    disciplineCount: 'practice areas',
    technologyCount: 'tools & technologies',
    languages: 'TR + EN',
    languagesLabel: 'bilingual narrative',
    scroll: 'Scroll',
    statsLabel: 'Practice summary',
  },
} as const;

const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const raw = useMotionValue(0);
  const rounded = useTransform(raw, (latest) => Math.round(latest).toString());

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(raw, value, { duration: 1.5, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, raw, value]);

  return (
    <strong>
      <motion.span ref={ref}>{rounded}</motion.span>
    </strong>
  );
};

export default function HomePage() {
  const { settings, projects, featuredProjects } = useContent();
  const { locale, lens, setLens, motionEnabled } = useAppPreferences();
  const t = copy[locale];
  const heroGlowRef = usePointerGlow<HTMLElement>();

  const selectedProjects = useMemo(() => {
    if (lens === 'hire') return (featuredProjects.length ? featuredProjects : projects).slice(0, 4);
    return [...projects].sort((left, right) => {
      const experimentDelta = Number(right.format === 'experiment') - Number(left.format === 'experiment');
      return experimentDelta || (left.order ?? 100) - (right.order ?? 100);
    }).slice(0, 4);
  }, [featuredProjects, projects, lens]);

  const disciplineCount = new Set(projects.map((project) => project.discipline)).size;
  const technologyCount = new Set(projects.flatMap((project) => project.technologies)).size;
  const acceptingInquiries = isAcceptingInquiries(settings.availability);
  const availabilityCopy = availabilityLabel(settings.availability, locale);

  const marqueeItems = useMemo(() => [
    ...new Set([
      ...projects.slice(0, 6).map((project) => localize(project.title, locale)),
      ...projects.flatMap((project) => project.technologies.slice(0, 1)),
    ]),
  ], [projects, locale]);

  const methods = [
    { title: t.capability1, body: t.capability1Body },
    { title: t.capability2, body: t.capability2Body },
    { title: t.capability3, body: t.capability3Body },
  ];

  useDocumentMeta({
    title: localize(settings.defaultSeo.title, locale),
    description: localize(settings.defaultSeo.description, locale),
    locale,
    type: 'profile',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Ahmet Cem Karaca',
      url: locale === 'en' ? `${settings.canonicalUrl.replace(/\/$/, '')}/en` : settings.canonicalUrl,
      email: `mailto:${settings.contactEmail}`,
      jobTitle: locale === 'tr' ? 'Mimarlık öğrencisi ve ürün geliştirici' : 'Architecture student and product developer',
      sameAs: settings.socialLinks.map((link) => link.href),
      knowsAbout: ['Architecture', 'Product design', 'TypeScript', 'Firebase', 'Artificial intelligence'],
    },
  });

  const openSearch = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  const heroLines = [t.headlineA, t.headlineB, t.headlineC];

  return (
    <main id="main-content" tabIndex={-1} className="home-page">
      <section className="home-hero" ref={heroGlowRef}>
        <span className="home-hero__aura" aria-hidden="true" />
        <ProjectConstellation
          projects={projects}
          motionEnabled={motionEnabled}
          palette={['#2b3fee', '#0c8a6d', '#c97a15']}
          className="home-hero__constellation"
        />
        <div className="shell home-hero__grid">
          <div className="home-hero__copy">
            <motion.div
              className="availability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <i aria-hidden="true" /> {availabilityCopy}
            </motion.div>
            <p className="home-hero__kicker">{t.kicker}</p>
            <h1>
              {heroLines.map((line, index) => (
                <span key={line}>
                  <span className={index === 1 ? 'home-hero__serif' : ''} style={{ '--line-i': index } as React.CSSProperties}>{line}</span>
                </span>
              ))}
            </h1>
            <p className="home-hero__intro">{t.intro}</p>
            <div className="home-hero__actions">
              <Link href="/work" className="button button--primary">{t.exploreWork}<ArrowRight aria-hidden="true" /></Link>
              {acceptingInquiries ? (
                <a href={`mailto:${settings.contactEmail}`} className="button button--ghost">{settings.contactEmail}<ArrowUpRight aria-hidden="true" /></a>
              ) : (
                <Link href="/about" className="button button--ghost">{locale === 'tr' ? 'Profili oku' : 'Read the profile'}<ArrowUpRight aria-hidden="true" /></Link>
              )}
            </div>
          </div>

          <div className="home-hero__utility">
            <button type="button" className="hero-search" onClick={openSearch}>
              <span className="hero-search__icon"><Command aria-hidden="true" /></span>
              <span><strong>{t.search}</strong><small>{t.searchHint}</small></span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="lens-switch" role="group" aria-label={locale === 'tr' ? 'Ziyaret görünümü' : 'Visitor view'}>
              <button type="button" className={lens === 'hire' ? 'is-active' : ''} onClick={() => setLens('hire')} aria-pressed={lens === 'hire'}>
                {t.hireLens}
              </button>
              <button type="button" className={lens === 'explore' ? 'is-active' : ''} onClick={() => setLens('explore')} aria-pressed={lens === 'explore'}>
                {t.exploreLens}
              </button>
            </div>
          </div>
        </div>
        <div className="shell">
          <a className="home-hero__scroll" href="#selected-work"><ArrowDown aria-hidden="true" /> {t.scroll}</a>
        </div>
      </section>

      <Marquee items={marqueeItems} />

      <section className="section" aria-label={t.statsLabel}>
        <div className="shell">
          <Reveal className="stats-band">
            <div className="stat"><CountUp value={projects.length} /><span>{t.projectCount}</span></div>
            <div className="stat"><CountUp value={disciplineCount} /><span>{t.disciplineCount}</span></div>
            <div className="stat"><CountUp value={technologyCount} /><span>{t.technologyCount}</span></div>
            <div className="stat"><strong>{t.languages}</strong><span>{t.languagesLabel}</span></div>
          </Reveal>
        </div>
      </section>

      <section className="section selected-work" id="selected-work">
        <div className="shell">
          <Reveal as="header" className="section-heading section-heading--split">
            <div><span className="eyebrow">{t.selectedEyebrow}</span><h2>{t.selectedTitle}</h2></div>
            <div><p>{lens === 'hire' ? t.selectedBodyHire : t.selectedBodyExplore}</p><Link href="/work" className="text-link">{t.allWork}<ArrowUpRight aria-hidden="true" /></Link></div>
          </Reveal>
          <div className="project-grid">
            {selectedProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
          </div>
        </div>
      </section>

      <section className="section method-section">
        <div className="shell method-section__grid">
          <Reveal className="method-section__intro">
            <span className="eyebrow">{t.methodEyebrow}</span>
            <h2>{t.methodTitle}</h2>
            <p>{t.methodBody}</p>
          </Reveal>
          <ol className="method-list">
            {methods.map(({ title, body }, index) => (
              <Reveal as="li" key={title} delay={index * 0.08}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section profile-teaser">
        <div className="shell profile-teaser__grid">
          <Reveal className="profile-teaser__portrait">
            <span>AC</span><i /><i /><i />
          </Reveal>
          <Reveal className="profile-teaser__copy" delay={0.08}>
            <span className="eyebrow">{t.profileEyebrow}</span>
            <h2>{t.profileTitle}</h2>
            <p>{t.profileBody}</p>
            <Link href="/about" className="text-link text-link--large">{t.readProfile}<ArrowUpRight aria-hidden="true" /></Link>
          </Reveal>
          <dl className="profile-teaser__facts">
            <div><dt>{projects.length}</dt><dd>{t.projectCount}</dd></div>
            <div><dt>{disciplineCount}</dt><dd>{t.disciplineCount}</dd></div>
            <div><dt>{t.languages}</dt><dd>{t.languagesLabel}</dd></div>
          </dl>
        </div>
      </section>
    </main>
  );
}
