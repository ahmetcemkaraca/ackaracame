// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ensureFunctionsEnvironmentFile,
  removeGeneratedFunctionsEnvironmentFile,
  renderFunctionsEnvironment
} from './functions-env-file.mjs';

const temporaryDirectories = [];
const environment = {
  FIREBASE_PROJECT_ID: 'ackaraca-prod',
  ACKARACA_STORAGE_BUCKET: 'ackaraca-prod.firebasestorage.app',
  ACKARACA_ADMIN_EMAIL: 'owner@ackaraca.me',
  SITE_REBUILD_WEBHOOK_HOST: 'api.github.com',
  SITE_REBUILD_PROVIDER: 'github'
};

const makeRoot = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ackaraca-functions-env-'));
  temporaryDirectories.push(root);
  fs.mkdirSync(path.join(root, 'functions'));
  return root;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('Functions deployment dotenv', () => {
  it('renders all required defineString parameters', () => {
    const rendered = renderFunctionsEnvironment(environment);
    expect(rendered).toContain('ACKARACA_STORAGE_BUCKET=');
    expect(rendered).toContain('ACKARACA_ADMIN_EMAIL=');
    expect(rendered).toContain('SITE_REBUILD_WEBHOOK_HOST=');
    expect(rendered).toContain('SITE_REBUILD_PROVIDER=');
  });

  it('creates a private file and removes only the file it created', () => {
    const generated = ensureFunctionsEnvironmentFile({ environment, projectRoot: makeRoot() });
    expect(generated.created).toBe(true);
    expect(fs.statSync(generated.filePath).mode & 0o077).toBe(0);
    removeGeneratedFunctionsEnvironmentFile(generated);
    expect(fs.existsSync(generated.filePath)).toBe(false);
  });

  it('preserves a matching operator-owned file', () => {
    const projectRoot = makeRoot();
    const filePath = path.join(projectRoot, 'functions', '.env.ackaraca-prod');
    fs.writeFileSync(filePath, renderFunctionsEnvironment(environment), { mode: 0o600 });
    const generated = ensureFunctionsEnvironmentFile({ environment, projectRoot });
    expect(generated.created).toBe(false);
    removeGeneratedFunctionsEnvironmentFile(generated);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('refuses to overwrite mismatched or overexposed files', () => {
    const mismatchedRoot = makeRoot();
    const mismatchedPath = path.join(mismatchedRoot, 'functions', '.env.ackaraca-prod');
    fs.writeFileSync(mismatchedPath, renderFunctionsEnvironment({ ...environment, SITE_REBUILD_PROVIDER: 'generic' }), { mode: 0o600 });
    expect(() => ensureFunctionsEnvironmentFile({ environment, projectRoot: mismatchedRoot })).toThrow(/does not match/u);

    const publicRoot = makeRoot();
    const publicPath = path.join(publicRoot, 'functions', '.env.ackaraca-prod');
    fs.writeFileSync(publicPath, renderFunctionsEnvironment(environment), { mode: 0o600 });
    fs.chmodSync(publicPath, 0o644);
    expect(() => ensureFunctionsEnvironmentFile({ environment, projectRoot: publicRoot })).toThrow(/permissions/u);
  });
});
