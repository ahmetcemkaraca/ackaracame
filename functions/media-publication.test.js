import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyMediaDeploymentMembership,
  extractReferencedMediaFiles,
  extractPublishedMediaManifest,
  mediaPublicationConfirmation,
  parseCanonicalFirebaseMediaUrl
} from './media-publication.js';

const bucketName = 'demo-ackaracame.firebasestorage.app';
const canonicalUrl = (objectPath) => (
  `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}`
  + `/o/${encodeURIComponent(objectPath)}?alt=media`
);

test('media confirmations distinguish prepared, fully deployed, and aborted releases', () => {
  const input = { deploymentId: 'deployment-123', projectId: 'ackaraca-production' };
  assert.equal(mediaPublicationConfirmation({ action: 'prepare', ...input }),
    'prepare:deployment-123:ackaraca-production');
  assert.equal(mediaPublicationConfirmation({ action: 'finalize', ...input }),
    'finalize:deployment-123:all-resources-deployed:ackaraca-production');
  assert.equal(mediaPublicationConfirmation({ action: 'abort', ...input }),
    'abort:deployment-123:release-not-fully-deployed:ackaraca-production');
  assert.throws(() => mediaPublicationConfirmation({ action: 'delete', ...input }), /Unsupported/u);
});

test('canonical Firebase media URLs are bound to bucket, entity, slug, and token-free query', () => {
  const input = {
    rawUrl: canonicalUrl('media/projects/draw-or-die/cover.webp'),
    bucketName,
    entity: 'project',
    slug: 'draw-or-die'
  };
  assert.equal(parseCanonicalFirebaseMediaUrl(input), 'cover.webp');
  assert.equal(parseCanonicalFirebaseMediaUrl({
    ...input,
    rawUrl: `${input.rawUrl}&token=secret`
  }), null);
  assert.equal(parseCanonicalFirebaseMediaUrl({ ...input, slug: 'another-project' }), null);
  assert.equal(parseCanonicalFirebaseMediaUrl({ ...input, bucketName: 'other.appspot.com' }), null);
  assert.equal(parseCanonicalFirebaseMediaUrl({
    ...input,
    rawUrl: canonicalUrl('media/journal/draw-or-die/cover.webp')
  }), null);
});

test('active deployment membership fails closed and distinguishes retired files', () => {
  const manifest = {
    active: true,
    complete: true,
    entity: 'project',
    slug: 'draw-or-die',
    files: ['cover.webp']
  };
  assert.equal(classifyMediaDeploymentMembership({
    manifest,
    entity: 'project',
    slug: 'draw-or-die',
    fileName: 'cover.webp'
  }), 'active');
  assert.equal(classifyMediaDeploymentMembership({
    manifest,
    entity: 'project',
    slug: 'draw-or-die',
    fileName: 'retired.webp'
  }), 'inactive');
  assert.equal(classifyMediaDeploymentMembership({
    manifest: { ...manifest, files: 'cover.webp' },
    entity: 'project',
    slug: 'draw-or-die',
    fileName: 'cover.webp'
  }), 'invalid');
});

test('published manifests include only canonical referenced media and deduplicate nested blocks', () => {
  const cover = canonicalUrl('media/projects/draw-or-die/cover.webp');
  const diagram = canonicalUrl('media/projects/draw-or-die/diagram.png');
  assert.deepEqual(extractPublishedMediaManifest({
    bucketName,
    entity: 'project',
    slug: 'draw-or-die',
    data: {
      status: 'published',
      media: [
        { assetState: 'ready', src: cover },
        { assetState: 'ready', src: 'https://cdn.example.com/not-owned.webp' }
      ],
      blocks: [
        { type: 'media', media: { assetState: 'ready', src: diagram, poster: cover } },
        { type: 'gallery', items: [{ assetState: 'ready', src: cover }] }
      ]
    }
  }), {
    published: true,
    complete: true,
    files: ['cover.webp', 'diagram.png']
  });
});

test('draft and invalid-bucket manifests fail closed', () => {
  assert.deepEqual(extractPublishedMediaManifest({
    bucketName,
    entity: 'project',
    slug: 'draw-or-die',
    data: { status: 'draft', media: [{ src: canonicalUrl('media/projects/draw-or-die/a.webp') }] }
  }), { published: false, complete: true, files: [] });
  assert.deepEqual(extractPublishedMediaManifest({
    bucketName: '',
    entity: 'project',
    slug: 'draw-or-die',
    data: { status: 'published' }
  }), { published: true, complete: false, files: [] });
  assert.deepEqual(extractPublishedMediaManifest({
    bucketName,
    entity: 'project',
    slug: 'draw-or-die',
    data: {
      status: 'published',
      media: [{
        assetState: 'ready',
        src: `${canonicalUrl('media/projects/draw-or-die/a.webp')}&token=legacy-token`
      }]
    }
  }), { published: true, complete: false, files: [] });
});

test('draft references remain visible to orphan collection without becoming public manifests', () => {
  const data = {
    status: 'draft',
    media: [{
      assetState: 'ready',
      src: canonicalUrl('media/projects/private-draft/draft.webp')
    }]
  };
  assert.deepEqual(extractReferencedMediaFiles({
    data,
    bucketName,
    entity: 'project',
    slug: 'private-draft'
  }), { complete: true, files: ['draft.webp'] });
  assert.deepEqual(extractPublishedMediaManifest({
    data,
    bucketName,
    entity: 'project',
    slug: 'private-draft'
  }), { published: false, complete: true, files: [] });
});

test('planned assets are retained for GC safety but never enter the public manifest', () => {
  const ready = canonicalUrl('media/projects/planned-safe/ready.webp');
  const planned = canonicalUrl('media/projects/planned-safe/planned.webp');
  const poster = canonicalUrl('media/projects/planned-safe/poster.webp');
  const data = {
    status: 'published',
    media: [
      { assetState: 'ready', src: ready },
      { assetState: 'planned', src: planned, poster }
    ]
  };

  assert.deepEqual(extractPublishedMediaManifest({
    data,
    bucketName,
    entity: 'project',
    slug: 'planned-safe'
  }), { published: true, complete: true, files: ['ready.webp'] });
  assert.deepEqual(extractReferencedMediaFiles({
    data,
    bucketName,
    entity: 'project',
    slug: 'planned-safe'
  }), { complete: true, files: ['planned.webp', 'poster.webp', 'ready.webp'] });
});
