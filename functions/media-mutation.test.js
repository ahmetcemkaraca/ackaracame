import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertPublisherMutationOwnership,
  isActiveMediaMutationLease
} from './media-mutation.js';

const timestamp = (milliseconds) => ({ toMillis: () => milliseconds });

test('running media mutation leases are active until expiry and malformed leases fail closed', () => {
  assert.equal(isActiveMediaMutationLease({
    state: { status: 'running', leaseExpiresAt: timestamp(2000) },
    nowMs: 1999
  }), true);
  assert.equal(isActiveMediaMutationLease({
    state: { status: 'running', leaseExpiresAt: timestamp(2000) },
    nowMs: 2000
  }), false);
  assert.equal(isActiveMediaMutationLease({
    state: { status: 'running' },
    nowMs: 2000
  }), true);
});

test('a publisher must own two live leases for every manifest mutation', () => {
  const input = {
    state: {
      status: 'preparing',
      deploymentId: 'deployment-a',
      snapshotHash: 'hash-a',
      revision: 4,
      operationToken: 'publisher-token',
      leaseExpiresAt: timestamp(5000)
    },
    mutation: {
      status: 'running',
      ownerType: 'media-publisher',
      ownerId: 'publisher-token',
      leaseExpiresAt: timestamp(5000)
    },
    action: 'prepare',
    deploymentId: 'deployment-a',
    snapshotHash: 'hash-a',
    revision: 4,
    operationToken: 'publisher-token',
    nowMs: 4999
  };
  assert.doesNotThrow(() => assertPublisherMutationOwnership(input));
  assert.throws(() => assertPublisherMutationOwnership({
    ...input,
    nowMs: 5000
  }), /superseded/u);
  assert.throws(() => assertPublisherMutationOwnership({
    ...input,
    mutation: { ...input.mutation, ownerId: 'new-owner' }
  }), /superseded/u);
  assert.throws(() => assertPublisherMutationOwnership({
    ...input,
    state: { ...input.state, leaseExpiresAt: null }
  }), /superseded/u);
});
