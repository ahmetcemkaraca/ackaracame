import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  deleteObject,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import {
  safeParseInquiry,
  safeParseJournalEntry,
  safeParsePortfolioProject,
  safeParseSiteSettings,
  type Inquiry,
  type JournalEntry,
  type PortfolioProject,
  type SiteSettings,
} from '../../domain/content';
import { requireFirebaseServices } from './client';

export interface InvalidContentRecord {
  id: string;
  reason: string;
}

export interface AdminContentResult<T> {
  valid: T[];
  invalid: InvalidContentRecord[];
}

export interface AdminInquiryRecord {
  documentId: string;
  inquiry: Inquiry;
}

export type AdminInquiryCursor = QueryDocumentSnapshot<DocumentData> | null;

export interface AdminInquiryPage extends AdminContentResult<AdminInquiryRecord> {
  nextCursor: AdminInquiryCursor;
  hasMore: boolean;
}

export type PromotableMediaEntity = 'project' | 'journal';

export interface PromotedAdminImage {
  ok: true;
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
  promotedNow: boolean;
  deletionCapability: string | null;
}

export interface DeletedPromotedAdminImage {
  ok: true;
  deleted: boolean;
}

export type SiteRebuildReason =
  | 'content-published'
  | 'content-updated'
  | 'settings-updated'
  | 'manual';

export interface SiteRebuildRequest {
  reason: SiteRebuildReason;
  paths?: string[];
}

export interface SiteRebuildResult {
  ok: true;
  status: 'hook-accepted';
  requestId: string;
  revision: number;
  acceptedRevision: number;
  coalesced: boolean;
}

export type SiteRebuildDeploymentState =
  | 'idle'
  | 'awaiting-hook'
  | 'dispatching'
  | 'hook-failed'
  | 'deploying'
  | 'deploy-failed'
  | 'active';

export interface SiteRebuildStatusResult {
  ok: true;
  targetRevision: number;
  state: SiteRebuildDeploymentState;
  requestedRevision: number;
  hookAcceptedRevision: number;
  activeRevision: number;
  queueStatus: 'queued' | 'dispatching' | 'hook-accepted' | 'failed' | 'unknown';
  deploymentStatus:
    | 'preparing'
    | 'prepared'
    | 'prepare-failed'
    | 'finalizing'
    | 'finalize-failed'
    | 'active'
    | 'aborted'
    | 'unknown';
  failureCode: string | null;
  activeDeploymentId: string | null;
}

const stripSystemFields = (data: DocumentData) => {
  const { createdAt, updatedAt, deletedAt, schemaVersion, ...content } = data;
  void createdAt;
  void updatedAt;
  void deletedAt;
  void schemaVersion;
  return content;
};

const stableContentValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableContentValue);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stableContentValue(item)]),
  );
};

const contentMatches = (left: unknown, right: unknown) => (
  JSON.stringify(stableContentValue(left)) === JSON.stringify(stableContentValue(right))
);

const validationReason = (error: { issues?: Array<{ path: PropertyKey[]; message: string }> }) =>
  error.issues?.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') || 'Invalid content record';

const parseCollection = <T>(
  docs: QueryDocumentSnapshot<DocumentData>[],
  parser: (value: unknown) => { success: true; data: T } | { success: false; error: { issues?: Array<{ path: PropertyKey[]; message: string }> } },
): AdminContentResult<T> => {
  const result: AdminContentResult<T> = { valid: [], invalid: [] };
  docs.forEach((snapshot) => {
    const parsed = parser(stripSystemFields(snapshot.data()));
    if (parsed.success) result.valid.push(parsed.data);
    else result.invalid.push({ id: snapshot.id, reason: validationReason(parsed.error) });
  });
  return result;
};

export const loadAdminProjects = async (): Promise<AdminContentResult<PortfolioProject>> => {
  const { db } = requireFirebaseServices();
  const snapshot = await getDocs(query(collection(db, 'projects'), limit(250)));
  const result = parseCollection(snapshot.docs, safeParsePortfolioProject);
  result.valid.sort((left, right) => (left.order ?? 100) - (right.order ?? 100));
  return result;
};

export const loadAdminJournal = async (): Promise<AdminContentResult<JournalEntry>> => {
  const { db } = requireFirebaseServices();
  const snapshot = await getDocs(query(collection(db, 'journal'), limit(500)));
  const result = parseCollection(snapshot.docs, safeParseJournalEntry);
  result.valid.sort((left, right) => (left.order ?? 100) - (right.order ?? 100));
  return result;
};

export const saveProject = async (input: PortfolioProject, previous: PortfolioProject | null = null) => {
  const parsed = safeParsePortfolioProject(input);
  if (!parsed.success) throw parsed.error;
  if (previous && previous.slug !== parsed.data.slug) {
    throw new Error('Published slugs are permanent. Duplicate the project to use a new URL.');
  }
  const { db } = requireFirebaseServices();
  const target = doc(db, 'projects', parsed.data.slug);
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(target);
    if (!previous && existing.exists()) {
      throw new Error('A project with this slug already exists. Open the existing record or choose another slug.');
    }
    if (previous && !existing.exists()) {
      throw new Error('The project no longer exists. Reload Studio before saving again.');
    }
    if (previous && existing.exists()) {
      const current = safeParsePortfolioProject(stripSystemFields(existing.data()));
      if (!current.success || !contentMatches(current.data, previous)) {
        throw new Error('This project changed in another session. Reload Studio before saving to avoid overwriting newer work.');
      }
    }
    transaction.set(target, {
      ...parsed.data,
      schemaVersion: 2,
      createdAt: existing.data()?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return parsed.data;
};

export const saveJournalEntry = async (input: JournalEntry, previous: JournalEntry | null = null) => {
  const parsed = safeParseJournalEntry(input);
  if (!parsed.success) throw parsed.error;
  if (previous && previous.slug !== parsed.data.slug) {
    throw new Error('Published slugs are permanent. Duplicate the entry to use a new URL.');
  }
  const { db } = requireFirebaseServices();
  const target = doc(db, 'journal', parsed.data.slug);
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(target);
    if (!previous && existing.exists()) {
      throw new Error('A journal entry with this slug already exists. Open the existing record or choose another slug.');
    }
    if (previous && !existing.exists()) {
      throw new Error('The journal entry no longer exists. Reload Studio before saving again.');
    }
    if (previous && existing.exists()) {
      const current = safeParseJournalEntry(stripSystemFields(existing.data()));
      if (!current.success || !contentMatches(current.data, previous)) {
        throw new Error('This journal entry changed in another session. Reload Studio before saving to avoid overwriting newer work.');
      }
    }
    transaction.set(target, {
      ...parsed.data,
      schemaVersion: 2,
      createdAt: existing.data()?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return parsed.data;
};

export const archiveContent = async (collectionName: 'projects' | 'journal', slug: string) => {
  const { db } = requireFirebaseServices();
  await updateDoc(doc(db, collectionName, slug), {
    status: 'archived',
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const restoreContent = async (collectionName: 'projects' | 'journal', slug: string) => {
  const { db } = requireFirebaseServices();
  await updateDoc(doc(db, collectionName, slug), {
    status: 'draft',
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
};

export const saveSiteSettings = async (settings: SiteSettings, previous: SiteSettings | null) => {
  const parsed = safeParseSiteSettings(settings);
  if (!parsed.success) throw parsed.error;
  const { db } = requireFirebaseServices();
  const target = doc(db, 'siteSettings', 'main');
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(target);
    if (!previous && existing.exists()) {
      throw new Error('Site settings already exist. Reload Studio before editing them.');
    }
    if (previous && !existing.exists()) {
      throw new Error('Site settings no longer exist. Reload Studio before saving again.');
    }
    if (previous && existing.exists()) {
      const current = safeParseSiteSettings(stripSystemFields(existing.data()));
      if (!current.success || !contentMatches(current.data, previous)) {
        throw new Error('Site settings changed in another session. Reload Studio before saving to avoid overwriting newer work.');
      }
    }
    transaction.set(target, {
      ...parsed.data,
      schemaVersion: 2,
      createdAt: existing.data()?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
};

export const loadSiteSettings = async (): Promise<SiteSettings | null> => {
  const { db } = requireFirebaseServices();
  const snapshot = await getDoc(doc(db, 'siteSettings', 'main'));
  if (!snapshot.exists()) return null;
  const parsed = safeParseSiteSettings(stripSystemFields(snapshot.data()));
  if (!parsed.success) throw parsed.error;
  return parsed.data;
};

const timestampToIso = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate().toISOString();
  }
  return typeof value === 'string' ? value : undefined;
};

export const loadInquiries = async (cursor: AdminInquiryCursor = null): Promise<AdminInquiryPage> => {
  const { db } = requireFirebaseServices();
  const pageSize = 200;
  const snapshot = await getDocs(query(
    collection(db, 'inquiries'),
    orderBy('createdAt', 'desc'),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ));
  const pageDocs = snapshot.docs.slice(0, pageSize);
  const valid: AdminInquiryRecord[] = [];
  const invalid: InvalidContentRecord[] = [];
  pageDocs.forEach((item) => {
    const raw = item.data();
    const parsed = safeParseInquiry({
      ...stripSystemFields(raw),
      createdAt: timestampToIso(raw.createdAt),
    });
    if (parsed.success) valid.push({ documentId: item.id, inquiry: parsed.data });
    else invalid.push({ id: item.id, reason: validationReason(parsed.error) });
  });
  const hasMore = snapshot.docs.length > pageSize;
  return {
    valid,
    invalid,
    hasMore,
    nextCursor: hasMore ? pageDocs.at(-1) ?? null : null,
  };
};

export const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
  const { db } = requireFirebaseServices();
  await updateDoc(doc(db, 'inquiries', id), { status, updatedAt: serverTimestamp() });
};

export const deleteInquiry = async (id: string): Promise<void> => {
  if (!/^[a-zA-Z0-9_-]{1,128}$/u.test(id)) {
    throw new Error('The inquiry document ID is invalid.');
  }
  const { db } = requireFirebaseServices();
  await deleteDoc(doc(db, 'inquiries', id));
};

export const seedFallbackContent = async () => {
  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<{ dryRun: false }, {
    ok: true;
    manifestHash: string;
    ids: string[];
    createdCount: number;
    skippedCount: number;
  }>(functions, 'seedContent', { limitedUseAppCheckTokens: true });
  const result = await callable({ dryRun: false });
  return result.data;
};

export const requestSiteRebuild = async (
  request: SiteRebuildRequest,
): Promise<SiteRebuildResult> => {
  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<SiteRebuildRequest, SiteRebuildResult>(
    functions,
    'requestSiteRebuild',
    { limitedUseAppCheckTokens: true },
  );
  const { data } = await callable(request);
  const allowedResponseKeys = [
    'ok', 'status', 'requestId', 'revision', 'acceptedRevision', 'coalesced',
  ];
  if (
    typeof data !== 'object'
    || data === null
    || Array.isArray(data)
    || data.ok !== true
    || data.status !== 'hook-accepted'
    || typeof data.requestId !== 'string'
    || data.requestId.length === 0
    || !Number.isSafeInteger(data.revision)
    || data.revision <= 0
    || !Number.isSafeInteger(data.acceptedRevision)
    || data.acceptedRevision < data.revision
    || typeof data.coalesced !== 'boolean'
    || Object.keys(data).some((key) => !allowedResponseKeys.includes(key))
  ) {
    throw new Error('The site rebuild service returned an invalid response.');
  }
  return data;
};

const rebuildTargetStates = new Set<SiteRebuildDeploymentState>([
  'awaiting-hook', 'dispatching', 'hook-failed', 'deploying', 'deploy-failed', 'active',
]);
const latestRebuildTargetStates = new Set<SiteRebuildDeploymentState>([
  'idle', ...rebuildTargetStates,
]);
const rebuildQueueStates = new Set<SiteRebuildStatusResult['queueStatus']>([
  'queued', 'dispatching', 'hook-accepted', 'failed', 'unknown',
]);
const rebuildDeploymentStates = new Set<SiteRebuildStatusResult['deploymentStatus']>([
  'preparing', 'prepared', 'prepare-failed', 'finalizing',
  'finalize-failed', 'active', 'aborted', 'unknown',
]);

export const getSiteRebuildStatus = async (
  revision: number,
): Promise<SiteRebuildStatusResult> => {
  if (!Number.isSafeInteger(revision) || revision <= 0) {
    throw new Error('A positive rebuild revision is required.');
  }
  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<{ revision: number }, SiteRebuildStatusResult>(
    functions,
    'getSiteRebuildStatus',
    { limitedUseAppCheckTokens: true },
  );
  const { data } = await callable({ revision });
  const allowedResponseKeys = [
    'ok', 'targetRevision', 'state', 'requestedRevision', 'hookAcceptedRevision',
    'activeRevision', 'queueStatus', 'deploymentStatus', 'failureCode',
    'activeDeploymentId',
  ];
  if (
    typeof data !== 'object'
    || data === null
    || Array.isArray(data)
    || data.ok !== true
    || data.targetRevision !== revision
    || !rebuildTargetStates.has(data.state)
    || !Number.isSafeInteger(data.requestedRevision)
    || data.requestedRevision < 0
    || !Number.isSafeInteger(data.hookAcceptedRevision)
    || data.hookAcceptedRevision < 0
    || !Number.isSafeInteger(data.activeRevision)
    || data.activeRevision < 0
    || !rebuildQueueStates.has(data.queueStatus)
    || !rebuildDeploymentStates.has(data.deploymentStatus)
    || (data.failureCode !== null && typeof data.failureCode !== 'string')
    || (data.activeDeploymentId !== null && typeof data.activeDeploymentId !== 'string')
    || Object.keys(data).some((key) => !allowedResponseKeys.includes(key))
  ) {
    throw new Error('The site rebuild status service returned an invalid response.');
  }
  return data;
};

export const getLatestSiteRebuildStatus = async (): Promise<SiteRebuildStatusResult> => {
  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<undefined, SiteRebuildStatusResult>(
    functions,
    'getLatestSiteRebuildStatus',
    { limitedUseAppCheckTokens: true },
  );
  const { data } = await callable();
  const allowedResponseKeys = [
    'ok', 'targetRevision', 'state', 'requestedRevision', 'hookAcceptedRevision',
    'activeRevision', 'queueStatus', 'deploymentStatus', 'failureCode',
    'activeDeploymentId',
  ];
  const idle = data?.targetRevision === 0;
  if (
    typeof data !== 'object'
    || data === null
    || Array.isArray(data)
    || data.ok !== true
    || !Number.isSafeInteger(data.targetRevision)
    || data.targetRevision < 0
    || !latestRebuildTargetStates.has(data.state)
    || !Number.isSafeInteger(data.requestedRevision)
    || data.requestedRevision < 0
    || !Number.isSafeInteger(data.hookAcceptedRevision)
    || data.hookAcceptedRevision < 0
    || !Number.isSafeInteger(data.activeRevision)
    || data.activeRevision < 0
    || !rebuildQueueStates.has(data.queueStatus)
    || !rebuildDeploymentStates.has(data.deploymentStatus)
    || (data.failureCode !== null && typeof data.failureCode !== 'string')
    || (data.activeDeploymentId !== null && typeof data.activeDeploymentId !== 'string')
    || (idle && (
      data.state !== 'idle'
      || data.requestedRevision !== 0
      || data.hookAcceptedRevision !== 0
      || data.failureCode !== null
    ))
    || (!idle && data.state === 'idle')
    || Object.keys(data).some((key) => !allowedResponseKeys.includes(key))
  ) {
    throw new Error('The latest site rebuild status service returned an invalid response.');
  }
  return data;
};

const IMAGE_SIGNATURES = {
  'image/jpeg': (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes: Uint8Array) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  'image/webp': (bytes: Uint8Array) => new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP',
  'image/avif': (bytes: Uint8Array) => new TextDecoder().decode(bytes.slice(4, 12)).startsWith('ftypavi'),
} as const;

export const uploadAdminImage = async (file: File, onProgress?: (percentage: number) => void) => {
  const maximumBytes = 8 * 1024 * 1024;
  if (!(file.type in IMAGE_SIGNATURES) || file.size <= 0 || file.size > maximumBytes) {
    throw new Error('Only JPEG, PNG, WebP, or AVIF images up to 8 MB are accepted.');
  }
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const signatureCheck = IMAGE_SIGNATURES[file.type as keyof typeof IMAGE_SIGNATURES];
  if (!signatureCheck(bytes)) throw new Error('The file signature does not match its declared image type.');

  const { auth, storage } = requireFirebaseServices();
  if (!auth.currentUser) throw new Error('An authenticated admin session is required.');
  const extension = ({
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  } as const)[file.type as keyof typeof IMAGE_SIGNATURES];
  const storagePath = `admin-media/${auth.currentUser.uid}/${crypto.randomUUID()}.${extension}`;
  const target = ref(storage, storagePath);

  await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    const task = uploadBytesResumable(target, file, {
      contentType: file.type,
      cacheControl: 'private,max-age=0,no-store',
      customMetadata: { uploadedBy: auth.currentUser?.uid ?? '' },
    });
    task.on('state_changed', (state) => {
      onProgress?.(Math.round((state.bytesTransferred / state.totalBytes) * 100));
    }, reject, () => resolve(task.snapshot));
  });

  return { storagePath, contentType: file.type, size: file.size };
};

export const deleteAdminImage = async (stagingPath: string): Promise<void> => {
  const { auth, storage } = requireFirebaseServices();
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('An authenticated admin session is required.');

  const segments = stagingPath.split('/');
  if (
    segments.length !== 3
    || segments[0] !== 'admin-media'
    || segments[1] !== currentUid
    || !/^[a-zA-Z0-9_-]{1,128}[.](?:jpg|jpeg|png|webp|avif)$/u.test(segments[2] ?? '')
  ) {
    throw new Error('Only your own canonical staging upload can be removed.');
  }

  try {
    await deleteObject(ref(storage, stagingPath));
  } catch (error) {
    if (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && error.code === 'storage/object-not-found'
    ) return;
    throw error;
  }
};

export const promoteAdminImage = async (
  stagingPath: string,
  entity: PromotableMediaEntity,
  slug: string,
): Promise<PromotedAdminImage> => {
  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<{
    stagingPath: string;
    entity: PromotableMediaEntity;
    slug: string;
  }, PromotedAdminImage>(functions, 'promoteMedia', {
    limitedUseAppCheckTokens: true,
  });
  const { data } = await callable({ stagingPath, entity, slug });

  const expectedPrefix = `media/${entity === 'project' ? 'projects' : 'journal'}/${slug}/`;
  if (
    typeof data !== 'object'
    || data === null
    || Array.isArray(data)
    || data.ok !== true
    || typeof data.url !== 'string'
    || !data.url.startsWith('https://firebasestorage.googleapis.com/')
    || typeof data.storagePath !== 'string'
    || !data.storagePath.startsWith(expectedPrefix)
    || typeof data.contentType !== 'string'
    || !Number.isSafeInteger(data.size)
    || data.size <= 0
    || typeof data.promotedNow !== 'boolean'
    || (
      data.promotedNow
        ? typeof data.deletionCapability !== 'string'
          || !/^[a-zA-Z0-9_-]{43}$/u.test(data.deletionCapability)
        : data.deletionCapability !== null
    )
    || Object.keys(data).some((key) => ![
      'ok', 'url', 'storagePath', 'contentType', 'size', 'promotedNow',
      'deletionCapability'
    ].includes(key))
  ) {
    throw new Error('The media promotion service returned an invalid response.');
  }

  return data;
};

const promotedMediaPath = /^media\/(projects|journal)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-zA-Z0-9_-]{1,128}\.(?:jpg|jpeg|png|webp|avif))$/u;

export const promotedAdminImageStoragePath = (
  rawUrl: string,
  entity: PromotableMediaEntity,
  slug: string,
): string | null => {
  const { app } = requireFirebaseServices();
  const expectedBucket = app.options.storageBucket;
  if (
    typeof expectedBucket !== 'string'
    || !/^[a-zA-Z0-9._-]{3,222}$/u.test(expectedBucket)
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
    || rawUrl.length > 4096
  ) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const queryEntries = [...url.searchParams.entries()];
  const altValues = url.searchParams.getAll('alt');
  const tokenValues = url.searchParams.getAll('token');
  const hasCanonicalQuery = queryEntries.length === 1
    && altValues.length === 1
    && altValues[0] === 'media';
  const hasLegacyTokenQuery = queryEntries.length === 2
    && altValues.length === 1
    && altValues[0] === 'media'
    && tokenValues.length === 1
    && /^[a-zA-Z0-9,_-]{10,200}$/u.test(tokenValues[0] ?? '');
  if (
    url.protocol !== 'https:'
    || url.hostname !== 'firebasestorage.googleapis.com'
    || url.port
    || url.username
    || url.password
    || url.hash
    || (!hasCanonicalQuery && !hasLegacyTokenQuery)
  ) return null;

  const parts = url.pathname.split('/');
  if (
    parts.length !== 6
    || parts[0] !== ''
    || parts[1] !== 'v0'
    || parts[2] !== 'b'
    || parts[4] !== 'o'
  ) return null;
  let bucketName: string;
  let storagePath: string;
  try {
    bucketName = decodeURIComponent(parts[3] ?? '');
    storagePath = decodeURIComponent(parts[5] ?? '');
  } catch {
    return null;
  }
  const match = promotedMediaPath.exec(storagePath);
  const expectedCollection = entity === 'project' ? 'projects' : 'journal';
  if (
    bucketName !== expectedBucket
    || !match
    || match[1] !== expectedCollection
    || match[2] !== slug
  ) return null;
  return storagePath;
};

export const deletePromotedAdminImage = async (
  storagePath: string,
  entity: PromotableMediaEntity,
  slug: string,
  deletionCapability: string,
): Promise<DeletedPromotedAdminImage> => {
  const expectedCollection = entity === 'project' ? 'projects' : 'journal';
  const match = promotedMediaPath.exec(storagePath);
  if (
    !match
    || match[1] !== expectedCollection
    || match[2] !== slug
    || !/^[a-zA-Z0-9_-]{43}$/u.test(deletionCapability)
  ) throw new Error('Only canonical promoted media for this content item can be removed.');

  const { functions } = requireFirebaseServices();
  const callable = httpsCallable<{
    storagePath: string;
    entity: PromotableMediaEntity;
    slug: string;
    deletionCapability: string;
  }, DeletedPromotedAdminImage>(functions, 'deletePromotedMedia', {
    limitedUseAppCheckTokens: true,
  });
  const { data } = await callable({ storagePath, entity, slug, deletionCapability });
  if (
    typeof data !== 'object'
    || data === null
    || Array.isArray(data)
    || data.ok !== true
    || typeof data.deleted !== 'boolean'
    || Object.keys(data).some((key) => !['ok', 'deleted'].includes(key))
  ) throw new Error('The promoted media deletion service returned an invalid response.');
  return data;
};
