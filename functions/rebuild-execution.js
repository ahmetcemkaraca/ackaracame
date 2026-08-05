import { assertAuthorizedRebuildRevision } from './rebuild-authorization.js';

const SAFE_EXECUTION_ID = /^[a-zA-Z0-9_.:-]{1,160}$/u;
const SAFE_DEPLOYMENT_ID = /^[a-zA-Z0-9_-]{8,100}$/u;
const SAFE_FAILURE_CODE = /^[a-z0-9][a-z0-9-]{0,79}$/u;
const DEFAULT_EXECUTION_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const safeRevision = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;

export const validateRebuildExecutionId = (value) => (
  typeof value === 'string' && SAFE_EXECUTION_ID.test(value)
);

export const planRebuildExecutionClaim = ({
  queue,
  execution,
  publication,
  revision,
  requestId,
  executionId,
  nowMs,
  leaseMs,
  retentionMs = DEFAULT_EXECUTION_RETENTION_MS
}) => {
  if (!validateRebuildExecutionId(executionId)) {
    throw new Error('The rebuild execution ID is invalid.');
  }
  const acceptedRevision = safeRevision(queue?.lastDispatchedRevision);
  if (acceptedRevision > revision) return { outcome: 'stale', state: {} };
  assertAuthorizedRebuildRevision({ contentRevision: revision, requestId, queue });

  if (
    publication?.status === 'active'
    && publication.activeContentRevision === revision
    && typeof publication.activeDeploymentId === 'string'
    && SAFE_DEPLOYMENT_ID.test(publication.activeDeploymentId)
  ) return { outcome: 'already-active', state: {} };

  const current = execution && typeof execution === 'object' ? execution : {};
  if (
    current.revision !== undefined
    && (current.revision !== revision || current.requestId !== requestId)
  ) {
    throw new Error('The rebuild execution record is bound to another request.');
  }
  if (current.status === 'active') return { outcome: 'already-active', state: {} };
  const leaseExpiresAtMs = current.leaseExpiresAt?.toMillis?.();
  if (
    current.status === 'running'
    && current.executionId !== executionId
    && (!Number.isFinite(leaseExpiresAtMs) || leaseExpiresAtMs > nowMs)
  ) return { outcome: 'duplicate-running', state: {} };

  return {
    outcome: 'claimed',
    state: {
      schemaVersion: 1,
      status: 'running',
      revision,
      requestId,
      executionId,
      leaseExpiresAtMs: nowMs + leaseMs,
      expiresAtMs: nowMs + Math.max(leaseMs, retentionMs),
      failureCode: null
    }
  };
};

export const assertRebuildExecutionOwner = ({
  execution,
  revision,
  requestId,
  executionId,
  result
}) => {
  if (!validateRebuildExecutionId(executionId)) {
    throw new Error('The rebuild execution ID is invalid.');
  }
  if (
    execution?.revision !== revision
    || execution.requestId !== requestId
    || execution.executionId !== executionId
  ) throw new Error('The rebuild execution claim was superseded.');
  if (
    execution.status === 'running'
    || execution.status === result
    || (execution.status === 'failed' && result === 'active')
  ) return;
  throw new Error('The rebuild execution claim was superseded.');
};

export const canonicalizeRebuildResult = ({
  requestedResult,
  revision,
  deploymentId,
  publication
}) => {
  if (!['active', 'failed'].includes(requestedResult)) {
    throw new Error('The rebuild result is invalid.');
  }
  const exactActive = publication?.status === 'active'
    && publication.activeContentRevision === revision
    && publication.activeDeploymentId === deploymentId;
  if (requestedResult === 'active') {
    if (!exactActive) {
      throw new Error('The active media deployment does not match this success report.');
    }
    return 'active';
  }
  if (
    publication?.status === 'active'
    && publication.activeContentRevision === revision
    && !exactActive
  ) {
    throw new Error('An active deployment already proves this content revision succeeded.');
  }
  return exactActive ? 'active' : 'failed';
};

export const selectRebuildFailureCode = ({
  requestedFailureCode,
  queue,
  execution,
  revision,
  deploymentId
}) => {
  if (typeof requestedFailureCode !== 'string' || !SAFE_FAILURE_CODE.test(requestedFailureCode)) {
    throw new Error('The rebuild failure code is invalid.');
  }
  const sameQueueResult = queue?.latestDeploymentResult === 'failed'
    && queue.latestDeploymentResultRevision === revision
    && queue.latestDeploymentId === deploymentId;
  const sameExecutionResult = execution?.status === 'failed'
    && execution.deploymentId === deploymentId;
  const firstFailureCode = [
    sameQueueResult ? queue.latestDeploymentFailureCode : null,
    sameExecutionResult ? execution.failureCode : null
  ].find((value) => typeof value === 'string' && SAFE_FAILURE_CODE.test(value));
  return firstFailureCode || requestedFailureCode;
};
