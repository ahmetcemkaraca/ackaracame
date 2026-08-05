import fs from 'node:fs';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { validateAdminClaimTarget } from './admin-claim.js';

const OWNER_POLICY_PATH = 'systemPolicies/owner-access';

const loadServiceAccount = () => {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) return JSON.parse(inlineAccount);

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  return null;
};

const createAdminApp = (projectId) => {
  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  if (serviceAccount) {
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }
  return initializeApp({ credential: applicationDefault(), projectId });
};

const requireInput = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const main = async () => {
  const action = process.argv[2];
  if (!['grant', 'revoke'].includes(action)) {
    throw new Error('Usage: npm run admin:claim -- grant|revoke');
  }

  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const expectedUid = requireInput('FIREBASE_ADMIN_UID');
  const expectedEmail = validateAdminClaimTarget({
    action,
    targetEmail: requireInput('FIREBASE_ADMIN_EMAIL'),
    configuredOwnerEmail: action === 'grant' ? requireInput('ACKARACA_ADMIN_EMAIL') : undefined
  });
  const confirmation = requireInput('CONFIRM_ADMIN_CLAIM');
  if (confirmation !== `${action}:${expectedUid}`) {
    throw new Error(`CONFIRM_ADMIN_CLAIM must equal ${action}:${expectedUid}.`);
  }

  const app = createAdminApp(projectId);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = await auth.getUser(expectedUid);
  if (!user.email || user.email.toLowerCase() !== expectedEmail) {
    throw new Error('The UID does not belong to the expected email address.');
  }
  if (action === 'grant' && user.email !== expectedEmail) {
    throw new Error(
      'The administrator account email must exactly use the configured lowercase form.'
    );
  }
  if (action === 'grant' && user.emailVerified !== true) {
    throw new Error('The administrator email must be verified before granting access.');
  }
  if (action === 'grant' && user.disabled === true) {
    throw new Error('A disabled account cannot be granted administrator access.');
  }
  if (
    action === 'grant'
    && !user.multiFactor?.enrolledFactors?.some((factor) => factor.factorId === 'totp')
  ) {
    throw new Error('A TOTP second factor must be enrolled before granting administrator access.');
  }

  const claims = { ...(user.customClaims || {}) };
  const ownerPolicy = db.doc(OWNER_POLICY_PATH);
  if (action === 'grant') {
    claims.admin = true;
    // Grant the claim before switching the owner binding. Until the policy write
    // succeeds the new token remains unusable and an existing owner is not locked out.
    await auth.setCustomUserClaims(user.uid, claims);
    await ownerPolicy.set({
      schemaVersion: 1,
      uid: user.uid,
      email: expectedEmail,
      updatedAt: FieldValue.serverTimestamp()
    });
  } else {
    // Remove a matching owner binding first. This immediately fails closed even
    // if the subsequent Auth mutation is interrupted.
    const policySnapshot = await ownerPolicy.get();
    if (policySnapshot.exists && policySnapshot.get('uid') === user.uid) {
      await ownerPolicy.delete();
    }
    delete claims.admin;
    await auth.setCustomUserClaims(user.uid, claims);
  }

  await auth.revokeRefreshTokens(user.uid);
  console.log(`Admin claim ${action === 'grant' ? 'granted to' : 'revoked from'} ${user.uid}.`);
  console.log('Existing sessions were revoked; sign in again to refresh the ID token.');
};

main().catch((error) => {
  console.error('Admin claim operation failed:', error.message);
  process.exitCode = 1;
});
