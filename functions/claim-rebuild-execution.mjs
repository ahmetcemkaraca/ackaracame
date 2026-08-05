import fs from 'node:fs';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import {
  planRebuildExecutionClaim,
  validateRebuildExecutionId
} from './rebuild-execution.js';

const OPERATION_PATH = 'systemOperations/site-rebuild';
const PUBLICATION_PATH = 'systemOperations/media-publication';
const EXECUTION_LEASE_MS = 40 * 60 * 1000;

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

const writeOutput = (name, value) => {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) fs.appendFileSync(outputPath, `${name}=${value}\n`, 'utf8');
};

const main = async () => {
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const revisionValue = requireInput('ACKARACA_CONTENT_REVISION');
  if (!/^(?:0|[1-9][0-9]*)$/u.test(revisionValue)) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  const revision = Number(revisionValue);
  if (!Number.isSafeInteger(revision)) throw new Error('The rebuild revision is invalid.');
  const requestId = process.env.REBUILD_REQUEST_ID?.trim() || null;
  const executionId = requireInput('REBUILD_EXECUTION_ID');
  if (!validateRebuildExecutionId(executionId)) {
    throw new Error('REBUILD_EXECUTION_ID is invalid.');
  }
  const expectedConfirmation = `claim:${revision}:${projectId}`;
  if (requireInput('CONFIRM_REBUILD_EXECUTION') !== expectedConfirmation) {
    throw new Error(`CONFIRM_REBUILD_EXECUTION must equal ${expectedConfirmation}.`);
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
  const executionRef = db.doc(`rebuildExecutions/revision-${revision}`);
  const publicationRef = db.doc(PUBLICATION_PATH);
  const outcome = await db.runTransaction(async (transaction) => {
    const [operationSnapshot, executionSnapshot, publicationSnapshot] = await Promise.all([
      transaction.get(operationRef),
      transaction.get(executionRef),
      transaction.get(publicationRef)
    ]);
    const planned = planRebuildExecutionClaim({
      queue: operationSnapshot.exists ? operationSnapshot.data() : {},
      execution: executionSnapshot.exists ? executionSnapshot.data() : {},
      publication: publicationSnapshot.exists ? publicationSnapshot.data() : {},
      revision,
      requestId,
      executionId,
      nowMs: Date.now(),
      leaseMs: EXECUTION_LEASE_MS
    });
    if (planned.outcome === 'claimed') {
      const { leaseExpiresAtMs, expiresAtMs, ...state } = planned.state;
      transaction.set(executionRef, {
        ...state,
        leaseExpiresAt: Timestamp.fromMillis(leaseExpiresAtMs),
        expiresAt: Timestamp.fromMillis(expiresAtMs),
        claimedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
    return planned.outcome;
  });
  const shouldRun = outcome === 'claimed';
  writeOutput('should_run', shouldRun ? 'true' : 'false');
  writeOutput('claim_outcome', outcome);
  console.log(shouldRun
    ? `Claimed rebuild execution ${revision} for ${executionId}.`
    : `Skipped rebuild execution ${revision}: ${outcome}.`);
};

main().catch((error) => {
  console.error('Rebuild execution claim failed:', error.message);
  process.exitCode = 1;
});
