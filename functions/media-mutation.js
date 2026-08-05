const leaseExpiryMs = (state) => state?.leaseExpiresAt?.toMillis?.();

export const isActiveMediaMutationLease = ({ state, nowMs }) => {
  if (state?.status !== 'running') return false;
  const expiresAtMs = leaseExpiryMs(state);
  // A malformed running lease is fail-closed instead of being stealable.
  return !Number.isFinite(expiresAtMs) || expiresAtMs > nowMs;
};

export const assertPublisherMutationOwnership = ({
  state,
  mutation,
  action,
  deploymentId,
  snapshotHash,
  revision,
  operationToken,
  nowMs
}) => {
  const expectedStatus = action === 'prepare' ? 'preparing' : 'finalizing';
  const stateLeaseExpiresAt = leaseExpiryMs(state);
  const mutationLeaseExpiresAt = leaseExpiryMs(mutation);
  if (
    state?.status !== expectedStatus
    || state.deploymentId !== deploymentId
    || state.snapshotHash !== snapshotHash
    || state.revision !== revision
    || state.operationToken !== operationToken
    || !Number.isFinite(stateLeaseExpiresAt)
    || stateLeaseExpiresAt <= nowMs
    || mutation?.status !== 'running'
    || mutation.ownerType !== 'media-publisher'
    || mutation.ownerId !== operationToken
    || !Number.isFinite(mutationLeaseExpiresAt)
    || mutationLeaseExpiresAt <= nowMs
  ) {
    throw new Error(`The media ${action} lease was superseded.`);
  }
};
