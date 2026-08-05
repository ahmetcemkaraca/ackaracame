import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertRebuildExecutionOwner,
  canonicalizeRebuildResult,
  planRebuildExecutionClaim,
  selectRebuildFailureCode
} from './rebuild-execution.js';

const timestamp = (milliseconds) => ({ toMillis: () => milliseconds });
const queue = {
  requestedRevision: 8,
  lastDispatchedRevision: 8,
  lastDispatchedRequestId: 'request-eight'
};

test('one accepted revision permits only one live build execution', () => {
  const claimed = planRebuildExecutionClaim({
    queue,
    execution: {},
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-1',
    nowMs: 1000,
    leaseMs: 60_000
  });
  assert.equal(claimed.outcome, 'claimed');
  assert.equal(claimed.state.expiresAtMs, 1000 + (90 * 24 * 60 * 60 * 1000));

  const duplicate = planRebuildExecutionClaim({
    queue,
    execution: {
      ...claimed.state,
      leaseExpiresAt: timestamp(claimed.state.leaseExpiresAtMs)
    },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-2',
    nowMs: 2000,
    leaseMs: 60_000
  });
  assert.deepEqual(duplicate, { outcome: 'duplicate-running', state: {} });

  const rerun = planRebuildExecutionClaim({
    queue,
    execution: {
      ...claimed.state,
      leaseExpiresAt: timestamp(claimed.state.leaseExpiresAtMs)
    },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-1',
    nowMs: 2000,
    leaseMs: 60_000
  });
  assert.equal(rerun.outcome, 'claimed');
  assert.equal(rerun.state.leaseExpiresAtMs, 62_000);
});

test('expired and failed executions can be recovered while active and stale builds skip', () => {
  const expired = planRebuildExecutionClaim({
    queue,
    execution: {
      status: 'running',
      revision: 8,
      requestId: 'request-eight',
      executionId: 'github-run-old',
      leaseExpiresAt: timestamp(1999)
    },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-new',
    nowMs: 2000,
    leaseMs: 60_000
  });
  assert.equal(expired.outcome, 'claimed');

  assert.deepEqual(planRebuildExecutionClaim({
    queue: {
      requestedRevision: 9,
      lastDispatchedRevision: 9,
      lastDispatchedRequestId: 'request-nine'
    },
    execution: {},
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-stale',
    nowMs: 2000,
    leaseMs: 60_000
  }), { outcome: 'stale', state: {} });

  assert.deepEqual(planRebuildExecutionClaim({
    queue,
    execution: {
      status: 'active',
      revision: 8,
      requestId: 'request-eight'
    },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-duplicate',
    nowMs: 2000,
    leaseMs: 60_000
  }), { outcome: 'already-active', state: {} });
});

test('an exact active publication prevents a recovered duplicate build', () => {
  assert.deepEqual(planRebuildExecutionClaim({
    queue,
    execution: {
      status: 'running',
      revision: 8,
      requestId: 'request-eight',
      executionId: 'github-run-old',
      leaseExpiresAt: timestamp(1000)
    },
    publication: {
      status: 'active',
      activeContentRevision: 8,
      activeDeploymentId: 'deployment-eight'
    },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-retry',
    nowMs: 2000,
    leaseMs: 60_000
  }), { outcome: 'already-active', state: {} });
  assert.equal(planRebuildExecutionClaim({
    queue,
    execution: {},
    publication: { status: 'active', activeContentRevision: 8 },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-retry',
    nowMs: 2000,
    leaseMs: 60_000
  }).outcome, 'claimed');
});

test('completion is fenced to the exact execution owner', () => {
  const execution = {
    status: 'running',
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-owner',
    result: 'active'
  };
  assert.doesNotThrow(() => assertRebuildExecutionOwner({
    execution,
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-owner'
  }));
  assert.throws(() => assertRebuildExecutionOwner({
    execution,
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-other',
    result: 'active'
  }), /superseded/u);
  assert.doesNotThrow(() => assertRebuildExecutionOwner({
    execution: { ...execution, status: 'active' },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-owner',
    result: 'active'
  }));
  assert.doesNotThrow(() => assertRebuildExecutionOwner({
    execution: { ...execution, status: 'failed' },
    revision: 8,
    requestId: 'request-eight',
    executionId: 'github-run-owner',
    result: 'active'
  }));
});

test('an exact active publication canonicalizes a lost finalize response to success', () => {
  const publication = {
    status: 'active',
    activeContentRevision: 8,
    activeDeploymentId: 'deployment-eight'
  };
  assert.equal(canonicalizeRebuildResult({
    requestedResult: 'failed',
    revision: 8,
    deploymentId: 'deployment-eight',
    publication
  }), 'active');
  assert.throws(() => canonicalizeRebuildResult({
    requestedResult: 'failed',
    revision: 8,
    deploymentId: 'different-deployment',
    publication
  }), /already proves/u);
  assert.throws(() => canonicalizeRebuildResult({
    requestedResult: 'active',
    revision: 8,
    deploymentId: 'deployment-eight',
    publication: { status: 'prepared' }
  }), /does not match/u);
});

test('duplicate failure reports preserve the first stage-specific failure code', () => {
  assert.equal(selectRebuildFailureCode({
    requestedFailureCode: 'github-workflow-failed',
    queue: {
      latestDeploymentResult: 'failed',
      latestDeploymentResultRevision: 8,
      latestDeploymentId: 'deployment-eight',
      latestDeploymentFailureCode: 'media-finalize-failed'
    },
    execution: {
      status: 'failed',
      deploymentId: 'deployment-eight',
      failureCode: 'media-finalize-failed'
    },
    revision: 8,
    deploymentId: 'deployment-eight'
  }), 'media-finalize-failed');

  assert.equal(selectRebuildFailureCode({
    requestedFailureCode: 'build-failed',
    queue: {},
    execution: {},
    revision: 8,
    deploymentId: 'deployment-eight'
  }), 'build-failed');

  assert.throws(() => selectRebuildFailureCode({
    requestedFailureCode: 'INVALID',
    queue: {},
    execution: {},
    revision: 8,
    deploymentId: 'deployment-eight'
  }), /failure code is invalid/u);
});
