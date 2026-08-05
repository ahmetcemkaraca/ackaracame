import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const repositoryRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(repositoryRoot, 'functions', 'data', 'canonical-content.json');

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObjectKeys(value[key])]));
};

const vite = await createServer({
  root: repositoryRoot,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true }
});

try {
  const domain = await vite.ssrLoadModule('/src/domain/content.ts');
  const portfolio = await vite.ssrLoadModule('/src/data/portfolio.ts');
  const bundle = domain.parseContentBundle(portfolio.fallbackContentBundle);
  const privateRecord = [
    ...bundle.projects.map((item) => `projects/${item.slug}:${item.status}`),
    ...bundle.journal.map((item) => `journal/${item.slug}:${item.status}`)
  ].find((item) => !item.endsWith(':published'));
  if (privateRecord) throw new Error(`Fallback contains a private record: ${privateRecord}.`);
  const artifact = `${JSON.stringify(sortObjectKeys(bundle), null, 2)}\n`;
  if (Buffer.byteLength(artifact, 'utf8') > domain.MAX_PUBLIC_CONTENT_BUNDLE_BYTES) {
    throw new Error('Canonical Functions content exceeds the public bundle budget.');
  }
  const temporary = `${destination}.next`;
  fs.writeFileSync(temporary, artifact, { encoding: 'utf8', mode: 0o644 });
  fs.renameSync(temporary, destination);
  fs.chmodSync(destination, 0o644);
  console.log(
    `Synced canonical Functions content: ${bundle.projects.length} projects, `
    + `${bundle.journal.length} journal entries, and site settings.`
  );
} finally {
  await vite.close();
}
