import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEnabledTotpConfig, hasExpectedTotpConfig } from './auth-config.js';

test('TOTP project config enables global MFA and the provider', () => {
  const config = buildEnabledTotpConfig(undefined);
  assert.deepEqual(config, {
    state: 'ENABLED',
    providerConfigs: [{
      state: 'ENABLED',
      totpProviderConfig: { adjacentIntervals: 1 }
    }]
  });
  assert.equal(hasExpectedTotpConfig(config), true);
});

test('TOTP project config preserves other factors and replaces stale TOTP config', () => {
  const otherProvider = { state: 'ENABLED', futureProviderConfig: { mode: 'existing' } };
  const config = buildEnabledTotpConfig({
    state: 'DISABLED',
    factorIds: ['phone'],
    providerConfigs: [
      otherProvider,
      { state: 'DISABLED', totpProviderConfig: { adjacentIntervals: 5 } },
      { state: 'ENABLED', totpProviderConfig: { adjacentIntervals: 2 } }
    ]
  });

  assert.deepEqual(config.factorIds, ['phone']);
  assert.deepEqual(config.providerConfigs, [
    otherProvider,
    { state: 'ENABLED', totpProviderConfig: { adjacentIntervals: 1 } }
  ]);
  assert.notEqual(config.providerConfigs[0], otherProvider);
  assert.equal(hasExpectedTotpConfig(config), true);
});

test('TOTP verification fails when global or provider state drifts', () => {
  assert.equal(hasExpectedTotpConfig({
    state: 'DISABLED',
    providerConfigs: [{
      state: 'ENABLED',
      totpProviderConfig: { adjacentIntervals: 1 }
    }]
  }), false);
  assert.equal(hasExpectedTotpConfig({
    state: 'ENABLED',
    providerConfigs: [{
      state: 'DISABLED',
      totpProviderConfig: { adjacentIntervals: 1 }
    }]
  }), false);
});
