import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAdminClaimTarget } from './admin-claim.js';

test('grant is fenced to the configured sole-owner email', () => {
  assert.equal(validateAdminClaimTarget({
    action: 'grant',
    targetEmail: 'owner@ackaraca.me',
    configuredOwnerEmail: 'owner@ackaraca.me'
  }), 'owner@ackaraca.me');
  assert.throws(() => validateAdminClaimTarget({
    action: 'grant',
    targetEmail: 'other@ackaraca.me',
    configuredOwnerEmail: 'owner@ackaraca.me'
  }), /exactly match/u);
  assert.throws(() => validateAdminClaimTarget({
    action: 'grant',
    targetEmail: 'Owner@ackaraca.me',
    configuredOwnerEmail: 'owner@ackaraca.me'
  }), /normalized lowercase/u);
});

test('revoke can recover a wrongly claimed non-owner account', () => {
  assert.equal(validateAdminClaimTarget({
    action: 'revoke',
    targetEmail: 'old-admin@ackaraca.me'
  }), 'old-admin@ackaraca.me');
});
