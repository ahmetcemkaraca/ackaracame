import crypto from 'node:crypto';
import { enqueueRebuildOperation } from './rebuild-queue.js';

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

const eventDigest = (eventId) => crypto.createHash('sha256').update(eventId).digest('hex');

export const contentRebuildRequest = ({ entity, documentId, beforeData, afterData }) => {
  if (entity === 'site-settings') {
    if (documentId !== 'main') return null;
    return { reason: 'settings-updated', paths: ['siteSettings/main'] };
  }
  if (!['project', 'journal'].includes(entity) || !SAFE_SLUG.test(documentId)) return null;
  const beforePublished = beforeData?.status === 'published';
  const afterPublished = afterData?.status === 'published';
  if (!beforePublished && !afterPublished) return null;
  return {
    reason: afterPublished && !beforePublished ? 'content-published' : 'content-updated',
    paths: [`${entity === 'project' ? 'projects' : 'journal'}/${documentId}`]
  };
};

export const rebuildOutboxIdentity = (eventId) => {
  if (typeof eventId !== 'string' || eventId.length < 1 || eventId.length > 2048) {
    throw new Error('The Firestore event ID is invalid.');
  }
  const digest = eventDigest(eventId);
  return {
    documentId: digest,
    requestId: `firestore-${digest}`
  };
};

export const planRebuildOutboxEvent = ({
  currentQueue,
  currentEvent,
  eventId,
  request,
  actorUid,
  dispatcherId,
  nowMs,
  leaseMs,
  debounceMs
}) => {
  const identity = rebuildOutboxIdentity(eventId);
  if (currentEvent) {
    if (
      currentEvent.eventDigest !== identity.documentId
      || currentEvent.requestId !== identity.requestId
      || !Number.isSafeInteger(currentEvent.revision)
      || currentEvent.revision < 1
      || !['enqueued', 'hook-accepted'].includes(currentEvent.status)
      || currentEvent.reason !== request.reason
      || !Array.isArray(currentEvent.paths)
      || currentEvent.paths.length !== request.paths.length
      || currentEvent.paths.some((path, index) => path !== request.paths[index])
    ) {
      throw new Error('The rebuild outbox event is malformed.');
    }
    if (
      !Number.isSafeInteger(currentQueue?.requestedRevision)
      || currentQueue.requestedRevision < currentEvent.revision
    ) throw new Error('The rebuild queue lost an enqueued outbox revision.');
    return {
      created: false,
      ownsDispatcher: false,
      revision: currentEvent.revision,
      requestId: currentEvent.requestId,
      queueState: {}
    };
  }
  if (!Number.isSafeInteger(debounceMs) || debounceMs < 0 || debounceMs > 60_000) {
    throw new Error('The rebuild outbox debounce window is invalid.');
  }
  const queued = enqueueRebuildOperation({
    current: currentQueue || {},
    request,
    requestId: identity.requestId,
    actorUid,
    dispatcherId,
    nowMs,
    leaseMs,
    claimDispatcher: false
  });
  return {
    created: true,
    ownsDispatcher: queued.ownsDispatcher,
    revision: queued.revision,
    requestId: identity.requestId,
    queueState: {
      ...queued.state,
      dispatchNotBeforeAtMs: Math.max(
        Number.isFinite(currentQueue?.dispatchNotBeforeAtMs)
          ? currentQueue.dispatchNotBeforeAtMs
          : 0,
        nowMs + debounceMs
      )
    },
    eventState: {
      schemaVersion: 1,
      eventDigest: identity.documentId,
      requestId: identity.requestId,
      revision: queued.revision,
      status: 'enqueued',
      reason: request.reason,
      paths: request.paths
    }
  };
};
