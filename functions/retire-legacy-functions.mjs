import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolvePinnedFirebaseCli } from '../scripts/pinned-firebase-cli.mjs';
import { planLegacyFunctionRetirement } from './legacy-functions.js';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

const requireInput = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const run = (command, args, { capture = false } = {}) => {
  const result = spawnSync(command, args, {
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with code ${result.status ?? 'unknown'}.`);
  return capture ? result.stdout : '';
};

const main = () => {
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const expectedConfirmation = `retire:adminLoginGuard,seedContent:${projectId}`;
  if (requireInput('CONFIRM_LEGACY_FUNCTION_MIGRATION') !== expectedConfirmation) {
    throw new Error(`CONFIRM_LEGACY_FUNCTION_MIGRATION must equal ${expectedConfirmation}.`);
  }
  const firebaseCli = resolvePinnedFirebaseCli({ repositoryRoot });
  const output = run(firebaseCli.command, [
    ...firebaseCli.argsPrefix,
    'functions:list',
    '--project',
    projectId,
    '--json'
  ], { capture: true });
  let response;
  try {
    response = JSON.parse(output);
  } catch {
    throw new Error('Firebase Functions inventory was not valid JSON.');
  }
  if (response?.status !== 'success' || !Array.isArray(response.result)) {
    throw new Error('Firebase Functions inventory did not report a successful complete result.');
  }
  const plan = planLegacyFunctionRetirement({ inventory: response.result, projectId });
  if (plan.names.length === 0) {
    console.log(`No legacy ${plan.region} Functions remain in ${projectId}.`);
    return;
  }
  console.log(`Retiring exact legacy Functions in ${projectId}/${plan.region}: ${plan.names.join(', ')}.`);
  run(firebaseCli.command, [
    ...firebaseCli.argsPrefix,
    'functions:delete',
    ...plan.names,
    '--region',
    plan.region,
    '--project',
    projectId,
    '--force'
  ]);
};

try {
  main();
} catch (error) {
  console.error('Legacy Functions retirement failed:', error.message);
  process.exitCode = 1;
}
