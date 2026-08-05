import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolvePinnedFirebaseCli } from './pinned-firebase-cli.mjs';

const temporaryDirectories = [];
afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

const createFixture = ({ installedVersion = '15.25.1', symlinkCli = false } = {}) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ackaraca-firebase-cli-'));
  temporaryDirectories.push(root);
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'functions'), { recursive: true });
  fs.mkdirSync(path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin'), {
    recursive: true
  });
  fs.writeFileSync(path.join(root, 'scripts', 'dependency-audit-policy.json'), JSON.stringify({
    firebaseToolsVersion: '15.25.1'
  }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    devDependencies: { 'firebase-tools': '15.25.1' }
  }));
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({
    packages: {
      'node_modules/firebase-tools': { version: '15.25.1', integrity: 'sha512-exact' }
    }
  }));
  fs.writeFileSync(path.join(root, 'functions', 'package.json'), JSON.stringify({ dependencies: {} }));
  fs.writeFileSync(path.join(root, 'node_modules', 'firebase-tools', 'package.json'), JSON.stringify({
    version: installedVersion,
    bin: { firebase: './lib/bin/firebase.js' }
  }));
  const cliPath = path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
  if (symlinkCli) {
    const outside = path.join(root, 'outside.js');
    fs.writeFileSync(outside, '#!/usr/bin/env node\n');
    fs.symlinkSync(outside, cliPath);
  } else {
    fs.writeFileSync(cliPath, '#!/usr/bin/env node\n');
  }
  return root;
};

describe('pinned Firebase CLI resolver', () => {
  it('returns only the exact lock-bound local package entry point', () => {
    const root = createFixture();
    const resolved = resolvePinnedFirebaseCli({ repositoryRoot: root });
    expect(resolved.version).toBe('15.25.1');
    expect(resolved.command).toBe(process.execPath);
    expect(resolved.argsPrefix[0]).toBe(
      path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js')
    );
  });

  it('rejects installed-version drift and a symlinked executable', () => {
    expect(() => resolvePinnedFirebaseCli({
      repositoryRoot: createFixture({ installedVersion: '15.25.0' })
    })).toThrow(/exact audited CLI/u);
    expect(() => resolvePinnedFirebaseCli({
      repositoryRoot: createFixture({ symlinkCli: true })
    })).toThrow(/regular, non-symlink/u);
  });
});
