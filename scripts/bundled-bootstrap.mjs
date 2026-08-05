import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPOSITORY_ROOT = path.resolve(moduleDirectory, '..');
export const GENERATED_CONTENT_PATH = path.join(
  DEFAULT_REPOSITORY_ROOT,
  'src',
  'data',
  'generated-content.json'
);

const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u;

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

export const sortObjectKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortObjectKeys(value[key])])
  );
};

const containsFirebaseStorageUrl = (value) => {
  if (typeof value === 'string') {
    try {
      return new URL(value).hostname.toLowerCase() === 'firebasestorage.googleapis.com';
    } catch {
      return false;
    }
  }
  if (Array.isArray(value)) return value.some(containsFirebaseStorageUrl);
  if (value && typeof value === 'object') {
    return Object.values(value).some(containsFirebaseStorageUrl);
  }
  return false;
};

export const assertPublishedBundle = (bundle) => {
  if (!Array.isArray(bundle?.projects) || bundle.projects.length === 0) {
    throw new Error('Bundled bootstrap content must contain at least one project.');
  }
  if (!Array.isArray(bundle?.journal)) {
    throw new Error('Bundled bootstrap content must contain a journal collection.');
  }

  const privateRecord = [
    ...bundle.projects.map((item) => `projects/${item.slug}:${item.status}`),
    ...bundle.journal.map((item) => `journal/${item.slug}:${item.status}`)
  ].find((item) => !item.endsWith(':published'));
  if (privateRecord) {
    throw new Error(`Bundled bootstrap content contains a private record: ${privateRecord}.`);
  }
  if (containsFirebaseStorageUrl(bundle)) {
    throw new Error(
      'Bundled bootstrap content cannot depend on Firebase Storage media before backend rules deploy.'
    );
  }
};

export const serializeBundledContent = (bundle, maximumBytes) => {
  assertPublishedBundle(bundle);
  const artifact = `${JSON.stringify(sortObjectKeys(bundle), null, 2)}\n`;
  const bytes = Buffer.byteLength(artifact, 'utf8');
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0 || bytes > maximumBytes) {
    throw new Error(`Bundled bootstrap artifact exceeds the ${maximumBytes}-byte public bundle budget.`);
  }
  return { artifact, bytes, hash: sha256(artifact) };
};

export const validateFirebaseProjectId = (projectId) => {
  if (typeof projectId !== 'string' || !PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error('FIREBASE_PROJECT_ID is not a valid Firebase project ID.');
  }
  return projectId;
};

export const bootstrapConfirmation = (projectId, hash) =>
  `bootstrap-bundled:${validateFirebaseProjectId(projectId)}:${hash}`;

export const parseBundledBootstrapMode = (rawValue) => {
  if (rawValue === undefined || rawValue === '' || rawValue === 'false') return false;
  if (rawValue === 'true') return true;
  throw new Error(
    'ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT must be exactly true, false, or empty.'
  );
};

export const createFirebaseDeployPhases = (bundledBootstrapEnabled) => {
  if (typeof bundledBootstrapEnabled !== 'boolean') {
    throw new Error('Bundled bootstrap deployment mode must be a boolean.');
  }
  if (!bundledBootstrapEnabled) {
    return [{
      failureCode: 'firebase-deploy-failed',
      targets: 'firestore:rules,firestore:indexes,storage,functions,hosting'
    }];
  }
  return [
    { failureCode: 'bootstrap-hosting-deploy-failed', targets: 'hosting' },
    {
      failureCode: 'bootstrap-backend-deploy-failed',
      targets: 'firestore:rules,firestore:indexes,storage,functions'
    }
  ];
};

export const assertBundledBootstrapRequest = ({
  rawMode,
  contentRevision,
  projectId,
  confirmation,
  plan
}) => {
  const enabled = parseBundledBootstrapMode(rawMode);
  if (!enabled) return false;
  if (contentRevision !== '0') {
    throw new Error('Bundled content bootstrap is allowed only for content revision 0.');
  }
  const expected = bootstrapConfirmation(projectId, plan.hash);
  if (confirmation !== expected) {
    throw new Error(`CONFIRM_BUNDLED_BOOTSTRAP must equal ${expected}.`);
  }
  return true;
};

export const createBundledBootstrapPlan = async ({
  projectId,
  repositoryRoot = DEFAULT_REPOSITORY_ROOT
}) => {
  validateFirebaseProjectId(projectId);
  const vite = await createServer({
    root: repositoryRoot,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true }
  });

  try {
    const domain = await vite.ssrLoadModule('/src/domain/content.ts');
    const portfolio = await vite.ssrLoadModule('/src/data/portfolio.ts');
    const bundle = domain.parseContentBundle(portfolio.fallbackContentBundle);
    const serialized = serializeBundledContent(bundle, domain.MAX_PUBLIC_CONTENT_BUNDLE_BYTES);
    return {
      ...serialized,
      projectId,
      projectCount: bundle.projects.length,
      journalCount: bundle.journal.length,
      confirmation: bootstrapConfirmation(projectId, serialized.hash)
    };
  } finally {
    await vite.close();
  }
};

const assertRegularDestination = (destination) => {
  const status = fs.lstatSync(destination);
  if (status.isSymbolicLink() || !status.isFile()) {
    throw new Error(`Refusing to replace non-regular generated content file: ${destination}.`);
  }
  return status;
};

const writeAtomicFile = ({ destination, content, finalMode, expectedCurrentHash }) => {
  const directory = path.dirname(destination);
  const temporary = path.join(
    directory,
    `.${path.basename(destination)}.${process.pid}.${crypto.randomUUID()}.tmp`
  );
  let temporaryCreated = false;

  try {
    const descriptor = fs.openSync(
      temporary,
      fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY,
      0o600
    );
    temporaryCreated = true;
    try {
      fs.writeFileSync(descriptor, content);
      fs.fsyncSync(descriptor);
    } finally {
      fs.closeSync(descriptor);
    }

    assertRegularDestination(destination);
    const currentHash = sha256(fs.readFileSync(destination));
    if (currentHash !== expectedCurrentHash) {
      throw new Error(`Refusing to replace generated content after concurrent drift: ${destination}.`);
    }
    fs.renameSync(temporary, destination);
    temporaryCreated = false;
    fs.chmodSync(destination, finalMode);

    const directoryDescriptor = fs.openSync(directory, fs.constants.O_RDONLY);
    try {
      fs.fsyncSync(directoryDescriptor);
    } finally {
      fs.closeSync(directoryDescriptor);
    }
  } finally {
    if (temporaryCreated) fs.rmSync(temporary, { force: true });
  }
};

export const installBundledBootstrap = ({
  plan,
  destination = GENERATED_CONTENT_PATH
}) => {
  const status = assertRegularDestination(destination);
  const original = fs.readFileSync(destination);
  const originalHash = sha256(original);
  if (sha256(plan.artifact) !== plan.hash) {
    throw new Error('Bundled bootstrap plan artifact does not match its SHA-256 digest.');
  }

  writeAtomicFile({
    destination,
    content: plan.artifact,
    finalMode: 0o600,
    expectedCurrentHash: originalHash
  });

  return Object.freeze({
    destination,
    installedHash: plan.hash,
    original,
    originalHash,
    originalMode: status.mode & 0o777
  });
};

export const restoreBundledBootstrap = (installation) => {
  assertRegularDestination(installation.destination);
  const currentHash = sha256(fs.readFileSync(installation.destination));
  if (currentHash !== installation.installedHash) {
    throw new Error(
      `Refusing to restore generated content because the installed file drifted: ${installation.destination}.`
    );
  }

  writeAtomicFile({
    destination: installation.destination,
    content: installation.original,
    finalMode: installation.originalMode,
    expectedCurrentHash: installation.installedHash
  });
};
