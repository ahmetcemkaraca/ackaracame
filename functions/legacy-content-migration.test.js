import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEGACY_COLLISION_TARGETS,
  assertLegacyCollisionConfirmations,
  canonicalizeFirestoreValue,
  createCanonicalBootstrapTargets,
  createLegacyCollisionPlan,
  hashCanonicalFirestoreValue,
  isRecognizedLegacyProject,
  isRecognizedLegacySettings,
  legacyCollisionConfirmation,
  legacyCollisionReviewConfirmation,
  reviewableFirestoreValue
} from './legacy-content-migration.js';

const timestamp = (seconds, nanoseconds = 0) => ({
  seconds,
  nanoseconds,
  toDate: () => new Date((seconds * 1000) + Math.floor(nanoseconds / 1_000_000))
});

const legacySettings = {
  footerTagline: 'Architect and developer',
  footerSubline: 'Selected work',
  footerCopyrightPrefix: '©',
  footerCopyrightText: 'Ahmet Cem Karaca',
  footerCopyrightSuffix: 'All rights reserved',
  homeHeroSubtitle: 'Architecture and software',
  siteWebsiteUrl: 'https://ackaraca.me',
  updatedAt: timestamp(10)
};

const legacyProject = (slug) => ({
  id: slug,
  title: slug,
  description: 'Legacy description',
  category: 'yazilim',
  images: ['https://example.com/image.webp'],
  technologies: ['TypeScript'],
  year: '2026',
  semester: 'Personal',
  featured: false,
  order: 1,
  status: 'active',
  createdAt: timestamp(1),
  updatedAt: timestamp(2)
});

const replacementFor = (path) => ({
  schemaVersion: 2,
  ...(path.startsWith('projects/') ? { slug: path.slice('projects/'.length) } : {}),
  canonical: true
});

const exactMap = (factory) => Object.fromEntries(
  LEGACY_COLLISION_TARGETS.map((target) => [target.path, factory(target)])
);

test('canonical Firestore hashing is key-order stable and type-aware', () => {
  const left = { nested: { z: 2, a: 1 }, at: timestamp(12, 34), bytes: new Uint8Array([1, 2]) };
  const right = { bytes: new Uint8Array([1, 2]), at: timestamp(12, 34), nested: { a: 1, z: 2 } };
  assert.equal(hashCanonicalFirestoreValue(left), hashCanonicalFirestoreValue(right));
  assert.notEqual(
    hashCanonicalFirestoreValue({ value: timestamp(12, 34) }),
    hashCanonicalFirestoreValue({ value: { seconds: 12, nanoseconds: 34 } })
  );
  assert.throws(() => canonicalizeFirestoreValue(undefined), /unsupported value type/u);
  assert.deepEqual(reviewableFirestoreValue({ at: timestamp(12, 34) }), {
    at: {
      $firestoreType: 'timestamp',
      iso: '1970-01-01T00:00:12.000Z',
      seconds: 12,
      nanoseconds: 34
    }
  });
});

test('legacy recognition is narrow and rejects unknown or v2-like collisions', () => {
  assert.equal(isRecognizedLegacySettings(legacySettings), true);
  assert.equal(isRecognizedLegacySettings({ ...legacySettings, injected: true }), false);
  assert.equal(isRecognizedLegacySettings({ ...legacySettings, updatedAt: 'yesterday' }), false);

  const project = legacyProject('draw-or-die');
  assert.equal(isRecognizedLegacyProject(project, 'draw-or-die'), true);
  assert.equal(isRecognizedLegacyProject({
    ...project,
    location: 'Remote',
    websiteUrl: 'https://ackaraca.me',
    websiteLabel: 'Website',
    githubUrl: 'https://github.com/ahmetcemkaraca',
    changelogEntries: [{
      version: 'v2',
      date: '2026-08-04',
      title: 'Edited in the old panel',
      description: 'A bounded release note'
    }],
    source: 'admin',
    kind: 'project',
    originCollection: 'projects'
  }, 'draw-or-die'), true);
  assert.equal(isRecognizedLegacyProject({ ...project, id: 'other' }, 'draw-or-die'), false);
  assert.equal(isRecognizedLegacyProject({ ...project, schemaVersion: 2 }, 'draw-or-die'), false);
  assert.equal(isRecognizedLegacyProject({ ...project, source: 'hardcoded' }, 'draw-or-die'), false);
  assert.equal(isRecognizedLegacyProject({
    ...project,
    changelogEntries: [{ version: 'v1', date: '', title: 'x', description: '', extra: true }]
  }, 'draw-or-die'), false);
  assert.equal(isRecognizedLegacyProject({ ...project, surprise: true }, 'draw-or-die'), false);
});

test('the plan preserves absent and valid v2 docs, replaces only recognized legacy, and blocks unknown data', () => {
  const documents = {
    'siteSettings/main': { exists: true, data: legacySettings, readVersion: 'v1' },
    'projects/draw-or-die': {
      exists: true,
      data: { schemaVersion: 2, slug: 'draw-or-die', valid: true },
      readVersion: 'v2'
    },
    'projects/hocapuanla': { exists: false, readVersion: null }
  };
  const replacements = exactMap(({ path }) => replacementFor(path));
  const plan = createLegacyCollisionPlan({
    documents,
    replacements,
    replacementSource: 'bundled-fallback',
    isValidV2: (_target, data) => data.valid === true,
    legacyProjectIds: new Set(['draw-or-die', 'hocapuanla'])
  });
  assert.deepEqual(plan.targets.map(({ classification, action }) => ({ classification, action })), [
    { classification: 'recognized-legacy', action: 'replace' },
    { classification: 'already-valid-v2', action: 'preserve' },
    { classification: 'absent', action: 'preserve' }
  ]);
  assert.equal(plan.blocked, false);
  assert.equal(plan.mutationCount, 1);

  const blocked = createLegacyCollisionPlan({
    documents: {
      ...documents,
      'projects/hocapuanla': { exists: true, data: { id: 'hocapuanla', surprise: true } }
    },
    replacements,
    replacementSource: 'bundled-fallback',
    isValidV2: () => false,
    legacyProjectIds: new Set(['draw-or-die', 'hocapuanla'])
  });
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.targets[2].action, 'block');
});

test('the plan accepts exactly the three fixed paths and binds source and replacement changes', () => {
  const documents = exactMap(({ path }) => ({
    exists: true,
    data: path === 'siteSettings/main'
      ? legacySettings
      : legacyProject(path.slice('projects/'.length)),
    readVersion: 'one'
  }));
  const replacements = exactMap(({ path }) => replacementFor(path));
  const inputs = {
    documents,
    replacements,
    replacementSource: 'generated-snapshot',
    isValidV2: () => false,
    legacyProjectIds: new Set(['draw-or-die', 'hocapuanla'])
  };
  const first = createLegacyCollisionPlan(inputs);
  const second = createLegacyCollisionPlan({
    ...inputs,
    documents: {
      ...documents,
      'projects/draw-or-die': {
        ...documents['projects/draw-or-die'],
        readVersion: 'two'
      }
    }
  });
  assert.notEqual(first.summaryHash, second.summaryHash);

  assert.throws(() => createLegacyCollisionPlan({
    ...inputs,
    documents: { ...documents, 'projects/unrelated-auto-id': { exists: true, data: {} } }
  }), /only the exact canonical target paths/u);
});

test('canonical bootstrap creates only missing bundle paths and blocks invalid existing non-collisions', () => {
  const targets = createCanonicalBootstrapTargets({
    projects: [
      { slug: 'draw-or-die' },
      { slug: 'hocapuanla' },
      { slug: 'third-project' }
    ],
    journal: [{ slug: 'design-note' }]
  });
  assert.deepEqual(targets.map(({ path }) => path), [
    'siteSettings/main',
    'journal/design-note',
    'projects/draw-or-die',
    'projects/hocapuanla',
    'projects/third-project'
  ]);
  const documents = Object.fromEntries(targets.map(({ path }) => [
    path,
    path === 'projects/third-project'
      ? { exists: true, data: { malformed: true }, readVersion: 'bad' }
      : { exists: false, readVersion: null }
  ]));
  const replacements = Object.fromEntries(targets.map(({ path }) => [
    path,
    replacementFor(path)
  ]));
  const blocked = createLegacyCollisionPlan({
    targets,
    documents,
    replacements,
    replacementSource: 'bundled-fallback',
    isValidV2: () => false,
    legacyProjectIds: new Set(['draw-or-die', 'hocapuanla']),
    createMissing: true
  });
  assert.equal(blocked.mutationCount, 4);
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.targets.find(({ path }) => path === 'journal/design-note').action, 'create');
  assert.equal(blocked.targets.find(({ path }) => path === 'projects/third-project').action, 'block');

  const validExisting = createLegacyCollisionPlan({
    targets,
    documents: {
      ...documents,
      'projects/third-project': {
        exists: true,
        data: { schemaVersion: 2, valid: true },
        readVersion: 'good'
      }
    },
    replacements,
    replacementSource: 'bundled-fallback',
    isValidV2: (_target, data) => data.valid === true,
    legacyProjectIds: new Set(['draw-or-die', 'hocapuanla']),
    createMissing: true
  });
  assert.equal(validExisting.blocked, false);
  assert.equal(validExisting.mutationCount, 4);
  assert.equal(
    validExisting.targets.find(({ path }) => path === 'projects/third-project').action,
    'preserve'
  );
});

test('the exact confirmation binds project, summary, and all fixed paths', () => {
  const hash = 'a'.repeat(64);
  assert.equal(
    legacyCollisionConfirmation('ackaraca-prod', hash),
    `replace:ackaraca-prod:${hash}:siteSettings/main,projects/draw-or-die,projects/hocapuanla`
  );
  assert.throws(() => legacyCollisionConfirmation('../other', hash), /project ID is invalid/u);
  assert.throws(() => legacyCollisionConfirmation('ackaraca-prod', 'short'), /summary hash is invalid/u);
  assert.equal(
    legacyCollisionReviewConfirmation('ackaraca-prod', hash),
    `reviewed:ackaraca-prod:${hash}`
  );
  assert.throws(() => assertLegacyCollisionConfirmations({
    projectId: 'ackaraca-prod',
    summaryHash: hash,
    migrationConfirmation: legacyCollisionConfirmation('ackaraca-prod', hash)
  }), /CONTENT_REVIEWED/u);
  assert.deepEqual(assertLegacyCollisionConfirmations({
    projectId: 'ackaraca-prod',
    summaryHash: hash,
    migrationConfirmation: legacyCollisionConfirmation('ackaraca-prod', hash),
    reviewConfirmation: legacyCollisionReviewConfirmation('ackaraca-prod', hash)
  }), {
    migrationConfirmation: legacyCollisionConfirmation('ackaraca-prod', hash),
    reviewConfirmation: legacyCollisionReviewConfirmation('ackaraca-prod', hash)
  });
  const canonicalPaths = [
    'siteSettings/main',
    'journal/design-note',
    'projects/draw-or-die',
    'projects/hocapuanla'
  ];
  const canonicalMigration = legacyCollisionConfirmation(
    'ackaraca-prod',
    hash,
    canonicalPaths
  );
  assert.equal(
    canonicalMigration,
    `replace:ackaraca-prod:${hash}:${canonicalPaths.join(',')}`
  );
  assert.doesNotThrow(() => assertLegacyCollisionConfirmations({
    projectId: 'ackaraca-prod',
    summaryHash: hash,
    targetPaths: canonicalPaths,
    migrationConfirmation: canonicalMigration,
    reviewConfirmation: legacyCollisionReviewConfirmation(
      'ackaraca-prod',
      hash,
      canonicalPaths
    )
  }));
});
