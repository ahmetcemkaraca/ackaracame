const MAX_COALESCED_PATHS = 100;

const safeRevision = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;

const mergePaths = (...pathGroups) => ([...new Set(pathGroups.flat())]
  .sort()
  .slice(0, MAX_COALESCED_PATHS));

export const enqueueRebuildOperation = ({
  current,
  request,
  requestId,
  actorUid,
  dispatcherId,
  nowMs,
  leaseMs,
  claimDispatcher = true
}) => {
  const activeDispatcher = current.status === 'dispatching'
    && typeof current.dispatcherId === 'string'
    && current.dispatcherId.length > 0
    && current.leaseExpiresAtMs > nowMs;
  const revision = safeRevision(current.requestedRevision) + 1;
  if (!Number.isSafeInteger(revision)) throw new Error('Rebuild revision overflow.');
  return {
    ownsDispatcher: claimDispatcher && !activeDispatcher,
    revision,
    state: {
      status: activeDispatcher || claimDispatcher ? 'dispatching' : 'queued',
      dispatcherId: activeDispatcher
        ? current.dispatcherId
        : claimDispatcher ? dispatcherId : null,
      requestedRevision: revision,
      latestRequestId: requestId,
      pendingReason: request.reason,
      pendingPaths: mergePaths(current.pendingPaths || [], request.paths),
      pendingRequestedBy: actorUid,
      leaseExpiresAtMs: activeDispatcher
        ? current.leaseExpiresAtMs
        : claimDispatcher ? nowMs + leaseMs : null
    }
  };
};

export const beginRebuildDispatch = ({ current, dispatcherId, nowMs, leaseMs }) => {
  if (
    current.status !== 'dispatching'
    || current.dispatcherId !== dispatcherId
    || current.leaseExpiresAtMs <= nowMs
    || (current.dispatchNotBeforeAtMs || 0) > nowMs
  ) return null;
  const revision = safeRevision(current.requestedRevision);
  if (revision <= safeRevision(current.lastDispatchedRevision)) return null;
  return {
    dispatch: {
      revision,
      requestId: current.latestRequestId,
      reason: current.pendingReason || 'manual',
      paths: [...(current.pendingPaths || [])],
      requestedBy: current.pendingRequestedBy || null
    },
    state: {
      dispatchingRevision: revision,
      pendingReason: null,
      pendingPaths: [],
      pendingRequestedBy: null,
      dispatchNotBeforeAtMs: null,
      leaseExpiresAtMs: nowMs + leaseMs
    }
  };
};

export const claimRebuildDispatcher = ({
  current,
  dispatcherId,
  targetRevision,
  nowMs,
  leaseMs
}) => {
  const lastDispatchedRevision = safeRevision(current.lastDispatchedRevision);
  if (lastDispatchedRevision >= targetRevision) {
    return {
      outcome: 'hook-accepted',
      acceptedRevision: lastDispatchedRevision,
      state: {}
    };
  }
  const activeDispatcher = current.status === 'dispatching'
    && typeof current.dispatcherId === 'string'
    && current.dispatcherId.length > 0
    && current.leaseExpiresAtMs > nowMs;
  if (activeDispatcher && current.dispatcherId !== dispatcherId) {
    return { outcome: 'waiting', state: {} };
  }
  return {
    outcome: 'owned',
    state: {
      status: 'dispatching',
      dispatcherId,
      leaseExpiresAtMs: nowMs + leaseMs
    }
  };
};

export const completeRebuildDispatch = ({
  current,
  dispatcherId,
  dispatchedRevision,
  nowMs,
  leaseMs
}) => {
  if (current.dispatcherId !== dispatcherId) return { ownsDispatcher: false, state: {} };
  const hasTrailingRequest = safeRevision(current.requestedRevision) > dispatchedRevision;
  return {
    ownsDispatcher: hasTrailingRequest,
    state: {
      status: hasTrailingRequest ? 'dispatching' : 'hook-accepted',
      dispatcherId: hasTrailingRequest ? dispatcherId : null,
      dispatchingRevision: null,
      lastDispatchedRevision: Math.max(
        dispatchedRevision,
        safeRevision(current.lastDispatchedRevision)
      ),
      leaseExpiresAtMs: hasTrailingRequest ? nowMs + leaseMs : null
    }
  };
};

export const advanceAcceptedRebuildTuple = ({
  currentRevision,
  dispatchRevision,
  dispatchRequestId
}) => {
  const acceptedRevision = safeRevision(currentRevision);
  if (
    !Number.isSafeInteger(dispatchRevision)
    || dispatchRevision < 0
    || dispatchRevision <= acceptedRevision
  ) return {};
  return {
    lastDispatchedRevision: dispatchRevision,
    lastDispatchedRequestId: dispatchRequestId
  };
};

export const failRebuildDispatch = ({ current, dispatcherId, dispatch, failureCode }) => {
  if (current.dispatcherId !== dispatcherId) return {};
  return {
    status: 'failed',
    dispatcherId: null,
    dispatchingRevision: null,
    pendingReason: current.pendingReason || dispatch.reason,
    pendingPaths: mergePaths(dispatch.paths, current.pendingPaths || []),
    pendingRequestedBy: current.pendingRequestedBy || dispatch.requestedBy,
    leaseExpiresAtMs: null,
    failedRevision: dispatch.revision,
    failureCode
  };
};

export const deriveRebuildTargetState = ({
  targetRevision,
  queueStatus,
  requestedRevision,
  hookAcceptedRevision,
  failedRevision,
  queueFailureCode,
  deploymentResult,
  deploymentResultRevision,
  deploymentFailureCode,
  activeRevision,
  deploymentStatus,
  candidateRevision,
  publicationFailureCode
}) => {
  if (activeRevision >= targetRevision) return { state: 'active', failureCode: null };
  if (
    queueStatus === 'failed'
    && failedRevision >= targetRevision
    && hookAcceptedRevision < targetRevision
  ) {
    return { state: 'hook-failed', failureCode: queueFailureCode || 'unknown' };
  }
  if (deploymentResult === 'failed' && deploymentResultRevision >= targetRevision) {
    return { state: 'deploy-failed', failureCode: deploymentFailureCode || 'unknown' };
  }
  if (
    ['prepare-failed', 'finalize-failed', 'aborted'].includes(deploymentStatus)
    && candidateRevision >= targetRevision
  ) {
    return {
      state: 'deploy-failed',
      failureCode: publicationFailureCode || deploymentStatus
    };
  }
  if (hookAcceptedRevision >= targetRevision) {
    return { state: 'deploying', failureCode: null };
  }
  if (queueStatus === 'dispatching' && requestedRevision >= targetRevision) {
    return { state: 'dispatching', failureCode: null };
  }
  return { state: 'awaiting-hook', failureCode: null };
};
