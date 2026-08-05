import { ArrowUpRight, FlaskConical, Music2, PencilRuler, Radar } from 'lucide-react';
import { Link } from 'wouter';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useAppPreferences, localize } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isAcceptingInquiries } from '../lib/availability';

const copy = {
  tr: {
    eyebrow: 'Laboratuvar / devam eden düşünceler',
    title: 'Bitmiş cevaplardan önce gelen deneyler.',
    intro: 'Lab; küçük araçlar, prototipler, teknik araştırmalar ve yaratıcı sistemler için yaşayan bir kayıt. Her deney yayınlanmış bir ürün olmak zorunda değil; ama gerçek bir soruya dayanmalı.',
    principles: 'Laboratuvar kuralları',
    rule1: 'Küçük başla', rule1Body: 'Bir fikrin en riskli varsayımını en küçük çalışan yüzeyde test et.',
    rule2: 'İzi koru', rule2Body: 'Kararları, girdileri ve tekrar üretilebilir adımları görünür bırak.',
    rule3: 'Gerçeğe bağla', rule3Body: 'Deneysel olanı bile gerçek bir kullanım anı ve kısıtla sınırla.',
    experiments: 'Aktif deneyler',
    notes: 'Alan notları',
    notesEmpty: 'Yayınlanmış alan notları hazırlanıyor. Bu sırada aktif deneyleri inceleyebilirsiniz.',
    discuss: 'Bir deney fikrini konuşalım',
  },
  en: {
    eyebrow: 'Lab / thoughts in progress',
    title: 'Experiments that come before finished answers.',
    intro: 'The Lab is a living record of small tools, prototypes, technical studies, and creative systems. An experiment does not have to be a shipped product, but it should begin with a real question.',
    principles: 'Lab rules',
    rule1: 'Start small', rule1Body: 'Test the riskiest assumption on the smallest working surface.',
    rule2: 'Keep the trace', rule2Body: 'Leave decisions, inputs, and reproducible steps visible.',
    rule3: 'Anchor it in reality', rule3Body: 'Give even experimental work a real moment of use and a constraint.',
    experiments: 'Active experiments',
    notes: 'Field notes',
    notesEmpty: 'Published field notes are in preparation. Explore the active experiments in the meantime.',
    discuss: 'Discuss an experiment idea',
  },
} as const;

export default function LabPage() {
  const { projects, lab, settings } = useContent();
  const { locale } = useAppPreferences();
  const t = copy[locale];
  const experiments = projects.filter((project) => project.format === 'experiment');
  const acceptingInquiries = isAcceptingInquiries(settings.availability);

  useDocumentMeta({
    title: locale === 'tr' ? 'Laboratuvar — Ahmet Cem Karaca' : 'Lab — Ahmet Cem Karaca',
    description: t.intro,
    path: '/lab',
    locale,
  });

  const rules = [
    { icon: FlaskConical, title: t.rule1, body: t.rule1Body },
    { icon: Radar, title: t.rule2, body: t.rule2Body },
    { icon: PencilRuler, title: t.rule3, body: t.rule3Body },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="page lab-page">
      <header className="lab-hero shell">
        <div><span className="eyebrow">{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p></div>
        <div className="lab-hero__signal" aria-hidden="true"><Radar /><span /><span /><span /><i>LAB</i></div>
      </header>

      <section className="lab-rules shell" aria-labelledby="lab-rules-title">
        <h2 id="lab-rules-title">{t.principles}</h2>
        <div>{rules.map(({ icon: Icon, title, body }, index) => <article key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="section shell lab-experiments">
        <header className="section-heading section-heading--split"><div><span className="eyebrow">01 / {t.experiments}</span><h2>{t.experiments}</h2></div><p>{locale === 'tr' ? 'Kod, çizim ve zaman tabanlı üretim arasında dolaşan küçük sistemler.' : 'Small systems moving between code, drawing, and time-based making.'}</p></header>
        <div className="project-grid">{experiments.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
      </section>

      <section className="section field-notes">
        <div className="shell">
          <header className="section-heading"><span className="eyebrow">02 / {t.notes}</span><h2>{t.notes}</h2></header>
          {lab.length ? (
            <div className="field-notes__grid">
              {lab.map((entry) => <Link key={entry.slug} href={`/lab/${entry.slug}`}><span>{entry.publishedAt?.slice(0, 10)}</span><h3>{localize(entry.title, locale)}</h3><p>{localize(entry.excerpt, locale)}</p><ArrowUpRight aria-hidden="true" /></Link>)}
            </div>
          ) : <p className="field-notes__empty">{t.notesEmpty}</p>}
          {acceptingInquiries ? <a className="lab-contact" href={`mailto:${settings.contactEmail}`}><Music2 aria-hidden="true" /><span>{t.discuss}</span><ArrowUpRight aria-hidden="true" /></a> : <Link className="lab-contact" href="/work"><Music2 aria-hidden="true" /><span>{locale === 'tr' ? 'Arşivde keşfe devam et' : 'Continue through the archive'}</span><ArrowUpRight aria-hidden="true" /></Link>}
        </div>
      </section>
    </main>
  );
}
