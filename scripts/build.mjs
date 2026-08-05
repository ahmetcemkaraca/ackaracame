import { spawnSync } from 'node:child_process';

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (process.env.ACKARACA_EXPORT_FIRESTORE === 'true') {
  run('npm', ['run', 'export:content', '--prefix', 'functions']);
}

run('tsc', ['-b', '--pretty', 'false']);
run(process.execPath, ['scripts/verify-public-content.mjs']);
run('vite', ['build']);
run('vite', ['build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr', '--emptyOutDir']);
run(process.execPath, ['scripts/prerender.mjs']);
