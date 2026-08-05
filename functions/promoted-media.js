import crypto from 'node:crypto';

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const STAGING_PATH = /^admin-media\/([a-zA-Z0-9_-]{1,128})\/([a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif))$/u;
const PROMOTED_PATH = /^media\/(projects|journal)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif))$/u;
const CONTENT_TYPE_EXTENSIONS = new Map([
  ['image/jpeg', new Set(['jpg', 'jpeg'])],
  ['image/png', new Set(['png'])],
  ['image/webp', new Set(['webp'])],
  ['image/avif', new Set(['avif'])]
]);

export const validatePromotedObjectMetadata = ({
  storagePath,
  objectMetadata,
  entity,
  slug,
  expectedUploadedBy,
  expectedStagingPath
}) => {
  const pathMatch = typeof storagePath === 'string' ? PROMOTED_PATH.exec(storagePath) : null;
  const expectedCollection = entity === 'project' ? 'projects' : 'journal';
  if (!pathMatch || pathMatch[1] !== expectedCollection || pathMatch[2] !== slug) {
    throw new Error('The promoted media path is not canonical for its content owner.');
  }
  const fileName = pathMatch[3];
  const custom = objectMetadata?.metadata || {};
  const stagingMatch = typeof custom.stagingPath === 'string'
    ? STAGING_PATH.exec(custom.stagingPath)
    : null;
  const contentType = objectMetadata?.contentType;
  const size = Number(objectMetadata?.size);
  const generation = String(objectMetadata?.generation || '');
  const sourceGeneration = String(custom.sourceGeneration || '');
  const extension = fileName.split('.').at(-1);
  if (
    !stagingMatch
    || stagingMatch[2] !== fileName
    || custom.uploadedBy !== stagingMatch[1]
    || custom.entity !== entity
    || custom.slug !== slug
    || (expectedUploadedBy !== undefined && custom.uploadedBy !== expectedUploadedBy)
    || (expectedStagingPath !== undefined && custom.stagingPath !== expectedStagingPath)
    || !CONTENT_TYPE_EXTENSIONS.get(contentType)?.has(extension)
    || !Number.isSafeInteger(size)
    || size <= 0
    || size > MAX_MEDIA_BYTES
    || !/^[1-9][0-9]*$/u.test(generation)
    || !/^[1-9][0-9]*$/u.test(sourceGeneration)
  ) throw new Error('The promoted media object metadata is invalid.');

  return {
    storagePath,
    entity,
    slug,
    fileName,
    contentType,
    size,
    generation,
    sourceGeneration,
    uploadedBy: custom.uploadedBy,
    stagingPath: custom.stagingPath
  };
};

export const bindVerifiedMediaToSnapshotHash = ({ snapshotHash, verifiedObjects }) => {
  if (typeof snapshotHash !== 'string' || !/^[a-f0-9]{64}$/u.test(snapshotHash)) {
    throw new Error('The content snapshot hash is invalid.');
  }
  const canonical = [...verifiedObjects]
    .map((object) => ({
      storagePath: object.storagePath,
      entity: object.entity,
      slug: object.slug,
      generation: object.generation,
      sourceGeneration: object.sourceGeneration,
      contentType: object.contentType,
      size: object.size,
      uploadedBy: object.uploadedBy,
      stagingPath: object.stagingPath
    }))
    .sort((left, right) => {
      if (left.storagePath < right.storagePath) return -1;
      if (left.storagePath > right.storagePath) return 1;
      return 0;
    });
  if (new Set(canonical.map((object) => object.storagePath)).size !== canonical.length) {
    throw new Error('The verified media object set contains duplicate paths.');
  }
  return crypto.createHash('sha256')
    .update(snapshotHash)
    .update('\n')
    .update(JSON.stringify(canonical))
    .digest('hex');
};

export const assertBoundMediaSnapshotUnchanged = ({
  contentSnapshotHash,
  expectedSnapshotHash,
  verifiedObjects
}) => {
  if (typeof expectedSnapshotHash !== 'string' || !/^[a-f0-9]{64}$/u.test(expectedSnapshotHash)) {
    throw new Error('The expected media-bound snapshot hash is invalid.');
  }
  const observedSnapshotHash = bindVerifiedMediaToSnapshotHash({
    snapshotHash: contentSnapshotHash,
    verifiedObjects
  });
  if (observedSnapshotHash !== expectedSnapshotHash) {
    throw new Error('Published media changed after the publisher acquired its mutation lease.');
  }
  return observedSnapshotHash;
};

export const desiredPromotedMediaObjects = ({ publications, maximum }) => {
  const objects = new Map();
  for (const desired of publications.values()) {
    const collection = desired.entity === 'project' ? 'projects' : 'journal';
    for (const fileName of desired.files) {
      const storagePath = `media/${collection}/${desired.slug}/${fileName}`;
      objects.set(storagePath, {
        storagePath,
        entity: desired.entity,
        slug: desired.slug
      });
      if (objects.size > maximum) {
        throw new Error(`The public snapshot exceeds ${maximum} unique media objects.`);
      }
    }
  }
  return [...objects.values()];
};

export const verifyPromotedMediaObjects = async ({
  desiredObjects,
  readMetadata,
  concurrency = 12
}) => {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 32) {
    throw new Error('The promoted media verification concurrency is invalid.');
  }
  const verified = [];
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, desiredObjects.length) },
    async () => {
      while (cursor < desiredObjects.length) {
        const index = cursor;
        cursor += 1;
        const desired = desiredObjects[index];
        let objectMetadata;
        try {
          objectMetadata = await readMetadata(desired.storagePath);
        } catch (error) {
          const wrapped = new Error(`Published media ${desired.storagePath} could not be verified.`);
          wrapped.cause = error;
          throw wrapped;
        }
        verified.push(validatePromotedObjectMetadata({
          storagePath: desired.storagePath,
          objectMetadata,
          entity: desired.entity,
          slug: desired.slug
        }));
      }
    }
  );
  await Promise.all(runners);
  return verified.sort((left, right) => {
    if (left.storagePath < right.storagePath) return -1;
    if (left.storagePath > right.storagePath) return 1;
    return 0;
  });
};
