import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const viteBin = () => {
  const packageDirectory = require.resolve('vite/package.json').replace(/package\.json$/, '');
  return `${packageDirectory}bin/vite.js`;
};

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (process.env.ACKARACA_EXPORT_FIRESTORE === 'true') {
  run('npm', ['run', 'export:content', '--prefix', 'functions']);
}

run(process.execPath, [require.resolve('typescript/bin/tsc'), '-b', '--pretty', 'false']);
run(process.execPath, ['scripts/verify-public-content.mjs']);
run(process.execPath, [viteBin(), 'build']);
run(process.execPath, [viteBin(), 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr', '--emptyOutDir']);
run(process.execPath, ['scripts/prerender.mjs']);
