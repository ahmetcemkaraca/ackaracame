import fs from 'node:fs';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { buildEnabledTotpConfig, hasExpectedTotpConfig } from './auth-config.js';

const loadServiceAccount = () => {
  const inlineAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineAccount) return JSON.parse(inlineAccount);

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) return JSON.parse(fs.readFileSync(accountPath, 'utf8'));
  return null;
};

const requireInput = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

const main = async () => {
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  const confirmation = requireInput('CONFIRM_TOTP_ENABLE');
  if (confirmation !== `enable-totp:${projectId}`) {
    throw new Error(`CONFIRM_TOTP_ENABLE must equal enable-totp:${projectId}.`);
  }

  const serviceAccount = loadServiceAccount();
  if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
    throw new Error('The service account project does not match FIREBASE_PROJECT_ID.');
  }
  const app = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId
  });
  const manager = getAuth(app).projectConfigManager();
  const current = await manager.getProjectConfig();
  const updated = await manager.updateProjectConfig({
    multiFactorConfig: buildEnabledTotpConfig(current.multiFactorConfig)
  });
  if (!hasExpectedTotpConfig(updated.multiFactorConfig)) {
    throw new Error('TOTP configuration could not be verified after the update.');
  }
  console.log(`TOTP MFA enabled for ${projectId} with one adjacent interval.`);
};

main().catch((error) => {
  console.error('TOTP enablement failed:', error.message);
  process.exitCode = 1;
});
