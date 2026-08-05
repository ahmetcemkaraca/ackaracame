import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({
  root: repositoryRoot,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true }
});

try {
  const domain = await vite.ssrLoadModule('/src/domain/content.ts');
  const { contentBundle, fallbackContentBundle } = await vite.ssrLoadModule('/src/data/portfolio.ts');
  const privateRecords = [
    ...contentBundle.projects.map((item) => ({ collection: 'projects', ...item })),
    ...contentBundle.journal.map((item) => ({ collection: 'journal', ...item }))
  ].filter((item) => item.status !== 'published');
  if (privateRecords.length > 0) {
    const paths = privateRecords.map((item) => `${item.collection}/${item.slug}`).join(', ');
    throw new Error(`Private content must never enter the public source bundle: ${paths}`);
  }
  if (contentBundle.projects.length === 0) {
    throw new Error('The public source bundle must contain at least one published project.');
  }
  const functionsArtifactPath = path.join(
    repositoryRoot,
    'functions',
    'data',
    'canonical-content.json'
  );
  const functionsArtifact = domain.parseContentBundle(JSON.parse(
    fs.readFileSync(functionsArtifactPath, 'utf8')
  ));
  const canonicalFallback = domain.parseContentBundle(fallbackContentBundle);
  if (JSON.stringify(functionsArtifact) !== JSON.stringify(canonicalFallback)) {
    throw new Error(
      'Canonical Functions content drifted from the bundled fallback; run npm run content:sync-functions.'
    );
  }
  console.log(
    `Verified public-only content: ${contentBundle.projects.length} projects, `
    + `${contentBundle.journal.length} journal entries; Functions fallback is exact.`
  );
} finally {
  await vite.close();
}
