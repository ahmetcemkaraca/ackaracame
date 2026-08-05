import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ValidationError,
  isAllowedAdminAccountEmail,
  stableSerialize,
  validateAuditEvent,
  validateDeletePromotedMedia,
  validateInquiry,
  validatePaftaLookup,
  validatePromoteMedia,
  validateRebuildRequest,
  projectPublishedPafta,
  validateSeedCommand,
  validateSeedManifest
} from './validation.js';

test('administrator account creation is exact and fail-closed', () => {
  assert.equal(isAllowedAdminAccountEmail('owner@example.com', 'owner@example.com'), true);
  assert.equal(isAllowedAdminAccountEmail(' Owner@Example.com ', 'owner@example.com'), true);
  assert.equal(isAllowedAdminAccountEmail('', 'owner@example.com'), false);
  assert.equal(isAllowedAdminAccountEmail('not-an-email', 'not-an-email'), false);
  assert.equal(isAllowedAdminAccountEmail('owner@example.com', 'attacker@example.com'), false);
  assert.equal(isAllowedAdminAccountEmail('owner@example.com', undefined), false);
  assert.equal(
    isAllowedAdminAccountEmail('owner@example.com', 'owner\u202E@example.com'),
    false
  );
});

const validInquiry = {
  name: '  Ahmet Karaca  ',
  email: ' AHMET@example.com ',
  organization: ' ACK Studio ',
  inquiryType: 'collaboration',
  budgetBand: '15k-50k',
  timeline: 'one-to-three-months',
  message: ' Birlikte yeni bir proje geliştirmek istiyorum. ',
  locale: 'tr',
  privacyConsent: true,
  website: ''
};

test('validateInquiry normalizes bounded contact data', () => {
  assert.deepEqual(validateInquiry(validInquiry), {
    name: 'Ahmet Karaca',
    email: 'ahmet@example.com',
    organization: 'ACK Studio',
    inquiryType: 'collaboration',
    budgetBand: '15k-50k',
    timeline: 'one-to-three-months',
    message: 'Birlikte yeni bir proje geliştirmek istiyorum.',
    locale: 'tr',
    privacyConsent: true
  });
});

test('validatePromoteMedia accepts only canonical staging paths and safe owners', () => {
  assert.deepEqual(validatePromoteMedia({
    stagingPath: 'admin-media/admin_uid/550e8400-e29b-41d4-a716-446655440000.webp',
    entity: 'project',
    slug: 'draw-or-die'
  }), {
    stagingPath: 'admin-media/admin_uid/550e8400-e29b-41d4-a716-446655440000.webp',
    ownerUid: 'admin_uid',
    fileName: '550e8400-e29b-41d4-a716-446655440000.webp',
    extension: 'webp',
    entity: 'project',
    slug: 'draw-or-die'
  });

  assert.throws(() => validatePromoteMedia({
    stagingPath: 'admin-media/admin_uid/../private.webp',
    entity: 'project',
    slug: 'draw-or-die'
  }), (error) => error instanceof ValidationError && error.field === 'stagingPath');
  assert.throws(() => validatePromoteMedia({
    stagingPath: 'admin-media/admin_uid/file.webp',
    entity: 'site-settings',
    slug: 'main'
  }), (error) => error instanceof ValidationError && error.field === 'entity');
});

test('validateDeletePromotedMedia binds canonical paths to their entity and slug', () => {
  const deletionCapability = 'a'.repeat(43);
  assert.deepEqual(validateDeletePromotedMedia({
    storagePath: 'media/projects/draw-or-die/550e8400-e29b-41d4-a716-446655440000.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability
  }), {
    storagePath: 'media/projects/draw-or-die/550e8400-e29b-41d4-a716-446655440000.webp',
    entity: 'project',
    slug: 'draw-or-die',
    fileName: '550e8400-e29b-41d4-a716-446655440000.webp',
    extension: 'webp',
    deletionCapability
  });

  assert.throws(() => validateDeletePromotedMedia({
    storagePath: 'media/projects/another-project/image.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability
  }), (error) => error instanceof ValidationError && error.field === 'storagePath');
  assert.throws(() => validateDeletePromotedMedia({
    storagePath: 'media/journal/draw-or-die/image.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability
  }), (error) => error instanceof ValidationError && error.field === 'storagePath');
  assert.throws(() => validateDeletePromotedMedia({
    storagePath: 'media/projects/draw-or-die/../private.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability
  }), (error) => error instanceof ValidationError && error.field === 'storagePath');
  assert.throws(() => validateDeletePromotedMedia({
    storagePath: 'media/projects/draw-or-die/image.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability,
    generation: '1'
  }), (error) => error instanceof ValidationError && error.field === 'mediaDeletion.generation');
  assert.throws(() => validateDeletePromotedMedia({
    storagePath: 'media/projects/draw-or-die/image.webp',
    entity: 'project',
    slug: 'draw-or-die',
    deletionCapability: 'too-short'
  }), (error) => error instanceof ValidationError && error.field === 'deletionCapability');
});

test('validateRebuildRequest accepts only bounded canonical content paths', () => {
  assert.deepEqual(validateRebuildRequest({
    reason: 'content-published',
    paths: ['projects/draw-or-die', 'journal/design-notes']
  }), {
    reason: 'content-published',
    paths: ['journal/design-notes', 'projects/draw-or-die']
  });
  assert.deepEqual(validateRebuildRequest({ reason: 'manual' }), {
    reason: 'manual',
    paths: []
  });
  assert.throws(() => validateRebuildRequest({
    reason: 'content-updated',
    paths: ['projects/../systemMigrations/private']
  }), (error) => error instanceof ValidationError && error.field === 'paths[0]');
  assert.throws(() => validateRebuildRequest({
    reason: 'content-updated',
    paths: []
  }), (error) => error instanceof ValidationError && error.field === 'paths');
  assert.throws(() => validateRebuildRequest({
    reason: 'deploy-anything',
    paths: ['projects/draw-or-die']
  }), (error) => error instanceof ValidationError && error.field === 'reason');
});

test('pafta lookup and public projection preserve only sanitized legacy fields', () => {
  const code = 'pafta-1700000000000-a1b2c3d4e';
  assert.deepEqual(validatePaftaLookup({ code }), { code });
  assert.throws(
    () => validatePaftaLookup({ code: 'PAFTA-1700000000000-a1b2c3d4e' }),
    (error) => error instanceof ValidationError && error.field === 'code'
  );
  assert.throws(
    () => validatePaftaLookup({ code, status: 'published' }),
    (error) => error instanceof ValidationError && error.field === 'lookup.status'
  );

  assert.deepEqual(projectPublishedPafta({
    title: '  Güvenli\u202E Pafta  ',
    description: '  Kamusal   açıklama  ',
    semester: '2025 Bahar',
    year: 2025,
    course: 'Studio VI',
    professor: 'Prof. Example',
    technologies: ['Rhino', 'rhino', 'Grasshopper', { unsafe: true }],
    images: [
      'https://firebasestorage.googleapis.com/v0/b/demo/o/board.webp?alt=media',
      'https://lh3.googleusercontent.com/example/board.webp',
      '/media/boards/local.webp',
      'https://ackaraca.me/media/boards/absolute.webp',
      'https://evil.example/steal.webp',
      'javascript:alert(1)'
    ],
    qrCodeData: code,
    projectId: 'private-project-id',
    aiData: { prompts: ['private prompt'] },
    secretApiKey: 'never-return-this'
  }), {
    title: 'Güvenli Pafta',
    technologies: ['Rhino', 'Grasshopper'],
    images: [
      'https://firebasestorage.googleapis.com/v0/b/demo/o/board.webp?alt=media',
      'https://lh3.googleusercontent.com/example/board.webp',
      '/media/boards/local.webp'
    ],
    description: 'Kamusal açıklama',
    semester: '2025 Bahar',
    year: '2025',
    course: 'Studio VI',
    professor: 'Prof. Example'
  });
  assert.equal(projectPublishedPafta({ description: 'missing title' }), null);
});

test('validateInquiry accepts optional commercial fields being omitted', () => {
  const result = validateInquiry({
    name: 'Test User',
    email: 'test@example.com',
    inquiryType: 'employment',
    message: 'This is a valid employment inquiry message.',
    locale: 'en',
    privacyConsent: true
  });

  assert.equal(result.inquiryType, 'employment');
  assert.equal(result.locale, 'en');
  assert.equal('organization' in result, false);
});

test('validateInquiry rejects unknown fields and honeypot submissions', () => {
  assert.throws(
    () => validateInquiry({ ...validInquiry, role: 'admin' }),
    (error) => error instanceof ValidationError && error.field === 'inquiry.role'
  );
  assert.throws(
    () => validateInquiry({ ...validInquiry, website: 'https://spam.example' }),
    (error) => error instanceof ValidationError && error.field === 'website'
  );
});

test('validateInquiry rejects invalid email and unsafe control characters', () => {
  assert.throws(
    () => validateInquiry({ ...validInquiry, email: 'not-an-email' }),
    (error) => error instanceof ValidationError && error.field === 'email'
  );
  assert.throws(
    () => validateInquiry({ ...validInquiry, message: 'valid message\u0000payload' }),
    (error) => error instanceof ValidationError && error.field === 'message'
  );
});

test('validateInquiry requires explicit privacy consent and rejects server-owned fields', () => {
  assert.throws(
    () => validateInquiry({ ...validInquiry, privacyConsent: false }),
    (error) => error instanceof ValidationError && error.field === 'privacyConsent'
  );
  assert.throws(
    () => validateInquiry({ ...validInquiry, status: 'new' }),
    (error) => error instanceof ValidationError && error.field === 'inquiry.status'
  );
  assert.throws(
    () => validateInquiry({ ...validInquiry, createdAt: new Date().toISOString() }),
    (error) => error instanceof ValidationError && error.field === 'inquiry.createdAt'
  );
});

test('validateSeedManifest normalizes projects and applications into one collection', () => {
  const entries = validateSeedManifest({
    projects: [{
      id: 'sample-project',
      title: 'Sample Project',
      description: 'A valid project description with enough detail for the portfolio seed.',
      category: 'software',
      images: ['https://example.com/project.webp'],
      technologies: ['React'],
      status: 'active',
      order: 2,
      featured: true
    }],
    applications: [{
      id: 'sample-app',
      title: 'Sample App',
      description: 'A valid application description with enough detail for the portfolio seed.',
      link: '/sample',
      techStack: [{ name: 'Firebase', color: 'bg-amber-500' }]
    }]
  });

  assert.equal(entries.length, 2);
  assert.deepEqual(entries.map(({ id }) => id), ['sample-project', 'sample-app']);
  assert.equal(entries[0].data.discipline, 'software');
  assert.equal(entries[0].data.status, 'published');
  assert.equal(entries[0].data.order, 2);
  assert.equal(entries[1].data.format, 'product');
  assert.equal(entries[1].data.order, 100);
  assert.equal(entries[1].data.links[0].href, '/sample');
  assert.equal(entries[1].data.schemaVersion, 2);
});

test('validateSeedManifest rejects duplicates, insecure URLs, and unknown fields', () => {
  assert.throws(() => validateSeedManifest({
    projects: [{
      id: 'duplicate',
      title: 'One',
      description: 'A valid description that is comfortably longer than forty characters.',
      technologies: ['React']
    }],
    applications: [{
      id: 'duplicate',
      title: 'Two',
      description: 'A valid description that is comfortably longer than forty characters.',
      techStack: [{ name: 'Firebase' }]
    }]
  }), /duplicate id/u);

  assert.throws(() => validateSeedManifest({
    projects: [{
      id: 'insecure-image',
      title: 'Insecure',
      description: 'A valid description that is comfortably longer than forty characters.',
      technologies: ['React'],
      images: ['http://example.com/image.jpg']
    }]
  }), (error) => error instanceof ValidationError && error.field === 'projects[0].images[0]');

  assert.throws(() => validateSeedManifest({
    projects: [{
      id: 'unknown-field',
      title: 'Unknown',
      description: 'A valid description that is comfortably longer than forty characters.',
      technologies: ['React'],
      isAdmin: true
    }]
  }), (error) => error instanceof ValidationError && error.field === 'projects[0].isAdmin');

  assert.throws(() => validateSeedManifest({
    projects: [{
      id: 'invalid-order',
      title: 'Invalid order',
      description: 'A valid description that is comfortably longer than forty characters.',
      technologies: ['React'],
      order: -1
    }]
  }), (error) => error instanceof ValidationError && error.field === 'projects[0].order');

  assert.throws(() => validateSeedManifest({
    projects: [{
      id: 'a',
      title: 'Too short',
      description: 'A valid description that is comfortably longer than forty characters.',
      technologies: ['React']
    }]
  }), (error) => error instanceof ValidationError && error.field === 'projects[0].id');
});

test('validateSeedCommand is strict and stableSerialize is key-order independent', () => {
  assert.deepEqual(validateSeedCommand(), { dryRun: false });
  assert.deepEqual(validateSeedCommand({ dryRun: true }), { dryRun: true });
  assert.throws(() => validateSeedCommand({ force: true }), ValidationError);

  assert.equal(
    stableSerialize({ z: 1, nested: { b: 2, a: 1 } }),
    stableSerialize({ nested: { a: 1, b: 2 }, z: 1 })
  );
});

test('validateAuditEvent accepts only bounded admin audit metadata', () => {
  assert.deepEqual(validateAuditEvent({
    action: 'update',
    entity: 'project',
    documentId: 'draw-or-die',
    changedFields: ['title.tr', 'status']
  }), {
    action: 'update',
    entity: 'project',
    documentId: 'draw-or-die',
    changedFields: ['title.tr', 'status']
  });

  assert.equal(validateAuditEvent({
    action: 'media-upload',
    entity: 'media',
    documentId: 'admin-media/admin_uid/550e8400-e29b-41d4-a716-446655440000.webp'
  }).documentId, 'admin-media/admin_uid/550e8400-e29b-41d4-a716-446655440000.webp');

  assert.throws(
    () => validateAuditEvent({
      action: 'impersonate',
      entity: 'project',
      documentId: 'draw-or-die'
    }),
    (error) => error instanceof ValidationError && error.field === 'action'
  );
  assert.throws(
    () => validateAuditEvent({
      action: 'update',
      entity: 'project',
      documentId: 'draw-or-die',
      changedFields: ['status', 'status']
    }),
    (error) => error instanceof ValidationError && error.field === 'changedFields'
  );
  assert.throws(
    () => validateAuditEvent({
      action: 'media-upload',
      entity: 'media',
      documentId: 'admin-media/../private.webp'
    }),
    (error) => error instanceof ValidationError && error.field === 'documentId'
  );
});
