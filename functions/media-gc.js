const PROMOTED_PATH = /^media\/(projects|journal)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif))$/u;

export const parsePromotedMediaPath = (value) => {
  if (typeof value !== 'string') return null;
  const match = PROMOTED_PATH.exec(value);
  if (!match) return null;
  return {
    entity: match[1] === 'projects' ? 'project' : 'journal',
    collection: match[1],
    slug: match[2],
    fileName: match[3]
  };
};

export const isMediaGcAgeEligible = ({ timeCreated, nowMs, retentionMs }) => {
  if (!Number.isFinite(nowMs) || !Number.isFinite(retentionMs) || retentionMs <= 0) return false;
  const createdAtMs = Date.parse(timeCreated);
  return Number.isFinite(createdAtMs) && createdAtMs <= nowMs - retentionMs;
};

export const shouldDeletePromotedMedia = ({
  ageEligible,
  metadataValid,
  deploymentMembership,
  referenceScanComplete,
  referenced
}) => ageEligible === true
  && metadataValid === true
  && deploymentMembership === 'inactive'
  && referenceScanComplete === true
  && referenced === false;
