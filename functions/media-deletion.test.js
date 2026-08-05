import assert from 'node:assert/strict';
import test from 'node:test';
import {
  issueMediaDeletionCapability,
  mediaDeletionJournalId,
  verifyMediaDeletionCapability
} from './media-deletion.js';

test('media deletion capabilities are random, hashed, bounded, and expiry checked', () => {
  const issued = issueMediaDeletionCapability({ nowMs: 1000, lifetimeMs: 5000 });
  assert.match(issued.value, /^[a-zA-Z0-9_-]{43}$/u);
  assert.match(issued.hash, /^[a-f0-9]{64}$/u);
  assert.equal(verifyMediaDeletionCapability({
    value: issued.value,
    expectedHash: issued.hash,
    expiresAtMs: issued.expiresAtMs,
    nowMs: 5999
  }), true);
  assert.equal(verifyMediaDeletionCapability({
    value: 'b'.repeat(43),
    expectedHash: issued.hash,
    expiresAtMs: issued.expiresAtMs,
    nowMs: 5999
  }), false);
  assert.equal(verifyMediaDeletionCapability({
    value: issued.value,
    expectedHash: issued.hash,
    expiresAtMs: issued.expiresAtMs,
    nowMs: 6000
  }), false);
});

test('physical deletion journal IDs bind path and generation without exposing capabilities', () => {
  const first = mediaDeletionJournalId({ storagePath: 'media/projects/a/file.webp', generation: '7' });
  const second = mediaDeletionJournalId({ storagePath: 'media/projects/a/file.webp', generation: '8' });
  assert.match(first, /^[a-f0-9]{64}$/u);
  assert.notEqual(first, second);
});
