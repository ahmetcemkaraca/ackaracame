const LEGACY_REGION = 'us-central1';
const LEGACY_FUNCTION_NAMES = new Set(['adminLoginGuard', 'seedContent']);

const functionName = (entry) => {
  const value = typeof entry?.id === 'string'
    ? entry.id
    : typeof entry?.name === 'string'
      ? entry.name
      : '';
  return value.split('/').filter(Boolean).at(-1) || '';
};

const functionRegions = (entry) => {
  if (Array.isArray(entry?.region)) return entry.region;
  if (typeof entry?.region === 'string') return [entry.region];
  if (Array.isArray(entry?.regions)) return entry.regions;
  return [];
};

export const planLegacyFunctionRetirement = ({ inventory, projectId }) => {
  if (!Array.isArray(inventory)) throw new Error('Firebase Functions inventory must be an array.');
  if (typeof projectId !== 'string' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u.test(projectId)) {
    throw new Error('A valid Firebase project ID is required.');
  }
  const targets = new Set();
  for (const entry of inventory) {
    const name = functionName(entry);
    if (!LEGACY_FUNCTION_NAMES.has(name)) continue;
    if (typeof entry.project === 'string' && entry.project !== projectId) {
      throw new Error('Firebase returned a legacy function from another project.');
    }
    if (functionRegions(entry).includes(LEGACY_REGION)) targets.add(name);
  }
  return {
    region: LEGACY_REGION,
    names: [...targets].sort()
  };
};
