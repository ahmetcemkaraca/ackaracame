import crypto from 'node:crypto';

const CAPABILITY = /^[a-zA-Z0-9_-]{43}$/u;
const HASH = /^[a-f0-9]{64}$/u;

export const issueMediaDeletionCapability = ({ nowMs, lifetimeMs }) => {
  if (!Number.isFinite(nowMs) || !Number.isFinite(lifetimeMs) || lifetimeMs <= 0) {
    throw new Error('The media deletion capability lifetime is invalid.');
  }
  const value = crypto.randomBytes(32).toString('base64url');
  return {
    value,
    hash: crypto.createHash('sha256').update(value).digest('hex'),
    expiresAtMs: Math.floor(nowMs + lifetimeMs)
  };
};

export const verifyMediaDeletionCapability = ({
  value,
  expectedHash,
  expiresAtMs,
  nowMs
}) => {
  if (
    typeof value !== 'string'
    || !CAPABILITY.test(value)
    || typeof expectedHash !== 'string'
    || !HASH.test(expectedHash)
    || !Number.isSafeInteger(expiresAtMs)
    || expiresAtMs <= nowMs
  ) return false;
  const actual = crypto.createHash('sha256').update(value).digest();
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

export const mediaDeletionJournalId = ({ storagePath, generation }) => (
  crypto.createHash('sha256').update(`${storagePath}\0${generation}`).digest('hex')
);
