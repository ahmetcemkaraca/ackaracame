const SAFE_REQUEST_ID = /^[a-zA-Z0-9_-]{8,100}$/u;

const optionalRevision = (value, field) => {
  if (value === undefined || value === null) return 0;
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`The rebuild queue ${field} is invalid.`);
  }
  return value;
};

export const assertAuthorizedRebuildRevision = ({
  contentRevision,
  requestId,
  queue
}) => {
  if (!Number.isSafeInteger(contentRevision) || contentRevision < 0) {
    throw new Error('The content revision must be a non-negative safe integer.');
  }
  const state = queue && typeof queue === 'object' ? queue : {};
  const requestedRevision = optionalRevision(state.requestedRevision, 'requested revision');
  const acceptedRevision = optionalRevision(
    state.lastDispatchedRevision,
    'accepted revision'
  );

  if (contentRevision === 0) {
    if (requestedRevision !== 0 || acceptedRevision !== 0) {
      throw new Error('Bootstrap revision 0 is unavailable after the rebuild queue has started.');
    }
    if (requestId) {
      throw new Error('Bootstrap revision 0 must not carry a rebuild request ID.');
    }
    return;
  }

  if (typeof requestId !== 'string' || !SAFE_REQUEST_ID.test(requestId)) {
    throw new Error('A valid server-issued rebuild request ID is required.');
  }
  if (
    acceptedRevision !== contentRevision
    || state.lastDispatchedRequestId !== requestId
  ) {
    throw new Error('The content revision is not the latest server-accepted rebuild request.');
  }
  if (requestedRevision < contentRevision) {
    throw new Error('The rebuild queue revision is inconsistent.');
  }
};
