export const planMediaDeploymentTransition = ({
  state,
  action,
  deploymentId,
  snapshotHash,
  contentRevision,
  nowMs
}) => {
  if (!['prepare', 'finalize'].includes(action)) {
    throw new Error('The media deployment action is invalid.');
  }
  const current = state && typeof state === 'object' ? state : {};
  const leaseExpiresAt = current.leaseExpiresAt?.toMillis?.() || 0;
  const sameDeployment = current.deploymentId === deploymentId
    && current.snapshotHash === snapshotHash;
  const latestContentRevision = Number.isSafeInteger(current.latestContentRevision)
    && current.latestContentRevision >= 0
    ? current.latestContentRevision
    : -1;
  const preparedLeaseActive = current.status === 'prepared' && leaseExpiresAt > nowMs;
  const blocksAnotherDeployment = preparedLeaseActive
    || (['preparing', 'finalizing'].includes(current.status) && leaseExpiresAt > nowMs);
  const retryableSameRevision = !sameDeployment
    && current.snapshotHash === snapshotHash
    && current.contentRevision === contentRevision
    && latestContentRevision === contentRevision
    && (
      ['prepare-failed', 'finalize-failed', 'aborted'].includes(current.status)
      || (current.status === 'prepared' && leaseExpiresAt <= nowMs)
      || (
        ['preparing', 'finalizing'].includes(current.status)
        && leaseExpiresAt <= nowMs
      )
    );

  if (current.deploymentId === deploymentId && current.snapshotHash !== snapshotHash) {
    throw new Error('A deployment ID cannot be reused for a different content snapshot.');
  }
  if (!Number.isSafeInteger(contentRevision) || contentRevision < 0) {
    throw new Error('The content revision must be a non-negative safe integer.');
  }
  if (sameDeployment && current.contentRevision !== contentRevision) {
    throw new Error('A deployment ID cannot be reused for a different content revision.');
  }
  if (
    sameDeployment
    && ['preparing', 'finalizing'].includes(current.status)
    && leaseExpiresAt > nowMs
  ) {
    throw new Error(`Media deployment ${deploymentId} still owns the active lease.`);
  }
  if (!sameDeployment && blocksAnotherDeployment && !retryableSameRevision) {
    throw new Error(`Media deployment ${current.deploymentId} still owns the active lease.`);
  }
  if (!sameDeployment && contentRevision <= latestContentRevision && !retryableSameRevision) {
    throw new Error('A stale or duplicate content revision cannot prepare a deployment.');
  }
  if (action === 'finalize' && (
    !sameDeployment
    || !['prepared', 'finalizing', 'finalize-failed'].includes(current.status)
    || (current.status === 'prepared' && leaseExpiresAt <= nowMs)
  )) {
    throw new Error('The requested deployment is not the currently prepared media release.');
  }
  if (action === 'prepare' && sameDeployment && !['preparing', 'prepare-failed'].includes(current.status)) {
    throw new Error('The requested deployment cannot be prepared from its current state.');
  }

  const previousLatestRevision = Number.isSafeInteger(current.latestRevision)
    ? current.latestRevision
    : 0;
  const revision = sameDeployment && Number.isSafeInteger(current.revision)
    ? current.revision
    : previousLatestRevision + 1;
  return {
    status: action === 'prepare' ? 'preparing' : 'finalizing',
    deploymentId,
    snapshotHash,
    contentRevision,
    latestContentRevision: Math.max(contentRevision, latestContentRevision),
    revision,
    latestRevision: Math.max(revision, previousLatestRevision)
  };
};
