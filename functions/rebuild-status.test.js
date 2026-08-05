import assert from 'node:assert/strict';
import test from 'node:test';
import { projectSiteRebuildStatus } from './rebuild-status.js';

test('latest rebuild status is explicitly idle before the durable queue starts', () => {
  assert.deepEqual(projectSiteRebuildStatus({
    targetRevision: 0,
    queue: {},
    publication: {}
  }), {
    targetRevision: 0,
    state: 'idle',
    requestedRevision: 0,
    hookAcceptedRevision: 0,
    activeRevision: 0,
    queueStatus: 'unknown',
    deploymentStatus: 'unknown',
    failureCode: null,
    activeDeploymentId: null
  });
});

test('latest rebuild status projects queued, failed, and active state with bounded fields', () => {
  const queued = projectSiteRebuildStatus({
    targetRevision: 4,
    queue: { status: 'queued', requestedRevision: 4 },
    publication: { status: 'active', activeContentRevision: 3 }
  });
  assert.equal(queued.state, 'awaiting-hook');
  assert.equal(queued.queueStatus, 'queued');

  const failed = projectSiteRebuildStatus({
    targetRevision: 4,
    queue: {
      status: 'failed',
      requestedRevision: 4,
      failedRevision: 4,
      failureCode: 'x'.repeat(200)
    },
    publication: {}
  });
  assert.equal(failed.state, 'hook-failed');
  assert.equal(failed.failureCode.length, 80);

  const active = projectSiteRebuildStatus({
    targetRevision: 4,
    queue: { status: 'hook-accepted', requestedRevision: 4, lastDispatchedRevision: 4 },
    publication: {
      status: 'active',
      activeContentRevision: 4,
      activeDeploymentId: 'deployment-four'
    }
  });
  assert.equal(active.state, 'active');
  assert.equal(active.activeDeploymentId, 'deployment-four');
});
