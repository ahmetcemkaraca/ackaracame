import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertBoundMediaSnapshotUnchanged,
  bindVerifiedMediaToSnapshotHash,
  desiredPromotedMediaObjects,
  validatePromotedObjectMetadata,
  verifyPromotedMediaObjects
} from './promoted-media.js';

const metadata = (overrides = {}) => ({
  contentType: 'image/webp',
  size: '2048',
  generation: '42',
  metadata: {
    uploadedBy: 'admin-user',
    stagingPath: 'admin-media/admin-user/photo.webp',
    sourceGeneration: '7',
    entity: 'project',
    slug: 'example-project'
  },
  ...overrides
});

test('desired media HEAD verification deduplicates objects and bounds concurrency', async () => {
  const publications = new Map([
    ['one', { entity: 'project', slug: 'example-project', files: ['photo.webp', 'photo.webp'] }],
    ['two', { entity: 'project', slug: 'second-project', files: ['second.webp'] }]
  ]);
  const desiredObjects = desiredPromotedMediaObjects({ publications, maximum: 10 });
  assert.equal(desiredObjects.length, 2);
  let active = 0;
  let maximumActive = 0;
  const verified = await verifyPromotedMediaObjects({
    desiredObjects,
    concurrency: 1,
    readMetadata: async (storagePath) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await Promise.resolve();
      active -= 1;
      const slug = storagePath.includes('second-project') ? 'second-project' : 'example-project';
      const fileName = storagePath.includes('second-project') ? 'second.webp' : 'photo.webp';
      return {
        contentType: 'image/webp',
        size: '100',
        generation: '9',
        metadata: {
          uploadedBy: 'admin-user',
          stagingPath: `admin-media/admin-user/${fileName}`,
          sourceGeneration: '4',
          entity: 'project',
          slug
        }
      };
    }
  });
  assert.equal(verified.length, 2);
  assert.equal(maximumActive, 1);
  await assert.rejects(() => verifyPromotedMediaObjects({
    desiredObjects: [desiredObjects[0]],
    concurrency: 1,
    readMetadata: async () => {
      const error = new Error('not found');
      error.code = 404;
      throw error;
    }
  }), /could not be verified/u);
});

test('promoted object validation binds path, owner, generations, MIME, size, and source', () => {
  const verified = validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata(),
    entity: 'project',
    slug: 'example-project',
    expectedUploadedBy: 'admin-user',
    expectedStagingPath: 'admin-media/admin-user/photo.webp'
  });
  assert.equal(verified.generation, '42');
  assert.equal(verified.sourceGeneration, '7');
  assert.throws(() => validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata({ generation: '' }),
    entity: 'project',
    slug: 'example-project'
  }), /metadata/u);
  assert.throws(() => validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata({ contentType: 'image/png' }),
    entity: 'project',
    slug: 'example-project'
  }), /metadata/u);
  assert.throws(() => validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata({ metadata: { ...metadata().metadata, slug: 'other' } }),
    entity: 'project',
    slug: 'example-project'
  }), /metadata/u);
  assert.throws(() => validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata(),
    entity: 'project',
    slug: 'example-project',
    expectedUploadedBy: 'another-admin',
    expectedStagingPath: 'admin-media/another-admin/photo.webp'
  }), /metadata/u);
});

test('verified object generations and metadata are bound deterministically into the snapshot hash', () => {
  const snapshotHash = 'a'.repeat(64);
  const object = validatePromotedObjectMetadata({
    storagePath: 'media/projects/example-project/photo.webp',
    objectMetadata: metadata(),
    entity: 'project',
    slug: 'example-project'
  });
  const first = bindVerifiedMediaToSnapshotHash({ snapshotHash, verifiedObjects: [object] });
  const same = bindVerifiedMediaToSnapshotHash({ snapshotHash, verifiedObjects: [object] });
  const changed = bindVerifiedMediaToSnapshotHash({
    snapshotHash,
    verifiedObjects: [{ ...object, generation: '43' }]
  });
  assert.match(first, /^[a-f0-9]{64}$/u);
  assert.equal(first, same);
  assert.notEqual(first, changed);
  assert.equal(assertBoundMediaSnapshotUnchanged({
    contentSnapshotHash: snapshotHash,
    expectedSnapshotHash: first,
    verifiedObjects: [object]
  }), first);
  assert.throws(() => assertBoundMediaSnapshotUnchanged({
    contentSnapshotHash: snapshotHash,
    expectedSnapshotHash: first,
    verifiedObjects: [{ ...object, generation: '43' }]
  }), /changed after.*mutation lease/u);
});
