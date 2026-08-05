import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceAcceptedRebuildTuple,
  beginRebuildDispatch,
  claimRebuildDispatcher,
  completeRebuildDispatch,
  deriveRebuildTargetState,
  enqueueRebuildOperation,
  failRebuildDispatch
} from './rebuild-queue.js';

test('a stale dispatcher cannot overwrite the accepted revision/request tuple', () => {
  assert.deepEqual(advanceAcceptedRebuildTuple({
    currentRevision: 12,
    dispatchRevision: 11,
    dispatchRequestId: 'request-from-stale-owner'
  }), {});
  assert.deepEqual(advanceAcceptedRebuildTuple({
    currentRevision: 11,
    dispatchRevision: 12,
    dispatchRequestId: 'request-from-current-owner'
  }), {
    lastDispatchedRevision: 12,
    lastDispatchedRequestId: 'request-from-current-owner'
  });
});

test('a trailing rebuild is coalesced under the active dispatcher and dispatched automatically', () => {
  const first = enqueueRebuildOperation({
    current: { requestedRevision: 0, pendingPaths: [], leaseExpiresAtMs: 0 },
    request: { reason: 'content-updated', paths: ['projects/alpha'] },
    requestId: 'request-a',
    actorUid: 'admin',
    dispatcherId: 'dispatcher-a',
    nowMs: 1000,
    leaseMs: 60_000
  });
  assert.equal(first.ownsDispatcher, true);
  const dispatch = beginRebuildDispatch({
    current: first.state,
    dispatcherId: 'dispatcher-a',
    nowMs: 1100,
    leaseMs: 60_000
  });
  assert.equal(dispatch.dispatch.revision, 1);

  const trailing = enqueueRebuildOperation({
    current: { ...first.state, ...dispatch.state },
    request: { reason: 'content-updated', paths: ['projects/beta'] },
    requestId: 'request-b',
    actorUid: 'admin',
    dispatcherId: 'dispatcher-b',
    nowMs: 1200,
    leaseMs: 60_000
  });
  assert.equal(trailing.ownsDispatcher, false);
  assert.equal(trailing.revision, 2);

  const completed = completeRebuildDispatch({
    current: trailing.state,
    dispatcherId: 'dispatcher-a',
    dispatchedRevision: 1,
    nowMs: 1300,
    leaseMs: 60_000
  });
  assert.equal(completed.ownsDispatcher, true);
  const trailingDispatch = beginRebuildDispatch({
    current: { ...trailing.state, ...completed.state },
    dispatcherId: 'dispatcher-a',
    nowMs: 1400,
    leaseMs: 60_000
  });
  assert.deepEqual(trailingDispatch.dispatch, {
    revision: 2,
    requestId: 'request-b',
    reason: 'content-updated',
    paths: ['projects/beta'],
    requestedBy: 'admin'
  });
});

test('automatic queue debounce prevents dispatch until the quiet-window fence expires', () => {
  const current = {
    status: 'dispatching',
    dispatcherId: 'dispatcher-a',
    requestedRevision: 3,
    lastDispatchedRevision: 2,
    latestRequestId: 'request-three',
    pendingReason: 'content-updated',
    pendingPaths: ['projects/burst'],
    pendingRequestedBy: 'admin',
    leaseExpiresAtMs: 70_000,
    dispatchNotBeforeAtMs: 10_000
  };
  assert.equal(beginRebuildDispatch({
    current,
    dispatcherId: 'dispatcher-a',
    nowMs: 9_999,
    leaseMs: 60_000
  }), null);
  const begun = beginRebuildDispatch({
    current,
    dispatcherId: 'dispatcher-a',
    nowMs: 10_000,
    leaseMs: 60_000
  });
  assert.equal(begun.dispatch.revision, 3);
  assert.equal(begun.state.dispatchNotBeforeAtMs, null);
});

test('an outbox enqueue stays neutral so its signal worker can claim immediately', () => {
  const queued = enqueueRebuildOperation({
    current: { requestedRevision: 0, pendingPaths: [], leaseExpiresAtMs: 0 },
    request: { reason: 'content-updated', paths: ['projects/automatic'] },
    requestId: 'automatic-request',
    actorUid: 'firestore-system',
    dispatcherId: 'event-local-owner',
    nowMs: 1000,
    leaseMs: 60_000,
    claimDispatcher: false
  });
  assert.equal(queued.state.status, 'queued');
  assert.equal(queued.state.dispatcherId, null);
  assert.equal(queued.state.leaseExpiresAtMs, null);
  const claimed = claimRebuildDispatcher({
    current: queued.state,
    dispatcherId: 'signal-worker',
    targetRevision: queued.revision,
    nowMs: 1001,
    leaseMs: 60_000
  });
  assert.equal(claimed.outcome, 'owned');
  assert.equal(claimed.state.dispatcherId, 'signal-worker');
});

test('a neutral burst dispatches only its latest trailing revision after quiet time', () => {
  const first = enqueueRebuildOperation({
    current: { requestedRevision: 0, pendingPaths: [], leaseExpiresAtMs: 0 },
    request: { reason: 'content-updated', paths: ['projects/one'] },
    requestId: 'request-one',
    actorUid: 'firestore-system',
    dispatcherId: 'unused-one',
    nowMs: 1000,
    leaseMs: 60_000,
    claimDispatcher: false
  });
  const second = enqueueRebuildOperation({
    current: { ...first.state, dispatchNotBeforeAtMs: 11_000 },
    request: { reason: 'content-updated', paths: ['projects/two'] },
    requestId: 'request-two',
    actorUid: 'firestore-system',
    dispatcherId: 'unused-two',
    nowMs: 2000,
    leaseMs: 60_000,
    claimDispatcher: false
  });
  const current = { ...second.state, dispatchNotBeforeAtMs: 12_000 };
  const claim = claimRebuildDispatcher({
    current,
    dispatcherId: 'signal-worker',
    targetRevision: 2,
    nowMs: 2001,
    leaseMs: 60_000
  });
  const claimed = { ...current, ...claim.state };
  assert.equal(beginRebuildDispatch({
    current: claimed,
    dispatcherId: 'signal-worker',
    nowMs: 11_999,
    leaseMs: 60_000
  }), null);
  const dispatch = beginRebuildDispatch({
    current: claimed,
    dispatcherId: 'signal-worker',
    nowMs: 12_000,
    leaseMs: 60_000
  });
  assert.equal(dispatch.dispatch.revision, 2);
  assert.equal(dispatch.dispatch.requestId, 'request-two');
  assert.deepEqual(dispatch.dispatch.paths, ['projects/one', 'projects/two']);
});

test('failed dispatches preserve their paths for the next monotonic retry', () => {
  const failed = failRebuildDispatch({
    current: {
      dispatcherId: 'dispatcher-a',
      pendingReason: 'settings-updated',
      pendingPaths: ['siteSettings/main'],
      pendingRequestedBy: 'admin'
    },
    dispatcherId: 'dispatcher-a',
    dispatch: {
      revision: 4,
      reason: 'content-updated',
      paths: ['projects/alpha'],
      requestedBy: 'admin'
    },
    failureCode: 'timeout'
  });
  assert.equal(failed.status, 'failed');
  assert.deepEqual(failed.pendingPaths, ['projects/alpha', 'siteSettings/main']);
  assert.equal(failed.failedRevision, 4);
});

test('a coalesced caller waits for a live owner and reclaims a failed or expired dispatcher', () => {
  const waiting = claimRebuildDispatcher({
    current: {
      status: 'dispatching',
      dispatcherId: 'dispatcher-a',
      requestedRevision: 5,
      lastDispatchedRevision: 3,
      leaseExpiresAtMs: 5000
    },
    dispatcherId: 'dispatcher-b',
    targetRevision: 5,
    nowMs: 4000,
    leaseMs: 60_000
  });
  assert.equal(waiting.outcome, 'waiting');

  const reclaimed = claimRebuildDispatcher({
    current: {
      status: 'failed',
      dispatcherId: null,
      requestedRevision: 5,
      lastDispatchedRevision: 3,
      leaseExpiresAtMs: 0
    },
    dispatcherId: 'dispatcher-b',
    targetRevision: 5,
    nowMs: 5000,
    leaseMs: 60_000
  });
  assert.equal(reclaimed.outcome, 'owned');
  assert.equal(reclaimed.state.dispatcherId, 'dispatcher-b');

  const accepted = claimRebuildDispatcher({
    current: { lastDispatchedRevision: 6, leaseExpiresAtMs: 0 },
    dispatcherId: 'dispatcher-b',
    targetRevision: 5,
    nowMs: 6000,
    leaseMs: 60_000
  });
  assert.equal(accepted.outcome, 'hook-accepted');
  assert.equal(accepted.acceptedRevision, 6);
});

test('rebuild status distinguishes hook acceptance, pipeline failure, and active deployment', () => {
  const baseline = {
    targetRevision: 8,
    queueStatus: 'hook-accepted',
    requestedRevision: 8,
    hookAcceptedRevision: 8,
    failedRevision: 0,
    queueFailureCode: null,
    deploymentResult: null,
    deploymentResultRevision: 0,
    deploymentFailureCode: null,
    activeRevision: 7,
    deploymentStatus: 'active',
    candidateRevision: 7,
    publicationFailureCode: null
  };
  assert.deepEqual(deriveRebuildTargetState(baseline), {
    state: 'deploying', failureCode: null
  });
  assert.deepEqual(deriveRebuildTargetState({
    ...baseline,
    deploymentResult: 'failed',
    deploymentResultRevision: 8,
    deploymentFailureCode: 'build-failed'
  }), { state: 'deploy-failed', failureCode: 'build-failed' });
  assert.deepEqual(deriveRebuildTargetState({
    ...baseline,
    activeRevision: 8,
    deploymentResult: 'failed',
    deploymentResultRevision: 8,
    deploymentFailureCode: 'stale-failure'
  }), { state: 'active', failureCode: null });
  assert.deepEqual(deriveRebuildTargetState({
    ...baseline,
    queueStatus: 'failed',
    hookAcceptedRevision: 7,
    failedRevision: 8,
    queueFailureCode: 'timeout'
  }), { state: 'hook-failed', failureCode: 'timeout' });
});
