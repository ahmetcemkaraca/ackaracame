import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Globe, History, Rocket } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { GitHubService } from '../firebase/services';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSafeHttpUrl, getSafeGitHubRepoUrl } from '../utils/urlSafety';

const formatDate = (value) => {
  if (!value) return 'Tarih belirtilmedi';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PortfolioChangelogPage = () => {
  const { id } = useParams();
  const { currentPortfolioItem, loadPortfolioItem, loading } = useProject();
  const [githubFeed, setGithubFeed] = useState({ releases: [], commits: [], repo: null });
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    if (id) loadPortfolioItem(id);
  }, [id, loadPortfolioItem]);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!currentPortfolioItem?.githubUrl) {
        setGithubFeed({ releases: [], commits: [], repo: null });
        return;
      }

      setGithubLoading(true);
      try {
        const feed = await GitHubService.getFeed(currentPortfolioItem.githubUrl);
        setGithubFeed(feed);
      } catch (error) {
        console.error('GitHub feed could not be loaded:', error);
        setGithubFeed({ releases: [], commits: [], repo: null });
      } finally {
        setGithubLoading(false);
      }
    };

    fetchFeed();
  }, [currentPortfolioItem]);

  const manualEntries = useMemo(() => (
    [...(currentPortfolioItem?.changelogEntries || [])].sort((left, right) => {
      return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime();
    })
  ), [currentPortfolioItem]);

  if (loading || !currentPortfolioItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark pt-20">
        <LoadingSpinner text="Changelog yukleniyor..." />
      </div>
    );
  }

  const item = currentPortfolioItem;

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark pt-20 text-slate-800 dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Link to={`/portfolio/${item.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            Detay sayfasina don
          </Link>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <History className="w-4 h-4" />
                Release Notes / Patch Notes
              </p>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
                {item.title} changelog akisi
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Manuel eklenen notlar ve varsa GitHub uzerinden parse edilen public release / commit akisi burada ayrik kartlar halinde listelenir.
              </p>
            </div>

            <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Baglantilar</p>
              <div className="mt-4 space-y-3">
                {item.websiteUrl && (
                  <a href={getSafeHttpUrl(item.websiteUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm hover:border-primary dark:border-slate-800">
                    <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> {item.websiteLabel || 'Website'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {item.githubUrl && (
                  <a href={getSafeGitHubRepoUrl(item.githubUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm hover:border-primary dark:border-slate-800">
                    <span className="inline-flex items-center gap-2"><Github className="w-4 h-4 text-primary" /> GitHub Repo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Rocket className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Siteden Eklenen</p>
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Manual changelog</h2>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {manualEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Bu icerik icin henuz manuel release notu eklenmedi.
                </div>
              ) : manualEntries.map((entry, index) => (
                <motion.div key={`${entry.version}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.title || 'Manual update'}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{entry.version || 'Version belirtilmedi'}</p>
                    </div>
                    <span className="text-sm text-slate-500">{formatDate(entry.date)}</span>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{entry.description || 'Aciklama girilmedi.'}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-100 dark:text-slate-900"><Github className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">GitHub Kaynakli</p>
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Public repo aktivitesi</h2>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {githubLoading ? (
                <LoadingSpinner text="GitHub akisi aliniyor..." />
              ) : (!githubFeed.releases.length && !githubFeed.commits.length) ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Public release veya commit verisi cekilemedi. Repo private olabilir ya da henuz veri bulunmuyor.
                </div>
              ) : (
                <>
                  {githubFeed.releases.map((release) => (
                    <div key={release.id} className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{release.name || release.tag_name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">GitHub Release</p>
                        </div>
                        <span className="text-sm text-slate-500">{formatDate(release.published_at)}</span>
                      </div>
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {release.body || 'Release body yok.'}
                      </p>
                      <a href={release.html_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Release'i GitHub'da ac
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}

                  {githubFeed.commits.map((commit) => (
                    <div key={commit.sha} className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{commit.commit?.message?.split('\n')[0] || commit.sha}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">GitHub Commit</p>
                        </div>
                        <span className="text-sm text-slate-500">{formatDate(commit.commit?.author?.date)}</span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {commit.sha?.slice(0, 7)} • {commit.commit?.author?.name || 'Bilinmeyen yazar'}
                      </p>
                      <a href={commit.html_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Commit'i GitHub'da ac
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PortfolioChangelogPage;
