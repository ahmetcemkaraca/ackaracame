import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  parsePinnedCanonicalContentArtifact,
  validateCanonicalContentArtifact
} from './canonical-content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, 'data', 'canonical-content.json');

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

function createAdminApp(projectId) {
  const serviceAccount = loadServiceAccount();
  const usesEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (usesEmulator) {
    return initializeApp({ projectId });
  }

  if (serviceAccount) {
    if (serviceAccount.project_id && serviceAccount.project_id !== projectId) {
      throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
    }
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

async function createMissingEntries(db, entries) {
  const refs = entries.map((entry) => db.doc(entry.path));
  const snapshots = refs.length > 0 ? await db.getAll(...refs) : [];
  const existingPaths = new Set(
    snapshots.filter((snapshot) => snapshot.exists).map((snapshot) => snapshot.ref.path)
  );
  const batch = db.batch();
  const createdIds = [];
  const skippedIds = [];

  entries.forEach((entry) => {
    const ref = db.doc(entry.path);
    if (existingPaths.has(ref.path)) {
      skippedIds.push(entry.path);
      return;
    }
    batch.create(ref, {
      ...entry.data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    createdIds.push(entry.path);
  });

  if (createdIds.length > 0) await batch.commit();
  return { createdIds, skippedIds };
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Canonical content artifact not found: ${manifestPath}`);
  }

  const usesEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is required to prevent cross-project seeding.');
  }
  if (!usesEmulator && process.env.CONFIRM_CREATE_ONLY_SEED !== 'ACKARACA_CREATE_ONLY') {
    throw new Error(
      'Production seeding requires CONFIRM_CREATE_ONLY_SEED=ACKARACA_CREATE_ONLY.'
    );
  }

  const artifact = parsePinnedCanonicalContentArtifact(fs.readFileSync(manifestPath));
  const entries = validateCanonicalContentArtifact(artifact);
  const app = createAdminApp(projectId);
  const db = getFirestore(app);
  const { createdIds, skippedIds } = await createMissingEntries(db, entries);

  console.log(`Seed complete. Created: ${createdIds.join(', ') || 'none'}`);
  console.log(`Seed complete. Preserved existing: ${skippedIds.join(', ') || 'none'}`);
}

main().catch((error) => {
  console.error('Content seed failed:', error.message);
  process.exitCode = 1;
});
