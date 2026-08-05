import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the production Functions module loads with valid endpoint options', async () => {
  const endpoints = await import('./index.js');
  assert.deepEqual(Object.keys(endpoints).sort(), [
    'auditAdminMediaUploads',
    'auditInquiryWrites',
    'auditJournalWrites',
    'auditProjectWrites',
    'auditSiteSettingsWrites',
    'collectOrphanedMedia',
    'deletePromotedMedia',
    'dispatchAutomaticRebuilds',
    'getLatestSiteRebuildStatus',
    'getPublishedPafta',
    'getSiteRebuildStatus',
    'promoteMedia',
    'requestSiteRebuild',
    'restrictUserCreation',
    'restrictUserSignIn',
    'seedContent',
    'submitInquiry'
  ]);
});

test('the manual rebuild callable delegates to the shared dispatcher', () => {
  const source = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  const start = source.indexOf('export const requestSiteRebuild');
  const end = source.indexOf('const readSiteRebuildStatus', start);
  assert(start >= 0 && end > start);
  const callableSource = source.slice(start, end);
  assert.match(callableSource, /await dispatchSiteRebuildQueue\(/u);
  assert.doesNotMatch(callableSource, /buildRebuildWebhookRequest|fetch\(/u);
  assert.equal((source.match(/const deadlineMs = Date\.now\(\) \+ REBUILD_WAIT_TIMEOUT_MS/gu) || []).length, 1);
});
