import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applicationDefault,
  cert,
  deleteApp,
  initializeApp
} from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  LEGACY_COLLISION_TARGETS,
  assertLegacyCollisionConfirmations,
  createCanonicalBootstrapTargets,
  createLegacyCollisionPlan,
  hashCanonicalFirestoreValue,
  legacyCollisionConfirmation,
  legacyCollisionReviewConfirmation,
  reviewableFirestoreValue
} from './legacy-content-migration.js';
import { parsePinnedCanonicalContentArtifact } from './canonical-content.js';
import { writePrivateMigrationSummary } from './private-summary.js';
import { validateSeedManifest } from './validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.join(__dirname, '..');
const canonicalContentPath = path.join(__dirname, 'data', 'canonical-content.json');
const seedManifestPath = path.join(__dirname, 'data', 'content-seeds.json');
const summaryDirectory = path.join(repositoryRoot, '.legacy-migration');
const BACKUP_COLLECTION = 'migrationBackups';
const BACKUP_PREFIX = 'canonical-content-bootstrap-v2-';
const MAX_REVIEW_PAYLOAD_BYTES = 800 * 1024;

const parseMode = (argumentsList) => {
  if (argumentsList.length === 0 || (
    argumentsList.length === 1 && argumentsList[0] === '--dry-run'
  )) return 'dry-run';
  if (argumentsList.length === 1 && argumentsList[0] === '--apply') return 'apply';
  throw new Error('Usage: migrate-legacy-content.mjs [--dry-run|--apply].');
};

const requireProjectId = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  // Reuse the exact confirmation builder as the single project-ID parser.
  legacyCollisionConfirmation(projectId || '', '0'.repeat(64));
  return projectId;
};

const loadServiceAccount = () => {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) return JSON.parse(inlineAccount);
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (accountPath) return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  return null;
};

const createAdminApp = (projectId) => {
  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) return initializeApp({ projectId });
  return initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId
  });
};

const stripSystemFields = (data) => {
  const { schemaVersion, createdAt, updatedAt, deletedAt, ...content } = data;
  void schemaVersion;
  void createdAt;
  void updatedAt;
  void deletedAt;
  return content;
};

const isTimestamp = (value) => (
  value !== null
  && typeof value === 'object'
  && typeof value.toDate === 'function'
  && Number.isFinite(value.seconds)
  && Number.isInteger(value.nanoseconds)
);

const createV2Validator = (domain) => (target, data) => {
  if (
    !Number.isInteger(data.schemaVersion)
    || data.schemaVersion < 2
    || data.schemaVersion > 10
    || !isTimestamp(data.updatedAt)
  ) return false;
  if ('createdAt' in data && !isTimestamp(data.createdAt)) return false;
  if (target.kind === 'settings') {
    if ('deletedAt' in data) return false;
    return domain.safeParseSiteSettings(stripSystemFields(data)).success;
  }
  if (!isTimestamp(data.createdAt)) return false;
  if ('deletedAt' in data && data.deletedAt !== null && !isTimestamp(data.deletedAt)) return false;
  const parsed = target.kind === 'project'
    ? domain.safeParsePortfolioProject(stripSystemFields(data))
    : domain.safeParseJournalEntry(stripSystemFields(data));
  return parsed.success && parsed.data.slug === target.slug;
};

const loadCanonicalReplacements = async () => {
  if (!fs.existsSync(canonicalContentPath)) {
    throw new Error(`Canonical content source is missing: ${canonicalContentPath}.`);
  }
  const rawCanonical = parsePinnedCanonicalContentArtifact(fs.readFileSync(canonicalContentPath));
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: repositoryRoot,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true }
  });
  try {
    const domain = await vite.ssrLoadModule('/src/domain/content.ts');
    const bundle = domain.parseContentBundle(rawCanonical);
    const replacementSource = 'bundled-fallback';
    const privateRecord = [
      ...bundle.projects.map((item) => `projects/${item.slug}:${item.status}`),
      ...bundle.journal.map((item) => `journal/${item.slug}:${item.status}`)
    ].find((item) => !item.endsWith(':published'));
    if (privateRecord) {
      throw new Error(`Canonical public replacement source contains a private record: ${privateRecord}.`);
    }

    const targets = createCanonicalBootstrapTargets(bundle);
    const replacements = { 'siteSettings/main': domain.parseSiteSettings(bundle.settings) };
    for (const project of bundle.projects) {
      replacements[`projects/${project.slug}`] = domain.parsePortfolioProject(project);
    }
    for (const entry of bundle.journal) {
      replacements[`journal/${entry.slug}`] = domain.parseJournalEntry(entry);
    }
    return {
      domain,
      targets,
      replacements,
      replacementSource
    };
  } finally {
    await vite.close();
  }
};

const loadRecognizedLegacyProjectIds = () => {
  if (!fs.existsSync(seedManifestPath)) {
    throw new Error(`Legacy seed fixture is missing: ${seedManifestPath}.`);
  }
  const entries = validateSeedManifest(JSON.parse(fs.readFileSync(seedManifestPath, 'utf8')));
  const projectIds = new Set(entries.map(({ id }) => id));
  for (const { kind, slug } of LEGACY_COLLISION_TARGETS) {
    if (kind === 'project' && !projectIds.has(slug)) {
      throw new Error(`Validated legacy fixture is missing the fixed ${slug} collision.`);
    }
  }
  return projectIds;
};

const readVersion = (snapshot) => snapshot.updateTime?.toDate?.().toISOString() || null;

const snapshotsToDocuments = (snapshots) => Object.fromEntries(snapshots.map((snapshot) => [
  snapshot.ref.path,
  snapshot.exists
    ? { exists: true, data: snapshot.data(), readVersion: readVersion(snapshot) }
    : { exists: false, readVersion: null }
]));

const sortJsonValue = (value) => {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJsonValue(value[key])]));
};

const boundedReviewPayload = (value) => {
  const reviewable = reviewableFirestoreValue(value);
  const bytes = Buffer.byteLength(JSON.stringify(reviewable), 'utf8');
  if (bytes <= MAX_REVIEW_PAYLOAD_BYTES) return reviewable;
  return {
    $reviewOmitted: true,
    reason: `payload-exceeds-${MAX_REVIEW_PAYLOAD_BYTES}-byte-review-limit`,
    byteLength: bytes,
    sha256: hashCanonicalFirestoreValue(value)
  };
};

const writeLocalSummary = ({
  projectId,
  plan,
  confirmation,
  reviewConfirmation,
  documents,
  replacements
}) => {
  const reviewTargets = plan.targets.map((target) => ({
    ...target,
    sourceData: documents[target.path].exists
      ? boundedReviewPayload(documents[target.path].data)
      : null,
    replacementData: boundedReviewPayload(replacements[target.path])
  }));
  const summary = sortJsonValue({
    projectId,
    confirmation,
    reviewConfirmation,
    plan: { ...plan, targets: reviewTargets }
  });
  const serialized = `${JSON.stringify(summary, null, 2)}\n`;
  const destination = path.join(
    summaryDirectory,
    `canonical-content-bootstrap-${projectId}-${plan.summaryHash}.json`
  );
  return writePrivateMigrationSummary({
    directory: summaryDirectory,
    destination,
    serialized
  });
};

const printPlan = ({
  projectId,
  plan,
  confirmation,
  reviewConfirmation,
  summaryPath
}) => {
  console.log(`Canonical content bootstrap plan for ${projectId}: ${plan.summaryHash}`);
  console.log(`Canonical replacement source: ${plan.replacementSource}`);
  for (const target of plan.targets) {
    console.log(`${target.path}: ${target.classification} -> ${target.action}`);
  }
  console.log(`Local canonical summary: ${summaryPath}`);
  if (plan.blocked) {
    console.log('Apply is blocked because at least one exact target has an unexpected shape.');
  } else if (plan.mutationCount === 0) {
    console.log('No canonical content document needs creation or legacy replacement.');
  } else {
    console.log('Review every sourceData/replacementData pair in the private summary before apply.');
    console.log(`Apply confirmation: CONFIRM_LEGACY_CONTENT_MIGRATION='${confirmation}'`);
    console.log(`Review confirmation: CONFIRM_LEGACY_CONTENT_REVIEWED='${reviewConfirmation}'`);
  }
};

const replacementWrite = ({ replacement, currentData }) => ({
  ...replacement,
  schemaVersion: 2,
  createdAt: isTimestamp(currentData?.createdAt)
    ? currentData.createdAt
    : FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
});

const runApplyTransaction = async ({
  db,
  projectId,
  plan,
  targets,
  replacements,
  replacementSource,
  isValidV2,
  legacyProjectIds
}) => {
  const refs = targets.map(({ path: targetPath }) => db.doc(targetPath));
  const manifestRef = db.doc(`${BACKUP_COLLECTION}/${BACKUP_PREFIX}${plan.summaryHash}`);
  await db.runTransaction(async (transaction) => {
    const liveSnapshots = await transaction.getAll(...refs);
    const liveDocuments = snapshotsToDocuments(liveSnapshots);
    const livePlan = createLegacyCollisionPlan({
      targets,
      documents: liveDocuments,
      replacements,
      replacementSource,
      isValidV2,
      legacyProjectIds,
      createMissing: true
    });
    if (livePlan.summaryHash !== plan.summaryHash) {
      throw new Error('Exact target data changed after dry-run; generate and confirm a new plan.');
    }
    if (livePlan.blocked) {
      throw new Error('An exact target has an unexpected shape; apply remains fail-closed.');
    }
    if (livePlan.mutationCount < 1) {
      throw new Error('No canonical content creation or recognized legacy replacement remains.');
    }

    transaction.create(manifestRef, {
      schemaVersion: 1,
      migration: 'canonical-content-bootstrap-v2',
      projectId,
      summaryHash: livePlan.summaryHash,
      replacementSource,
      paths: targets.map(({ path: targetPath }) => targetPath),
      targets: livePlan.targets,
      status: 'complete',
      createdAt: FieldValue.serverTimestamp(),
      completedAt: FieldValue.serverTimestamp()
    });

    for (const target of targets) {
      const document = liveDocuments[target.path];
      const backupRef = manifestRef.collection('documents').doc(target.backupId);
      transaction.create(backupRef, {
        schemaVersion: 1,
        sourcePath: target.path,
        exists: document.exists,
        sourceHash: livePlan.targets.find(({ path: targetPath }) => targetPath === target.path).sourceHash,
        sourceReadVersion: document.readVersion,
        ...(document.exists ? { sourceData: document.data } : {}),
        createdAt: FieldValue.serverTimestamp()
      });
    }

    for (const targetPlan of livePlan.targets.filter(({ action }) => (
      ['create', 'replace'].includes(action)
    ))) {
      const target = targets.find(({ path: targetPath }) => targetPath === targetPlan.path);
      transaction.set(
        db.doc(target.path),
        replacementWrite({
          replacement: replacements[target.path],
          currentData: liveDocuments[target.path].data
        })
      );
    }
  });
  return manifestRef;
};

const main = async () => {
  const mode = parseMode(process.argv.slice(2));
  const projectId = requireProjectId();
  const legacyProjectIds = loadRecognizedLegacyProjectIds();
  const canonical = await loadCanonicalReplacements();
  const isValidV2 = createV2Validator(canonical.domain);
  const app = createAdminApp(projectId);
  try {
    const db = getFirestore(app);
    const refs = canonical.targets.map(({ path: targetPath }) => db.doc(targetPath));
    const snapshots = await db.getAll(...refs);
    const documents = snapshotsToDocuments(snapshots);
    const plan = createLegacyCollisionPlan({
      targets: canonical.targets,
      documents,
      replacements: canonical.replacements,
      replacementSource: canonical.replacementSource,
      isValidV2,
      legacyProjectIds,
      createMissing: true
    });
    const targetPaths = plan.targets.map(({ path: targetPath }) => targetPath);
    const confirmation = legacyCollisionConfirmation(projectId, plan.summaryHash, targetPaths);
    const reviewConfirmation = legacyCollisionReviewConfirmation(
      projectId,
      plan.summaryHash,
      targetPaths
    );
    const summaryPath = writeLocalSummary({
      projectId,
      plan,
      confirmation,
      reviewConfirmation,
      documents,
      replacements: canonical.replacements
    });
    printPlan({ projectId, plan, confirmation, reviewConfirmation, summaryPath });

    if (mode === 'dry-run') return;
    if (plan.blocked) {
      throw new Error('Refusing apply: an exact target contains unrecognized data.');
    }
    if (plan.mutationCount === 0) {
      console.log('Apply completed without writes because the canonical data plane is already valid.');
      return;
    }
    assertLegacyCollisionConfirmations({
      projectId,
      summaryHash: plan.summaryHash,
      targetPaths,
      migrationConfirmation: process.env.CONFIRM_LEGACY_CONTENT_MIGRATION,
      reviewConfirmation: process.env.CONFIRM_LEGACY_CONTENT_REVIEWED
    });

    const manifestRef = await runApplyTransaction({
      db,
      projectId,
      plan,
      targets: canonical.targets,
      replacements: canonical.replacements,
      replacementSource: canonical.replacementSource,
      isValidV2,
      legacyProjectIds
    });
    const [verificationSnapshots, backupManifest, backupDocuments] = await Promise.all([
      db.getAll(...refs),
      manifestRef.get(),
      manifestRef.collection('documents').get()
    ]);
    const invalidCanonical = verificationSnapshots.find((snapshot) => {
      const target = canonical.targets.find(({ path: targetPath }) => (
        targetPath === snapshot.ref.path
      ));
      return !snapshot.exists || !isValidV2(target, snapshot.data());
    });
    const backupPaths = new Set(backupDocuments.docs.map((snapshot) => (
      snapshot.data().sourcePath
    )));
    if (
      invalidCanonical
      || !backupManifest.exists
      || backupManifest.data().summaryHash !== plan.summaryHash
      || backupDocuments.size !== canonical.targets.length
      || canonical.targets.some(({ path: targetPath }) => !backupPaths.has(targetPath))
    ) {
      throw new Error('Migration committed, but post-commit verification failed; inspect the private backup.');
    }
    console.log(`Migration applied and verified. Private backup: ${manifestRef.path}`);
  } finally {
    await deleteApp(app);
  }
};

main().catch((error) => {
  console.error('Legacy content migration failed:', error.message);
  process.exitCode = 1;
});
