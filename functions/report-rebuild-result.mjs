import fs from 'node:fs';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { assertAuthorizedRebuildRevision } from './rebuild-authorization.js';
import {
  assertRebuildExecutionOwner,
  canonicalizeRebuildResult,
  selectRebuildFailureCode,
  validateRebuildExecutionId
} from './rebuild-execution.js';

const OPERATION_PATH = 'systemOperations/site-rebuild';
const PUBLICATION_PATH = 'systemOperations/media-publication';
const SAFE_DEPLOYMENT_ID = /^[a-zA-Z0-9_-]{8,100}$/u;
const SAFE_REQUEST_ID = /^[a-zA-Z0-9_-]{8,100}$/u;
const SAFE_FAILURE_CODE = /^[a-z0-9][a-z0-9-]{0,79}$/u;
const EXECUTION_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

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

const main = async () => {
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const result = requireInput('REBUILD_DEPLOYMENT_RESULT');
  if (!['active', 'failed'].includes(result)) {
    throw new Error('REBUILD_DEPLOYMENT_RESULT must be active or failed.');
  }
  const revisionValue = requireInput('ACKARACA_CONTENT_REVISION');
  if (!/^(?:0|[1-9][0-9]*)$/u.test(revisionValue)) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  const revision = Number(revisionValue);
  if (!Number.isSafeInteger(revision)) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  const deploymentId = requireInput('MEDIA_DEPLOYMENT_ID');
  if (!SAFE_DEPLOYMENT_ID.test(deploymentId)) {
    throw new Error('MEDIA_DEPLOYMENT_ID must be 8-100 URL-safe characters.');
  }
  const requestId = process.env.REBUILD_REQUEST_ID?.trim() || null;
  if (requestId && !SAFE_REQUEST_ID.test(requestId)) {
    throw new Error('REBUILD_REQUEST_ID must be 8-100 URL-safe characters.');
  }
  const executionId = process.env.REBUILD_EXECUTION_ID?.trim() || null;
  if (executionId && !validateRebuildExecutionId(executionId)) {
    throw new Error('REBUILD_EXECUTION_ID is invalid.');
  }
  const failureCode = result === 'failed'
    ? requireInput('REBUILD_FAILURE_CODE')
    : null;
  if (failureCode && !SAFE_FAILURE_CODE.test(failureCode)) {
    throw new Error('REBUILD_FAILURE_CODE must be a bounded kebab-case identifier.');
  }
  const expectedConfirmation = `report:${revision}:${result}:${projectId}`;
  if (requireInput('CONFIRM_REBUILD_RESULT') !== expectedConfirmation) {
    throw new Error(`CONFIRM_REBUILD_RESULT must equal ${expectedConfirmation}.`);
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
  const operationRef = db.doc(OPERATION_PATH);
  const publicationRef = db.doc(PUBLICATION_PATH);
  const executionRef = executionId
    ? db.doc(`rebuildExecutions/revision-${revision}`)
    : null;

  let recordedResult = result;
  await db.runTransaction(async (transaction) => {
    const reads = [
      transaction.get(operationRef),
      transaction.get(publicationRef)
    ];
    if (executionRef) reads.push(transaction.get(executionRef));
    const [operation, publication, execution] = await Promise.all(reads);
    const canonicalResult = canonicalizeRebuildResult({
      requestedResult: result,
      revision,
      deploymentId,
      publication: publication.exists ? publication.data() : {}
    });
    recordedResult = canonicalResult;
    const current = operation.exists ? operation.data() : {};
    assertAuthorizedRebuildRevision({
      contentRevision: revision,
      requestId,
      queue: current
    });
    if (executionRef) {
      assertRebuildExecutionOwner({
        execution: execution.exists ? execution.data() : {},
        revision,
        requestId,
        executionId,
        result: canonicalResult
      });
    }
    const currentResultRevision = Number.isSafeInteger(current.latestDeploymentResultRevision)
      ? current.latestDeploymentResultRevision
      : -1;
    if (revision < currentResultRevision) return;
    const recordedFailureCode = canonicalResult === 'failed'
      ? selectRebuildFailureCode({
        requestedFailureCode: failureCode,
        queue: current,
        execution: execution?.exists ? execution.data() : null,
        revision,
        deploymentId
      })
      : null;
    transaction.set(operationRef, {
      latestDeploymentResult: canonicalResult,
      latestDeploymentResultRevision: revision,
      latestDeploymentId: deploymentId,
      latestDeploymentRequestId: requestId,
      latestDeploymentFailureCode: recordedFailureCode,
      latestDeploymentResultAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    if (executionRef) {
      transaction.set(executionRef, {
        status: canonicalResult,
        leaseExpiresAt: null,
        deploymentId,
        failureCode: recordedFailureCode,
        expiresAt: Timestamp.fromMillis(Date.now() + EXECUTION_RETENTION_MS),
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
  });
  console.log(`Recorded rebuild revision ${revision} as ${recordedResult}.`);
};

main().catch((error) => {
  console.error('Rebuild result report failed:', error.message);
  process.exitCode = 1;
});
