import fs from 'node:fs';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { validateOwnerPreflight } from './owner-preflight.js';

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
  const configuredEmail = requireInput('ACKARACA_ADMIN_EMAIL');
  const mode = requireInput('ACKARACA_OWNER_PREFLIGHT_MODE');
  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  const app = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId
  });
  const user = await getAuth(app).getUserByEmail(configuredEmail);
  const policySnapshot = mode === 'normal'
    ? await getFirestore(app).doc('systemPolicies/owner-access').get()
    : null;
  const result = validateOwnerPreflight({
    mode,
    configuredEmail,
    user,
    ownerPolicy: policySnapshot?.exists ? policySnapshot.data() : null
  });
  console.log(`Sole-owner ${result.mode} preflight passed for UID ${result.uid}.`);
};

main().catch((error) => {
  console.error('Sole-owner preflight failed:', error.message);
  process.exitCode = 1;
});
