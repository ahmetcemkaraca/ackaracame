import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertBundledBootstrapRequest,
  assertPublishedBundle,
  bootstrapConfirmation,
  createBundledBootstrapPlan,
  createFirebaseDeployPhases,
  DEFAULT_REPOSITORY_ROOT,
  installBundledBootstrap,
  parseBundledBootstrapMode,
  restoreBundledBootstrap,
  serializeBundledContent,
  sha256,
  sortObjectKeys
} from './bundled-bootstrap.mjs';

const temporaryDirectories = [];
const createTemporaryDirectory = () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ackaraca-bootstrap-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('bundled revision-0 bootstrap', () => {
  it('sorts object keys recursively without changing array order', () => {
    expect(sortObjectKeys({ z: 1, a: [{ y: 2, b: 3 }, 'last'] })).toEqual({
      a: [{ b: 3, y: 2 }, 'last'],
      z: 1
    });
  });

  it('creates a stable artifact and digest', () => {
    const bundle = {
      settings: { z: 'last', a: 'first' },
      projects: [{ slug: 'published-project', status: 'published' }],
      journal: []
    };
    const first = serializeBundledContent(bundle, 10_000);
    const second = serializeBundledContent(bundle, 10_000);
    expect(first).toEqual(second);
    expect(first.hash).toBe(sha256(first.artifact));
    expect(first.artifact).toBe(
      '{\n  "journal": [],\n  "projects": [\n    {\n      "slug": "published-project",\n      "status": "published"\n    }\n  ],\n  "settings": {\n    "a": "first",\n    "z": "last"\n  }\n}\n'
    );
  });

  it('rejects private or malformed bundled records', () => {
    expect(() => assertPublishedBundle({ projects: [], journal: [] })).toThrow(/at least one/u);
    expect(() => assertPublishedBundle({
      projects: [{ slug: 'draft', status: 'draft' }],
      journal: []
    })).toThrow(/private record: projects\/draft:draft/u);
    expect(() => assertPublishedBundle({
      projects: [{ slug: 'public', status: 'published' }],
      journal: [{ slug: 'private-note', status: 'archived' }]
    })).toThrow(/journal\/private-note:archived/u);
    expect(() => assertPublishedBundle({
      projects: [{
        slug: 'storage-backed',
        status: 'published',
        media: [{ src: 'https://FIREBASESTORAGE.GOOGLEAPIS.COM/v0/b/example/o/cover.webp' }]
      }],
      journal: []
    })).toThrow(/cannot depend on Firebase Storage/u);
    expect(() => assertPublishedBundle({
      projects: [{
        slug: 'prose-only',
        status: 'published',
        description: 'The hostname firebasestorage.googleapis.com appears only as prose.'
      }],
      journal: []
    })).not.toThrow();
  });

  it('loads and validates the real canonical fallback reproducibly through Vite SSR', async () => {
    const first = await createBundledBootstrapPlan({ projectId: 'ackaraca-production' });
    const second = await createBundledBootstrapPlan({ projectId: 'ackaraca-production' });
    expect(first.projectCount).toBeGreaterThan(0);
    expect(first.journalCount).toBeGreaterThanOrEqual(0);
    expect(second).toEqual(first);
    expect(first.confirmation).toBe(
      bootstrapConfirmation('ackaraca-production', first.hash)
    );

    const isolatedRoot = fs.mkdtempSync(path.join(DEFAULT_REPOSITORY_ROOT, '.bootstrap-test-'));
    temporaryDirectories.push(isolatedRoot);
    fs.mkdirSync(path.join(isolatedRoot, 'src', 'domain'), { recursive: true });
    fs.mkdirSync(path.join(isolatedRoot, 'src', 'data'), { recursive: true });
    fs.copyFileSync(
      path.join(DEFAULT_REPOSITORY_ROOT, 'src', 'domain', 'content.ts'),
      path.join(isolatedRoot, 'src', 'domain', 'content.ts')
    );
    fs.copyFileSync(
      path.join(DEFAULT_REPOSITORY_ROOT, 'src', 'data', 'portfolio.ts'),
      path.join(isolatedRoot, 'src', 'data', 'portfolio.ts')
    );
    const staleGenerated = JSON.parse(first.artifact);
    staleGenerated.projects = staleGenerated.projects.slice(0, 1);
    staleGenerated.journal = [];
    fs.writeFileSync(
      path.join(isolatedRoot, 'src', 'data', 'generated-content.json'),
      `${JSON.stringify(staleGenerated)}\n`
    );
    const staleGeneratedPlan = await createBundledBootstrapPlan({
      projectId: 'ackaraca-production',
      repositoryRoot: isolatedRoot
    });
    expect(staleGeneratedPlan.hash).toBe(first.hash);
    expect(staleGeneratedPlan.projectCount).toBe(first.projectCount);
    expect(staleGeneratedPlan.journalCount).toBe(first.journalCount);
  });

  it('accepts only an exact bootstrap mode and fences it to revision 0 and exact confirmation', () => {
    const plan = { hash: 'a'.repeat(64) };
    const projectId = 'ackaraca-production';
    const confirmation = bootstrapConfirmation(projectId, plan.hash);
    expect(parseBundledBootstrapMode(undefined)).toBe(false);
    expect(parseBundledBootstrapMode('')).toBe(false);
    expect(parseBundledBootstrapMode('false')).toBe(false);
    expect(parseBundledBootstrapMode('true')).toBe(true);
    expect(() => parseBundledBootstrapMode(' true ')).toThrow(/exactly/u);
    expect(assertBundledBootstrapRequest({
      rawMode: 'true', contentRevision: '0', projectId, confirmation, plan
    })).toBe(true);
    expect(() => assertBundledBootstrapRequest({
      rawMode: 'true', contentRevision: '1', projectId, confirmation, plan
    })).toThrow(/revision 0/u);
    expect(() => assertBundledBootstrapRequest({
      rawMode: 'true', contentRevision: '0', projectId, confirmation: 'wrong', plan
    })).toThrow(/CONFIRM_BUNDLED_BOOTSTRAP/u);
    expect(assertBundledBootstrapRequest({
      rawMode: 'false', contentRevision: '7', projectId, confirmation: '', plan
    })).toBe(false);
  });

  it('deploys static Hosting before restrictive backend resources only for revision-0 bootstrap', () => {
    expect(createFirebaseDeployPhases(true)).toEqual([
      { failureCode: 'bootstrap-hosting-deploy-failed', targets: 'hosting' },
      {
        failureCode: 'bootstrap-backend-deploy-failed',
        targets: 'firestore:rules,firestore:indexes,storage,functions'
      }
    ]);
    expect(createFirebaseDeployPhases(false)).toEqual([{
      failureCode: 'firebase-deploy-failed',
      targets: 'firestore:rules,firestore:indexes,storage,functions,hosting'
    }]);
    expect(() => createFirebaseDeployPhases('true')).toThrow(/boolean/u);
  });

  it('atomically installs and restores the exact prior file and permissions', () => {
    const directory = createTemporaryDirectory();
    const destination = path.join(directory, 'generated-content.json');
    fs.writeFileSync(destination, '{}\n', { mode: 0o640 });
    fs.chmodSync(destination, 0o640);
    const artifact = '{"bootstrap":true}\n';
    const installation = installBundledBootstrap({
      destination,
      plan: { artifact, hash: sha256(artifact) }
    });
    expect(fs.readFileSync(destination, 'utf8')).toBe(artifact);
    expect(fs.statSync(destination).mode & 0o777).toBe(0o600);
    restoreBundledBootstrap(installation);
    expect(fs.readFileSync(destination, 'utf8')).toBe('{}\n');
    expect(fs.statSync(destination).mode & 0o777).toBe(0o640);
  });

  it('rejects symlink and non-regular destinations', () => {
    const directory = createTemporaryDirectory();
    const target = path.join(directory, 'target.json');
    const link = path.join(directory, 'generated-content.json');
    fs.writeFileSync(target, '{}\n');
    fs.symlinkSync(target, link);
    const plan = { artifact: '{"safe":true}\n' };
    plan.hash = sha256(plan.artifact);
    expect(() => installBundledBootstrap({ destination: link, plan })).toThrow(/non-regular/u);
    expect(() => installBundledBootstrap({ destination: directory, plan })).toThrow(/non-regular/u);
  });

  it('refuses to restore over drifted installed content', () => {
    const directory = createTemporaryDirectory();
    const destination = path.join(directory, 'generated-content.json');
    fs.writeFileSync(destination, '{}\n');
    const artifact = '{"bootstrap":true}\n';
    const installation = installBundledBootstrap({
      destination,
      plan: { artifact, hash: sha256(artifact) }
    });
    fs.writeFileSync(destination, '{"concurrent":"edit"}\n');
    expect(() => restoreBundledBootstrap(installation)).toThrow(/installed file drifted/u);
    expect(fs.readFileSync(destination, 'utf8')).toBe('{"concurrent":"edit"}\n');
  });
});
