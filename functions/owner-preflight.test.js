import assert from 'node:assert/strict';
import test from 'node:test';
import { validateOwnerPreflight } from './owner-preflight.js';

const user = {
  uid: 'owner-uid',
  email: 'owner@ackaraca.me',
  emailVerified: true,
  disabled: false,
  providerData: [{ providerId: 'password' }],
  customClaims: { admin: true },
  multiFactor: { enrolledFactors: [{ factorId: 'totp' }] }
};
const ownerPolicy = {
  schemaVersion: 1,
  uid: user.uid,
  email: user.email
};

test('bootstrap requires an exact verified enabled password owner before blocking functions deploy', () => {
  assert.deepEqual(validateOwnerPreflight({
    mode: 'bootstrap',
    configuredEmail: user.email,
    user: { ...user, customClaims: {}, multiFactor: { enrolledFactors: [] } }
  }), { uid: user.uid, email: user.email, mode: 'bootstrap' });
  assert.throws(() => validateOwnerPreflight({
    mode: 'bootstrap', configuredEmail: user.email, user: { ...user, emailVerified: false }
  }), /verified and enabled/u);
  assert.throws(() => validateOwnerPreflight({
    mode: 'bootstrap', configuredEmail: user.email, user: { ...user, providerData: [] }
  }), /email\/password/u);
});

test('normal deploy requires claim, TOTP, and exact Firestore owner policy', () => {
  assert.deepEqual(validateOwnerPreflight({
    mode: 'normal', configuredEmail: user.email, user, ownerPolicy
  }), { uid: user.uid, email: user.email, mode: 'normal' });
  assert.throws(() => validateOwnerPreflight({
    mode: 'normal', configuredEmail: user.email, user: { ...user, customClaims: {} }, ownerPolicy
  }), /admin custom claim/u);
  assert.throws(() => validateOwnerPreflight({
    mode: 'normal', configuredEmail: user.email, user, ownerPolicy: { ...ownerPolicy, uid: 'other' }
  }), /owner-access policy/u);
});

test('email identity is exact and normalized', () => {
  assert.throws(() => validateOwnerPreflight({
    mode: 'bootstrap', configuredEmail: 'Owner@ackaraca.me', user
  }), /normalized lowercase/u);
  assert.throws(() => validateOwnerPreflight({
    mode: 'bootstrap', configuredEmail: 'other@ackaraca.me', user
  }), /exact configured/u);
});
