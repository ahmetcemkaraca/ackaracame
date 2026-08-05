import { deriveRebuildTargetState } from './rebuild-queue.js';

const safeRevision = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const QUEUE_STATES = new Set(['queued', 'dispatching', 'hook-accepted', 'failed']);
const DEPLOYMENT_STATES = new Set([
  'preparing', 'prepared', 'prepare-failed', 'finalizing',
  'finalize-failed', 'active', 'aborted'
]);
const SAFE_DEPLOYMENT_ID = /^[a-zA-Z0-9_-]{8,100}$/u;

export const projectSiteRebuildStatus = ({ targetRevision, queue, publication }) => {
  if (!Number.isSafeInteger(targetRevision) || targetRevision < 0) {
    throw new Error('The rebuild target revision is invalid.');
  }
  const requestedRevision = safeRevision(queue?.requestedRevision);
  const hookAcceptedRevision = safeRevision(queue?.lastDispatchedRevision);
  const activeRevision = safeRevision(publication?.activeContentRevision);
  const queueStatus = QUEUE_STATES.has(queue?.status) ? queue.status : 'unknown';
  const deploymentStatus = DEPLOYMENT_STATES.has(publication?.status)
    ? publication.status
    : 'unknown';
  const activeDeploymentId = typeof publication?.activeDeploymentId === 'string'
    && SAFE_DEPLOYMENT_ID.test(publication.activeDeploymentId)
    ? publication.activeDeploymentId
    : null;
  if (targetRevision === 0 && requestedRevision === 0) {
    return {
      targetRevision: 0,
      state: 'idle',
      requestedRevision,
      hookAcceptedRevision,
      activeRevision,
      queueStatus,
      deploymentStatus,
      failureCode: null,
      activeDeploymentId
    };
  }
  if (targetRevision === 0) {
    throw new Error('An idle rebuild projection cannot hide a requested revision.');
  }

  const targetState = deriveRebuildTargetState({
    targetRevision,
    queueStatus,
    requestedRevision,
    hookAcceptedRevision,
    failedRevision: safeRevision(queue?.failedRevision),
    queueFailureCode: typeof queue?.failureCode === 'string'
      ? queue.failureCode.slice(0, 80)
      : null,
    deploymentResult: queue?.latestDeploymentResult,
    deploymentResultRevision: safeRevision(queue?.latestDeploymentResultRevision),
    deploymentFailureCode: typeof queue?.latestDeploymentFailureCode === 'string'
      ? queue.latestDeploymentFailureCode.slice(0, 80)
      : null,
    activeRevision,
    deploymentStatus,
    candidateRevision: safeRevision(publication?.contentRevision),
    publicationFailureCode: typeof publication?.failureCode === 'string'
      ? publication.failureCode.slice(0, 80)
      : null
  });
  return {
    targetRevision,
    state: targetState.state,
    requestedRevision,
    hookAcceptedRevision,
    activeRevision,
    queueStatus,
    deploymentStatus,
    failureCode: targetState.failureCode,
    activeDeploymentId
  };
};
