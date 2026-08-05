import fs from 'node:fs';
import path from 'node:path';

const FUNCTION_PARAMETER_NAMES = [
  'ACKARACA_STORAGE_BUCKET',
  'ACKARACA_ADMIN_EMAIL',
  'SITE_REBUILD_WEBHOOK_HOST',
  'SITE_REBUILD_PROVIDER'
];

const parseValue = (rawValue, name) => {
  const value = rawValue.trim();
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') return parsed;
    } catch {
      // The common error below intentionally does not expose configuration values.
    }
    throw new Error(`Existing Functions dotenv parameter ${name} is malformed.`);
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
    return value.slice(1, -1);
  }
  return value;
};

const parseFunctionsEnvironment = (source) => {
  const values = new Map();
  for (const sourceLine of source.split(/\r?\n/u)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/u.exec(line);
    if (!match) throw new Error('Existing Functions dotenv contains a malformed assignment.');
    const [, name, rawValue] = match;
    if (values.has(name)) throw new Error(`Existing Functions dotenv repeats ${name}.`);
    values.set(name, parseValue(rawValue, name));
  }
  return values;
};

export const renderFunctionsEnvironment = (environment) => (
  `${FUNCTION_PARAMETER_NAMES.map((name) => `${name}=${JSON.stringify(environment[name])}`).join('\n')}\n`
);

export const ensureFunctionsEnvironmentFile = ({ environment, projectRoot }) => {
  const projectId = environment.FIREBASE_PROJECT_ID;
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u.test(projectId)) {
    throw new Error('Refusing to construct a Functions dotenv path from an invalid project ID.');
  }
  const filePath = path.join(projectRoot, 'functions', `.env.${projectId}`);

  if (fs.existsSync(filePath)) {
    const stat = fs.lstatSync(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error('Existing Functions dotenv must be a regular file, not a link.');
    }
    if ((stat.mode & 0o077) !== 0) {
      throw new Error(`Existing Functions dotenv permissions are too broad; run chmod 600 ${filePath}.`);
    }
    const existing = parseFunctionsEnvironment(fs.readFileSync(filePath, 'utf8'));
    for (const name of FUNCTION_PARAMETER_NAMES) {
      if (existing.get(name) !== environment[name]) {
        throw new Error(`Existing Functions dotenv does not match validated ${name}.`);
      }
    }
    return { created: false, filePath };
  }

  fs.writeFileSync(filePath, renderFunctionsEnvironment(environment), {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600
  });
  return { created: true, filePath };
};

export const removeGeneratedFunctionsEnvironmentFile = ({ created, filePath }) => {
  if (!created) return;
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
};
