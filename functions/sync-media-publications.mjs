import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { planMediaDeploymentTransition } from './deployment-state.js';
import {
  extractPublishedMediaManifest,
  mediaPublicationConfirmation
} from './media-publication.js';
import {
  assertPublisherMutationOwnership,
  isActiveMediaMutationLease
} from './media-mutation.js';
import { assertAuthorizedRebuildRevision } from './rebuild-authorization.js';
import {
  assertBoundMediaSnapshotUnchanged,
  bindVerifiedMediaToSnapshotHash,
  desiredPromotedMediaObjects,
  verifyPromotedMediaObjects
} from './promoted-media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.join(__dirname, '..');
const snapshotPath = path.join(repositoryRoot, 'src', 'data', 'generated-content.json');
const STATE_PATH = 'systemOperations/media-publication';
const MEDIA_MUTATION_OPERATION_PATH = 'systemOperations/media-mutation';
const REBUILD_OPERATION_PATH = 'systemOperations/site-rebuild';
const LEASE_MS = 10 * 60 * 1000;
const PREPARED_RECOVERY_MS = 45 * 60 * 1000;
const MAX_CONTENT_ITEMS = 1000;
const MAX_VERIFIED_MEDIA_OBJECTS = 5000;
const SAFE_DEPLOYMENT_ID = /^[a-zA-Z0-9_-]{8,100}$/u;
const SAFE_FILE_NAME = /^[a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif)$/u;

const requireInput = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const loadServiceAccount = () => {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) return JSON.parse(inlineAccount);
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  return null;
};

const validateSnapshot = async (snapshot) => {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: repositoryRoot,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true }
  });
  try {
    const domain = await vite.ssrLoadModule('/src/domain/content.ts');
    return domain.parseContentBundle(snapshot);
  } finally {
    await vite.close();
  }
};

const readDesiredPublications = async ({ bucketName }) => {
  const rawSnapshot = fs.readFileSync(snapshotPath, 'utf8');
  const snapshot = await validateSnapshot(JSON.parse(rawSnapshot));
  const items = [
    ...snapshot.projects.map((data) => ({ entity: 'project', data })),
    ...snapshot.journal.map((data) => ({ entity: 'journal', data }))
  ];
  if (items.length > MAX_CONTENT_ITEMS) {
    throw new Error(`The public snapshot exceeds ${MAX_CONTENT_ITEMS} content items.`);
  }

  const publications = new Map();
  for (const { entity, data } of items) {
    const publication = extractPublishedMediaManifest({
      data,
      bucketName,
      entity,
      slug: data.slug
    });
    if (!publication.published || !publication.complete) {
      throw new Error(
        `${entity}/${data.slug} contains an invalid, tokenized, cross-bucket, or excessive Firebase media reference.`
      );
    }
    const id = `${entity}--${data.slug}`;
    if (publications.has(id)) throw new Error(`Duplicate media publication ${id}.`);
    publications.set(id, {
      entity,
      slug: data.slug,
      files: publication.files
    });
  }
  return {
    publications,
    snapshotHash: crypto.createHash('sha256').update(rawSnapshot).digest('hex')
  };
};

const activeFilesFromSnapshot = (snapshot, expected) => {
  if (!snapshot.exists) return [];
  const data = snapshot.data();
  const active = data.active === true || (data.active === undefined && data.published === true);
  if (data.active === false || (data.active === undefined && data.published === false)) return [];
  if (
    !active
    || data.complete !== true
    || data.entity !== expected.entity
    || data.slug !== expected.slug
    || !Array.isArray(data.files)
    || data.files.length > 1000
    || data.files.some((fileName) => typeof fileName !== 'string' || !SAFE_FILE_NAME.test(fileName))
    || new Set(data.files).size !== data.files.length
  ) {
    throw new Error(`Existing media publication ${snapshot.id} is invalid; prepare is fail-closed.`);
  }
  return data.files;
};

const forEachConcurrent = async (entries, concurrency, worker) => {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
    while (cursor < entries.length) {
      const index = cursor;
      cursor += 1;
      await worker(entries[index]);
    }
  });
  await Promise.all(runners);
};

const verifyDesiredMediaObjects = async ({ bucket, publications }) => {
  const desiredObjects = desiredPromotedMediaObjects({
    publications,
    maximum: MAX_VERIFIED_MEDIA_OBJECTS
  });
  return verifyPromotedMediaObjects({
    desiredObjects,
    concurrency: 12,
    readMetadata: async (storagePath) => {
      const [metadata] = await bucket.file(storagePath).getMetadata();
      return metadata;
    }
  });
};

const reverifyClaimedMediaSnapshot = async ({
  bucket,
  publications,
  contentSnapshotHash,
  expectedSnapshotHash
}) => {
  const verifiedObjects = await verifyDesiredMediaObjects({ bucket, publications });
  assertBoundMediaSnapshotUnchanged({
    contentSnapshotHash,
    expectedSnapshotHash,
    verifiedObjects
  });
};

const assertOperationOwnership = ({
  stateSnapshot,
  mutationSnapshot,
  action,
  deploymentId,
  snapshotHash,
  revision,
  operationToken,
  nowMs
}) => {
  const state = stateSnapshot.exists ? stateSnapshot.data() : {};
  const mutation = mutationSnapshot.exists ? mutationSnapshot.data() : {};
  assertPublisherMutationOwnership({
    state,
    mutation,
    action,
    deploymentId,
    snapshotHash,
    revision,
    operationToken,
    nowMs
  });
};

const commitFencedOperations = async ({
  db,
  stateRef,
  mutationRef,
  action,
  deploymentId,
  snapshotHash,
  revision,
  operationToken,
  operations
}) => {
  for (let offset = 0; offset < operations.length; offset += 400) {
    await db.runTransaction(async (transaction) => {
      const nowMs = Date.now();
      const [state, mutation] = await Promise.all([
        transaction.get(stateRef),
        transaction.get(mutationRef)
      ]);
      assertOperationOwnership({
        stateSnapshot: state,
        mutationSnapshot: mutation,
        action,
        deploymentId,
        snapshotHash,
        revision,
        operationToken,
        nowMs
      });
      for (const operation of operations.slice(offset, offset + 400)) operation(transaction);
    });
  }
};

const claimOperation = async ({
  db,
  action,
  deploymentId,
  snapshotHash,
  contentRevision,
  requestId
}) => {
  const stateRef = db.doc(STATE_PATH);
  const mutationRef = db.doc(MEDIA_MUTATION_OPERATION_PATH);
  const rebuildRef = db.doc(REBUILD_OPERATION_PATH);
  const operationToken = crypto.randomUUID();
  const revision = await db.runTransaction(async (transaction) => {
    const nowMs = Date.now();
    const reads = [
      transaction.get(stateRef),
      transaction.get(mutationRef)
    ];
    if (action === 'prepare') reads.push(transaction.get(rebuildRef));
    const [stateSnapshot, mutationSnapshot, rebuildSnapshot] = await Promise.all(reads);
    const mutation = mutationSnapshot.exists ? mutationSnapshot.data() : {};
    if (isActiveMediaMutationLease({ state: mutation, nowMs })) {
      throw new Error('Another process currently owns the media mutation lease.');
    }
    if (action === 'prepare') {
      assertAuthorizedRebuildRevision({
        contentRevision,
        requestId,
        queue: rebuildSnapshot?.exists ? rebuildSnapshot.data() : {}
      });
    }
    const state = stateSnapshot.exists ? stateSnapshot.data() : {};
    const transition = planMediaDeploymentTransition({
      state,
      action,
      deploymentId,
      snapshotHash,
      contentRevision,
      nowMs
    });
    const leaseExpiresAt = Timestamp.fromMillis(nowMs + LEASE_MS);
    transaction.set(stateRef, {
      ...transition,
      leaseExpiresAt,
      operationToken,
      updatedAt: FieldValue.serverTimestamp(),
      failureCode: null
    }, { merge: true });
    transaction.set(mutationRef, {
      status: 'running',
      ownerType: 'media-publisher',
      ownerId: operationToken,
      leaseExpiresAt,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return transition.revision;
  });
  return { stateRef, mutationRef, revision, operationToken };
};

const markFailure = async ({
  db,
  stateRef,
  mutationRef,
  action,
  deploymentId,
  snapshotHash,
  revision,
  operationToken,
  error
}) => {
  await db.runTransaction(async (transaction) => {
    const [stateSnapshot, mutationSnapshot] = await Promise.all([
      transaction.get(stateRef),
      transaction.get(mutationRef)
    ]);
    const state = stateSnapshot.exists ? stateSnapshot.data() : {};
    const mutation = mutationSnapshot.exists ? mutationSnapshot.data() : {};
    if (
      state.deploymentId === deploymentId
      && state.snapshotHash === snapshotHash
      && state.revision === revision
      && state.operationToken === operationToken
    ) {
      transaction.set(stateRef, {
        status: action === 'prepare' ? 'prepare-failed' : 'finalize-failed',
        leaseExpiresAt: null,
        operationToken: null,
        failureCode: String(error?.code || error?.name || 'unknown').slice(0, 80),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    if (
      mutation.status === 'running'
      && mutation.ownerType === 'media-publisher'
      && mutation.ownerId === operationToken
    ) {
      transaction.set(mutationRef, {
        status: 'idle',
        ownerType: null,
        ownerId: null,
        leaseExpiresAt: null,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
  }).catch(() => undefined);
};

const prepare = async ({
  db,
  deploymentId,
  snapshotHash,
  contentSnapshotHash,
  contentRevision,
  requestId,
  publications,
  bucket
}) => {
  const { stateRef, mutationRef, revision, operationToken } = await claimOperation({
    db,
    action: 'prepare',
    deploymentId,
    snapshotHash,
    contentRevision,
    requestId
  });
  try {
    // The first HEAD pass binds Storage generations into snapshotHash. Repeat
    // it only after acquiring the shared publisher lease so GC/editor cleanup
    // cannot delete a previously verified object before manifests are written.
    await reverifyClaimedMediaSnapshot({
      bucket,
      publications,
      contentSnapshotHash,
      expectedSnapshotHash: snapshotHash
    });
    await forEachConcurrent([...publications.entries()], 10, async ([id, desired]) => {
      const publicationRef = db.collection('mediaPublications').doc(id);
      await db.runTransaction(async (transaction) => {
        const nowMs = Date.now();
        const [state, mutation, current] = await Promise.all([
          transaction.get(stateRef),
          transaction.get(mutationRef),
          transaction.get(publicationRef)
        ]);
        assertOperationOwnership({
          stateSnapshot: state,
          mutationSnapshot: mutation,
          action: 'prepare',
          deploymentId,
          snapshotHash,
          revision,
          operationToken,
          nowMs
        });
        const files = [...new Set([
          ...activeFilesFromSnapshot(current, desired),
          ...desired.files
        ])].sort();
        transaction.set(publicationRef, {
          schemaVersion: 2,
          entity: desired.entity,
          slug: desired.slug,
          active: true,
          complete: true,
          files,
          deploymentId,
          revision,
          contentRevision,
          phase: 'prepared-union',
          updatedAt: FieldValue.serverTimestamp()
        });
      });
    });
    await db.runTransaction(async (transaction) => {
      const nowMs = Date.now();
      const [current, mutation] = await Promise.all([
        transaction.get(stateRef),
        transaction.get(mutationRef)
      ]);
      assertOperationOwnership({
        stateSnapshot: current,
        mutationSnapshot: mutation,
        action: 'prepare',
        deploymentId,
        snapshotHash,
        revision,
        operationToken,
        nowMs
      });
      transaction.set(stateRef, {
        status: 'prepared',
        preparedAt: FieldValue.serverTimestamp(),
        leaseExpiresAt: Timestamp.fromMillis(nowMs + PREPARED_RECOVERY_MS),
        operationToken: null,
        itemCount: publications.size,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      transaction.set(mutationRef, {
        status: 'idle',
        ownerType: null,
        ownerId: null,
        leaseExpiresAt: null,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });
  } catch (error) {
    await markFailure({
      db,
      stateRef,
      mutationRef,
      action: 'prepare',
      deploymentId,
      snapshotHash,
      revision,
      operationToken,
      error
    });
    throw error;
  }
};

const finalize = async ({
  db,
  deploymentId,
  snapshotHash,
  contentSnapshotHash,
  contentRevision,
  publications,
  bucket
}) => {
  const { stateRef, mutationRef, revision, operationToken } = await claimOperation({
    db,
    action: 'finalize',
    deploymentId,
    snapshotHash,
    contentRevision
  });
  try {
    // Prepared union manifests protect desired files between phases. The
    // second lease-bound verification also catches out-of-band object drift
    // before finalize narrows the live manifest.
    await reverifyClaimedMediaSnapshot({
      bucket,
      publications,
      contentSnapshotHash,
      expectedSnapshotHash: snapshotHash
    });
    const current = await db.collection('mediaPublications').get();
    const desiredIds = new Set(publications.keys());
    const operations = [];
    for (const snapshot of current.docs) {
      if (!desiredIds.has(snapshot.id)) {
        operations.push((batch) => batch.delete(snapshot.ref));
      }
    }
    for (const [id, desired] of publications) {
      const ref = db.collection('mediaPublications').doc(id);
      operations.push((batch) => batch.set(ref, {
        schemaVersion: 2,
        entity: desired.entity,
        slug: desired.slug,
        active: true,
        complete: true,
        files: desired.files,
        deploymentId,
        revision,
        contentRevision,
        phase: 'active',
        updatedAt: FieldValue.serverTimestamp()
      }));
    }
    await commitFencedOperations({
      db,
      stateRef,
      mutationRef,
      action: 'finalize',
      deploymentId,
      snapshotHash,
      revision,
      operationToken,
      operations
    });
    await db.runTransaction(async (transaction) => {
      const nowMs = Date.now();
      const [state, mutation] = await Promise.all([
        transaction.get(stateRef),
        transaction.get(mutationRef)
      ]);
      assertOperationOwnership({
        stateSnapshot: state,
        mutationSnapshot: mutation,
        action: 'finalize',
        deploymentId,
        snapshotHash,
        revision,
        operationToken,
        nowMs
      });
      transaction.set(stateRef, {
        status: 'active',
        activeContentRevision: contentRevision,
        activeDeploymentId: deploymentId,
        activatedAt: FieldValue.serverTimestamp(),
        leaseExpiresAt: null,
        operationToken: null,
        itemCount: publications.size,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      transaction.set(mutationRef, {
        status: 'idle',
        ownerType: null,
        ownerId: null,
        leaseExpiresAt: null,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });
  } catch (error) {
    await markFailure({
      db,
      stateRef,
      mutationRef,
      action: 'finalize',
      deploymentId,
      snapshotHash,
      revision,
      operationToken,
      error
    });
    throw error;
  }
};

const abort = async ({ db, deploymentId }) => {
  const stateRef = db.doc(STATE_PATH);
  await db.runTransaction(async (transaction) => {
    const state = await transaction.get(stateRef);
    if (!state.exists || state.data().deploymentId !== deploymentId) {
      throw new Error('Only the current media deployment can be aborted.');
    }
    if (!['prepared', 'prepare-failed'].includes(state.data().status)) {
      throw new Error('Only a prepared or failed-prepare media deployment can be aborted.');
    }
    transaction.set(stateRef, {
      status: 'aborted',
      abortedAt: FieldValue.serverTimestamp(),
      leaseExpiresAt: null,
      operationToken: null,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });
};

const main = async () => {
  const action = process.argv[2];
  if (!['prepare', 'finalize', 'abort'].includes(action)) {
    throw new Error('Usage: node sync-media-publications.mjs prepare|finalize|abort');
  }
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const deploymentId = requireInput('MEDIA_DEPLOYMENT_ID');
  if (!SAFE_DEPLOYMENT_ID.test(deploymentId)) {
    throw new Error('MEDIA_DEPLOYMENT_ID must be 8-100 URL-safe characters.');
  }
  const expectedConfirmation = mediaPublicationConfirmation({
    action,
    deploymentId,
    projectId
  });
  if (requireInput('CONFIRM_MEDIA_PUBLICATION') !== expectedConfirmation) {
    throw new Error(`CONFIRM_MEDIA_PUBLICATION must equal ${expectedConfirmation}.`);
  }

  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  const app = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId
  });
  const db = getFirestore(app);
  if (action === 'abort') {
    await abort({ db, deploymentId });
    console.log(`Media deployment ${deploymentId} aborted without narrowing active files.`);
    return;
  }

  const bucketName = requireInput('ACKARACA_STORAGE_BUCKET');
  const contentRevisionValue = requireInput('ACKARACA_CONTENT_REVISION');
  if (!/^(?:0|[1-9][0-9]*)$/u.test(contentRevisionValue)) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  const contentRevision = Number(contentRevisionValue);
  if (!Number.isSafeInteger(contentRevision)) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  const requestId = process.env.REBUILD_REQUEST_ID?.trim() || null;
  const desired = await readDesiredPublications({ bucketName });
  const bucket = getStorage().bucket(bucketName);
  const verifiedObjects = await verifyDesiredMediaObjects({
    bucket,
    publications: desired.publications
  });
  const snapshotHash = bindVerifiedMediaToSnapshotHash({
    snapshotHash: desired.snapshotHash,
    verifiedObjects
  });
  const { publications } = desired;
  if (action === 'prepare') {
    await prepare({
      db,
      deploymentId,
      snapshotHash,
      contentSnapshotHash: desired.snapshotHash,
      contentRevision,
      requestId,
      publications,
      bucket
    });
    console.log(
      `Prepared ${publications.size} media manifests for ${deploymentId}; old and new deployed files are active.`
    );
  } else {
    await finalize({
      db,
      deploymentId,
      snapshotHash,
      contentSnapshotHash: desired.snapshotHash,
      contentRevision,
      publications,
      bucket
    });
    console.log(
      `Finalized ${publications.size} media manifests for ${deploymentId}; retired files are no longer public.`
    );
  }
};

main().catch((error) => {
  console.error('Media publication sync failed:', error.message);
  process.exitCode = 1;
});
