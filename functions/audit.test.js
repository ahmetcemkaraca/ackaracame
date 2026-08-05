import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveAuditAction, getChangedFields } from './audit.js';

test('deriveAuditAction identifies document lifecycle and publication transitions', () => {
  assert.equal(deriveAuditAction({
    beforeData: null,
    afterData: { status: 'draft' },
    entity: 'project'
  }), 'create');
  assert.equal(deriveAuditAction({
    beforeData: { status: 'draft' },
    afterData: { status: 'published' },
    entity: 'project'
  }), 'publish');
  assert.equal(deriveAuditAction({
    beforeData: { status: 'published' },
    afterData: { status: 'archived' },
    entity: 'journal'
  }), 'archive');
  assert.equal(deriveAuditAction({
    beforeData: { status: 'archived' },
    afterData: { status: 'draft' },
    entity: 'journal'
  }), 'restore');
  assert.equal(deriveAuditAction({
    beforeData: { status: 'draft' },
    afterData: null,
    entity: 'project'
  }), 'delete');
});

test('deriveAuditAction uses entity-specific update actions', () => {
  assert.equal(deriveAuditAction({
    beforeData: { availability: 'limited' },
    afterData: { availability: 'unavailable' },
    entity: 'site-settings'
  }), 'settings-update');
  assert.equal(deriveAuditAction({
    beforeData: { status: 'new' },
    afterData: { status: 'replied' },
    entity: 'inquiry'
  }), 'inquiry-update');
});

test('getChangedFields compares nested data deterministically and caps output', () => {
  assert.deepEqual(getChangedFields(
    { status: 'draft', title: { tr: 'A', en: 'A' }, untouched: [1, 2] },
    { status: 'published', title: { en: 'A', tr: 'A' }, untouched: [1, 2] }
  ), ['status']);

  const manyBefore = Object.fromEntries(Array.from({ length: 50 }, (_, index) => [`field${index}`, 0]));
  const manyAfter = Object.fromEntries(Array.from({ length: 50 }, (_, index) => [`field${index}`, 1]));
  assert.equal(getChangedFields(manyBefore, manyAfter).length, 40);
});
