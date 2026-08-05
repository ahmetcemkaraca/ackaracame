const INQUIRY_TYPES = new Set([
  'employment',
  'architecture',
  'product',
  'collaboration',
  'speaking',
  'other'
]);
const INQUIRY_LOCALES = new Set(['tr', 'en']);
const BUDGET_BANDS = new Set(['not-specified', 'under-5k', '5k-15k', '15k-50k', 'over-50k']);
const INQUIRY_TIMELINES = new Set([
  'not-specified',
  'as-soon-as-possible',
  'one-to-three-months',
  'flexible'
]);
const CONTENT_STATES = new Set(['draft', 'published', 'archived']);

const INQUIRY_KEYS = new Set([
  'name',
  'email',
  'organization',
  'inquiryType',
  'budgetBand',
  'timeline',
  'message',
  'locale',
  'privacyConsent',
  'website'
]);

const PROJECT_KEYS = new Set([
  'id',
  'slug',
  'title',
  'description',
  'summary',
  'category',
  'images',
  'technologies',
  'year',
  'semester',
  'featured',
  'order',
  'status',
  'location',
  'websiteUrl',
  'websiteLabel',
  'githubUrl',
  'changelogEntries',
  'seo'
]);

const APPLICATION_KEYS = new Set([
  'id',
  'slug',
  'title',
  'description',
  'summary',
  'version',
  'type',
  'iconName',
  'image',
  'techStack',
  'link',
  'linkText',
  'websiteUrl',
  'websiteLabel',
  'githubUrl',
  'order',
  'status',
  'accountDeletionEnabled',
  'changelogEntries',
  'seo'
]);

const SEED_COMMAND_KEYS = new Set(['dryRun']);
const PROMOTE_MEDIA_KEYS = new Set(['stagingPath', 'entity', 'slug']);
const DELETE_PROMOTED_MEDIA_KEYS = new Set([
  'storagePath', 'entity', 'slug', 'deletionCapability'
]);
const REBUILD_REQUEST_KEYS = new Set(['reason', 'paths']);
const PAFTA_LOOKUP_KEYS = new Set(['code']);
const REBUILD_REASONS = new Set([
  'content-published',
  'content-updated',
  'settings-updated',
  'manual'
]);
const AUDIT_KEYS = new Set(['action', 'entity', 'documentId', 'changedFields']);
const AUDIT_ACTIONS = new Set([
  'create',
  'update',
  'delete',
  'publish',
  'archive',
  'restore',
  'settings-update',
  'inquiry-update',
  'media-upload'
]);
const AUDIT_ENTITIES = new Set(['project', 'journal', 'site-settings', 'inquiry', 'media']);
// eslint-disable-next-line no-control-regex -- These are the exact ASCII/C1 and bidi controls rejected at trust boundaries.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
const DOCUMENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
const AUDIT_DOCUMENT_ID = /^[a-zA-Z0-9][a-zA-Z0-9_./-]{0,255}$/u;
const AUDIT_FIELD = /^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/u;
const STAGING_MEDIA_PATH = /^admin-media\/([a-zA-Z0-9_-]{1,128})\/([a-zA-Z0-9_-]{1,128})\.(jpg|jpeg|png|webp|avif)$/u;
const PROMOTED_MEDIA_PATH = /^media\/(projects|journal)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-zA-Z0-9_-]{1,128})\.(jpg|jpeg|png|webp|avif)$/u;
const MEDIA_DELETION_CAPABILITY = /^[a-zA-Z0-9_-]{43}$/u;
const REBUILD_CONTENT_PATH = /^(?:(?:projects|journal)\/[a-z0-9]+(?:-[a-z0-9]+)*|siteSettings\/main)$/u;
const LEGACY_PAFTA_CODE = /^pafta-[0-9]{13}-[a-z0-9]{9}$/u;
// eslint-disable-next-line no-control-regex -- Sanitization intentionally strips the same explicit control ranges.
const PUBLIC_TEXT_UNSAFE_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu;

export const isAllowedAdminAccountEmail = (configuredEmail, candidateEmail) => {
  if (typeof configuredEmail !== 'string' || typeof candidateEmail !== 'string') return false;
  const expected = configuredEmail.trim().toLowerCase();
  const candidate = candidateEmail.trim().toLowerCase();
  return EMAIL.test(expected)
    && !CONTROL_CHARACTERS.test(expected)
    && !CONTROL_CHARACTERS.test(candidate)
    && candidate === expected;
};

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const isPlainObject = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const assertPlainObject = (value, field) => {
  if (!isPlainObject(value)) {
    throw new ValidationError(`${field} must be an object.`, field);
  }
};

const assertAllowedKeys = (value, allowedKeys, field) => {
  const unknownKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unknownKey) {
    throw new ValidationError(`${field}.${unknownKey} is not supported.`, `${field}.${unknownKey}`);
  }
};

const cleanString = (value, { field, min = 0, max, multiline = false }) => {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string.`, field);
  }

  const normalized = (multiline ? value.replace(/\r\n?/gu, '\n') : value)
    .normalize('NFKC')
    .trim();

  if (CONTROL_CHARACTERS.test(normalized)) {
    throw new ValidationError(`${field} contains unsupported control characters.`, field);
  }

  if (normalized.length < min || normalized.length > max) {
    throw new ValidationError(`${field} must be between ${min} and ${max} characters.`, field);
  }

  return normalized;
};

const optionalString = (value, options) => {
  if (value === undefined || value === null || value === '') return undefined;
  return cleanString(value, options);
};

const cleanHttpsUrl = (value, field, { allowRelative = false } = {}) => {
  const normalized = cleanString(value, { field, min: 1, max: 2048 });
  if (allowRelative && /^\/(?!\/)[a-zA-Z0-9/_?&=.#%-]*$/u.test(normalized)) {
    let decoded;
    try {
      decoded = decodeURIComponent(normalized);
    } catch {
      throw new ValidationError(`${field} must be a valid internal URL.`, field);
    }
    if (!decoded.split(/[/?#]/u).some((segment) => segment === '..')) return normalized;
    throw new ValidationError(`${field} cannot contain path traversal.`, field);
  }

  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new ValidationError(`${field} must be a valid URL.`, field);
  }

  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    throw new ValidationError(`${field} must use credential-free HTTPS.`, field);
  }

  return url.toString();
};

const optionalHttpsUrl = (value, field, options) => {
  if (value === undefined || value === null || value === '') return undefined;
  return cleanHttpsUrl(value, field, options);
};

const cleanStringArray = (value, field, { maxItems, itemMax }) => {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ValidationError(`${field} must be an array with at most ${maxItems} items.`, field);
  }

  return value.map((item, index) => cleanString(item, {
    field: `${field}[${index}]`,
    min: 1,
    max: itemMax
  }));
};

const cleanUrlArray = (value, field, maxItems) => {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ValidationError(`${field} must be an array with at most ${maxItems} items.`, field);
  }

  return value.map((item, index) => cleanHttpsUrl(item, `${field}[${index}]`));
};

const cleanStatus = (value, field) => {
  const normalized = value === undefined || value === 'active' ? 'published' : value;
  if (!CONTENT_STATES.has(normalized)) {
    throw new ValidationError(`${field} must be draft, published, or archived.`, field);
  }
  return normalized;
};

const cleanInteger = (value, field, { minimum, maximum, fallback }) => {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ValidationError(
      `${field} must be an integer between ${minimum} and ${maximum}.`,
      field
    );
  }
  return value;
};

const assignIfDefined = (target, key, value) => {
  if (value !== undefined) target[key] = value;
};

const validateDocumentId = (value, field) => {
  const id = cleanString(value, { field, min: 2, max: 64 });
  if (!DOCUMENT_ID.test(id)) {
    throw new ValidationError(`${field} must be a lowercase URL-safe identifier.`, field);
  }
  return id;
};

const localized = (tr, en = tr) => ({ tr, en });

const truncate = (value, maximum) => value.slice(0, maximum).trim();

const createSeedSeo = (title, description) => ({
  title: localized(truncate(`${title} — ACKaraca`, 70)),
  description: localized(truncate(description, 180)),
  noIndex: false
});

const createSeedCover = (id, title, visualVariant) => ({
  slug: id,
  palette: ['#0f172a', '#f8fafc', '#197fe6'],
  visualVariant,
  alt: localized(truncate(`${title} kapak görseli`, 80), truncate(`${title} cover visual`, 80))
});

const createSeedBlocks = (id, title, description, formatLabel) => ([
  {
    id: `${id}-overview`,
    type: 'text',
    eyebrow: localized('Özet', 'Overview'),
    heading: localized(truncate(title, 120)),
    body: localized(description)
  },
  {
    id: `${id}-profile`,
    type: 'facts',
    heading: localized('Proje profili', 'Project profile'),
    items: [{
      label: localized('Biçim', 'Format'),
      value: localized(formatLabel)
    }]
  }
]);

const createSeedLink = ({ kind, label, href }) => ({
  kind,
  label: localized(cleanString(label, { field: 'seed.link.label', min: 1, max: 80 })),
  href,
  newTab: href.startsWith('https://')
});

const validateProjectSeed = (item, index) => {
  const field = `projects[${index}]`;
  assertPlainObject(item, field);
  assertAllowedKeys(item, PROJECT_KEYS, field);

  const id = validateDocumentId(item.id, `${field}.id`);
  const slug = validateDocumentId(item.slug || id, `${field}.slug`);
  if (slug !== id) {
    throw new ValidationError(`${field}.slug must match id.`, `${field}.slug`);
  }
  const title = cleanString(item.title, { field: `${field}.title`, min: 2, max: 120 });
  const description = cleanString(item.description, {
    field: `${field}.description`, min: 40, max: 8000, multiline: true
  });
  const category = optionalString(item.category, {
    field: `${field}.category`, min: 1, max: 40
  }) || 'portfolio';
  const discipline = ['mimari', 'architecture'].includes(category)
    ? 'architecture'
    : ['yazilim', 'software'].includes(category) ? 'software' : 'hybrid';
  const format = discipline === 'architecture' ? 'academic' : 'product';
  const technologies = cleanStringArray(item.technologies || [], `${field}.technologies`, {
    maxItems: 20, itemMax: 40
  });
  if (technologies.length === 0) {
    throw new ValidationError(`${field}.technologies must contain at least one item.`, `${field}.technologies`);
  }
  if (new Set(technologies.map((name) => name.toLocaleLowerCase('en-US'))).size !== technologies.length) {
    throw new ValidationError(`${field}.technologies contains duplicate names.`, `${field}.technologies`);
  }
  const summary = optionalString(item.summary, {
    field: `${field}.summary`, min: 12, max: 360, multiline: true
  });

  const links = [];
  const websiteUrl = optionalHttpsUrl(item.websiteUrl, `${field}.websiteUrl`);
  const githubUrl = optionalHttpsUrl(item.githubUrl, `${field}.githubUrl`);
  if (websiteUrl) links.push(createSeedLink({
    kind: 'live', label: item.websiteLabel || 'Website', href: websiteUrl
  }));
  if (githubUrl) links.push(createSeedLink({ kind: 'source', label: 'GitHub', href: githubUrl }));

  const data = {
    schemaVersion: 2,
    slug,
    status: cleanStatus(item.status, `${field}.status`),
    discipline,
    format,
    order: cleanInteger(item.order, `${field}.order`, {
      minimum: 0, maximum: 10000, fallback: 100
    }),
    featured: item.featured === true,
    title: localized(title),
    dek: localized(summary || truncate(description, 360)),
    technologies,
    topics: [category],
    cover: createSeedCover(id, title, discipline === 'architecture' ? 'architectural-grid' : 'code-canvas'),
    media: [],
    links,
    metrics: [],
    blocks: createSeedBlocks(id, title, description, format),
    relatedSlugs: [],
    seo: createSeedSeo(title, description)
  };

  const year = Number(item.year);
  if (Number.isInteger(year) && year >= 2000 && year <= 2100) data.year = year;
  const context = optionalString(item.semester, { field: `${field}.semester`, min: 1, max: 80 });
  const location = optionalString(item.location, { field: `${field}.location`, min: 1, max: 80 });
  if (context) data.context = localized(context);
  if (location) data.location = localized(location);

  // Validate legacy media URLs even though placeholder assets are intentionally
  // not migrated into the production domain model.
  if (item.images !== undefined) cleanUrlArray(item.images, `${field}.images`, 30);
  return { id, data };
};

const validateApplicationSeed = (item, index) => {
  const field = `applications[${index}]`;
  assertPlainObject(item, field);
  assertAllowedKeys(item, APPLICATION_KEYS, field);

  const id = validateDocumentId(item.id, `${field}.id`);
  const slug = validateDocumentId(item.slug || id, `${field}.slug`);
  if (slug !== id) {
    throw new ValidationError(`${field}.slug must match id.`, `${field}.slug`);
  }
  const title = cleanString(item.title, { field: `${field}.title`, min: 2, max: 120 });
  const description = cleanString(item.description, {
    field: `${field}.description`, min: 40, max: 8000, multiline: true
  });
  const type = optionalString(item.type, { field: `${field}.type`, min: 1, max: 40 }) || 'digital product';
  const summary = optionalString(item.summary, {
    field: `${field}.summary`, min: 12, max: 360, multiline: true
  });
  if (!Array.isArray(item.techStack) || item.techStack.length === 0 || item.techStack.length > 20) {
    throw new ValidationError(`${field}.techStack must contain between 1 and 20 items.`, `${field}.techStack`);
  }
  const technologies = item.techStack.map((technology, technologyIndex) => {
    const technologyField = `${field}.techStack[${technologyIndex}]`;
    assertPlainObject(technology, technologyField);
    assertAllowedKeys(technology, new Set(['name', 'color']), technologyField);
    return cleanString(technology.name, { field: `${technologyField}.name`, min: 1, max: 40 });
  });
  if (new Set(technologies.map((itemName) => itemName.toLowerCase())).size !== technologies.length) {
    throw new ValidationError(`${field}.techStack contains duplicate names.`, `${field}.techStack`);
  }

  const links = [];
  const primaryLink = optionalHttpsUrl(item.link, `${field}.link`, { allowRelative: true });
  const websiteUrl = optionalHttpsUrl(item.websiteUrl, `${field}.websiteUrl`);
  const githubUrl = optionalHttpsUrl(item.githubUrl, `${field}.githubUrl`);
  if (primaryLink) links.push(createSeedLink({
    kind: primaryLink.startsWith('/') ? 'updates' : 'live',
    label: item.linkText || 'Open',
    href: primaryLink
  }));
  if (websiteUrl && websiteUrl !== primaryLink) links.push(createSeedLink({
    kind: 'live', label: item.websiteLabel || 'Website', href: websiteUrl
  }));
  if (githubUrl) links.push(createSeedLink({ kind: 'source', label: 'GitHub', href: githubUrl }));

  // Validate but deliberately omit legacy placeholder cover images.
  optionalHttpsUrl(item.image, `${field}.image`);
  const data = {
    schemaVersion: 2,
    slug,
    status: cleanStatus(item.status, `${field}.status`),
    discipline: 'software',
    format: 'product',
    order: cleanInteger(item.order, `${field}.order`, {
      minimum: 0, maximum: 10000, fallback: 100
    }),
    featured: false,
    title: localized(title),
    dek: localized(summary || truncate(description, 360)),
    releaseStage: 'maintained',
    technologies,
    topics: [type],
    cover: createSeedCover(id, title, 'product-orbit'),
    media: [],
    links,
    metrics: [],
    blocks: createSeedBlocks(id, title, description, type),
    relatedSlugs: [],
    seo: createSeedSeo(title, description)
  };

  return { id, data };
};

export const validateInquiry = (payload) => {
  assertPlainObject(payload, 'inquiry');
  assertAllowedKeys(payload, INQUIRY_KEYS, 'inquiry');

  if (JSON.stringify(payload).length > 12000) {
    throw new ValidationError('Inquiry payload is too large.', 'inquiry');
  }

  const website = payload.website === undefined
    ? ''
    : cleanString(payload.website, { field: 'website', min: 0, max: 0 });
  if (website) {
    throw new ValidationError('Inquiry could not be accepted.', 'website');
  }

  const email = cleanString(payload.email, { field: 'email', min: 3, max: 254 }).toLowerCase();
  if (!EMAIL.test(email)) {
    throw new ValidationError('email must be a valid address.', 'email');
  }

  if (!INQUIRY_TYPES.has(payload.inquiryType)) {
    throw new ValidationError('inquiryType is not supported.', 'inquiryType');
  }

  if (!INQUIRY_LOCALES.has(payload.locale)) {
    throw new ValidationError('locale must be tr or en.', 'locale');
  }

  if (payload.privacyConsent !== true) {
    throw new ValidationError('privacyConsent must be accepted.', 'privacyConsent');
  }
  if (payload.budgetBand !== undefined && !BUDGET_BANDS.has(payload.budgetBand)) {
    throw new ValidationError('budgetBand is not supported.', 'budgetBand');
  }
  if (payload.timeline !== undefined && !INQUIRY_TIMELINES.has(payload.timeline)) {
    throw new ValidationError('timeline is not supported.', 'timeline');
  }

  const inquiry = {
    name: cleanString(payload.name, { field: 'name', min: 2, max: 100 }),
    email,
    inquiryType: payload.inquiryType,
    message: cleanString(payload.message, { field: 'message', min: 20, max: 4000, multiline: true }),
    locale: payload.locale,
    privacyConsent: true
  };
  assignIfDefined(inquiry, 'organization', optionalString(payload.organization, {
    field: 'organization', min: 1, max: 120
  }));
  assignIfDefined(inquiry, 'budgetBand', payload.budgetBand);
  assignIfDefined(inquiry, 'timeline', payload.timeline);
  return inquiry;
};

export const validateSeedCommand = (payload = {}) => {
  assertPlainObject(payload, 'command');
  assertAllowedKeys(payload, SEED_COMMAND_KEYS, 'command');
  if (payload.dryRun !== undefined && typeof payload.dryRun !== 'boolean') {
    throw new ValidationError('dryRun must be a boolean.', 'dryRun');
  }
  return { dryRun: payload.dryRun === true };
};

export const validatePromoteMedia = (payload) => {
  assertPlainObject(payload, 'promotion');
  assertAllowedKeys(payload, PROMOTE_MEDIA_KEYS, 'promotion');

  if (typeof payload.stagingPath !== 'string') {
    throw new ValidationError('stagingPath must be a string.', 'stagingPath');
  }
  const pathMatch = STAGING_MEDIA_PATH.exec(payload.stagingPath);
  if (!pathMatch) {
    throw new ValidationError('stagingPath is not a valid admin media path.', 'stagingPath');
  }
  if (!['project', 'journal'].includes(payload.entity)) {
    throw new ValidationError('entity must be project or journal.', 'entity');
  }
  const slug = cleanString(payload.slug, { field: 'slug', min: 2, max: 80 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new ValidationError('slug must be a lowercase URL-safe identifier.', 'slug');
  }

  return {
    stagingPath: payload.stagingPath,
    ownerUid: pathMatch[1],
    fileName: `${pathMatch[2]}.${pathMatch[3]}`,
    extension: pathMatch[3],
    entity: payload.entity,
    slug
  };
};

export const validateDeletePromotedMedia = (payload) => {
  assertPlainObject(payload, 'mediaDeletion');
  assertAllowedKeys(payload, DELETE_PROMOTED_MEDIA_KEYS, 'mediaDeletion');

  if (typeof payload.storagePath !== 'string') {
    throw new ValidationError('storagePath must be a string.', 'storagePath');
  }
  if (!['project', 'journal'].includes(payload.entity)) {
    throw new ValidationError('entity must be project or journal.', 'entity');
  }
  if (
    typeof payload.deletionCapability !== 'string'
    || !MEDIA_DELETION_CAPABILITY.test(payload.deletionCapability)
  ) {
    throw new ValidationError(
      'deletionCapability is not a valid one-time media capability.',
      'deletionCapability'
    );
  }
  const slug = cleanString(payload.slug, { field: 'slug', min: 2, max: 80 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new ValidationError('slug must be a lowercase URL-safe identifier.', 'slug');
  }

  const pathMatch = PROMOTED_MEDIA_PATH.exec(payload.storagePath);
  const expectedCollection = payload.entity === 'project' ? 'projects' : 'journal';
  if (!pathMatch || pathMatch[1] !== expectedCollection || pathMatch[2] !== slug) {
    throw new ValidationError(
      'storagePath does not match the requested entity and slug.',
      'storagePath'
    );
  }

  return {
    storagePath: payload.storagePath,
    entity: payload.entity,
    slug,
    fileName: `${pathMatch[3]}.${pathMatch[4]}`,
    extension: pathMatch[4],
    deletionCapability: payload.deletionCapability
  };
};

export const validateRebuildRequest = (payload) => {
  assertPlainObject(payload, 'rebuild');
  assertAllowedKeys(payload, REBUILD_REQUEST_KEYS, 'rebuild');

  if (!REBUILD_REASONS.has(payload.reason)) {
    throw new ValidationError('reason is not supported.', 'reason');
  }
  const paths = payload.paths ?? [];
  if (!Array.isArray(paths) || paths.length > 20) {
    throw new ValidationError('paths must contain at most 20 content paths.', 'paths');
  }
  const normalizedPaths = paths.map((contentPath, index) => {
    if (typeof contentPath !== 'string' || !REBUILD_CONTENT_PATH.test(contentPath)) {
      throw new ValidationError(
        `paths[${index}] is not a supported content path.`,
        `paths[${index}]`
      );
    }
    return contentPath;
  });
  if (new Set(normalizedPaths).size !== normalizedPaths.length) {
    throw new ValidationError('paths must not contain duplicates.', 'paths');
  }
  if (payload.reason !== 'manual' && normalizedPaths.length === 0) {
    throw new ValidationError('paths is required for content-driven rebuilds.', 'paths');
  }

  return {
    reason: payload.reason,
    paths: [...normalizedPaths].sort()
  };
};

export const validatePaftaLookup = (payload) => {
  assertPlainObject(payload, 'lookup');
  assertAllowedKeys(payload, PAFTA_LOOKUP_KEYS, 'lookup');
  if (typeof payload.code !== 'string' || !LEGACY_PAFTA_CODE.test(payload.code)) {
    throw new ValidationError('code is not a canonical legacy pafta code.', 'code');
  }
  return { code: payload.code };
};

const sanitizePublicText = (value, { minimum = 1, maximum }) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value
    .normalize('NFKC')
    .replace(PUBLIC_TEXT_UNSAFE_CHARACTERS, '')
    .replace(/\s+/gu, ' ')
    .trim();
  if (normalized.length < minimum) return undefined;
  return normalized.slice(0, maximum);
};

const isApprovedPublicMediaUrl = (value) => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return false;
  if (/^\/(?!\/)/u.test(value) && !value.includes('\\')) {
    try {
      const decoded = decodeURIComponent(value);
      return !decoded.split(/[/?#]/u).some((segment) => segment === '..');
    } catch {
      return false;
    }
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:'
      && !url.username
      && !url.password
      && (!url.port || url.port === '443')
      && (
        hostname === 'firebasestorage.googleapis.com'
        || hostname.endsWith('.googleusercontent.com')
      );
  } catch {
    return false;
  }
};

export const projectPublishedPafta = (data) => {
  if (!isPlainObject(data)) return null;
  const title = sanitizePublicText(data.title, { minimum: 1, maximum: 180 });
  if (!title) return null;

  const rawTechnologies = Array.isArray(data.technologies) ? data.technologies : [];
  const technologies = rawTechnologies
    .slice(0, 20)
    .map((value) => sanitizePublicText(value, { minimum: 1, maximum: 60 }))
    .filter((value) => value !== undefined);
  const uniqueTechnologies = technologies.filter((value, index) => (
    technologies.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index
  ));
  const rawImages = Array.isArray(data.images) ? data.images : [];
  const images = rawImages
    .filter(isApprovedPublicMediaUrl)
    .slice(0, 20);

  const projection = { title, technologies: uniqueTechnologies, images };
  for (const [field, maximum] of [
    ['description', 10000],
    ['semester', 80],
    ['year', 16],
    ['course', 120],
    ['professor', 120]
  ]) {
    const rawValue = field === 'year' && Number.isInteger(data[field])
      ? String(data[field])
      : data[field];
    const value = sanitizePublicText(rawValue, { minimum: 1, maximum });
    if (value !== undefined) projection[field] = value;
  }
  return projection;
};

export const validateAuditEvent = (payload) => {
  assertPlainObject(payload, 'audit');
  assertAllowedKeys(payload, AUDIT_KEYS, 'audit');

  if (!AUDIT_ACTIONS.has(payload.action)) {
    throw new ValidationError('action is not supported.', 'action');
  }
  if (!AUDIT_ENTITIES.has(payload.entity)) {
    throw new ValidationError('entity is not supported.', 'entity');
  }
  const documentIdSegments = typeof payload.documentId === 'string'
    ? payload.documentId.split('/')
    : [];
  if (
    typeof payload.documentId !== 'string'
    || !AUDIT_DOCUMENT_ID.test(payload.documentId)
    || documentIdSegments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new ValidationError('documentId must be a safe identifier.', 'documentId');
  }

  const changedFields = payload.changedFields ?? [];
  if (!Array.isArray(changedFields) || changedFields.length > 40) {
    throw new ValidationError('changedFields must contain at most 40 fields.', 'changedFields');
  }
  const normalizedFields = changedFields.map((field, index) => {
    if (typeof field !== 'string' || !AUDIT_FIELD.test(field)) {
      throw new ValidationError(
        `changedFields[${index}] must be a safe field path.`,
        `changedFields[${index}]`
      );
    }
    return field;
  });
  if (new Set(normalizedFields).size !== normalizedFields.length) {
    throw new ValidationError('changedFields must not contain duplicates.', 'changedFields');
  }

  return {
    action: payload.action,
    entity: payload.entity,
    documentId: payload.documentId,
    changedFields: normalizedFields
  };
};

export const validateSeedManifest = (manifest) => {
  assertPlainObject(manifest, 'manifest');
  assertAllowedKeys(manifest, new Set(['projects', 'applications']), 'manifest');

  const projects = manifest.projects ?? [];
  const applications = manifest.applications ?? [];
  if (!Array.isArray(projects) || !Array.isArray(applications)) {
    throw new ValidationError('manifest projects and applications must be arrays.', 'manifest');
  }
  if (projects.length + applications.length > 250) {
    throw new ValidationError('manifest contains more than 250 entries.', 'manifest');
  }

  const entries = [
    ...projects.map(validateProjectSeed),
    ...applications.map(validateApplicationSeed)
  ];
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new ValidationError(`manifest contains duplicate id: ${entry.id}.`, 'manifest');
    }
    ids.add(entry.id);
  }

  return entries;
};

export const stableSerialize = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};
