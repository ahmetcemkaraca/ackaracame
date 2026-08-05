import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onDocumentWrittenWithAuthContext } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { deriveAuditAction, getChangedFields } from './audit.js';
import {
  parsePinnedCanonicalContentArtifact,
  validateCanonicalContentArtifact
} from './canonical-content.js';
import {
  inquiryLimitExceeded,
  inquirySubmissionAvailable
} from './inquiry-rate-limit.js';
import {
  classifyMediaDeploymentMembership,
  extractReferencedMediaFiles
} from './media-publication.js';
import {
  isMediaGcAgeEligible,
  parsePromotedMediaPath,
  shouldDeletePromotedMedia
} from './media-gc.js';
import {
  issueMediaDeletionCapability,
  mediaDeletionJournalId,
  verifyMediaDeletionCapability
} from './media-deletion.js';
import { isActiveMediaMutationLease } from './media-mutation.js';
import { buildRebuildWebhookRequest } from './rebuild-provider.js';
import { projectSiteRebuildStatus } from './rebuild-status.js';
import { validatePromotedObjectMetadata } from './promoted-media.js';
import {
  contentRebuildRequest,
  planRebuildOutboxEvent,
  rebuildOutboxIdentity
} from './rebuild-outbox.js';
import {
  advanceAcceptedRebuildTuple,
  beginRebuildDispatch,
  claimRebuildDispatcher,
  completeRebuildDispatch,
  enqueueRebuildOperation,
  failRebuildDispatch
} from './rebuild-queue.js';
import {
  ValidationError,
  isAllowedAdminAccountEmail,
  projectPublishedPafta,
  stableSerialize,
  validateDeletePromotedMedia,
  validateInquiry,
  validatePaftaLookup,
  validatePromoteMedia,
  validateRebuildRequest,
  validateSeedCommand
} from './validation.js';

initializeApp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'data', 'canonical-content.json');
const db = getFirestore();
const rateLimitSalt = defineSecret('RATE_LIMIT_SALT');
const siteRebuildWebhookUrl = defineSecret('SITE_REBUILD_WEBHOOK_URL');
const siteRebuildWebhookToken = defineSecret('SITE_REBUILD_WEBHOOK_TOKEN');
const storageBucket = defineString('ACKARACA_STORAGE_BUCKET');
const siteRebuildWebhookHost = defineString('SITE_REBUILD_WEBHOOK_HOST', { default: '' });
const siteRebuildProvider = defineString('SITE_REBUILD_PROVIDER', { default: 'generic' });
const configuredAdminEmail = defineString('ACKARACA_ADMIN_EMAIL', { default: '' });

const FUNCTION_REGION = 'europe-west1';
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_RETENTION_MS = 48 * 60 * 60 * 1000;
const MAX_INQUIRIES_PER_IP = 5;
const MAX_INQUIRIES_PER_EMAIL = 3;
const MAX_INQUIRIES_GLOBAL = 200;
const PAFTA_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_PAFTA_LOOKUPS_PER_IP = 30;
const SEED_LEASE_MS = 10 * 60 * 1000;
const SEED_MIGRATION_PATH = 'systemMigrations/content-seed-v2';
const REBUILD_LEASE_MS = 60 * 1000;
const REBUILD_OPERATION_PATH = 'systemOperations/site-rebuild';
const REBUILD_DISPATCH_SIGNAL_PATH = 'systemOperations/rebuild-dispatch-signal';
const MEDIA_PUBLICATION_OPERATION_PATH = 'systemOperations/media-publication';
const MEDIA_GC_OPERATION_PATH = 'systemOperations/media-gc';
const MEDIA_MUTATION_OPERATION_PATH = 'systemOperations/media-mutation';
const REBUILD_WAIT_TIMEOUT_MS = 100 * 1000;
const REBUILD_MAX_DISPATCH_ATTEMPTS = 3;
const AUTOMATIC_REBUILD_DEBOUNCE_MS = 10 * 1000;
const REBUILD_RECORD_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const STAGING_MEDIA_RETENTION_MS = 48 * 60 * 60 * 1000;
const INACTIVE_MEDIA_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_MEDIA_GC_OBJECTS = 2000;
const MEDIA_GC_LEASE_MS = 11 * 60 * 1000;
const MEDIA_DELETE_LEASE_MS = 60 * 1000;
const MEDIA_DELETE_CAPABILITY_LIFETIME_MS = 2 * 60 * 60 * 1000;

const callableCors = [
  /^https:\/\/([a-z0-9-]+\.)?ackaraca\.me$/u,
  /^https:\/\/[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/u,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u
];

const serverTimestamp = () => FieldValue.serverTimestamp();
const ADMIN_MEDIA_MAX_BYTES = 8 * 1024 * 1024;
const ADMIN_MEDIA_TYPES = new Map([
  ['image/jpeg', new Set(['jpg', 'jpeg'])],
  ['image/png', new Set(['png'])],
  ['image/webp', new Set(['webp'])],
  ['image/avif', new Set(['avif'])]
]);

const toHttpsValidationError = (error) => {
  if (error instanceof ValidationError) {
    return new HttpsError('invalid-argument', error.message, { field: error.field });
  }
  return error;
};

const assertVerifiedAdmin = (request) => {
  const token = request.auth?.token;
  const candidateEmail = typeof token?.email === 'string' ? token.email : '';
  if (
    !request.auth?.uid
    || token?.admin !== true
    || token?.email_verified !== true
    || token?.firebase?.sign_in_second_factor !== 'totp'
    || !isAllowedAdminAccountEmail(configuredAdminEmail.value(), candidateEmail)
  ) {
    throw new HttpsError(
      'permission-denied',
      'A verified administrator session authenticated with TOTP is required.'
    );
  }

  return {
    uid: request.auth.uid,
    email: candidateEmail
  };
};

const getRateLimitSalt = () => {
  const value = rateLimitSalt.value();
  if (typeof value !== 'string' || value.length < 32) {
    console.error('RATE_LIMIT_SALT is missing or shorter than 32 characters.');
    throw new HttpsError('failed-precondition', 'Request protection is not configured.');
  }
  return value;
};

const hmac = (salt, value) => (
  crypto.createHmac('sha256', salt).update(String(value)).digest('hex')
);

const getRequestIp = (request) => {
  const rawRequest = request.rawRequest;
  const value = rawRequest?.ip || rawRequest?.socket?.remoteAddress || 'unknown';
  return String(value).slice(0, 128);
};

const getRateLimitState = (snapshot) => {
  if (!snapshot.exists) return { count: 0 };
  const data = snapshot.data();
  return { count: Number.isInteger(data.count) ? data.count : 0 };
};

const getSafeRevision = (value) => (
  Number.isSafeInteger(value) && value >= 0 ? value : 0
);

const toRebuildQueueState = (data) => ({
  ...data,
  leaseExpiresAtMs: data.leaseExpiresAt?.toMillis?.() || 0,
  dispatchNotBeforeAtMs: data.dispatchNotBeforeAt?.toMillis?.() || 0
});

const toFirestoreRebuildQueuePatch = (patch) => {
  const { leaseExpiresAtMs, dispatchNotBeforeAtMs, ...fields } = patch;
  return {
    ...fields,
    ...(leaseExpiresAtMs === undefined
      ? {}
      : {
          leaseExpiresAt: leaseExpiresAtMs === null
            ? null
            : Timestamp.fromMillis(leaseExpiresAtMs)
        }),
    ...(dispatchNotBeforeAtMs === undefined
      ? {}
      : {
          dispatchNotBeforeAt: dispatchNotBeforeAtMs === null
            ? null
            : Timestamp.fromMillis(dispatchNotBeforeAtMs)
        })
  };
};

const waitForRebuildState = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const claimMediaMutationLease = async ({ ownerType, ownerId, leaseMs }) => {
  const leaseRef = db.doc(MEDIA_MUTATION_OPERATION_PATH);
  const nowMs = Date.now();
  const claimed = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leaseRef);
    const current = snapshot.exists ? snapshot.data() : {};
    const active = isActiveMediaMutationLease({ state: current, nowMs });
    if (active && current.ownerId !== ownerId) return false;
    transaction.set(leaseRef, {
      status: 'running',
      ownerType,
      ownerId,
      leaseExpiresAt: Timestamp.fromMillis(nowMs + leaseMs),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  });
  return { claimed, leaseRef };
};

const renewMediaMutationLease = async ({ leaseRef, ownerId, leaseMs }) => {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leaseRef);
    const current = snapshot.exists ? snapshot.data() : {};
    const expiresAtMs = current.leaseExpiresAt?.toMillis?.();
    if (
      current.status !== 'running'
      || current.ownerId !== ownerId
      || !Number.isFinite(expiresAtMs)
      || expiresAtMs <= Date.now()
    ) {
      throw new HttpsError('aborted', 'The media mutation lease expired or was superseded.');
    }
    transaction.set(leaseRef, {
      leaseExpiresAt: Timestamp.fromMillis(Date.now() + leaseMs),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
};

const releaseMediaMutationLease = async ({ leaseRef, ownerId }) => {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(leaseRef);
    if (!snapshot.exists || snapshot.data().ownerId !== ownerId) return;
    transaction.set(leaseRef, {
      status: 'idle',
      ownerType: null,
      ownerId: null,
      leaseExpiresAt: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }).catch(() => undefined);
};

const beginMediaDeletionJournal = async ({
  storagePath,
  generation,
  source,
  actorUid = null
}) => {
  const id = mediaDeletionJournalId({ storagePath, generation });
  const ref = db.collection('mediaDeletionJournal').doc(id);
  await ref.set({
    status: 'deleting',
    storagePath,
    generation,
    source,
    actorUid,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  return ref;
};

const completeMediaDeletionJournal = async ({ ref, deleted }) => {
  await ref.set({
    status: deleted ? 'deleted' : 'not-found',
    deletedAt: deleted ? serverTimestamp() : null,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};

const failMediaDeletionJournal = async ({ ref, error }) => {
  await ref.set({
    status: 'failed',
    failureCode: String(error?.code || error?.name || 'unknown').slice(0, 80),
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true }).catch(() => undefined);
};

const createRateLimitError = (windowStartMs, windowMs = RATE_LIMIT_WINDOW_MS) => {
  const retryAfterSeconds = Math.max(1, Math.ceil(
    (windowStartMs + windowMs - Date.now()) / 1000
  ));
  return new HttpsError(
    'resource-exhausted',
    'Too many requests. Please try again later.',
    { retryAfterSeconds }
  );
};

const consumePaftaLookupRateLimit = async (request) => {
  const salt = getRateLimitSalt();
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / PAFTA_RATE_LIMIT_WINDOW_MS)
    * PAFTA_RATE_LIMIT_WINDOW_MS;
  const ipFingerprint = hmac(salt, getRequestIp(request));
  const limitRef = db.collection('rateLimits').doc(
    `pafta-ip-${windowStartMs}-${ipFingerprint}`
  );

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(limitRef);
    const state = getRateLimitState(snapshot);
    if (state.count >= MAX_PAFTA_LOOKUPS_PER_IP) {
      throw createRateLimitError(windowStartMs, PAFTA_RATE_LIMIT_WINDOW_MS);
    }
    transaction.set(limitRef, {
      count: state.count + 1,
      windowStart: Timestamp.fromMillis(windowStartMs),
      expiresAt: Timestamp.fromMillis(windowStartMs + RATE_LIMIT_RETENTION_MS),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
};

const hasValidImageSignature = (contentType, bytes) => {
  if (contentType === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === 'image/png') {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (contentType === 'image/webp') {
    return bytes.subarray(0, 4).toString('ascii') === 'RIFF'
      && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  if (contentType === 'image/avif') {
    return bytes.subarray(4, 12).toString('ascii').startsWith('ftypavi');
  }
  return false;
};

const hasValidPromotedMediaMetadata = ({ objectMetadata, parsed }) => {
  try {
    validatePromotedObjectMetadata({
      storagePath: `media/${parsed.collection}/${parsed.slug}/${parsed.fileName}`,
      objectMetadata,
      entity: parsed.entity,
      slug: parsed.slug
    });
    return true;
  } catch {
    return false;
  }
};

const createPublicStorageUrl = (bucketName, objectPath) => (
  `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}`
  + `/o/${encodeURIComponent(objectPath)}?alt=media`
);

const getSiteRebuildWebhook = () => {
  const rawUrl = siteRebuildWebhookUrl.value();
  const token = siteRebuildWebhookToken.value();
  const allowedHost = siteRebuildWebhookHost.value().trim().toLowerCase();
  const provider = siteRebuildProvider.value().trim().toLowerCase();
  if (
    typeof rawUrl !== 'string'
    || rawUrl.length < 12
    || !allowedHost
    || !['generic', 'github'].includes(provider)
  ) {
    throw new HttpsError('failed-precondition', 'The site rebuild hook is not configured.');
  }

  let webhookUrl;
  try {
    webhookUrl = new URL(rawUrl);
  } catch {
    throw new HttpsError('failed-precondition', 'The site rebuild hook is invalid.');
  }
  if (
    webhookUrl.protocol !== 'https:'
    || webhookUrl.hostname.toLowerCase() !== allowedHost
    || webhookUrl.username
    || webhookUrl.password
    || webhookUrl.hash
    || (webhookUrl.port && webhookUrl.port !== '443')
  ) {
    throw new HttpsError('failed-precondition', 'The site rebuild hook is not allowlisted.');
  }
  if (
    provider === 'github'
    && (
      webhookUrl.hostname !== 'api.github.com'
      || !/^\/repos\/[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}\/dispatches$/u
        .test(webhookUrl.pathname)
      || webhookUrl.search
      || webhookUrl.hash
    )
  ) {
    throw new HttpsError('failed-precondition', 'The GitHub dispatch URL is invalid.');
  }
  try {
    buildRebuildWebhookRequest({ provider, token, payload: {} });
  } catch {
    throw new HttpsError('failed-precondition', 'The site rebuild hook credential is invalid.');
  }
  return { webhookUrl, provider, token };
};

const writeAuditLog = async ({
  action,
  actor,
  entity,
  documentId,
  changedFields = [],
  metadata = {}
}) => {
  return db.collection('auditLogs').add({
    action,
    actorUid: actor.uid,
    actorEmail: actor.email,
    entity,
    documentId,
    changedFields,
    metadata,
    createdAt: serverTimestamp()
  });
};

const acknowledgeRebuildOutbox = async (acceptedRevision) => {
  while (true) {
    const pending = await db.collection('rebuildOutbox')
      .where('status', '==', 'enqueued')
      .where('revision', '<=', acceptedRevision)
      .orderBy('revision', 'asc')
      .limit(400)
      .get();
    if (pending.empty) return;
    const batch = db.batch();
    for (const snapshot of pending.docs) {
      batch.update(snapshot.ref, {
        status: 'hook-accepted',
        acceptedRevision,
        hookAcceptedAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + REBUILD_RECORD_RETENTION_MS),
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
    if (pending.size < 400) return;
  }
};

const dispatchSiteRebuildQueue = async ({
  targetRevision,
  dispatcherId,
  actor,
  auditSource
}) => {
  const { webhookUrl, provider, token } = getSiteRebuildWebhook();
  const operationRef = db.doc(REBUILD_OPERATION_PATH);
  const deadlineMs = Date.now() + REBUILD_WAIT_TIMEOUT_MS;
  let ownsDispatcher = false;
  let acceptedRevision = 0;
  let dispatchAttempts = 0;

  while (Date.now() < deadlineMs) {
    if (!ownsDispatcher) {
      const claim = await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(operationRef);
        if (!snapshot.exists) return { outcome: 'waiting', state: {} };
        const next = claimRebuildDispatcher({
          current: toRebuildQueueState(snapshot.data()),
          dispatcherId,
          targetRevision,
          nowMs: Date.now(),
          leaseMs: REBUILD_LEASE_MS
        });
        if (next.outcome === 'owned') {
          transaction.set(operationRef, {
            ...toFirestoreRebuildQueuePatch(next.state),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        return next;
      });
      if (claim.outcome === 'hook-accepted') {
        acceptedRevision = claim.acceptedRevision;
        break;
      }
      if (claim.outcome === 'waiting') {
        await waitForRebuildState(400);
        continue;
      }
    }

    const dispatch = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(operationRef);
      if (!snapshot.exists) return null;
      const begun = beginRebuildDispatch({
        current: toRebuildQueueState(snapshot.data()),
        dispatcherId,
        nowMs: Date.now(),
        leaseMs: REBUILD_LEASE_MS
      });
      if (!begun) return null;
      transaction.set(operationRef, {
        ...toFirestoreRebuildQueuePatch(begun.state),
        updatedAt: serverTimestamp()
      }, { merge: true });
      return begun.dispatch;
    });
    if (!dispatch) {
      ownsDispatcher = false;
      await waitForRebuildState(250);
      continue;
    }

    let response;
    try {
      const webhookRequest = buildRebuildWebhookRequest({
        provider,
        token,
        payload: {
          requestId: dispatch.requestId,
          revision: dispatch.revision,
          reason: dispatch.reason,
          paths: dispatch.paths,
          requestedAt: new Date().toISOString()
        }
      });
      response = await fetch(webhookUrl, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
        headers: webhookRequest.headers,
        body: webhookRequest.body
      });
      if (!response.ok) {
        const status = Number(response.status);
        const error = new Error('The site rebuild hook returned a non-success response.');
        error.failureCode = Number.isInteger(status) ? `http-${status}` : 'http-error';
        throw error;
      }
    } catch (error) {
      const failureCode = error?.failureCode
        || (error?.name === 'TimeoutError' ? 'timeout' : 'network-error');
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(operationRef);
        if (!snapshot.exists) return;
        const failed = failRebuildDispatch({
          current: toRebuildQueueState(snapshot.data()),
          dispatcherId,
          dispatch,
          failureCode
        });
        if (Object.keys(failed).length === 0) return;
        transaction.set(operationRef, {
          ...toFirestoreRebuildQueuePatch(failed),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }).catch(() => undefined);
      console.error('Site rebuild hook dispatch failed.', {
        failureCode,
        revision: dispatch.revision
      });
      dispatchAttempts += 1;
      ownsDispatcher = false;
      if (dispatchAttempts >= REBUILD_MAX_DISPATCH_ATTEMPTS) {
        const latest = await operationRef.get().catch(() => null);
        if (latest?.exists) {
          acceptedRevision = getSafeRevision(latest.data().lastDispatchedRevision);
          if (acceptedRevision >= targetRevision) break;
        }
        throw new HttpsError(
          'unavailable',
          'The rebuild hook failed after bounded automatic retries.'
        );
      }
      await waitForRebuildState(400 * (2 ** (dispatchAttempts - 1)));
      continue;
    }

    const completion = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(operationRef);
      if (!snapshot.exists) return { ownsDispatcher: false, state: {} };
      const completed = completeRebuildDispatch({
        current: toRebuildQueueState(snapshot.data()),
        dispatcherId,
        dispatchedRevision: dispatch.revision,
        nowMs: Date.now(),
        leaseMs: REBUILD_LEASE_MS
      });
      const acceptedTuple = advanceAcceptedRebuildTuple({
        currentRevision: snapshot.data().lastDispatchedRevision,
        dispatchRevision: dispatch.revision,
        dispatchRequestId: dispatch.requestId
      });
      transaction.set(operationRef, {
        ...(Object.keys(completed.state).length > 0
          ? toFirestoreRebuildQueuePatch(completed.state)
          : {}),
        ...acceptedTuple,
        failureCode: null,
        lastHookAcceptedAt: serverTimestamp(),
        responseStatus: response.status,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return completed;
    });
    acceptedRevision = Math.max(acceptedRevision, dispatch.revision);
    await writeAuditLog({
      action: 'site-rebuild',
      actor: {
        uid: dispatch.requestedBy || actor.uid,
        email: actor.email || null
      },
      entity: 'site-settings',
      documentId: dispatch.requestId,
      changedFields: [],
      metadata: {
        source: auditSource,
        revision: dispatch.revision,
        reason: dispatch.reason,
        paths: dispatch.paths,
        responseStatus: response.status
      }
    }).catch((error) => {
      console.error('Site rebuild audit could not be written.', { code: error?.code || 'unknown' });
    });
    ownsDispatcher = completion.ownsDispatcher;
    if (!ownsDispatcher && acceptedRevision >= targetRevision) break;
  }

  if (acceptedRevision < targetRevision) {
    throw new HttpsError(
      'deadline-exceeded',
      'The rebuild request was preserved but hook acceptance was not confirmed in time.'
    );
  }
  await acknowledgeRebuildOutbox(acceptedRevision);
  return { acceptedRevision };
};

const authBlockingOptions = {
  region: FUNCTION_REGION,
  // Identity Platform blocking functions have a hard seven-second ceiling.
  timeoutSeconds: 7,
  memory: '256MiB',
  maxInstances: 5
};

const assertSoleOwnerEmail = (event) => {
  const expectedEmail = configuredAdminEmail.value();
  const candidateEmail = event.data?.email;
  if (!isAllowedAdminAccountEmail(expectedEmail, candidateEmail)) {
    if (!expectedEmail?.trim()) {
      console.error('ACKARACA_ADMIN_EMAIL is empty; authentication is fail-closed.');
    }
    throw new HttpsError('permission-denied', 'Account access is restricted.');
  }
};

export const restrictUserCreation = beforeUserCreated(
  authBlockingOptions,
  assertSoleOwnerEmail
);

export const restrictUserSignIn = beforeUserSignedIn(
  authBlockingOptions,
  assertSoleOwnerEmail
);

const loadSeedEntries = () => {
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Canonical content artifact is missing.');
  }
  const artifact = parsePinnedCanonicalContentArtifact(fs.readFileSync(manifestPath));
  return validateCanonicalContentArtifact(artifact);
};

const contentHash = (value) => (
  crypto.createHash('sha256').update(stableSerialize(value)).digest('hex')
);

const enqueueFirestoreRebuildEvent = async ({
  event,
  entity,
  documentId,
  beforeData,
  afterData
}) => {
  const request = contentRebuildRequest({ entity, documentId, beforeData, afterData });
  if (!request) return;
  const eventId = String(event.id || `${entity}:${documentId}:${event.time || 'unknown'}`);
  const identity = rebuildOutboxIdentity(eventId);
  const eventRef = db.collection('rebuildOutbox').doc(identity.documentId);
  const operationRef = db.doc(REBUILD_OPERATION_PATH);
  const signalRef = db.doc(REBUILD_DISPATCH_SIGNAL_PATH);
  const dispatcherId = crypto.randomUUID();
  const actorUid = event.authId || 'firestore-system';
  const nowMs = Date.now();
  const enqueued = await db.runTransaction(async (transaction) => {
    const [operationSnapshot, eventSnapshot] = await Promise.all([
      transaction.get(operationRef),
      transaction.get(eventRef)
    ]);
    const currentQueue = toRebuildQueueState(
      operationSnapshot.exists ? operationSnapshot.data() : {}
    );
    const planned = planRebuildOutboxEvent({
      currentQueue,
      currentEvent: eventSnapshot.exists ? eventSnapshot.data() : null,
      eventId,
      request,
      actorUid,
      dispatcherId,
      nowMs,
      leaseMs: REBUILD_LEASE_MS,
      debounceMs: AUTOMATIC_REBUILD_DEBOUNCE_MS
    });
    if (planned.created) {
      transaction.set(operationRef, {
        ...toFirestoreRebuildQueuePatch(planned.queueState),
        latestRequestedAt: Timestamp.fromMillis(nowMs),
        failureCode: null,
        updatedAt: serverTimestamp()
      }, { merge: true });
      transaction.create(eventRef, {
        ...planned.eventState,
        entity,
        documentId,
        actorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      transaction.set(signalRef, {
        schemaVersion: 1,
        requestedRevision: planned.revision,
        notBeforeAt: Timestamp.fromMillis(nowMs + AUTOMATIC_REBUILD_DEBOUNCE_MS),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else if (
      eventSnapshot.data().status === 'enqueued'
      && getSafeRevision(currentQueue.lastDispatchedRevision) < planned.revision
    ) {
      // A duplicate Firestore delivery can re-kick a lost/failed signal without
      // allocating another queue revision.
      transaction.set(signalRef, {
        schemaVersion: 1,
        requestedRevision: currentQueue.requestedRevision,
        notBeforeAt: Timestamp.fromMillis(nowMs),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    return planned;
  });

  return enqueued;
};

const createFirestoreAuditHandler = (entity, { automaticRebuild = false } = {}) => async (event) => {
  const beforeSnapshot = event.data?.before;
  const afterSnapshot = event.data?.after;
  const beforeData = beforeSnapshot?.exists ? beforeSnapshot.data() : null;
  const afterData = afterSnapshot?.exists ? afterSnapshot.data() : null;
  if (!beforeData && !afterData) return;

  const documentId = String(event.params.documentId);
  const changedFields = getChangedFields(beforeData, afterData);
  const eventId = String(event.id || `${entity}:${documentId}:${event.time || 'unknown'}`);
  const auditId = `firestore-${contentHash(eventId)}`;
  const eventTime = new Date(event.time);
  const createdAt = Number.isNaN(eventTime.getTime())
    ? serverTimestamp()
    : Timestamp.fromDate(eventTime);

  await db.collection('auditLogs').doc(auditId).set({
    action: deriveAuditAction({ beforeData, afterData, entity }),
    actorUid: event.authId || null,
    actorEmail: null,
    actorType: event.authType || 'unknown',
    entity,
    documentId,
    changedFields,
    metadata: {
      source: 'firestore-auth-context',
      eventId
    },
    createdAt
  });
  if (automaticRebuild) {
    await enqueueFirestoreRebuildEvent({
      event,
      entity,
      documentId,
      beforeData,
      afterData
    });
  }
};

const firestoreAuditOptions = (collectionName, { automaticRebuild = false } = {}) => ({
  document: `${collectionName}/{documentId}`,
  region: FUNCTION_REGION,
  retry: true,
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: automaticRebuild ? 20 : 10
});

export const auditProjectWrites = onDocumentWrittenWithAuthContext(
  firestoreAuditOptions('projects', { automaticRebuild: true }),
  createFirestoreAuditHandler('project', { automaticRebuild: true })
);

export const auditJournalWrites = onDocumentWrittenWithAuthContext(
  firestoreAuditOptions('journal', { automaticRebuild: true }),
  createFirestoreAuditHandler('journal', { automaticRebuild: true })
);

export const auditSiteSettingsWrites = onDocumentWrittenWithAuthContext(
  firestoreAuditOptions('siteSettings', { automaticRebuild: true }),
  createFirestoreAuditHandler('site-settings', { automaticRebuild: true })
);

export const auditInquiryWrites = onDocumentWrittenWithAuthContext(
  firestoreAuditOptions('inquiries'),
  createFirestoreAuditHandler('inquiry')
);

export const dispatchAutomaticRebuilds = onDocumentWrittenWithAuthContext({
  document: REBUILD_DISPATCH_SIGNAL_PATH,
  region: FUNCTION_REGION,
  retry: true,
  timeoutSeconds: 300,
  memory: '256MiB',
  maxInstances: 1,
  concurrency: 1,
  secrets: [siteRebuildWebhookUrl, siteRebuildWebhookToken]
}, async (event) => {
  if (!event.data?.after?.exists) return;
  const signalRef = db.doc(REBUILD_DISPATCH_SIGNAL_PATH);
  const debounceDeadlineMs = Date.now() + 180 * 1000;
  let targetRevision = 0;
  while (Date.now() < debounceDeadlineMs) {
    const snapshot = await signalRef.get();
    if (!snapshot.exists) return;
    const state = snapshot.data();
    const requestedRevision = state.requestedRevision;
    const notBeforeAtMs = state.notBeforeAt?.toMillis?.();
    if (
      !Number.isSafeInteger(requestedRevision)
      || requestedRevision < 1
      || !Number.isFinite(notBeforeAtMs)
    ) throw new Error('The automatic rebuild dispatch signal is malformed.');
    targetRevision = Math.max(targetRevision, requestedRevision);
    const remainingDebounceMs = notBeforeAtMs - Date.now();
    if (remainingDebounceMs > 0) {
      await waitForRebuildState(Math.min(1000, remainingDebounceMs));
      continue;
    }
    await dispatchSiteRebuildQueue({
      targetRevision,
      dispatcherId: crypto.randomUUID(),
      actor: { uid: 'firestore-system', email: null },
      auditSource: 'firestore-rebuild-outbox'
    });
    return;
  }
  throw new Error('The automatic rebuild debounce window did not become quiet.');
});

export const auditAdminMediaUploads = onObjectFinalized({
  bucket: storageBucket,
  region: FUNCTION_REGION,
  retry: true,
  memory: '256MiB',
  maxInstances: 10
}, async (event) => {
  const object = event.data;
  if (!object?.name?.startsWith('admin-media/')) return;

  const eventId = String(event.id || `${object.name}:${object.generation}`);
  const eventTime = new Date(event.time);
  const createdAt = Number.isNaN(eventTime.getTime())
    ? serverTimestamp()
    : Timestamp.fromDate(eventTime);

  await db.collection('auditLogs').doc(`storage-${contentHash(eventId)}`).set({
    action: 'media-upload',
    actorUid: object.metadata?.uploadedBy || null,
    actorEmail: null,
    actorType: 'storage-metadata',
    entity: 'media',
    documentId: object.name,
    changedFields: ['contentType', 'size'],
    metadata: {
      source: 'storage-finalized',
      eventId,
      generation: String(object.generation),
      contentType: object.contentType || null,
      size: Number(object.size) || 0
    },
    createdAt
  });
});

const claimSeedLease = async ({ manifestHash, actor }) => {
  const migrationRef = db.doc(SEED_MIGRATION_PATH);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(migrationRef);
    const current = snapshot.exists ? snapshot.data() : {};
    const startedAtMs = current.startedAt?.toMillis?.() || 0;

    if (current.status === 'running' && Date.now() - startedAtMs < SEED_LEASE_MS) {
      throw new HttpsError('aborted', 'A content seed operation is already running.');
    }

    transaction.set(migrationRef, {
      status: 'running',
      manifestHash,
      startedAt: serverTimestamp(),
      startedBy: actor.uid,
      completedAt: null,
      failureCode: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  return migrationRef;
};

const writeSeedEntries = async ({ entries }) => {
  const refs = entries.map((entry) => db.doc(entry.path));
  const snapshots = refs.length > 0 ? await db.getAll(...refs) : [];
  const snapshotByPath = new Map(snapshots.map((snapshot) => [snapshot.ref.path, snapshot]));
  const batches = [];
  const createdIds = [];
  const skippedIds = [];

  for (let offset = 0; offset < entries.length; offset += 400) {
    const batch = db.batch();
    const chunk = entries.slice(offset, offset + 400);
    let writesInBatch = 0;

    for (const entry of chunk) {
      const ref = db.doc(entry.path);
      const existing = snapshotByPath.get(ref.path);
      if (existing?.exists) {
        skippedIds.push(entry.path);
        continue;
      }
      batch.create(ref, {
        ...entry.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      createdIds.push(entry.path);
      writesInBatch += 1;
    }

    if (writesInBatch > 0) batches.push(batch.commit());
  }

  await Promise.all(batches);
  return { createdIds, skippedIds };
};

export const submitInquiry = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  secrets: [rateLimitSalt],
  region: FUNCTION_REGION,
  timeoutSeconds: 15,
  memory: '256MiB',
  maxInstances: 20
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  let inquiry;
  try {
    inquiry = validateInquiry(request.data || {});
  } catch (error) {
    throw toHttpsValidationError(error);
  }

  const salt = getRateLimitSalt();
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS;
  const bucket = String(windowStartMs);
  const ipFingerprint = hmac(salt, getRequestIp(request));
  const emailFingerprint = hmac(salt, inquiry.email);
  const ipLimitRef = db.collection('rateLimits').doc(`inquiry-ip-${bucket}-${ipFingerprint}`);
  const emailLimitRef = db.collection('rateLimits').doc(`inquiry-email-${bucket}-${emailFingerprint}`);
  const globalLimitRef = db.collection('rateLimits').doc(`inquiry-global-${bucket}`);
  const inquiryRef = db.collection('inquiries').doc();
  const settingsRef = db.doc('siteSettings/main');
  const expiresAt = Timestamp.fromMillis(windowStartMs + RATE_LIMIT_RETENTION_MS);

  try {
    await db.runTransaction(async (transaction) => {
      const [settingsSnapshot, ipSnapshot, emailSnapshot, globalSnapshot] = await Promise.all([
        transaction.get(settingsRef),
        transaction.get(ipLimitRef),
        transaction.get(emailLimitRef),
        transaction.get(globalLimitRef)
      ]);
      if (!inquirySubmissionAvailable(
        settingsSnapshot.exists ? settingsSnapshot.data() : null
      )) {
        throw new HttpsError(
          'failed-precondition',
          'New inquiries are currently unavailable.'
        );
      }
      const ipState = getRateLimitState(ipSnapshot);
      const emailState = getRateLimitState(emailSnapshot);
      const globalState = getRateLimitState(globalSnapshot);

      if (inquiryLimitExceeded({
        ipCount: ipState.count,
        emailCount: emailState.count,
        globalCount: globalState.count,
        maximumPerIp: MAX_INQUIRIES_PER_IP,
        maximumPerEmail: MAX_INQUIRIES_PER_EMAIL,
        maximumGlobal: MAX_INQUIRIES_GLOBAL
      })) {
        throw createRateLimitError(windowStartMs);
      }

      const counterData = {
        windowStart: Timestamp.fromMillis(windowStartMs),
        expiresAt,
        updatedAt: serverTimestamp()
      };
      transaction.set(ipLimitRef, { ...counterData, count: ipState.count + 1 }, { merge: true });
      transaction.set(emailLimitRef, { ...counterData, count: emailState.count + 1 }, { merge: true });
      transaction.set(globalLimitRef, { ...counterData, count: globalState.count + 1 }, { merge: true });
      transaction.create(inquiryRef, {
        ...inquiry,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('Inquiry transaction failed.', { code: error?.code || 'unknown' });
    throw new HttpsError('internal', 'Inquiry could not be submitted.');
  }

  return { ok: true, id: inquiryRef.id };
});

export const getPublishedPafta = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  secrets: [rateLimitSalt],
  region: FUNCTION_REGION,
  timeoutSeconds: 15,
  memory: '256MiB',
  maxInstances: 20
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  let lookup;
  try {
    lookup = validatePaftaLookup(request.data || {});
  } catch (error) {
    throw toHttpsValidationError(error);
  }

  try {
    await consumePaftaLookupRateLimit(request);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('Pafta lookup rate limit failed.', { code: error?.code || 'unknown' });
    throw new HttpsError('internal', 'The pafta lookup could not be completed.');
  }

  let snapshot;
  try {
    snapshot = await db.collection('paftas')
      .where('status', '==', 'published')
      .where('qrCodeData', '==', lookup.code)
      .limit(1)
      .get();
  } catch (error) {
    console.error('Published pafta query failed.', { code: error?.code || 'unknown' });
    throw new HttpsError('internal', 'The pafta lookup could not be completed.');
  }

  if (snapshot.empty) return { ok: true, pafta: null };
  const pafta = projectPublishedPafta(snapshot.docs[0].data());
  return { ok: true, pafta };
});

export const promoteMedia = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  region: FUNCTION_REGION,
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 5
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  const actor = assertVerifiedAdmin(request);
  let promotion;
  try {
    promotion = validatePromoteMedia(request.data || {});
  } catch (error) {
    throw toHttpsValidationError(error);
  }
  if (promotion.ownerUid !== actor.uid) {
    throw new HttpsError('permission-denied', 'The staging object belongs to another user.');
  }

  const bucketName = storageBucket.value();
  if (typeof bucketName !== 'string' || bucketName.length < 3) {
    throw new HttpsError('failed-precondition', 'The media bucket is not configured.');
  }
  const destinationCollection = promotion.entity === 'project' ? 'projects' : 'journal';
  const destinationPath = `media/${destinationCollection}/${promotion.slug}/${promotion.fileName}`;
  const bucket = getStorage().bucket(bucketName);
  const sourceFile = bucket.file(promotion.stagingPath);
  const destinationFile = bucket.file(destinationPath);

  const getExistingDestination = async () => {
    try {
      const [metadata] = await destinationFile.getMetadata();
      try {
        validatePromotedObjectMetadata({
          storagePath: destinationPath,
          objectMetadata: metadata,
          entity: promotion.entity,
          slug: promotion.slug,
          expectedUploadedBy: actor.uid,
          expectedStagingPath: promotion.stagingPath
        });
      } catch {
        throw new HttpsError(
          'failed-precondition',
          'The existing promoted object metadata does not match this promotion.'
        );
      }
      return metadata;
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      if (Number(error?.code) === 404) return null;
      throw error;
    }
  };

  let destinationMetadata = await getExistingDestination();
  let promotedNow = false;
  let deletionCapability = null;
  if (!destinationMetadata) {
    let sourceMetadata;
    try {
      [sourceMetadata] = await sourceFile.getMetadata();
    } catch (error) {
      if (Number(error?.code) === 404) {
        throw new HttpsError('not-found', 'The staging media object no longer exists.');
      }
      console.error('Staging metadata could not be read.', { code: error?.code || 'unknown' });
      throw new HttpsError('internal', 'The staging media object could not be inspected.');
    }

    const contentType = sourceMetadata.contentType;
    const size = Number(sourceMetadata.size);
    const allowedExtensions = ADMIN_MEDIA_TYPES.get(contentType);
    if (
      sourceMetadata.metadata?.uploadedBy !== actor.uid
      || !allowedExtensions?.has(promotion.extension)
      || !Number.isSafeInteger(size)
      || size <= 0
      || size > ADMIN_MEDIA_MAX_BYTES
    ) {
      throw new HttpsError('failed-precondition', 'The staging media metadata is invalid.');
    }

    const immutableSourceFile = bucket.file(promotion.stagingPath, {
      generation: sourceMetadata.generation
    });
    let signatureBytes;
    try {
      [signatureBytes] = await immutableSourceFile.download({ start: 0, end: 15 });
    } catch (error) {
      console.error('Staging signature could not be read.', { code: error?.code || 'unknown' });
      throw new HttpsError('internal', 'The staging media signature could not be inspected.');
    }
    if (!hasValidImageSignature(contentType, signatureBytes)) {
      throw new HttpsError('failed-precondition', 'The staging media signature is invalid.');
    }

    const issuedDeletionCapability = issueMediaDeletionCapability({
      nowMs: Date.now(),
      lifetimeMs: MEDIA_DELETE_CAPABILITY_LIFETIME_MS
    });
    try {
      await immutableSourceFile.copy(destinationFile, {
        cacheControl: 'public,max-age=31536000,immutable',
        contentDisposition: 'inline',
        contentType,
        metadata: {
          uploadedBy: actor.uid,
          stagingPath: promotion.stagingPath,
          sourceGeneration: String(sourceMetadata.generation),
          entity: promotion.entity,
          slug: promotion.slug,
          deletionCapabilityHash: issuedDeletionCapability.hash,
          deletionCapabilityExpiresAtMs: String(issuedDeletionCapability.expiresAtMs)
        },
        preconditionOpts: { ifGenerationMatch: 0 }
      });
      promotedNow = true;
      deletionCapability = issuedDeletionCapability.value;
      [destinationMetadata] = await destinationFile.getMetadata();
    } catch (error) {
      if (Number(error?.code) === 412) {
        destinationMetadata = await getExistingDestination();
      } else {
        console.error('Media promotion copy failed.', { code: error?.code || 'unknown' });
        throw new HttpsError('internal', 'The media object could not be promoted.');
      }
    }

    await immutableSourceFile.delete({
      ifGenerationMatch: sourceMetadata.generation,
      ignoreNotFound: true
    }).catch((error) => {
      console.warn('Promoted staging object could not be removed.', { code: error?.code || 'unknown' });
    });
  }

  if (!destinationMetadata) {
    throw new HttpsError('internal', 'The promoted media metadata is unavailable.');
  }
  const contentType = destinationMetadata.contentType;
  const size = Number(destinationMetadata.size);
  const publicUrl = createPublicStorageUrl(bucketName, destinationPath);
  await writeAuditLog({
    action: 'media-promote',
    actor,
    entity: 'media',
    documentId: destinationPath,
    changedFields: ['contentType', 'size'],
    metadata: {
      source: 'server-media-promotion',
      stagingPath: promotion.stagingPath,
      promotedNow,
      contentType,
      size
    }
  }).catch((error) => {
    console.error('Media promotion audit could not be written.', { code: error?.code || 'unknown' });
  });

  return {
    ok: true,
    url: publicUrl,
    storagePath: destinationPath,
    contentType,
    size,
    promotedNow,
    deletionCapability
  };
});

const assertMediaCanBePhysicallyDeleted = async ({ deletion, bucketName }) => {
  const contentCollection = deletion.entity === 'project' ? 'projects' : 'journal';
  const [content, publication] = await db.getAll(
    db.collection(contentCollection).doc(deletion.slug),
    db.collection('mediaPublications').doc(`${deletion.entity}--${deletion.slug}`)
  );
  const membership = classifyMediaDeploymentMembership({
    manifest: publication.exists ? publication.data() : null,
    entity: deletion.entity,
    slug: deletion.slug,
    fileName: deletion.fileName
  });
  if (membership === 'invalid') {
    throw new HttpsError(
      'failed-precondition',
      'The active media deployment manifest is invalid; deletion is fail-closed.'
    );
  }
  if (membership === 'active') {
    throw new HttpsError(
      'failed-precondition',
      'Media used by the active site must be retired after a successful deployment.'
    );
  }
  const references = content.exists
    ? extractReferencedMediaFiles({
        data: content.data(),
        bucketName,
        entity: deletion.entity,
        slug: deletion.slug
      })
    : { complete: true, files: [] };
  if (!references.complete) {
    throw new HttpsError(
      'failed-precondition',
      'The content media reference set is invalid; deletion is fail-closed.'
    );
  }
  if (references.files.includes(deletion.fileName)) {
    throw new HttpsError(
      'failed-precondition',
      'Media referenced by saved content cannot be physically deleted.'
    );
  }
};

export const deletePromotedMedia = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  region: FUNCTION_REGION,
  timeoutSeconds: 30,
  memory: '256MiB',
  maxInstances: 5
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  const actor = assertVerifiedAdmin(request);
  let deletion;
  try {
    deletion = validateDeletePromotedMedia(request.data || {});
  } catch (error) {
    throw toHttpsValidationError(error);
  }

  const bucketName = storageBucket.value();
  if (typeof bucketName !== 'string' || bucketName.length < 3) {
    throw new HttpsError('failed-precondition', 'The media bucket is not configured.');
  }
  const mutationOwnerId = `callable-delete:${crypto.randomUUID()}`;
  const mutationLease = await claimMediaMutationLease({
    ownerType: 'callable-delete',
    ownerId: mutationOwnerId,
    leaseMs: MEDIA_DELETE_LEASE_MS
  });
  if (!mutationLease.claimed) {
    throw new HttpsError('aborted', 'Another media mutation is in progress; retry safely.');
  }
  try {
  await assertMediaCanBePhysicallyDeleted({ deletion, bucketName });
  const objectFile = getStorage().bucket(bucketName).file(deletion.storagePath);
  let objectMetadata;
  try {
    [objectMetadata] = await objectFile.getMetadata();
  } catch (error) {
    if (Number(error?.code) !== 404) {
      console.error('Promoted media metadata could not be read.', {
        code: error?.code || 'unknown'
      });
      throw new HttpsError('internal', 'The promoted media object could not be inspected.');
    }
  }

  let deleted = false;
  let generation = null;
  let sourcePromotion = null;
  if (objectMetadata) {
    const customMetadata = objectMetadata.metadata || {};
    try {
      sourcePromotion = validatePromoteMedia({
        stagingPath: customMetadata.stagingPath,
        entity: deletion.entity,
        slug: deletion.slug
      });
    } catch {
      throw new HttpsError('failed-precondition', 'The promoted media ownership metadata is invalid.');
    }
    generation = String(objectMetadata.generation || '');
    const size = Number(objectMetadata.size);
    const allowedExtensions = ADMIN_MEDIA_TYPES.get(objectMetadata.contentType);
    const capabilityExpiresAtMs = Number(customMetadata.deletionCapabilityExpiresAtMs);
    if (
      customMetadata.uploadedBy !== actor.uid
      || customMetadata.entity !== deletion.entity
      || customMetadata.slug !== deletion.slug
      || sourcePromotion.ownerUid !== actor.uid
      || sourcePromotion.fileName !== deletion.fileName
      || !allowedExtensions?.has(deletion.extension)
      || !/^[1-9][0-9]*$/u.test(generation)
      || !/^[1-9][0-9]*$/u.test(String(customMetadata.sourceGeneration || ''))
      || !Number.isSafeInteger(size)
      || size <= 0
      || size > ADMIN_MEDIA_MAX_BYTES
      || !verifyMediaDeletionCapability({
        value: deletion.deletionCapability,
        expectedHash: customMetadata.deletionCapabilityHash,
        expiresAtMs: capabilityExpiresAtMs,
        nowMs: Date.now()
      })
    ) {
      throw new HttpsError(
        'failed-precondition',
        'The promoted media ownership or deletion capability is invalid.'
      );
    }

    await renewMediaMutationLease({
      leaseRef: mutationLease.leaseRef,
      ownerId: mutationOwnerId,
      leaseMs: MEDIA_DELETE_LEASE_MS
    });
    // Project/journal writes are rules-fenced while this lease is active.
    await assertMediaCanBePhysicallyDeleted({ deletion, bucketName });
    const journalRef = await beginMediaDeletionJournal({
      storagePath: deletion.storagePath,
      generation,
      source: 'callable-session-cleanup',
      actorUid: actor.uid
    });
    await renewMediaMutationLease({
      leaseRef: mutationLease.leaseRef,
      ownerId: mutationOwnerId,
      leaseMs: MEDIA_DELETE_LEASE_MS
    }).catch(async (error) => {
      await failMediaDeletionJournal({ ref: journalRef, error });
      throw error;
    });
    try {
      await objectFile.delete({ ifGenerationMatch: generation });
      deleted = true;
    } catch (error) {
      if (Number(error?.code) === 404) {
        deleted = false;
      } else if (Number(error?.code) === 412) {
        await failMediaDeletionJournal({ ref: journalRef, error });
        throw new HttpsError('aborted', 'The media object changed; reload before deleting it.');
      } else {
        await failMediaDeletionJournal({ ref: journalRef, error });
        console.error('Promoted media deletion failed.', { code: error?.code || 'unknown' });
        throw new HttpsError('internal', 'The promoted media object could not be deleted.');
      }
    }
    await completeMediaDeletionJournal({ ref: journalRef, deleted });
  }

  await writeAuditLog({
    action: 'media-delete',
    actor,
    entity: 'media',
    documentId: deletion.storagePath,
    changedFields: [],
    metadata: {
      source: 'server-media-deletion',
      deleted,
      entity: deletion.entity,
      slug: deletion.slug,
      generation,
      stagingPath: sourcePromotion?.stagingPath || null
    }
  }).catch((error) => {
    console.error('Media deletion audit could not be written.', { code: error?.code || 'unknown' });
  });

  return { ok: true, deleted };
  } finally {
    await releaseMediaMutationLease({
      leaseRef: mutationLease.leaseRef,
      ownerId: mutationOwnerId
    });
  }
});

export const collectOrphanedMedia = onSchedule({
  schedule: '17 3 * * *',
  timeZone: 'Europe/Berlin',
  region: FUNCTION_REGION,
  timeoutSeconds: 540,
  memory: '512MiB',
  maxInstances: 1,
  retryCount: 0
}, async () => {
  const bucketName = storageBucket.value();
  if (typeof bucketName !== 'string' || bucketName.length < 3) {
    throw new Error('The media bucket is not configured.');
  }
  const runId = crypto.randomUUID();
  const nowMs = Date.now();
  const gcRef = db.doc(MEDIA_GC_OPERATION_PATH);
  const claimed = await db.runTransaction(async (transaction) => {
    const gcSnapshot = await transaction.get(gcRef);
    const gcState = gcSnapshot.exists ? gcSnapshot.data() : {};
    const gcLeaseExpiresAt = gcState.leaseExpiresAt?.toMillis?.() || 0;
    if (gcState.status === 'running' && gcLeaseExpiresAt > nowMs) {
      return { ownsLease: false, cursors: {} };
    }
    const storedCursors = gcState.cursors && typeof gcState.cursors === 'object'
      ? gcState.cursors
      : {};
    const cursors = Object.fromEntries(['staging', 'projects', 'journal'].map((key) => {
      const value = storedCursors[key];
      return [key, typeof value === 'string' && value.length <= 1024 ? value : null];
    }));
    transaction.set(gcRef, {
      status: 'running',
      runId,
      startedAt: serverTimestamp(),
      leaseExpiresAt: Timestamp.fromMillis(nowMs + MEDIA_GC_LEASE_MS),
      failureCode: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { ownsLease: true, cursors };
  });
  if (!claimed.ownsLease) return;

  const bucket = getStorage().bucket(bucketName);
  const stats = {
    scanned: 0,
    stagingDeleted: 0,
    promotedDeleted: 0,
    preserved: 0,
    errors: 0
  };
  const nextCursors = { ...claimed.cursors };
  const checkpointProgress = async () => {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(gcRef);
      if (
        !snapshot.exists
        || snapshot.data().status !== 'running'
        || snapshot.data().runId !== runId
      ) {
        const error = new Error('The media GC run lease was superseded.');
        error.code = 'gc-lease-superseded';
        throw error;
      }
      transaction.set(gcRef, {
        stats,
        cursors: nextCursors,
        leaseExpiresAt: Timestamp.fromMillis(Date.now() + MEDIA_GC_LEASE_MS),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  };
  const deleteGeneration = async ({ file, generation, source, beforeDelete }) => {
    const normalizedGeneration = String(generation || '');
    const journalRef = await beginMediaDeletionJournal({
      storagePath: file.name,
      generation: normalizedGeneration,
      source
    });
    try {
      if (beforeDelete) await beforeDelete();
      await file.delete({ ifGenerationMatch: normalizedGeneration });
      await completeMediaDeletionJournal({ ref: journalRef, deleted: true });
      return true;
    } catch (error) {
      if (Number(error?.code) === 404) {
        await completeMediaDeletionJournal({ ref: journalRef, deleted: false });
        return false;
      }
      await failMediaDeletionJournal({ ref: journalRef, error });
      if (Number(error?.code) === 412) return false;
      throw error;
    }
  };
  const visitPrefix = async (cursorKey, prefix, visitor) => {
    let pageToken;
    let prefixScanned = 0;
    const prefixLimit = Math.floor(MAX_MEDIA_GC_OBJECTS / 3);
    const storedStartOffset = claimed.cursors[cursorKey];
    const startOffset = typeof storedStartOffset === 'string'
      && storedStartOffset.startsWith(prefix)
      ? storedStartOffset
      : null;
    let lastScannedName = null;
    let reachedEnd = false;
    while (prefixScanned < prefixLimit) {
      const [files, nextQuery] = await bucket.getFiles({
        prefix,
        autoPaginate: false,
        maxResults: Math.min(250, prefixLimit - prefixScanned),
        ...(!pageToken && startOffset ? { startOffset } : {}),
        ...(pageToken ? { pageToken } : {})
      });
      for (const file of files) {
        if (prefixScanned >= prefixLimit) break;
        if (!pageToken && startOffset && file.name === startOffset) continue;
        prefixScanned += 1;
        stats.scanned += 1;
        lastScannedName = file.name;
        try {
          await visitor(file);
        } catch (error) {
          stats.errors += 1;
          console.error('Media GC preserved an object after an inspection error.', {
            path: file.name,
            code: error?.code || error?.name || 'unknown'
          });
        }
        nextCursors[cursorKey] = lastScannedName;
        if (prefixScanned % 25 === 0) await checkpointProgress();
      }
      pageToken = nextQuery?.pageToken;
      if (!pageToken || files.length === 0) {
        reachedEnd = true;
        break;
      }
      await checkpointProgress();
    }
    nextCursors[cursorKey] = reachedEnd ? null : lastScannedName || startOffset || null;
    await checkpointProgress();
  };

  try {
    await visitPrefix('staging', 'admin-media/', async (file) => {
      const [metadata] = await file.getMetadata();
      const ageEligible = isMediaGcAgeEligible({
        timeCreated: metadata.timeCreated,
        nowMs,
        retentionMs: STAGING_MEDIA_RETENTION_MS
      });
      if (!ageEligible || !/^[1-9][0-9]*$/u.test(String(metadata.generation || ''))) {
        stats.preserved += 1;
        return;
      }
      if (await deleteGeneration({
        file,
        generation: metadata.generation,
        source: 'scheduled-staging-gc'
      })) stats.stagingDeleted += 1;
    });

    for (const [cursorKey, prefix] of [
      ['projects', 'media/projects/'],
      ['journal', 'media/journal/']
    ]) {
      await visitPrefix(cursorKey, prefix, async (file) => {
        const parsed = parsePromotedMediaPath(file.name);
        if (!parsed) {
          stats.preserved += 1;
          return;
        }
        const [metadata] = await file.getMetadata();
        const ageEligible = isMediaGcAgeEligible({
          timeCreated: metadata.timeCreated,
          nowMs,
          retentionMs: INACTIVE_MEDIA_RETENTION_MS
        });
        const metadataValid = hasValidPromotedMediaMetadata({
          objectMetadata: metadata,
          parsed
        });
        if (!ageEligible || !metadataValid) {
          stats.preserved += 1;
          return;
        }

        const inspectCurrentReferences = async () => {
          const contentRef = db.collection(parsed.collection).doc(parsed.slug);
          const publicationRef = db.collection('mediaPublications')
            .doc(`${parsed.entity}--${parsed.slug}`);
          const [contentSnapshot, publicationSnapshot] = await db.getAll(
            contentRef,
            publicationRef
          );
          const deploymentMembership = classifyMediaDeploymentMembership({
            manifest: publicationSnapshot.exists ? publicationSnapshot.data() : null,
            entity: parsed.entity,
            slug: parsed.slug,
            fileName: parsed.fileName
          });
          const references = contentSnapshot.exists
            ? extractReferencedMediaFiles({
                data: contentSnapshot.data(),
                bucketName,
                entity: parsed.entity,
                slug: parsed.slug
              })
            : { complete: true, files: [] };
          return shouldDeletePromotedMedia({
            ageEligible,
            metadataValid,
            deploymentMembership,
            referenceScanComplete: references.complete,
            referenced: references.files.includes(parsed.fileName)
          });
        };
        if (!await inspectCurrentReferences()) {
          stats.preserved += 1;
          return;
        }
        const mutationOwnerId = `scheduled-gc:${runId}:${crypto.randomUUID()}`;
        const mutationLease = await claimMediaMutationLease({
          ownerType: 'scheduled-gc',
          ownerId: mutationOwnerId,
          leaseMs: MEDIA_DELETE_LEASE_MS
        });
        if (!mutationLease.claimed) {
          stats.preserved += 1;
          return;
        }
        try {
          await renewMediaMutationLease({
            leaseRef: mutationLease.leaseRef,
            ownerId: mutationOwnerId,
            leaseMs: MEDIA_DELETE_LEASE_MS
          });
          // Admin content writes and publisher manifest mutations are fenced by
          // the same lease while this final reference scan and delete execute.
          if (!await inspectCurrentReferences()) {
            stats.preserved += 1;
            return;
          }
          if (await deleteGeneration({
            file,
            generation: metadata.generation,
            source: 'scheduled-promoted-gc',
            beforeDelete: () => renewMediaMutationLease({
              leaseRef: mutationLease.leaseRef,
              ownerId: mutationOwnerId,
              leaseMs: MEDIA_DELETE_LEASE_MS
            })
          })) stats.promotedDeleted += 1;
        } finally {
          await releaseMediaMutationLease({
            leaseRef: mutationLease.leaseRef,
            ownerId: mutationOwnerId
          });
        }
      });
    }

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(gcRef);
      if (!snapshot.exists || snapshot.data().runId !== runId) return;
      transaction.set(gcRef, {
        status: 'complete',
        completedAt: serverTimestamp(),
        leaseExpiresAt: null,
        stats,
        cursors: nextCursors,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    await db.collection('auditLogs').add({
      action: 'media-gc',
      actorUid: null,
      actorEmail: null,
      actorType: 'scheduler',
      entity: 'media',
      documentId: runId,
      changedFields: [],
      metadata: { source: 'scheduled-media-gc', ...stats },
      createdAt: serverTimestamp()
    });
  } catch (error) {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(gcRef);
      if (!snapshot.exists || snapshot.data().runId !== runId) return;
      transaction.set(gcRef, {
        status: 'failed',
        leaseExpiresAt: null,
        failureCode: String(error?.code || error?.name || 'unknown').slice(0, 80),
        stats,
        cursors: nextCursors,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }).catch(() => undefined);
    throw error;
  }
});

export const requestSiteRebuild = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  secrets: [siteRebuildWebhookUrl, siteRebuildWebhookToken],
  region: FUNCTION_REGION,
  timeoutSeconds: 120,
  memory: '256MiB',
  maxInstances: 3
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  const actor = assertVerifiedAdmin(request);
  let rebuildRequest;
  try {
    rebuildRequest = validateRebuildRequest(request.data || {});
  } catch (error) {
    throw toHttpsValidationError(error);
  }
  const operationRef = db.doc(REBUILD_OPERATION_PATH);
  const nowMs = Date.now();
  const requestId = crypto.randomUUID();
  const dispatcherId = crypto.randomUUID();

  const enqueued = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(operationRef);
    const current = snapshot.exists ? snapshot.data() : {};
    const queued = enqueueRebuildOperation({
      current: toRebuildQueueState(current),
      request: rebuildRequest,
      requestId,
      actorUid: actor.uid,
      dispatcherId,
      nowMs,
      leaseMs: REBUILD_LEASE_MS
    });
    transaction.set(operationRef, {
      ...toFirestoreRebuildQueuePatch(queued.state),
      latestRequestedAt: Timestamp.fromMillis(nowMs),
      failureCode: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return queued;
  });

  const { acceptedRevision } = await dispatchSiteRebuildQueue({
    targetRevision: enqueued.revision,
    dispatcherId,
    actor,
    auditSource: 'server-rebuild-hook'
  });

  return {
    ok: true,
    status: 'hook-accepted',
    requestId,
    revision: enqueued.revision,
    acceptedRevision,
    coalesced: !enqueued.ownsDispatcher
  };
});

const readSiteRebuildStatus = async (targetRevision) => {
  const [queueSnapshot, publicationSnapshot] = await Promise.all([
    db.doc(REBUILD_OPERATION_PATH).get(),
    db.doc(MEDIA_PUBLICATION_OPERATION_PATH).get()
  ]);
  const queue = queueSnapshot.exists ? queueSnapshot.data() : {};
  const publication = publicationSnapshot.exists ? publicationSnapshot.data() : {};
  return projectSiteRebuildStatus({
    targetRevision: targetRevision ?? getSafeRevision(queue.requestedRevision),
    queue,
    publication
  });
};

export const getSiteRebuildStatus = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  region: FUNCTION_REGION,
  timeoutSeconds: 15,
  memory: '256MiB',
  maxInstances: 5
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  assertVerifiedAdmin(request);
  const input = request.data;
  if (
    input === null
    || typeof input !== 'object'
    || Array.isArray(input)
    || Object.keys(input).length !== 1
    || !Number.isSafeInteger(input.revision)
    || input.revision <= 0
  ) {
    throw new HttpsError('invalid-argument', 'A positive rebuild revision is required.');
  }

  return {
    ok: true,
    ...await readSiteRebuildStatus(input.revision)
  };
});

export const getLatestSiteRebuildStatus = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  region: FUNCTION_REGION,
  timeoutSeconds: 15,
  memory: '256MiB',
  maxInstances: 5
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  assertVerifiedAdmin(request);
  const input = request.data;
  if (
    input !== undefined
    && input !== null
    && (
      typeof input !== 'object'
      || Array.isArray(input)
      || Object.keys(input).length !== 0
    )
  ) throw new HttpsError('invalid-argument', 'This status request does not accept input.');
  return { ok: true, ...await readSiteRebuildStatus() };
});

export const seedContent = onCall({
  cors: callableCors,
  enforceAppCheck: true,
  consumeAppCheckToken: true,
  region: FUNCTION_REGION,
  timeoutSeconds: 120,
  memory: '512MiB',
  maxInstances: 2
}, async (request) => {
  if (request.app?.alreadyConsumed === true) {
    throw new HttpsError('permission-denied', 'A fresh App Check token is required.');
  }
  const actor = assertVerifiedAdmin(request);
  let command;
  let entries;

  try {
    command = validateSeedCommand(request.data || {});
    entries = loadSeedEntries();
  } catch (error) {
    const converted = toHttpsValidationError(error);
    if (converted instanceof HttpsError) throw converted;
    console.error('Seed manifest could not be loaded.', { code: error?.code || 'invalid-manifest' });
    throw new HttpsError('failed-precondition', 'Bundled seed content is invalid.');
  }

  const manifestHash = contentHash(entries);
  const ids = entries.map((entry) => entry.path);
  if (command.dryRun) {
    return { ok: true, dryRun: true, manifestHash, ids };
  }

  let migrationRef;
  let seedResult;
  try {
    migrationRef = await claimSeedLease({ manifestHash, actor });
    seedResult = await writeSeedEntries({ entries });
    await migrationRef.set({
      status: 'complete',
      manifestHash,
      itemCount: entries.length,
      createdCount: seedResult.createdIds.length,
      skippedCount: seedResult.skippedIds.length,
      completedAt: serverTimestamp(),
      failureCode: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    await writeAuditLog({
      action: 'content.seed',
      actor,
      entity: 'project',
      documentId: manifestHash,
      changedFields: [],
      metadata: {
        source: 'server-seed',
        itemCount: entries.length,
        createdIds: seedResult.createdIds,
        skippedIds: seedResult.skippedIds
      }
    }).catch((error) => {
      console.error('Seed audit log could not be written.', { code: error?.code || 'unknown' });
    });
  } catch (error) {
    if (migrationRef) {
      await migrationRef.set({
        status: 'failed',
        failureCode: error?.code || 'unknown',
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(() => undefined);
    }
    if (error instanceof HttpsError) throw error;
    console.error('Content seed failed.', { code: error?.code || 'unknown' });
    throw new HttpsError('internal', 'Content seed failed.');
  }

  return {
    ok: true,
    manifestHash,
    ids,
    createdCount: seedResult.createdIds.length,
    skippedCount: seedResult.skippedIds.length
  };
});
