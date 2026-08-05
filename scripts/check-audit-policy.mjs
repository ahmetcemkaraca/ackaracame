import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  assertZeroVulnerabilities,
  validateDevelopmentAuditException,
  validateFirebaseToolsLock
} from './audit-policy.mjs';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const runAudit = (args, label) => {
  const result = spawnSync('npm', ['audit', '--json', ...args], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    shell: process.platform === 'win32'
  });
  if (result.error) throw result.error;
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error(`${label} audit returned invalid JSON: ${result.stderr.trim() || 'no details'}`);
  }
  if (![0, 1].includes(result.status)) {
    throw new Error(`${label} audit command failed with exit code ${result.status ?? 'unknown'}.`);
  }
  return report;
};

const policy = readJson('scripts/dependency-audit-policy.json');
validateFirebaseToolsLock({
  rootManifest: readJson('package.json'),
  lockfile: readJson('package-lock.json'),
  functionsManifest: readJson('functions/package.json'),
  policy
});
assertZeroVulnerabilities(runAudit(['--omit=dev'], 'Web runtime'), 'Web runtime');
assertZeroVulnerabilities(runAudit(['--prefix', 'functions'], 'Functions runtime'), 'Functions runtime');
const accepted = validateDevelopmentAuditException({
  report: runAudit([], 'Complete root'),
  policy
});
console.log('Runtime dependency audits are clean.');
console.log(
  `Exact deploy-tool exception accepted until ${accepted.reviewBy}: ${accepted.advisoryIds.join(', ')}.`
);
