import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contentRebuildRequest,
  planRebuildOutboxEvent,
  rebuildOutboxIdentity
} from './rebuild-outbox.js';

test('only public-content-affecting writes create automatic rebuild requests', () => {
  assert.equal(contentRebuildRequest({
    entity: 'project',
    documentId: 'private-draft',
    beforeData: { status: 'draft' },
    afterData: { status: 'draft' }
  }), null);
  assert.deepEqual(contentRebuildRequest({
    entity: 'project',
    documentId: 'public-work',
    beforeData: { status: 'draft' },
    afterData: { status: 'published' }
  }), { reason: 'content-published', paths: ['projects/public-work'] });
  assert.deepEqual(contentRebuildRequest({
    entity: 'journal',
    documentId: 'public-note',
    beforeData: { status: 'published' },
    afterData: { status: 'archived' }
  }), { reason: 'content-updated', paths: ['journal/public-note'] });
  assert.deepEqual(contentRebuildRequest({
    entity: 'site-settings',
    documentId: 'main',
    beforeData: {},
    afterData: {}
  }), { reason: 'settings-updated', paths: ['siteSettings/main'] });
});

test('event retries reuse one deterministic request and never allocate a second revision', () => {
  const request = { reason: 'content-updated', paths: ['projects/alpha'] };
  const first = planRebuildOutboxEvent({
    currentQueue: { requestedRevision: 6, pendingPaths: [], leaseExpiresAtMs: 0 },
    currentEvent: null,
    eventId: 'firestore-event-a',
    request,
    actorUid: 'admin',
    dispatcherId: 'dispatcher-a',
    nowMs: 1000,
    leaseMs: 60_000,
    debounceMs: 10_000
  });
  assert.equal(first.created, true);
  assert.equal(first.revision, 7);
  assert.equal(first.ownsDispatcher, false);
  assert.equal(first.queueState.status, 'queued');
  assert.equal(first.queueState.dispatcherId, null);
  assert.equal(first.queueState.leaseExpiresAtMs, null);

  const retried = planRebuildOutboxEvent({
    currentQueue: { ...first.queueState, requestedRevision: 7 },
    currentEvent: first.eventState,
    eventId: 'firestore-event-a',
    request,
    actorUid: 'admin',
    dispatcherId: 'dispatcher-b',
    nowMs: 2000,
    leaseMs: 60_000,
    debounceMs: 10_000
  });
  assert.deepEqual(retried.queueState, {});
  assert.equal(retried.created, false);
  assert.equal(retried.revision, 7);
  assert.equal(retried.requestId, first.requestId);
});

test('concurrent distinct events stay monotonic and coalesce under one dispatcher', () => {
  const first = planRebuildOutboxEvent({
    currentQueue: { requestedRevision: 0, pendingPaths: [], leaseExpiresAtMs: 0 },
    currentEvent: null,
    eventId: 'event-one',
    request: { reason: 'content-updated', paths: ['projects/one'] },
    actorUid: 'admin',
    dispatcherId: 'dispatcher-one',
    nowMs: 1000,
    leaseMs: 60_000,
    debounceMs: 10_000
  });
  const second = planRebuildOutboxEvent({
    currentQueue: first.queueState,
    currentEvent: null,
    eventId: 'event-two',
    request: { reason: 'settings-updated', paths: ['siteSettings/main'] },
    actorUid: 'admin',
    dispatcherId: 'dispatcher-two',
    nowMs: 1001,
    leaseMs: 60_000,
    debounceMs: 10_000
  });
  assert.equal(second.revision, 2);
  assert.equal(second.ownsDispatcher, false);
  assert.equal(second.queueState.status, 'queued');
  assert.equal(second.queueState.dispatcherId, null);
  assert.deepEqual(second.queueState.pendingPaths, ['projects/one', 'siteSettings/main']);
  assert.notEqual(rebuildOutboxIdentity('event-one').requestId, second.requestId);
});
