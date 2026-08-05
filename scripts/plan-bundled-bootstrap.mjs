import { createBundledBootstrapPlan } from './bundled-bootstrap.mjs';

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required.');

const plan = await createBundledBootstrapPlan({ projectId });
console.log([
  'Bundled revision-0 bootstrap plan',
  `Firebase project: ${plan.projectId}`,
  `Published projects: ${plan.projectCount}`,
  `Published journal entries: ${plan.journalCount}`,
  `Artifact bytes: ${plan.bytes}`,
  `SHA-256: ${plan.hash}`,
  `Required confirmation: ${plan.confirmation}`
].join('\n'));
