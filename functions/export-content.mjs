import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.join(__dirname, '..');

const loadServiceAccount = () => {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) return JSON.parse(inlineAccount);
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  return null;
};

const createAdminApp = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is required to prevent cross-project exports.');
  }
  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  return initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId,
  });
};

const stripSystemFields = (data) => {
  const { createdAt, updatedAt, deletedAt, schemaVersion, ...content } = data;
  void createdAt;
  void updatedAt;
  void deletedAt;
  void schemaVersion;
  return content;
};

const documentContent = (snapshot, collectionName) => {
  const content = stripSystemFields(snapshot.data());
  if (content.slug !== snapshot.id) {
    throw new Error(`${collectionName}/${snapshot.id} has a mismatched slug.`);
  }
  return content;
};

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortObjectKeys(value[key])])
  );
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
    return {
      snapshot: domain.parseContentBundle(snapshot),
      maximumArtifactBytes: domain.MAX_PUBLIC_CONTENT_BUNDLE_BYTES,
    };
  } finally {
    await vite.close();
  }
};

const main = async () => {
  if (process.env.CONFIRM_CONTENT_EXPORT !== 'ACKARACA_PUBLIC_CONTENT') {
    throw new Error('CONFIRM_CONTENT_EXPORT must equal ACKARACA_PUBLIC_CONTENT.');
  }

  const db = getFirestore(createAdminApp());
  const [settingsSnapshot, projectSnapshot, journalSnapshot] = await Promise.all([
    db.doc('siteSettings/main').get(),
    db.collection('projects').where('status', '==', 'published').get(),
    db.collection('journal').where('status', '==', 'published').get(),
  ]);

  if (!settingsSnapshot.exists) throw new Error('siteSettings/main is required for a production content export.');
  if (projectSnapshot.empty) throw new Error('At least one published project is required for a production content export.');

  const byOrder = (left, right) => (
    (left.order ?? 100) - (right.order ?? 100) || left.slug.localeCompare(right.slug)
  );
  const byPublicationDate = (left, right) => (
    String(right.publishedAt ?? '').localeCompare(String(left.publishedAt ?? ''))
    || left.slug.localeCompare(right.slug)
  );
  const rawSnapshot = {
    settings: stripSystemFields(settingsSnapshot.data()),
    projects: projectSnapshot.docs.map((item) => documentContent(item, 'projects')).sort(byOrder),
    journal: journalSnapshot.docs
      .map((item) => documentContent(item, 'journal'))
      .sort(byPublicationDate),
  };
  const validated = await validateSnapshot(rawSnapshot);
  const snapshot = validated.snapshot;

  const destination = path.join(repositoryRoot, 'src', 'data', 'generated-content.json');
  const temporary = `${destination}.next`;
  const artifact = `${JSON.stringify(sortObjectKeys(snapshot), null, 2)}\n`;
  const artifactBytes = Buffer.byteLength(artifact, 'utf8');
  if (artifactBytes > validated.maximumArtifactBytes) {
    throw new Error(`Generated content artifact exceeds the ${validated.maximumArtifactBytes}-byte delivery budget.`);
  }
  fs.writeFileSync(temporary, artifact, {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.renameSync(temporary, destination);
  console.log(`Exported ${snapshot.projects.length} public projects and ${snapshot.journal.length} public entries.`);
};

main().catch((error) => {
  console.error('Public content export failed:', error.message);
  process.exitCode = 1;
});
