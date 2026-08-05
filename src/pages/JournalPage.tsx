import { ArrowUpRight, BookOpen, FlaskConical } from 'lucide-react';
import { Link } from 'wouter';
import { localize, useAppPreferences } from '../context/AppPreferences';
import { useContent } from '../context/Content';
import { journalEntryPath } from '../domain/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const copy = {
  tr: {
    eyebrow: 'Journal / çalışma notları',
    title: 'Kararların arkasındaki düşünceyi açık bırakmak.',
    intro: 'Mimarlık, ürün geliştirme ve çalışan sistemler üzerine uzun biçimli notlar; bitmiş işlerin yanında süreçleri, kısıtları ve öğrenilenleri de görünür kılar.',
    archive: 'Yayınlanmış yazılar',
    empty: 'İlk yazı hazırlanıyor. Bu sırada laboratuvardaki aktif deneyleri inceleyebilirsiniz.',
    lab: 'Laboratuvara geç',
    journal: 'Journal',
    release: 'Sürüm notu',
  },
  en: {
    eyebrow: 'Journal / working notes',
    title: 'Keeping the thinking behind decisions visible.',
    intro: 'Long-form notes on architecture, product development, and working systems—making processes, constraints, and lessons as visible as the finished work.',
    archive: 'Published writing',
    empty: 'The first entry is being prepared. Explore the active experiments in the Lab in the meantime.',
    lab: 'Open the Lab',
    journal: 'Journal',
    release: 'Release note',
  },
} as const;

export default function JournalPage() {
  const { journal } = useContent();
  const { locale } = useAppPreferences();
  const t = copy[locale];

  useDocumentMeta({
    title: locale === 'tr' ? 'Journal — Ahmet Cem Karaca' : 'Journal — Ahmet Cem Karaca',
    description: t.intro,
    path: '/journal',
    locale,
  });

  return (
    <main id="main-content" tabIndex={-1} className="page journal-index">
      <header className="page-hero shell">
        <span className="eyebrow">{t.eyebrow}</span>
        <div className="page-hero__grid">
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </header>

      <section className="section field-notes" aria-labelledby="journal-archive-title">
        <div className="shell">
          <header className="section-heading section-heading--split">
            <div><span className="eyebrow">01 / Archive</span><h2 id="journal-archive-title">{t.archive}</h2></div>
            <BookOpen aria-hidden="true" />
          </header>
          {journal.length ? (
            <div className="field-notes__grid">
              {journal.map((entry) => (
                <Link key={entry.slug} href={journalEntryPath(entry)}>
                  <span>{entry.publishedAt?.slice(0, 10)} · {entry.entryType === 'release-note' ? t.release : t.journal}</span>
                  <h3>{localize(entry.title, locale)}</h3>
                  <p>{localize(entry.excerpt, locale)}</p>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : <p className="field-notes__empty">{t.empty}</p>}
          <Link className="lab-contact" href="/lab"><FlaskConical aria-hidden="true" /><span>{t.lab}</span><ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
