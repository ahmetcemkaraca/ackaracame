// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateProductionEnvironment } from './production-env.mjs';

const validEnvironment = {
  FIREBASE_PROJECT_ID: 'ackaraca-prod',
  ACKARACA_STORAGE_BUCKET: 'ackaraca-prod.firebasestorage.app',
  ACKARACA_ADMIN_EMAIL: 'owner@ackaraca.me',
  SITE_REBUILD_WEBHOOK_HOST: 'api.github.com',
  SITE_REBUILD_PROVIDER: 'github',
  VITE_FIREBASE_API_KEY: 'AIza-valid-public-web-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'ackaraca-prod.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'ackaraca-prod',
  VITE_FIREBASE_STORAGE_BUCKET: 'ackaraca-prod.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
  VITE_FIREBASE_APP_ID: '1:123456789012:web:abcdef123456',
  VITE_FIREBASE_APPCHECK_SITE_KEY: '6Lc-valid-site-key',
  VITE_FIREBASE_FUNCTIONS_REGION: 'europe-west1'
};

describe('production environment validation', () => {
  it('accepts one complete and consistent configuration', () => {
    expect(validateProductionEnvironment(validEnvironment)).toMatchObject(validEnvironment);
  });

  it.each([
    ['VITE_FIREBASE_API_KEY', ''],
    ['VITE_FIREBASE_APPCHECK_SITE_KEY', 'your_site_key'],
    ['ACKARACA_ADMIN_EMAIL', 'Owner@ackaraca.me'],
    ['SITE_REBUILD_WEBHOOK_HOST', 'evil.example'],
    ['VITE_FIREBASE_PROJECT_ID', 'another-project'],
    ['ACKARACA_STORAGE_BUCKET', 'another-project.firebasestorage.app'],
    ['VITE_FIREBASE_STORAGE_BUCKET', 'another-project.firebasestorage.app'],
    ['VITE_FIREBASE_AUTH_DOMAIN', 'another-project.firebaseapp.com'],
    ['VITE_FIREBASE_APP_ID', '1:999999999999:web:abcdef123456']
  ])('rejects unsafe %s values', (name, value) => {
    expect(() => validateProductionEnvironment({ ...validEnvironment, [name]: value })).toThrow();
  });
});
