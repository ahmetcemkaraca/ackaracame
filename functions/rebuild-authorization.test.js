import assert from 'node:assert/strict';
import test from 'node:test';
import { assertAuthorizedRebuildRevision } from './rebuild-authorization.js';

test('bootstrap revision zero is allowed only before the server queue starts', () => {
  assert.doesNotThrow(() => assertAuthorizedRebuildRevision({
    contentRevision: 0,
    requestId: null,
    queue: {}
  }));
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: 0,
    requestId: null,
    queue: { requestedRevision: 1, lastDispatchedRevision: 1 }
  }), /unavailable/u);
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: 0,
    requestId: 'bootstrap-request',
    queue: {}
  }), /must not carry/u);
});

test('queued deployments require the exact accepted revision and server request ID', () => {
  const queue = {
    requestedRevision: 8,
    lastDispatchedRevision: 7,
    lastDispatchedRequestId: 'request-seven'
  };
  assert.doesNotThrow(() => assertAuthorizedRebuildRevision({
    contentRevision: 7,
    requestId: 'request-seven',
    queue
  }));
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: 8,
    requestId: 'request-seven',
    queue
  }), /not the latest/u);
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: 7,
    requestId: 'request-eight',
    queue
  }), /not the latest/u);
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: Number.MAX_SAFE_INTEGER,
    requestId: 'forged-request',
    queue
  }), /not the latest/u);
});

test('malformed server queue revisions fail closed', () => {
  assert.throws(() => assertAuthorizedRebuildRevision({
    contentRevision: 2,
    requestId: 'request-two',
    queue: {
      requestedRevision: '2',
      lastDispatchedRevision: 2,
      lastDispatchedRequestId: 'request-two'
    }
  }), /queue requested revision is invalid/u);
});
