import crypto from 'node:crypto';
import { stableSerialize } from './validation.js';

export const LEGACY_COLLISION_TARGETS = Object.freeze([
  Object.freeze({
    path: 'siteSettings/main',
    backupId: 'site-settings--main',
    kind: 'settings'
  }),
  Object.freeze({
    path: 'projects/draw-or-die',
    backupId: 'projects--draw-or-die',
    kind: 'project',
    slug: 'draw-or-die'
  }),
  Object.freeze({
    path: 'projects/hocapuanla',
    backupId: 'projects--hocapuanla',
    kind: 'project',
    slug: 'hocapuanla'
  })
]);

const LEGACY_COLLISION_PATHS = new Set(LEGACY_COLLISION_TARGETS.map(({ path }) => path));
const CONTENT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const LEGACY_SETTINGS_FIELDS = new Set([
  'footerTagline',
  'footerSubline',
  'footerCopyrightPrefix',
  'footerCopyrightText',
  'footerCopyrightSuffix',
  'homeHeroSubtitle',
  'siteWebsiteUrl'
]);
const LEGACY_PROJECT_REQUIRED_FIELDS = new Set([
  'id',
  'title',
  'description',
  'category',
  'images',
  'technologies',
  'year',
  'semester',
  'featured',
  'order',
  'status'
]);
const LEGACY_PROJECT_OPTIONAL_STRING_LIMITS = new Map([
  ['location', 200],
  ['link', 2048],
  ['linkText', 120],
  ['websiteUrl', 2048],
  ['websiteLabel', 120],
  ['githubUrl', 2048]
]);
const LEGACY_PROJECT_PASSTHROUGH_VALUES = new Map([
  ['source', 'admin'],
  ['kind', 'project'],
  ['originCollection', 'projects']
]);
const LEGACY_CHANGELOG_FIELDS = new Set(['version', 'date', 'title', 'description']);
const LEGACY_SYSTEM_FIELDS = new Set(['createdAt', 'updatedAt']);

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const isTimestampLike = (value) => (
  value instanceof Date
  || (
    value !== null
    && typeof value === 'object'
    && typeof value.toDate === 'function'
    && Number.isFinite(value.seconds)
    && Number.isInteger(value.nanoseconds)
  )
);

const timestampParts = (value) => {
  if (value instanceof Date) {
    const milliseconds = value.getTime();
    if (!Number.isFinite(milliseconds)) throw new Error('Invalid Date cannot be canonicalized.');
    const seconds = Math.floor(milliseconds / 1000);
    return [seconds, (milliseconds - (seconds * 1000)) * 1_000_000];
  }
  return [value.seconds, value.nanoseconds];
};

/**
 * Converts Firestore-supported values into an explicitly typed, stable tree.
 * The type tags prevent otherwise ambiguous hashes such as a Timestamp and a
 * user-authored map containing the same numeric properties.
 */
export const canonicalizeFirestoreValue = (value, field = 'value') => {
  if (value === null) return ['null'];
  if (typeof value === 'string') return ['string', value];
  if (typeof value === 'boolean') return ['boolean', value];
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return ['number', 'NaN'];
    if (value === Infinity) return ['number', 'Infinity'];
    if (value === -Infinity) return ['number', '-Infinity'];
    return ['number', Object.is(value, -0) ? '-0' : String(value)];
  }
  if (Array.isArray(value)) {
    return ['array', value.map((item, index) => canonicalizeFirestoreValue(
      item,
      `${field}[${index}]`
    ))];
  }
  if (isTimestampLike(value)) {
    const [seconds, nanoseconds] = timestampParts(value);
    return ['timestamp', String(seconds), String(nanoseconds)];
  }
  if (value instanceof Uint8Array) {
    return ['bytes', Buffer.from(value).toString('base64')];
  }
  if (
    value !== null
    && typeof value === 'object'
    && value.constructor?.name === 'GeoPoint'
    && Number.isFinite(value.latitude)
    && Number.isFinite(value.longitude)
  ) {
    return ['geo-point', String(value.latitude), String(value.longitude)];
  }
  if (
    value !== null
    && typeof value === 'object'
    && value.constructor?.name === 'DocumentReference'
    && typeof value.path === 'string'
  ) {
    return ['document-reference', value.path];
  }
  if (isPlainObject(value)) {
    return [
      'map',
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeFirestoreValue(value[key], `${field}.${key}`)])
    ];
  }
  throw new Error(`${field} contains an unsupported value type.`);
};

export const hashCanonicalFirestoreValue = (value) => crypto
  .createHash('sha256')
  .update(stableSerialize(canonicalizeFirestoreValue(value)))
  .digest('hex');

export const reviewableFirestoreValue = (value, field = 'value') => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : { $firestoreType: 'number', value: String(value) };
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => reviewableFirestoreValue(item, `${field}[${index}]`));
  }
  if (isTimestampLike(value)) {
    const [seconds, nanoseconds] = timestampParts(value);
    return {
      $firestoreType: 'timestamp',
      iso: (value instanceof Date ? value : value.toDate()).toISOString(),
      seconds,
      nanoseconds
    };
  }
  if (value instanceof Uint8Array) {
    return { $firestoreType: 'bytes', base64: Buffer.from(value).toString('base64') };
  }
  if (
    value !== null
    && typeof value === 'object'
    && value.constructor?.name === 'GeoPoint'
    && Number.isFinite(value.latitude)
    && Number.isFinite(value.longitude)
  ) {
    return {
      $firestoreType: 'geo-point',
      latitude: value.latitude,
      longitude: value.longitude
    };
  }
  if (
    value !== null
    && typeof value === 'object'
    && value.constructor?.name === 'DocumentReference'
    && typeof value.path === 'string'
  ) {
    return { $firestoreType: 'document-reference', path: value.path };
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [
      key,
      reviewableFirestoreValue(value[key], `${field}.${key}`)
    ]));
  }
  throw new Error(`${field} contains an unsupported value type.`);
};

const hasOnlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.has(key));
const hasAllKeys = (value, required) => [...required].every((key) => key in value);
const isStringArray = (value) => Array.isArray(value)
  && value.every((item) => typeof item === 'string');
const isBoundedString = (value, maximum) => typeof value === 'string' && value.length <= maximum;

const isRecognizedLegacyChangelog = (value) => Array.isArray(value)
  && value.length <= 100
  && value.every((entry) => (
    isPlainObject(entry)
    && hasAllKeys(entry, LEGACY_CHANGELOG_FIELDS)
    && hasOnlyKeys(entry, LEGACY_CHANGELOG_FIELDS)
    && isBoundedString(entry.version, 64)
    && isBoundedString(entry.date, 40)
    && isBoundedString(entry.title, 200)
    && isBoundedString(entry.description, 5000)
  ));

const hasValidLegacySystemFields = (data) => [...LEGACY_SYSTEM_FIELDS].every((field) => (
  !(field in data) || isTimestampLike(data[field])
));

export const isRecognizedLegacySettings = (data) => {
  if (!isPlainObject(data)) return false;
  const allowed = new Set([...LEGACY_SETTINGS_FIELDS, ...LEGACY_SYSTEM_FIELDS]);
  return hasAllKeys(data, LEGACY_SETTINGS_FIELDS)
    && hasOnlyKeys(data, allowed)
    && [...LEGACY_SETTINGS_FIELDS].every((field) => typeof data[field] === 'string')
    && hasValidLegacySystemFields(data);
};

export const isRecognizedLegacyProject = (data, expectedSlug) => {
  if (!isPlainObject(data)) return false;
  const allowed = new Set([
    ...LEGACY_PROJECT_REQUIRED_FIELDS,
    ...LEGACY_PROJECT_OPTIONAL_STRING_LIMITS.keys(),
    ...LEGACY_PROJECT_PASSTHROUGH_VALUES.keys(),
    'changelogEntries',
    ...LEGACY_SYSTEM_FIELDS
  ]);
  if (
    !hasAllKeys(data, LEGACY_PROJECT_REQUIRED_FIELDS)
    || !hasOnlyKeys(data, allowed)
    || data.id !== expectedSlug
    || !isBoundedString(data.title, 180)
    || !isBoundedString(data.description, 10_000)
    || !isBoundedString(data.category, 64)
    || !isStringArray(data.images)
    || data.images.length > 30
    || data.images.some((item) => item.length > 2048)
    || !isStringArray(data.technologies)
    || data.technologies.length > 50
    || data.technologies.some((item) => item.length > 100)
    || !isBoundedString(data.year, 20)
    || !isBoundedString(data.semester, 80)
    || typeof data.featured !== 'boolean'
    || !Number.isInteger(data.order)
    || data.order < 0
    || data.order > 10_000
    || !['active', 'archived'].includes(data.status)
    || !hasValidLegacySystemFields(data)
  ) return false;
  return [...LEGACY_PROJECT_OPTIONAL_STRING_LIMITS].every(([field, maximum]) => (
    !(field in data) || isBoundedString(data[field], maximum)
  )) && [...LEGACY_PROJECT_PASSTHROUGH_VALUES].every(([field, expected]) => (
    !(field in data) || data[field] === expected
  )) && (
    !('changelogEntries' in data) || isRecognizedLegacyChangelog(data.changelogEntries)
  );
};

export const createCanonicalBootstrapTargets = ({ projects, journal }) => {
  if (!Array.isArray(projects) || !Array.isArray(journal)) {
    throw new Error('Canonical projects and journal must be arrays.');
  }
  const targets = [
    { path: 'siteSettings/main', backupId: 'site-settings--main', kind: 'settings' },
    ...projects.map(({ slug }) => ({
      path: `projects/${slug}`,
      backupId: `projects--${slug}`,
      kind: 'project',
      slug
    })),
    ...journal.map(({ slug }) => ({
      path: `journal/${slug}`,
      backupId: `journal--${slug}`,
      kind: 'journal',
      slug
    }))
  ];
  const byPath = (left, right) => left.path.localeCompare(right.path);
  return [targets[0], ...targets.slice(1).sort(byPath)];
};

const assertCanonicalTargets = (targets) => {
  if (!Array.isArray(targets) || targets.length < LEGACY_COLLISION_TARGETS.length || targets.length > 501) {
    throw new Error('targets must be a bounded canonical content target list.');
  }
  const paths = new Set();
  for (const target of targets) {
    if (!isPlainObject(target) || typeof target.path !== 'string' || paths.has(target.path)) {
      throw new Error('targets contain a malformed or duplicate path.');
    }
    paths.add(target.path);
    if (target.kind === 'settings') {
      if (target.path !== 'siteSettings/main' || target.backupId !== 'site-settings--main') {
        throw new Error('The settings bootstrap target is malformed.');
      }
      continue;
    }
    if (
      !['project', 'journal'].includes(target.kind)
      || typeof target.slug !== 'string'
      || !CONTENT_SLUG.test(target.slug)
      || target.path !== `${target.kind === 'project' ? 'projects' : 'journal'}/${target.slug}`
      || target.backupId !== `${target.kind === 'project' ? 'projects' : 'journal'}--${target.slug}`
    ) throw new Error(`The canonical target ${target.path} is malformed.`);
  }
  if ([...LEGACY_COLLISION_PATHS].some((path) => !paths.has(path))) {
    throw new Error('targets must include all three fixed legacy collision paths.');
  }
};

const assertExactTargetMap = (value, field, targets) => {
  if (!isPlainObject(value)) throw new Error(`${field} must be an exact target map.`);
  const targetPaths = new Set(targets.map(({ path }) => path));
  const keys = Object.keys(value);
  if (
    keys.length !== targetPaths.size
    || keys.some((path) => !targetPaths.has(path))
    || [...targetPaths].some((path) => !(path in value))
  ) throw new Error(`${field} must contain only the exact canonical target paths.`);
};

const classifyTarget = ({ target, document, isValidV2, legacyProjectIds }) => {
  if (!isPlainObject(document) || typeof document.exists !== 'boolean') {
    throw new Error(`documents.${target.path} is malformed.`);
  }
  if (!document.exists) {
    if (document.data !== undefined) {
      throw new Error(`documents.${target.path} cannot have data when absent.`);
    }
    return 'absent';
  }
  if (!isPlainObject(document.data)) {
    return 'unexpected';
  }
  if (isValidV2(target, document.data)) return 'already-valid-v2';
  if (!LEGACY_COLLISION_PATHS.has(target.path)) return 'unexpected';
  if (target.kind === 'settings') {
    return isRecognizedLegacySettings(document.data) ? 'recognized-legacy' : 'unexpected';
  }
  if (!legacyProjectIds.has(target.slug)) return 'unexpected';
  return isRecognizedLegacyProject(document.data, target.slug)
    ? 'recognized-legacy'
    : 'unexpected';
};

export const createLegacyCollisionPlan = ({
  targets = LEGACY_COLLISION_TARGETS,
  documents,
  replacements,
  replacementSource,
  isValidV2,
  legacyProjectIds,
  createMissing = false
}) => {
  assertCanonicalTargets(targets);
  assertExactTargetMap(documents, 'documents', targets);
  assertExactTargetMap(replacements, 'replacements', targets);
  if (!['generated-snapshot', 'bundled-fallback'].includes(replacementSource)) {
    throw new Error('replacementSource is invalid.');
  }
  if (typeof isValidV2 !== 'function') throw new Error('isValidV2 is required.');
  if (!(legacyProjectIds instanceof Set)) throw new Error('legacyProjectIds must be a Set.');

  const targetPlans = targets.map((target) => {
    const document = documents[target.path];
    const classification = classifyTarget({
      target,
      document,
      isValidV2,
      legacyProjectIds
    });
    const sourceHash = hashCanonicalFirestoreValue({
      exists: document.exists,
      ...(document.exists ? { data: document.data } : {}),
      readVersion: document.readVersion ?? null
    });
    const replacementHash = hashCanonicalFirestoreValue(replacements[target.path]);
    return {
      path: target.path,
      backupId: target.backupId,
      classification,
      action: classification === 'recognized-legacy'
        ? 'replace'
        : classification === 'absent' && createMissing ? 'create'
        : classification === 'unexpected' ? 'block' : 'preserve',
      sourceHash,
      replacementHash,
      readVersion: document.readVersion ?? null
    };
  });
  const summary = {
    schemaVersion: 1,
    replacementSource,
    targets: targetPlans
  };
  const summaryHash = hashCanonicalFirestoreValue(summary);
  return {
    ...summary,
    summaryHash,
    blocked: targetPlans.some(({ action }) => action === 'block'),
    mutationCount: targetPlans.filter(({ action }) => ['create', 'replace'].includes(action)).length
  };
};

export const legacyCollisionConfirmation = (
  projectId,
  summaryHash,
  targetPaths = LEGACY_COLLISION_TARGETS.map(({ path }) => path)
) => {
  if (typeof projectId !== 'string' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u.test(projectId)) {
    throw new Error('The Firebase project ID is invalid.');
  }
  if (typeof summaryHash !== 'string' || !/^[a-f0-9]{64}$/u.test(summaryHash)) {
    throw new Error('The migration summary hash is invalid.');
  }
  if (
    !Array.isArray(targetPaths)
    || targetPaths.length < LEGACY_COLLISION_TARGETS.length
    || targetPaths.length > 501
    || new Set(targetPaths).size !== targetPaths.length
    || targetPaths.some((path) => !(
      path === 'siteSettings/main'
      || /^(?:projects|journal)\/[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(path)
    ))
    || [...LEGACY_COLLISION_PATHS].some((path) => !targetPaths.includes(path))
  ) throw new Error('The migration target path list is invalid.');
  return `replace:${projectId}:${summaryHash}:${targetPaths.join(',')}`;
};

export const legacyCollisionReviewConfirmation = (projectId, summaryHash, targetPaths) => {
  // The primary builder owns the exact shared project/hash validation.
  legacyCollisionConfirmation(projectId, summaryHash, targetPaths);
  return `reviewed:${projectId}:${summaryHash}`;
};

export const assertLegacyCollisionConfirmations = ({
  projectId,
  summaryHash,
  targetPaths,
  migrationConfirmation,
  reviewConfirmation
}) => {
  const expectedMigration = legacyCollisionConfirmation(projectId, summaryHash, targetPaths);
  const expectedReview = legacyCollisionReviewConfirmation(projectId, summaryHash, targetPaths);
  if (migrationConfirmation !== expectedMigration) {
    throw new Error('CONFIRM_LEGACY_CONTENT_MIGRATION does not match the exact current plan.');
  }
  if (reviewConfirmation !== expectedReview) {
    throw new Error('CONFIRM_LEGACY_CONTENT_REVIEWED does not prove review of the exact current plan.');
  }
  return { migrationConfirmation: expectedMigration, reviewConfirmation: expectedReview };
};
