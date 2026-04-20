import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'data', 'content-seeds.json');

function loadServiceAccount() {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) {
    return JSON.parse(inlineAccount);
  }

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) {
    return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  }

  return null;
}

function createAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  const serviceAccount = loadServiceAccount();
  const usesEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (usesEmulator) {
    return initializeApp({ projectId });
  }

  if (serviceAccount) {
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

async function upsertCollection(db, collectionName, items) {
  const results = [];

  for (const item of items) {
    const docRef = db.collection(collectionName).doc(item.id);
    await docRef.set({
      ...item,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    results.push(item.id);
  }

  return results;
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Seed manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const app = createAdminApp();
  const db = getFirestore(app);

  const projectIds = await upsertCollection(db, 'projects', manifest.projects || []);
  const applicationIds = await upsertCollection(db, 'applications', manifest.applications || []);

  console.log(`Seed complete. Projects: ${projectIds.join(', ') || 'none'}`);
  console.log(`Seed complete. Applications: ${applicationIds.join(', ') || 'none'}`);
}

main().catch((error) => {
  console.error('Content seed failed:', error.message);
  process.exitCode = 1;
});