import { stableSerialize } from './validation.js';

export const getChangedFields = (beforeData, afterData) => {
  const keys = new Set([
    ...Object.keys(beforeData || {}),
    ...Object.keys(afterData || {})
  ]);
  return [...keys]
    .filter((key) => stableSerialize(beforeData?.[key]) !== stableSerialize(afterData?.[key]))
    .sort()
    .slice(0, 40);
};

export const deriveAuditAction = ({ beforeData, afterData, entity }) => {
  if (!beforeData && afterData) return 'create';
  if (beforeData && !afterData) return 'delete';
  if (entity === 'site-settings') return 'settings-update';
  if (entity === 'inquiry') return 'inquiry-update';

  if (beforeData?.status !== afterData?.status) {
    if (afterData?.status === 'published') return 'publish';
    if (afterData?.status === 'archived') return 'archive';
    if (beforeData?.status === 'archived' && afterData?.status === 'draft') return 'restore';
  }
  return 'update';
};
