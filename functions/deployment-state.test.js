import assert from 'node:assert/strict';
import test from 'node:test';
import { planMediaDeploymentTransition } from './deployment-state.js';

test('media deployment revisions increase monotonically and remain stable for one release', () => {
  const preparing = planMediaDeploymentTransition({
    state: { status: 'active', latestRevision: 4 },
    action: 'prepare',
    deploymentId: 'deploy-a',
    snapshotHash: 'hash-a',
    contentRevision: 10,
    nowMs: 1000
  });
  assert.equal(preparing.revision, 5);
  assert.equal(preparing.latestRevision, 5);

  const finalizing = planMediaDeploymentTransition({
    state: {
      ...preparing,
      status: 'prepared',
      leaseExpiresAt: { toMillis: () => 10_000 }
    },
    action: 'finalize',
    deploymentId: 'deploy-a',
    snapshotHash: 'hash-a',
    contentRevision: 10,
    nowMs: 2000
  });
  assert.equal(finalizing.revision, 5);

  const next = planMediaDeploymentTransition({
    state: { ...finalizing, status: 'active' },
    action: 'prepare',
    deploymentId: 'deploy-b',
    snapshotHash: 'hash-b',
    contentRevision: 11,
    nowMs: 3000
  });
  assert.equal(next.revision, 6);
});

test('prepared releases fence overlapping prepares and stale finalization', () => {
  const state = {
    status: 'prepared',
    deploymentId: 'deploy-new',
    snapshotHash: 'hash-new',
    contentRevision: 20,
    latestContentRevision: 20,
    revision: 9,
    latestRevision: 9,
    leaseExpiresAt: { toMillis: () => 10_000 }
  };
  assert.throws(() => planMediaDeploymentTransition({
    state,
    action: 'prepare',
    deploymentId: 'deploy-other',
    snapshotHash: 'hash-other',
    contentRevision: 21,
    nowMs: 1000
  }), /active lease/u);
  assert.throws(() => planMediaDeploymentTransition({
    state,
    action: 'finalize',
    deploymentId: 'deploy-old',
    snapshotHash: 'hash-old',
    contentRevision: 19,
    nowMs: 1000
  }), /active lease|currently prepared/u);
  assert.throws(() => planMediaDeploymentTransition({
    state,
    action: 'prepare',
    deploymentId: 'deploy-new',
    snapshotHash: 'mutated-hash',
    contentRevision: 20,
    nowMs: 1000
  }), /cannot be reused/u);
  assert.throws(() => planMediaDeploymentTransition({
    state: { ...state, status: 'active' },
    action: 'prepare',
    deploymentId: 'deploy-stale',
    snapshotHash: 'hash-stale',
    contentRevision: 19,
    nowMs: 1000
  }), /stale or duplicate/u);
});

test('active leases fence concurrent retries while expired attempts can be reclaimed', () => {
  const state = {
    status: 'preparing',
    deploymentId: 'deploy-current',
    snapshotHash: 'hash-current',
    contentRevision: 30,
    latestContentRevision: 30,
    revision: 12,
    latestRevision: 12,
    leaseExpiresAt: { toMillis: () => 5000 }
  };
  assert.throws(() => planMediaDeploymentTransition({
    state,
    action: 'prepare',
    deploymentId: 'deploy-current',
    snapshotHash: 'hash-current',
    contentRevision: 30,
    nowMs: 4999
  }), /active lease/u);

  const reclaimed = planMediaDeploymentTransition({
    state,
    action: 'prepare',
    deploymentId: 'deploy-current',
    snapshotHash: 'hash-current',
    contentRevision: 30,
    nowMs: 5000
  });
  assert.equal(reclaimed.revision, 12);
  assert.equal(reclaimed.latestRevision, 12);
});

test('completed phases cannot be reopened under the same deployment identity', () => {
  const active = {
    status: 'active',
    deploymentId: 'deploy-complete',
    snapshotHash: 'hash-complete',
    contentRevision: 40,
    latestContentRevision: 40,
    revision: 15,
    latestRevision: 15
  };
  assert.throws(() => planMediaDeploymentTransition({
    state: active,
    action: 'prepare',
    deploymentId: 'deploy-complete',
    snapshotHash: 'hash-complete',
    contentRevision: 40,
    nowMs: 6000
  }), /cannot be prepared/u);
  assert.throws(() => planMediaDeploymentTransition({
    state: active,
    action: 'finalize',
    deploymentId: 'deploy-complete',
    snapshotHash: 'hash-complete',
    contentRevision: 40,
    nowMs: 6000
  }), /not the currently prepared/u);
});

test('a failed or expired attempt can restart the identical content revision under a fresh ID', () => {
  const retry = planMediaDeploymentTransition({
    state: {
      status: 'prepare-failed',
      deploymentId: 'deploy-failed',
      snapshotHash: 'hash-stable',
      contentRevision: 50,
      latestContentRevision: 50,
      revision: 18,
      latestRevision: 18
    },
    action: 'prepare',
    deploymentId: 'deploy-retry',
    snapshotHash: 'hash-stable',
    contentRevision: 50,
    nowMs: 10_000
  });
  assert.equal(retry.revision, 19);
  assert.equal(retry.contentRevision, 50);

  const recoveredPrepared = planMediaDeploymentTransition({
    state: {
      status: 'prepared',
      deploymentId: 'deploy-prepared-expired',
      snapshotHash: 'hash-stable',
      contentRevision: 50,
      latestContentRevision: 50,
      revision: 18,
      latestRevision: 18,
      leaseExpiresAt: { toMillis: () => 9_999 }
    },
    action: 'prepare',
    deploymentId: 'deploy-prepared-takeover',
    snapshotHash: 'hash-stable',
    contentRevision: 50,
    nowMs: 10_000
  });
  assert.equal(recoveredPrepared.revision, 19);

  assert.throws(() => planMediaDeploymentTransition({
    state: {
      status: 'prepared',
      deploymentId: 'deploy-prepared-expired',
      snapshotHash: 'hash-stable',
      contentRevision: 50,
      latestContentRevision: 50,
      revision: 18,
      latestRevision: 18,
      leaseExpiresAt: { toMillis: () => 9_999 }
    },
    action: 'finalize',
    deploymentId: 'deploy-prepared-expired',
    snapshotHash: 'hash-stable',
    contentRevision: 50,
    nowMs: 10_000
  }), /not the currently prepared/u);

  assert.throws(() => planMediaDeploymentTransition({
    state: {
      status: 'prepare-failed',
      deploymentId: 'deploy-failed',
      snapshotHash: 'hash-stable',
      contentRevision: 50,
      latestContentRevision: 50,
      revision: 18,
      latestRevision: 18
    },
    action: 'prepare',
    deploymentId: 'deploy-mutated',
    snapshotHash: 'hash-mutated',
    contentRevision: 50,
    nowMs: 10_000
  }), /stale or duplicate/u);
});

test('a newer revision safely takes over a failed finalization union', () => {
  const takeover = planMediaDeploymentTransition({
    state: {
      status: 'finalize-failed',
      deploymentId: 'deploy-finalize-failed',
      snapshotHash: 'hash-revision-one',
      contentRevision: 1,
      latestContentRevision: 1,
      revision: 4,
      latestRevision: 4,
      leaseExpiresAt: null
    },
    action: 'prepare',
    deploymentId: 'deploy-revision-two',
    snapshotHash: 'hash-revision-two',
    contentRevision: 2,
    nowMs: 20_000
  });
  assert.equal(takeover.status, 'preparing');
  assert.equal(takeover.contentRevision, 2);
  assert.equal(takeover.revision, 5);
});
