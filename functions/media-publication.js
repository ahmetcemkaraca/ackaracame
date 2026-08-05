const FIREBASE_STORAGE_HOST = 'firebasestorage.googleapis.com';
const MAX_MANIFEST_FILES = 1000;
const SAFE_BUCKET = /^[a-zA-Z0-9._-]{3,222}$/u;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const PROMOTED_OBJECT_PATH = /^media\/(projects|journal)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif))$/u;
const SAFE_FILE_NAME = /^[a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif)$/u;

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const mediaPublicationConfirmation = ({ action, deploymentId, projectId }) => {
  if (!['prepare', 'finalize', 'abort'].includes(action)) {
    throw new Error('Unsupported media publication action.');
  }
  if (typeof deploymentId !== 'string' || typeof projectId !== 'string') {
    throw new Error('Media publication confirmation identifiers must be strings.');
  }
  const phase = action === 'finalize'
    ? 'all-resources-deployed'
    : action === 'abort'
      ? 'release-not-fully-deployed'
      : null;
  return [action, deploymentId, phase, projectId].filter((part) => part !== null).join(':');
};

const isFirebaseStorageUrl = (value) => {
  if (typeof value !== 'string' || value.length > 4096) return false;
  try {
    return new URL(value).hostname === FIREBASE_STORAGE_HOST;
  } catch {
    return false;
  }
};

function* iterateMediaRecords(data, { readyOnly = false } = {}) {
  if (!isRecord(data)) return;
  if (Array.isArray(data.media)) {
    for (const media of data.media) {
      if (isRecord(media) && (!readyOnly || media.assetState === 'ready')) yield media;
    }
  }
  if (!Array.isArray(data.blocks)) return;
  for (const block of data.blocks) {
    if (!isRecord(block)) continue;
    if (block.type === 'media' && isRecord(block.media)) {
      if (!readyOnly || block.media.assetState === 'ready') yield block.media;
    } else if (block.type === 'gallery' && Array.isArray(block.items)) {
      for (const media of block.items) {
        if (isRecord(media) && (!readyOnly || media.assetState === 'ready')) yield media;
      }
    }
  }
}

export const parseCanonicalFirebaseMediaUrl = ({ rawUrl, bucketName, entity, slug }) => {
  if (
    typeof rawUrl !== 'string'
    || rawUrl.length > 4096
    || typeof bucketName !== 'string'
    || !SAFE_BUCKET.test(bucketName)
    || !['project', 'journal'].includes(entity)
    || typeof slug !== 'string'
    || !SAFE_SLUG.test(slug)
  ) return null;

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const queryEntries = [...url.searchParams.entries()];
  if (
    url.protocol !== 'https:'
    || url.hostname !== FIREBASE_STORAGE_HOST
    || url.port
    || url.username
    || url.password
    || url.hash
    || queryEntries.length !== 1
    || queryEntries[0][0] !== 'alt'
    || queryEntries[0][1] !== 'media'
  ) return null;

  const pathParts = url.pathname.split('/');
  if (
    pathParts.length !== 6
    || pathParts[0] !== ''
    || pathParts[1] !== 'v0'
    || pathParts[2] !== 'b'
    || pathParts[4] !== 'o'
  ) return null;

  let decodedBucket;
  let objectPath;
  try {
    decodedBucket = decodeURIComponent(pathParts[3]);
    objectPath = decodeURIComponent(pathParts[5]);
  } catch {
    return null;
  }
  const match = PROMOTED_OBJECT_PATH.exec(objectPath);
  const expectedCollection = entity === 'project' ? 'projects' : 'journal';
  if (
    decodedBucket !== bucketName
    || !match
    || match[1] !== expectedCollection
    || match[2] !== slug
  ) return null;
  return match[3];
};

export const extractReferencedMediaFiles = ({ data, bucketName, entity, slug }) => {
  if (!isRecord(data)) return { complete: false, files: [] };
  if (typeof bucketName !== 'string' || !SAFE_BUCKET.test(bucketName)) {
    return { complete: false, files: [] };
  }

  const files = new Set();
  for (const media of iterateMediaRecords(data)) {
    for (const field of ['src', 'poster']) {
      const fileName = parseCanonicalFirebaseMediaUrl({
        rawUrl: media[field],
        bucketName,
        entity,
        slug
      });
      if (fileName) files.add(fileName);
      else if (isFirebaseStorageUrl(media[field])) {
        return { complete: false, files: [] };
      }
      if (files.size > MAX_MANIFEST_FILES) {
        return { complete: false, files: [] };
      }
    }
  }

  return {
    complete: true,
    files: [...files].sort()
  };
};

export const extractPublishedMediaManifest = ({ data, bucketName, entity, slug }) => {
  if (!isRecord(data) || data.status !== 'published') {
    return { published: false, complete: true, files: [] };
  }
  if (typeof bucketName !== 'string' || !SAFE_BUCKET.test(bucketName)) {
    return { published: true, complete: false, files: [] };
  }

  const files = new Set();
  for (const media of iterateMediaRecords(data, { readyOnly: true })) {
    for (const field of ['src', 'poster']) {
      const fileName = parseCanonicalFirebaseMediaUrl({
        rawUrl: media[field],
        bucketName,
        entity,
        slug
      });
      if (fileName) files.add(fileName);
      else if (isFirebaseStorageUrl(media[field])) {
        return { published: true, complete: false, files: [] };
      }
      if (files.size > MAX_MANIFEST_FILES) {
        return { published: true, complete: false, files: [] };
      }
    }
  }
  return { published: true, complete: true, files: [...files].sort() };
};

export const classifyMediaDeploymentMembership = ({ manifest, entity, slug, fileName }) => {
  if (manifest === undefined || manifest === null) return 'inactive';
  if (!isRecord(manifest) || manifest.active === false) return manifest?.active === false
    ? 'inactive'
    : 'invalid';
  if (
    manifest.active !== true
    || manifest.complete !== true
    || manifest.entity !== entity
    || manifest.slug !== slug
    || !Array.isArray(manifest.files)
    || manifest.files.length > MAX_MANIFEST_FILES
    || manifest.files.some((item) => typeof item !== 'string' || !SAFE_FILE_NAME.test(item))
  ) return 'invalid';
  return manifest.files.includes(fileName) ? 'active' : 'inactive';
};
