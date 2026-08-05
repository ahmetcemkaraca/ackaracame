import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

const PROJECT_ID = 'demo-ackaracame-test';
const ADMIN_UID = 'admin-user';
const ADMIN_EMAIL = 'admin@example.com';
const IMAGE_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let testEnv;

const localized = (tr, en = tr) => ({ tr, en });
const fixedTimestamp = () => firebase.firestore.Timestamp.fromMillis(1_700_000_000_000);
const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

const adminContext = () => testEnv.authenticatedContext(ADMIN_UID, {
  admin: true,
  email: ADMIN_EMAIL,
  email_verified: true,
  firebase: {
    sign_in_provider: 'password',
    identities: { email: ['admin@example.com'] },
    sign_in_second_factor: 'totp'
  }
});

const wrongUidAdminContext = () => testEnv.authenticatedContext('wrong-admin', {
  admin: true,
  email: ADMIN_EMAIL,
  email_verified: true,
  firebase: {
    sign_in_provider: 'password',
    identities: { email: [ADMIN_EMAIL] },
    sign_in_second_factor: 'totp'
  }
});

const wrongEmailAdminContext = () => testEnv.authenticatedContext(ADMIN_UID, {
  admin: true,
  email: 'wrong-admin@example.com',
  email_verified: true,
  firebase: {
    sign_in_provider: 'password',
    identities: { email: ['wrong-admin@example.com'] },
    sign_in_second_factor: 'totp'
  }
});

const adminWithoutMfaContext = () => testEnv.authenticatedContext(ADMIN_UID, {
  admin: true,
  email: 'admin@example.com',
  email_verified: true,
  firebase: {
    sign_in_provider: 'password',
    identities: { email: ['admin@example.com'] }
  }
});

const verifiedUserContext = () => testEnv.authenticatedContext('verified-user', {
  email: 'person@example.com',
  email_verified: true,
  firebase: {
    sign_in_provider: 'password',
    identities: { email: ['person@example.com'] }
  }
});

const projectData = ({
  slug,
  status = 'draft',
  createdAt = fixedTimestamp(),
  updatedAt = fixedTimestamp()
}) => ({
  schemaVersion: 2,
  slug,
  status,
  discipline: 'software',
  format: 'case-study',
  featured: false,
  order: 10,
  title: localized('Örnek Proje', 'Example Project'),
  dek: localized(
    'Güvenlik kurallarını sınamak için yeterince uzun proje özeti.',
    'A sufficiently long project summary used to exercise security rules.'
  ),
  technologies: ['TypeScript'],
  topics: ['security'],
  cover: {
    slug,
    palette: ['#111827', '#f9fafb', '#2563eb'],
    visualVariant: 'code-canvas',
    alt: localized('Örnek proje kapağı', 'Example project cover')
  },
  media: [],
  links: [],
  metrics: [],
  blocks: [{ id: 'overview' }, { id: 'details' }],
  relatedSlugs: [],
  seo: {
    title: localized('Örnek Proje — ACKaraca', 'Example Project — ACKaraca'),
    description: localized(
      'Örnek projenin güvenli ve erişilebilir açıklaması burada yer alır.',
      'A secure and accessible description for the example project appears here.'
    ),
    noIndex: status !== 'published'
  },
  createdAt,
  updatedAt
});

const siteSettingsData = ({ updatedAt = fixedTimestamp(), createdAt = fixedTimestamp() } = {}) => ({
  schemaVersion: 2,
  siteName: localized('ACKaraca Portfolyo', 'ACKaraca Portfolio'),
  ownerName: localized('Ahmet Cem Karaca'),
  headline: localized('Mimar ve ürün geliştirici', 'Architect and product builder'),
  introduction: localized(
    'Mimarlık, tasarım ve yazılımın kesişiminde çalışan bağımsız bir üreticiyim.',
    'I am an independent maker working across architecture, design, and software.'
  ),
  location: localized('İstanbul, Türkiye', 'Istanbul, Türkiye'),
  contactEmail: 'hello@example.com',
  canonicalUrl: 'https://ackaraca.me/',
  defaultLocale: 'tr',
  supportedLocales: ['tr', 'en'],
  availability: 'open-to-inquiries',
  socialLinks: [],
  palette: {
    background: '#f9fafb',
    foreground: '#111827',
    accent: '#2563eb'
  },
  footerNote: localized(
    'Düşünülmüş ürünler ve mekânlar üretmek için buradayım.',
    'Here to make considered products and spaces.'
  ),
  defaultSeo: {
    title: localized('ACKaraca — Mimar ve Geliştirici', 'ACKaraca — Architect and Developer'),
    description: localized(
      'Ahmet Cem Karaca’nın mimarlık, tasarım ve yazılım çalışmalarından seçkiler.',
      'Selected architecture, design, and software work by Ahmet Cem Karaca.'
    ),
    noIndex: false
  },
  createdAt,
  updatedAt
});

const seedFirestore = async (writes) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(writes.map(({ path, data }) => db.doc(path).set(data)));
  });
};

const seedStorage = async (writes) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const storage = context.storage();
    await Promise.all(writes.map(({ path, bytes = IMAGE_BYTES, metadata }) => (
      storage.ref(path).put(bytes, metadata)
    )));
  });
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
    storage: { rules: fs.readFileSync('storage.rules', 'utf8') }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seedFirestore([{
    path: 'systemPolicies/owner-access',
    data: {
      schemaVersion: 1,
      uid: ADMIN_UID,
      email: ADMIN_EMAIL,
      updatedAt: fixedTimestamp()
    }
  }]);
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore public boundary', () => {
  test('public content documents are snapshot-only while administrators retain direct access', async () => {
    await seedFirestore([
      { path: 'projects/published-work', data: projectData({ slug: 'published-work', status: 'published' }) },
      { path: 'projects/draft-work', data: projectData({ slug: 'draft-work', status: 'draft' }) },
      { path: 'journal/published-entry', data: { status: 'published' } },
      { path: 'siteSettings/main', data: siteSettingsData() }
    ]);

    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.doc('projects/published-work').get());
    await assertFails(db.doc('projects/draft-work').get());
    await assertFails(db.doc('journal/published-entry').get());
    await assertFails(db.doc('siteSettings/main').get());
    await assertFails(db.collection('projects').where('status', '==', 'published').get());
    await assertFails(db.collection('projects').get());
    const adminDb = adminContext().firestore();
    await assertSucceeds(adminDb.doc('projects/published-work').get());
    await assertSucceeds(adminDb.doc('journal/published-entry').get());
    await assertSucceeds(adminDb.doc('siteSettings/main').get());
    await assertSucceeds(adminDb.collection('projects').get());
  });

  test('malformed or secret-bearing settings are not exposed publicly', async () => {
    await seedFirestore([{
      path: 'siteSettings/main',
      data: { ...siteSettingsData(), secretApiKey: 'must-never-leak' }
    }]);

    await assertFails(
      testEnv.unauthenticatedContext().firestore().doc('siteSettings/main').get()
    );
    await assertSucceeds(adminContext().firestore().doc('siteSettings/main').get());
  });

  test('legacy collections remain quarantined even when marked published', async () => {
    await seedFirestore([
      {
        path: 'blogPosts/legacy-post',
        data: { status: 'published', title: 'Legacy post' }
      },
      {
        path: 'paftas/physical-board',
        data: {
          status: 'published',
          qrCodeData: 'pafta-1700000000000-a1b2c3d4e',
          title: 'Physical board'
        }
      }
    ]);
    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      anonymousDb.doc('blogPosts/legacy-post').get()
    );
    await assertFails(anonymousDb.collection('paftas')
      .where('status', '==', 'published')
      .where('qrCodeData', '==', 'pafta-1700000000000-a1b2c3d4e')
      .limit(1)
      .get());
    await assertSucceeds(adminContext().firestore().doc('blogPosts/legacy-post').get());
    await assertSucceeds(adminContext().firestore().doc('paftas/physical-board').get());
  });
});

describe('Firestore administrator boundary', () => {
  test('verified users and admin tokens without a TOTP session cannot write', async () => {
    const payload = projectData({
      slug: 'blocked-write',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await assertFails(
      verifiedUserContext().firestore().doc('projects/blocked-write').set(payload)
    );
    await assertFails(
      adminWithoutMfaContext().firestore().doc('projects/blocked-write').set(payload)
    );
  });

  test('a valid-looking admin claim is denied unless UID and email match the owner policy', async () => {
    await seedStorage([{
      path: 'images/owner-policy.png',
      metadata: { contentType: 'image/png' }
    }]);
    for (const context of [wrongUidAdminContext(), wrongEmailAdminContext()]) {
      const wrongDb = context.firestore();
      await assertFails(wrongDb.doc('projects/blocked-owner').get());
      await assertFails(wrongDb.doc('projects/blocked-owner').set(projectData({
        slug: 'blocked-owner',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })));
      await assertFails(context.storage().ref('images/owner-policy.png').getMetadata());
    }
    await assertSucceeds(
      adminContext().storage().ref('images/owner-policy.png').getMetadata()
    );
    await assertFails(
      wrongUidAdminContext().storage().ref('admin-media/wrong-admin/upload.png').put(
        IMAGE_BYTES,
        {
          contentType: 'image/png',
          customMetadata: { uploadedBy: 'wrong-admin' }
        }
      )
    );
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('systemPolicies/owner-access').delete();
    });
    await assertFails(adminContext().firestore().doc('projects/blocked-owner').get());
    await assertFails(
      adminContext().storage().ref('images/owner-policy.png').getMetadata()
    );
  });

  test('TOTP-authenticated admins preserve create and update timestamps', async () => {
    const db = adminContext().firestore();
    const target = db.doc('projects/timestamp-safe');

    await assertSucceeds(target.set(projectData({
      slug: 'timestamp-safe',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })));
    await assertSucceeds(target.update({ featured: true, updatedAt: serverTimestamp() }));
    await assertFails(target.update({
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    await assertFails(db.doc('projects/stale-create').set(projectData({
      slug: 'stale-create',
      createdAt: fixedTimestamp(),
      updatedAt: fixedTimestamp()
    })));
  });

  test('clients cannot create inquiries or mutate operational collections', async () => {
    const userDb = verifiedUserContext().firestore();
    const adminDb = adminContext().firestore();
    const inquiry = {
      name: 'Example Person',
      email: 'person@example.com',
      inquiryType: 'collaboration',
      message: 'This is a valid-looking inquiry that must still use the callable function.',
      locale: 'en',
      privacyConsent: true,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await assertFails(userDb.doc('inquiries/client-created').set(inquiry));
    await assertFails(adminDb.doc('inquiries/admin-created').set(inquiry));
    await assertFails(adminDb.doc('auditLogs/forged').set({ action: 'forged' }));
    await assertFails(adminDb.doc('rateLimits/tampered').set({ count: 0 }));
    await assertFails(adminDb.doc('rateLimits/tampered').get());
    await assertFails(adminDb.doc('systemOperations/site-rebuild').get());
    await assertFails(adminDb.doc('systemOperations/site-rebuild').set({ status: 'queued' }));
    await assertFails(adminDb.doc('systemPolicies/owner-access').get());
    await assertFails(adminDb.doc('systemPolicies/owner-access').set({
      schemaVersion: 1,
      uid: ADMIN_UID,
      email: ADMIN_EMAIL,
      updatedAt: serverTimestamp()
    }));
    await assertFails(adminDb.doc('systemPolicies/owner-access').delete());
    await assertFails(adminDb.doc('mediaPublications/project--forged').get());
    await assertFails(adminDb.doc('mediaPublications/project--forged').set({
      entity: 'project',
      slug: 'forged',
      active: true,
      complete: true,
      files: ['private.png']
    }));
    await assertFails(adminDb.doc('mediaDeletionJournal/forged').get());
    await assertFails(adminDb.doc('mediaDeletionJournal/forged').set({
      status: 'deleted',
      storagePath: 'media/projects/forged/private.png',
      generation: '1'
    }));
    await assertFails(adminDb.doc('rebuildOutbox/forged').set({ status: 'enqueued' }));
    await assertFails(adminDb.doc('rebuildExecutions/revision-1').set({ status: 'active' }));
    await assertFails(adminDb.doc('migrationBackups/legacy-collision-v2-forged').get());
    await assertFails(adminDb.doc(
      'migrationBackups/legacy-collision-v2-forged/documents/projects--draw-or-die'
    ).set({ sourcePath: 'projects/draw-or-die' }));
  });

  test('an active media mutation lease fences admin content saves fail-closed', async () => {
    const targetPath = 'projects/mutation-fenced';
    const adminDb = adminContext().firestore();
    await seedFirestore([{
      path: 'systemOperations/media-mutation',
      data: {
        status: 'running',
        ownerType: 'scheduled-gc',
        ownerId: 'gc-owner',
        leaseExpiresAt: firebase.firestore.Timestamp.fromMillis(Date.now() + 60_000)
      }
    }]);
    await assertFails(adminDb.doc(targetPath).set(projectData({
      slug: 'mutation-fenced',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })));

    await seedFirestore([{
      path: 'systemOperations/media-mutation',
      data: {
        status: 'running',
        ownerType: 'scheduled-gc',
        ownerId: 'expired-owner',
        leaseExpiresAt: firebase.firestore.Timestamp.fromMillis(Date.now() - 60_000)
      }
    }]);
    await assertSucceeds(adminDb.doc(targetPath).set(projectData({
      slug: 'mutation-fenced',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })));

    await seedFirestore([{
      path: 'systemOperations/media-mutation',
      data: {
        status: 'running',
        ownerType: 'media-publisher',
        ownerId: 'publisher-owner'
      }
    }]);
    await assertFails(adminDb.doc(targetPath).update({
      featured: true,
      updatedAt: serverTimestamp()
    }));
  });

  test('site settings reject extra keys even for an administrator write', async () => {
    const db = adminContext().firestore();
    await assertFails(db.doc('siteSettings/main').set({
      ...siteSettingsData({
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }),
      secretApiKey: 'must-never-be-written'
    }));
  });
});

describe('Storage staging boundary', () => {
  test('staging is private and requires canonical owner, path, MIME, size, and metadata', async () => {
    const adminStorage = adminContext().storage();
    const anonymousStorage = testEnv.unauthenticatedContext().storage();
    const validPath = `admin-media/${ADMIN_UID}/valid-upload.png`;

    await assertSucceeds(adminStorage.ref(validPath).put(IMAGE_BYTES, {
      contentType: 'image/png',
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: ADMIN_UID }
    }));
    await assertFails(anonymousStorage.ref(validPath).getMetadata());
    await assertSucceeds(adminStorage.ref(validPath).getMetadata());
    await assertSucceeds(adminStorage.ref(validPath).delete());

    await assertFails(adminStorage.ref(`admin-media/${ADMIN_UID}/nested/file.png`).put(IMAGE_BYTES, {
      contentType: 'image/png',
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: ADMIN_UID }
    }));
    await assertFails(adminStorage.ref(`admin-media/${ADMIN_UID}/mismatch.png`).put(IMAGE_BYTES, {
      contentType: 'image/jpeg',
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: ADMIN_UID }
    }));
    await assertFails(adminStorage.ref(`admin-media/${ADMIN_UID}/missing-metadata.webp`).put(IMAGE_BYTES, {
      contentType: 'image/webp',
      cacheControl: 'private,max-age=0,no-store'
    }));
    await assertFails(adminStorage.ref(`admin-media/${ADMIN_UID}/wrong-owner.webp`).put(IMAGE_BYTES, {
      contentType: 'image/webp',
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: 'someone-else' }
    }));
    await assertFails(adminStorage.ref(`admin-media/${ADMIN_UID}/too-large.webp`).put(
      new Uint8Array((8 * 1024 * 1024) + 1),
      {
        contentType: 'image/webp',
        cacheControl: 'private,max-age=0,no-store',
        customMetadata: { uploadedBy: ADMIN_UID }
      }
    ));
  });

  test('ordinary users, non-MFA admins, and anonymous visitors cannot use staging', async () => {
    const metadata = {
      contentType: 'image/png',
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: ADMIN_UID }
    };
    await assertFails(
      verifiedUserContext().storage().ref('admin-media/verified-user/user.png').put(
        IMAGE_BYTES,
        { ...metadata, customMetadata: { uploadedBy: 'verified-user' } }
      )
    );
    await assertFails(
      adminWithoutMfaContext().storage().ref(`admin-media/${ADMIN_UID}/no-mfa.png`).put(
        IMAGE_BYTES,
        metadata
      )
    );
    await assertFails(
      testEnv.unauthenticatedContext().storage().ref(`admin-media/${ADMIN_UID}/anon.png`).put(
        IMAGE_BYTES,
        metadata
      )
    );
  });
});

describe('Storage publication boundary', () => {
  test('active deployment manifests preserve the old site across live edits and deny unsaved or retired files', async () => {
    await seedFirestore([
      { path: 'projects/public-project', data: { status: 'published' } },
      { path: 'projects/draft-project', data: { status: 'draft' } },
      { path: 'journal/public-entry', data: { status: 'published' } },
      { path: 'journal/draft-entry', data: { status: 'draft' } },
      {
        path: 'mediaPublications/project--public-project',
        data: {
          entity: 'project', slug: 'public-project', active: true, complete: true, files: ['cover.png']
        }
      },
      {
        path: 'mediaPublications/project--draft-project',
        data: {
          entity: 'project', slug: 'draft-project', active: true, complete: true, files: ['cover.png']
        }
      },
      {
        path: 'mediaPublications/journal--public-entry',
        data: {
          entity: 'journal', slug: 'public-entry', active: true, complete: true, files: ['cover.png']
        }
      },
      {
        path: 'mediaPublications/journal--draft-entry',
        data: {
          entity: 'journal', slug: 'draft-entry', active: true, complete: true, files: ['cover.png']
        }
      },
      {
        path: 'mediaPublications/project--deleted-project',
        data: {
          entity: 'project', slug: 'deleted-project', active: true, complete: true, files: ['cover.png']
        }
      },
      {
        path: 'mediaPublications/project--inactive-project',
        data: {
          entity: 'project', slug: 'inactive-project', active: false, complete: true, files: ['cover.png']
        }
      }
    ]);
    await seedStorage([
      { path: 'media/projects/public-project/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'media/projects/public-project/promoted-but-unsaved.png', metadata: { contentType: 'image/png' } },
      { path: 'media/projects/draft-project/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'media/journal/public-entry/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'media/journal/draft-entry/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'media/projects/deleted-project/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'media/projects/inactive-project/cover.png', metadata: { contentType: 'image/png' } },
      { path: 'images/legacy.png', metadata: { contentType: 'image/png' } }
    ]);

    const anonymousStorage = testEnv.unauthenticatedContext().storage();
    const adminStorage = adminContext().storage();
    await assertSucceeds(anonymousStorage.ref('media/projects/public-project/cover.png').getMetadata());
    await assertFails(anonymousStorage.ref('media/projects/public-project/promoted-but-unsaved.png').getMetadata());
    await assertSucceeds(anonymousStorage.ref('media/projects/draft-project/cover.png').getMetadata());
    await assertSucceeds(anonymousStorage.ref('media/journal/public-entry/cover.png').getMetadata());
    await assertSucceeds(anonymousStorage.ref('media/journal/draft-entry/cover.png').getMetadata());
    await assertSucceeds(anonymousStorage.ref('media/projects/deleted-project/cover.png').getMetadata());
    await assertFails(anonymousStorage.ref('media/projects/inactive-project/cover.png').getMetadata());
    await assertSucceeds(adminStorage.ref('media/projects/draft-project/cover.png').getMetadata());
    await assertFails(anonymousStorage.ref('images/legacy.png').getMetadata());
    await assertSucceeds(adminStorage.ref('images/legacy.png').getMetadata());
  });

  test('published media paths are function-owned and immutable to clients', async () => {
    await seedFirestore([{
      path: 'projects/public-project',
      data: { status: 'published' }
    }]);
    await seedStorage([
      { path: 'media/projects/public-project/existing.png', metadata: { contentType: 'image/png' } },
      { path: 'media/journal/public-entry/existing.png', metadata: { contentType: 'image/png' } },
      { path: 'media/site/main/existing.png', metadata: { contentType: 'image/png' } }
    ]);
    const adminStorage = adminContext().storage();
    await assertFails(
      adminStorage.ref('media/projects/public-project/direct.png')
        .put(IMAGE_BYTES, { contentType: 'image/png' })
    );
    await assertFails(
      adminStorage.ref('media/site/main/direct.png')
        .put(IMAGE_BYTES, { contentType: 'image/png' })
    );
    await assertFails(adminStorage.ref('media/projects/public-project/existing.png').delete());
    await assertFails(adminStorage.ref('media/journal/public-entry/existing.png').delete());
    await assertFails(adminStorage.ref('media/site/main/existing.png').delete());
  });
});
