import crypto from 'node:crypto';

const MAX_CONTENT_DOCUMENT_BYTES = 750 * 1024;
const MAX_PUBLIC_CONTENT_BUNDLE_BYTES = 2 * 1024 * 1024;
const MAX_COLLECTION_ITEMS = 500;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const SYSTEM_FIELDS = new Set(['schemaVersion', 'createdAt', 'updatedAt', 'deletedAt']);

// This digest deliberately pins the emergency/bootstrap source to a reviewed
// revision. Updating the fallback requires updating the artifact, this digest,
// and passing the root exact-equality build check together.
export const CANONICAL_CONTENT_ARTIFACT_SHA256 =
  'c64ee8bc470e8156b86825015391c431a7c3ab60aa0e62b1da5aafa3053f5ed1';

export const parsePinnedCanonicalContentArtifact = (source) => {
  if (typeof source !== 'string' && !Buffer.isBuffer(source)) {
    throw new Error('Canonical content artifact source must be text or bytes.');
  }
  const digest = crypto.createHash('sha256').update(source).digest('hex');
  if (digest !== CANONICAL_CONTENT_ARTIFACT_SHA256) {
    throw new Error(
      'Canonical content artifact does not match the reviewed revision; '
      + 'run the root exact-equality verification before changing its pinned digest.'
    );
  }
  return JSON.parse(source.toString('utf8'));
};

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const jsonBytes = (value, field) => {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new Error(`${field} is not JSON serializable.`);
  }
  if (typeof serialized !== 'string') throw new Error(`${field} is not JSON serializable.`);
  return Buffer.byteLength(serialized, 'utf8');
};

const assertNoSystemFields = (value, field) => {
  const systemField = Object.keys(value).find((key) => SYSTEM_FIELDS.has(key));
  if (systemField) throw new Error(`${field}.${systemField} is server-owned.`);
};

const validateCollection = ({ values, collection, kind }) => {
  if (!Array.isArray(values) || values.length > MAX_COLLECTION_ITEMS) {
    throw new Error(`${collection} must be a bounded array.`);
  }
  if (kind === 'project' && values.length === 0) {
    throw new Error('Canonical fallback must contain at least one project.');
  }
  const ids = new Set();
  return values.map((value, index) => {
    const field = `${collection}[${index}]`;
    if (!isPlainObject(value)) throw new Error(`${field} must be an object.`);
    assertNoSystemFields(value, field);
    if (typeof value.slug !== 'string' || !SLUG.test(value.slug)) {
      throw new Error(`${field}.slug is invalid.`);
    }
    if (value.status !== 'published') {
      throw new Error(`${field} must be public fallback content.`);
    }
    if (ids.has(value.slug)) throw new Error(`${collection} contains a duplicate slug.`);
    ids.add(value.slug);
    const data = { ...value, schemaVersion: 2 };
    if (jsonBytes(data, field) > MAX_CONTENT_DOCUMENT_BYTES) {
      throw new Error(`${field} exceeds the document budget.`);
    }
    return {
      collection,
      kind,
      id: value.slug,
      path: `${collection}/${value.slug}`,
      data
    };
  });
};

export const validateCanonicalContentArtifact = (artifact) => {
  if (!isPlainObject(artifact)) throw new Error('Canonical content must be an object.');
  const keys = Object.keys(artifact);
  if (
    keys.length !== 3
    || !['settings', 'projects', 'journal'].every((key) => keys.includes(key))
  ) throw new Error('Canonical content must have exact settings, projects, and journal keys.');
  if (jsonBytes(artifact, 'canonical content') > MAX_PUBLIC_CONTENT_BUNDLE_BYTES) {
    throw new Error('Canonical content exceeds the bundle budget.');
  }
  if (!isPlainObject(artifact.settings)) throw new Error('settings must be an object.');
  assertNoSystemFields(artifact.settings, 'settings');
  const settings = {
    collection: 'siteSettings',
    kind: 'settings',
    id: 'main',
    path: 'siteSettings/main',
    data: { ...artifact.settings, schemaVersion: 2 }
  };
  if (jsonBytes(settings.data, 'settings') > MAX_CONTENT_DOCUMENT_BYTES) {
    throw new Error('settings exceeds the document budget.');
  }
  const projects = validateCollection({
    values: artifact.projects,
    collection: 'projects',
    kind: 'project'
  }).sort((left, right) => left.path.localeCompare(right.path));
  const journal = validateCollection({
    values: artifact.journal,
    collection: 'journal',
    kind: 'journal'
  }).sort((left, right) => left.path.localeCompare(right.path));
  return [settings, ...journal, ...projects];
};
