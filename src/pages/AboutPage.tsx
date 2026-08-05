import { ArrowUpRight, Box, Braces, Building2, Compass, Layers3, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { ProjectArtwork } from '../components/experience/ProjectArtwork';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isAcceptingInquiries } from '../lib/availability';

const content = {
  tr: {
    eyebrow: 'Profil / yaklaşım',
    titleA: 'Mimarlık bana', titleB: 'nasıl bakacağımı;', titleC: 'yazılım nasıl sınayacağımı öğretti.',
    intro: 'Ben Ahmet Cem Karaca. Mimarlık eğitimi alırken aynı zamanda bağımsız dijital ürünler, yapay zekâ araçları ve deneysel sistemler geliştiriyorum.',
    body1: 'Bir binayı yalnızca cephesiyle açıklayamayacağınız gibi, bir ürünü de yalnızca ekranlarıyla açıklayamazsınız. Akışın, taşıyıcı sistemin, sınırların ve kullanım anının birlikte çalışması gerekir.',
    body2: 'Çalışmalarım bu kesişimde duruyor: mimarlık öğrencileri için jüri simülatörü, e-posta özet servisi, dijital sağlık ürünü, mobil keşif deneyimleri ve yaratıcı üretim araçları.',
    body3: 'ACKARACA LIMITED çatısı altında fikirleri küçük deneylerden, test edilebilir ve yönetilebilir ürün sistemlerine dönüştürüyorum.',
    principles: 'Çalışma ilkeleri',
    principle1: 'Önce bağlam', principle1Body: 'Teknolojiden önce insanı, kısıtı ve gerçek kullanım anını tanımlarım.',
    principle2: 'Görünür kararlar', principle2Body: 'Neden yaptığımı, trade-off’ları ve sistem sınırlarını belgelerim.',
    principle3: 'Güven varsayılan', principle3Body: 'Erişilebilirlik, performans ve güvenliği son kontrol değil tasarım girdisi sayarım.',
    stack: 'Çalışma alanları',
    stackBody: 'Tek bir unvana sığmayan; araştırma, ürün tasarımı, frontend, backend ve güvenlik arasında ilerleyen bir pratik.',
    now: 'Şimdi',
    nowTitle: 'Daha az ama daha derin ürünler.',
    nowBody: 'Mimarlık bilgisini yapay zekâ ve etkileşim tasarımıyla buluşturan ürünlere, güvenilir admin sistemlerine ve uzun ömürlü dijital altyapılara odaklanıyorum.',
    contact: 'Birlikte çalışmayı konuşalım',
  },
  en: {
    eyebrow: 'Profile / approach',
    titleA: 'Architecture taught me', titleB: 'how to look;', titleC: 'software taught me how to test.',
    intro: 'I’m Ahmet Cem Karaca. Alongside studying architecture, I build independent digital products, AI tools, and experimental systems.',
    body1: 'Just as a building cannot be explained by its façade alone, a product cannot be explained by its screens. Flow, structure, boundaries, and the moment of use all have to work together.',
    body2: 'My work sits at that intersection: an architecture jury simulator, an email digest service, a digital wellbeing product, mobile discovery experiences, and tools for creative production.',
    body3: 'Through ACKARACA LIMITED, I turn ideas from small experiments into product systems that can be tested, managed, and maintained.',
    principles: 'Working principles',
    principle1: 'Context first', principle1Body: 'Before technology, I define the person, the constraint, and the real moment of use.',
    principle2: 'Visible decisions', principle2Body: 'I document why, the trade-offs, and where the system’s boundaries sit.',
    principle3: 'Trust by default', principle3Body: 'I treat accessibility, performance, and security as design inputs—not a final check.',
    stack: 'Practice areas',
    stackBody: 'A practice that does not fit one title, moving across research, product design, frontend, backend, and security.',
    now: 'Now',
    nowTitle: 'Fewer products, built more deeply.',
    nowBody: 'I’m focused on products that bring architectural knowledge together with AI and interaction design, reliable admin systems, and durable digital infrastructure.',
    contact: 'Let’s talk about working together',
  },
} as const;

export default function AboutPage() {
  const { locale } = useAppPreferences();
  const { settings, projects } = useContent();
  const t = content[locale];
  const representative = projects.find((project) => project.slug === 'archbuilder') ?? projects[0];
  const acceptingInquiries = isAcceptingInquiries(settings.availability);

  useDocumentMeta({
    title: locale === 'tr' ? 'Profil — Ahmet Cem Karaca' : 'Profile — Ahmet Cem Karaca',
    description: t.intro,
    path: '/about',
    locale,
    type: 'profile',
  });

  const practiceAreas = [
    { icon: Compass, title: locale === 'tr' ? 'Araştırma & strateji' : 'Research & strategy', body: locale === 'tr' ? 'Problem çerçevesi, kullanıcı yolculuğu, bilgi mimarisi.' : 'Problem framing, user journeys, information architecture.' },
    { icon: Building2, title: locale === 'tr' ? 'Mimari düşünce' : 'Architectural thinking', body: locale === 'tr' ? 'Mekân, bağlam, hiyerarşi ve sunum sistemleri.' : 'Space, context, hierarchy, and presentation systems.' },
    { icon: Box, title: locale === 'tr' ? 'Ürün tasarımı' : 'Product design', body: locale === 'tr' ? 'Etkileşim, prototip, içerik ve tasarım sistemi.' : 'Interaction, prototyping, content, and design systems.' },
    { icon: Braces, title: locale === 'tr' ? 'Ürün mühendisliği' : 'Product engineering', body: locale === 'tr' ? 'React, TypeScript, Firebase, Appwrite ve Python.' : 'React, TypeScript, Firebase, Appwrite, and Python.' },
  ];

  const principles = [
    { icon: Layers3, title: t.principle1, body: t.principle1Body },
    { icon: Compass, title: t.principle2, body: t.principle2Body },
    { icon: ShieldCheck, title: t.principle3, body: t.principle3Body },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="page about-page">
      <header className="about-hero shell">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1><span>{t.titleA}</span><em>{t.titleB}</em><span>{t.titleC}</span></h1>
        <div className="about-hero__intro"><p>{t.intro}</p><span>{localize(settings.location, locale)}</span></div>
      </header>

      <section className="about-story shell">
        <div className="about-story__mark" aria-hidden="true"><span>AC</span><small>Architecture × Product</small></div>
        <div className="about-story__copy"><p>{t.body1}</p><p>{t.body2}</p><p>{t.body3}</p></div>
      </section>

      <section className="section principles-section">
        <div className="shell">
          <header className="section-heading"><span className="eyebrow">01 / {t.principles}</span><h2>{locale === 'tr' ? 'İyi görünen şeyden önce, iyi çalışan sistem.' : 'A system that works before an object that merely looks good.'}</h2></header>
          <div className="principles-grid">
            {principles.map(({ icon: Icon, title, body }, index) => (
              <article key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section practice-section shell">
        <header className="section-heading section-heading--split"><div><span className="eyebrow">02 / {t.stack}</span><h2>{t.stack}</h2></div><p>{t.stackBody}</p></header>
        <div className="practice-grid">
          {practiceAreas.map(({ icon: Icon, title, body }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="section now-section">
        <div className="shell now-section__grid">
          <div><span className="eyebrow">03 / {t.now}</span><h2>{t.nowTitle}</h2><p>{t.nowBody}</p><Link href={acceptingInquiries ? '/contact' : '/work'} className="text-link text-link--large">{acceptingInquiries ? t.contact : (locale === 'tr' ? 'Seçili işleri incele' : 'Explore selected work')}<ArrowUpRight aria-hidden="true" /></Link></div>
          {representative ? <ProjectArtwork slug={representative.slug} variant={representative.cover.visualVariant} palette={representative.cover.palette} title={localize(representative.title, locale)} caption={localize(representative.cover.alt, locale)} /> : null}
        </div>
      </section>
    </main>
  );
}
