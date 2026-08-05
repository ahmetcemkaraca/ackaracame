import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isMediaGcAgeEligible,
  parsePromotedMediaPath,
  shouldDeletePromotedMedia
} from './media-gc.js';

test('promoted GC accepts only canonical project and journal paths', () => {
  assert.deepEqual(parsePromotedMediaPath('media/projects/atlas/cover.webp'), {
    entity: 'project', collection: 'projects', slug: 'atlas', fileName: 'cover.webp'
  });
  assert.deepEqual(parsePromotedMediaPath('media/journal/release-note/hero.png'), {
    entity: 'journal', collection: 'journal', slug: 'release-note', fileName: 'hero.png'
  });
  assert.equal(parsePromotedMediaPath('media/projects/atlas/nested/cover.webp'), null);
  assert.equal(parsePromotedMediaPath('media/site/main/cover.webp'), null);
});

test('GC eligibility is fail-closed for active, referenced, young, or malformed objects', () => {
  assert.equal(isMediaGcAgeEligible({
    timeCreated: '2026-01-01T00:00:00.000Z',
    nowMs: Date.parse('2026-02-15T00:00:00.000Z'),
    retentionMs: 30 * 24 * 60 * 60 * 1000
  }), true);
  const baseline = {
    ageEligible: true,
    metadataValid: true,
    deploymentMembership: 'inactive',
    referenceScanComplete: true,
    referenced: false
  };
  assert.equal(shouldDeletePromotedMedia(baseline), true);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, deploymentMembership: 'active' }), false);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, deploymentMembership: 'invalid' }), false);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, referenced: true }), false);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, referenceScanComplete: false }), false);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, metadataValid: false }), false);
  assert.equal(shouldDeletePromotedMedia({ ...baseline, ageEligible: false }), false);
});
