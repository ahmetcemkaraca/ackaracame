import assert from 'node:assert/strict';
import test from 'node:test';
import { planLegacyFunctionRetirement } from './legacy-functions.js';

test('legacy retirement selects only the two old us-central1 exports', () => {
  assert.deepEqual(planLegacyFunctionRetirement({
    projectId: 'ackaraca-prod',
    inventory: [
      {
        id: 'projects/ackaraca-prod/locations/us-central1/functions/adminLoginGuard',
        project: 'ackaraca-prod',
        region: 'us-central1'
      },
      { id: 'seedContent', project: 'ackaraca-prod', region: ['us-central1'] },
      { id: 'seedContent', project: 'ackaraca-prod', region: 'europe-west1' },
      { id: 'submitInquiry', project: 'ackaraca-prod', region: 'europe-west1' }
    ]
  }), {
    region: 'us-central1',
    names: ['adminLoginGuard', 'seedContent']
  });
});

test('legacy retirement is idempotent after the old region is empty', () => {
  assert.deepEqual(planLegacyFunctionRetirement({
    projectId: 'ackaraca-prod',
    inventory: [{ id: 'seedContent', region: 'europe-west1' }]
  }).names, []);
});

test('legacy retirement rejects cross-project inventory', () => {
  assert.throws(() => planLegacyFunctionRetirement({
    projectId: 'ackaraca-prod',
    inventory: [{ id: 'adminLoginGuard', project: 'other-project', region: 'us-central1' }]
  }), /another project/u);
});
