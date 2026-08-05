import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  CANONICAL_CONTENT_ARTIFACT_SHA256,
  parsePinnedCanonicalContentArtifact,
  validateCanonicalContentArtifact
} from './canonical-content.js';

const artifactSource = fs.readFileSync(new URL('./data/canonical-content.json', import.meta.url));
const artifact = parsePinnedCanonicalContentArtifact(artifactSource);

const cloneArtifact = () => JSON.parse(JSON.stringify(artifact));

test('the checked-in canonical artifact expands to the complete create-only data plane', () => {
  assert.match(CANONICAL_CONTENT_ARTIFACT_SHA256, /^[a-f0-9]{64}$/u);
  const entries = validateCanonicalContentArtifact(artifact);
  assert.equal(entries.length, 11);
  assert.equal(entries.filter(({ collection }) => collection === 'projects').length, 8);
  assert.equal(entries.filter(({ collection }) => collection === 'journal').length, 2);
  assert.deepEqual(entries.map(({ path }) => path), [...entries.map(({ path }) => path)].sort((a, b) => {
    if (a === 'siteSettings/main') return -1;
    if (b === 'siteSettings/main') return 1;
    return a.localeCompare(b);
  }));
  assert(entries.every(({ data }) => data.schemaVersion === 2));
  assert(entries.some(({ path }) => path === 'projects/draw-or-die'));
  assert(entries.some(({ path }) => path === 'projects/hocapuanla'));
});

test('the canonical artifact parser rejects any unreviewed byte or content drift', () => {
  assert.throws(
    () => parsePinnedCanonicalContentArtifact(`${artifactSource.toString('utf8')} `),
    /does not match the reviewed revision/u
  );
  assert.throws(
    () => parsePinnedCanonicalContentArtifact({}),
    /must be text or bytes/u
  );
});

test('canonical artifact validation rejects drift, private records, duplicates, and system fields', () => {
  assert.throws(() => validateCanonicalContentArtifact({
    ...cloneArtifact(),
    extra: true
  }), /exact settings, projects, and journal/u);

  const privateArtifact = cloneArtifact();
  privateArtifact.projects[0].status = 'draft';
  assert.throws(() => validateCanonicalContentArtifact(privateArtifact), /public fallback/u);

  const duplicateArtifact = cloneArtifact();
  duplicateArtifact.projects[1].slug = duplicateArtifact.projects[0].slug;
  assert.throws(() => validateCanonicalContentArtifact(duplicateArtifact), /duplicate slug/u);

  const systemFieldArtifact = cloneArtifact();
  systemFieldArtifact.settings.updatedAt = 'forged';
  assert.throws(() => validateCanonicalContentArtifact(systemFieldArtifact), /server-owned/u);
});
