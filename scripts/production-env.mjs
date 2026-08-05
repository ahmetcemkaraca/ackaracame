const REQUIRED_WEB_CONFIG = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_APPCHECK_SITE_KEY',
  'VITE_FIREBASE_FUNCTIONS_REGION'
];

const PLACEHOLDER_PATTERN = /(?:change[-_ ]?me|example|firebase-project-id|placeholder|your[-_ ])/iu;
const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u;
const BUCKET_PATTERN = /^[a-z0-9][a-z0-9._-]{1,220}\.(?:appspot\.com|firebasestorage\.app)$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const required = (environment, name) => {
  const value = environment[name]?.trim();
  if (!value || PLACEHOLDER_PATTERN.test(value)) {
    throw new Error(`${name} must be explicitly configured and must not be a placeholder.`);
  }
  return value;
};

const assertHostname = (value, name) => {
  let parsed;
  try {
    parsed = new URL(`https://${value}`);
  } catch {
    throw new Error(`${name} must be a valid hostname.`);
  }
  if (parsed.hostname !== value || parsed.username || parsed.password || parsed.port) {
    throw new Error(`${name} must be a bare HTTPS hostname without credentials, a port, or a path.`);
  }
};

export const validateProductionEnvironment = (environment) => {
  const values = Object.fromEntries(
    [
      'FIREBASE_PROJECT_ID',
      'ACKARACA_STORAGE_BUCKET',
      'ACKARACA_ADMIN_EMAIL',
      'SITE_REBUILD_WEBHOOK_HOST',
      'SITE_REBUILD_PROVIDER',
      ...REQUIRED_WEB_CONFIG
    ].map((name) => [name, required(environment, name)])
  );

  if (!PROJECT_ID_PATTERN.test(values.FIREBASE_PROJECT_ID)) {
    throw new Error('FIREBASE_PROJECT_ID is not a valid Firebase project ID.');
  }
  if (!BUCKET_PATTERN.test(values.ACKARACA_STORAGE_BUCKET)) {
    throw new Error('ACKARACA_STORAGE_BUCKET is not a supported Firebase Storage bucket.');
  }
  const expectedBuckets = new Set([
    `${values.FIREBASE_PROJECT_ID}.appspot.com`,
    `${values.FIREBASE_PROJECT_ID}.firebasestorage.app`
  ]);
  if (!expectedBuckets.has(values.ACKARACA_STORAGE_BUCKET)) {
    throw new Error('ACKARACA_STORAGE_BUCKET must belong to FIREBASE_PROJECT_ID.');
  }
  if (values.VITE_FIREBASE_PROJECT_ID !== values.FIREBASE_PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID must exactly match FIREBASE_PROJECT_ID.');
  }
  if (values.VITE_FIREBASE_STORAGE_BUCKET !== values.ACKARACA_STORAGE_BUCKET) {
    throw new Error('VITE_FIREBASE_STORAGE_BUCKET must exactly match ACKARACA_STORAGE_BUCKET.');
  }
  if (!EMAIL_PATTERN.test(values.ACKARACA_ADMIN_EMAIL)
    || values.ACKARACA_ADMIN_EMAIL !== values.ACKARACA_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('ACKARACA_ADMIN_EMAIL must be a normalized lowercase email address.');
  }

  assertHostname(values.VITE_FIREBASE_AUTH_DOMAIN, 'VITE_FIREBASE_AUTH_DOMAIN');
  if (values.VITE_FIREBASE_AUTH_DOMAIN !== `${values.FIREBASE_PROJECT_ID}.firebaseapp.com`) {
    throw new Error('VITE_FIREBASE_AUTH_DOMAIN must belong to FIREBASE_PROJECT_ID.');
  }
  assertHostname(values.SITE_REBUILD_WEBHOOK_HOST, 'SITE_REBUILD_WEBHOOK_HOST');
  if (!['generic', 'github'].includes(values.SITE_REBUILD_PROVIDER)) {
    throw new Error('SITE_REBUILD_PROVIDER must be either generic or github.');
  }
  if (values.SITE_REBUILD_PROVIDER === 'github' && values.SITE_REBUILD_WEBHOOK_HOST !== 'api.github.com') {
    throw new Error('GitHub rebuilds require SITE_REBUILD_WEBHOOK_HOST=api.github.com.');
  }
  if (values.VITE_FIREBASE_FUNCTIONS_REGION !== 'europe-west1') {
    throw new Error('VITE_FIREBASE_FUNCTIONS_REGION must match the deployed region europe-west1.');
  }
  if (!/^\d{6,30}$/u.test(values.VITE_FIREBASE_MESSAGING_SENDER_ID)) {
    throw new Error('VITE_FIREBASE_MESSAGING_SENDER_ID must be a numeric Firebase sender ID.');
  }
  const appIdMatch = /^\d+:([^\s:]+):web:[A-Za-z0-9]+$/u.exec(values.VITE_FIREBASE_APP_ID);
  if (!appIdMatch) {
    throw new Error('VITE_FIREBASE_APP_ID must be a Firebase web app ID.');
  }
  if (appIdMatch[1] !== values.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    throw new Error('VITE_FIREBASE_APP_ID must belong to VITE_FIREBASE_MESSAGING_SENDER_ID.');
  }
  if (/\s/u.test(values.VITE_FIREBASE_API_KEY) || values.VITE_FIREBASE_API_KEY.length > 256) {
    throw new Error('VITE_FIREBASE_API_KEY is malformed.');
  }
  if (/\s/u.test(values.VITE_FIREBASE_APPCHECK_SITE_KEY)
    || values.VITE_FIREBASE_APPCHECK_SITE_KEY.length > 512) {
    throw new Error('VITE_FIREBASE_APPCHECK_SITE_KEY is malformed.');
  }

  return values;
};
