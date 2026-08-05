import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRebuildWebhookRequest } from './rebuild-provider.js';

const payload = {
  requestId: 'request-id',
  revision: 4,
  reason: 'content-updated',
  paths: ['projects/atlas'],
  requestedAt: '2026-08-04T12:00:00.000Z'
};

test('GitHub dispatch uses the repository_dispatch contract and bearer authentication', () => {
  const request = buildRebuildWebhookRequest({
    provider: 'github',
    token: 'github-token-at-least-20-characters',
    payload
  });
  assert.equal(request.headers.authorization, 'Bearer github-token-at-least-20-characters');
  assert.equal(request.headers['x-github-api-version'], '2022-11-28');
  assert.deepEqual(JSON.parse(request.body), {
    event_type: 'site-rebuild',
    client_payload: payload
  });
});

test('generic hooks receive the canonical event envelope and reject weak credentials', () => {
  const request = buildRebuildWebhookRequest({
    provider: 'generic',
    token: 'generic-token-at-least-20-characters',
    payload
  });
  assert.deepEqual(JSON.parse(request.body), {
    event: 'site.rebuild.requested',
    ...payload
  });
  assert.throws(() => buildRebuildWebhookRequest({
    provider: 'generic',
    token: 'short',
    payload
  }), /authentication is invalid/u);
});
