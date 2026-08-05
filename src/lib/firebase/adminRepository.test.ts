import { beforeEach, describe, expect, it, vi } from 'vitest';
import { allEntries, portfolioProjects, siteSettings } from '../../data/portfolio';
import { loadInquiries, saveJournalEntry, saveProject, saveSiteSettings } from './adminRepository';

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => ({ serverTimestamp: true })),
  transactionGet: vi.fn(),
  transactionSet: vi.fn(),
  getDocs: vi.fn(),
  collection: vi.fn((_, path: string) => ({ path })),
  query: vi.fn((...constraints: unknown[]) => constraints),
  orderBy: vi.fn((field: string, direction: string) => ({ field, direction })),
  limit: vi.fn((count: number) => ({ count })),
  startAfter: vi.fn((cursor: unknown) => ({ cursor })),
  requireFirebaseServices: vi.fn(() => ({ db: { name: 'admin-db' } })),
}));

vi.mock('firebase/firestore', () => ({
  collection: mocks.collection,
  doc: mocks.doc,
  getDoc: vi.fn(),
  getDocs: mocks.getDocs,
  limit: mocks.limit,
  orderBy: mocks.orderBy,
  query: mocks.query,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  startAfter: mocks.startAfter,
  writeBatch: vi.fn(),
}));

vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn() }));
vi.mock('firebase/storage', () => ({
  deleteObject: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
}));
vi.mock('./client', () => ({ requireFirebaseServices: mocks.requireFirebaseServices }));

describe('admin content write mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doc.mockReturnValue({ path: 'content/slug' });
    mocks.runTransaction.mockImplementation(async (_db, operation) => operation({
      get: mocks.transactionGet,
      set: mocks.transactionSet,
    }));
  });

  it('never overwrites an existing project through the new-project path', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    mocks.transactionGet.mockResolvedValue({ exists: () => true, data: () => ({ createdAt: 'existing' }) });

    await expect(saveProject(project)).rejects.toThrow(/already exists/i);
    expect(mocks.transactionSet).not.toHaveBeenCalled();
  });

  it('never recreates a journal record that disappeared during an edit', async () => {
    const entry = allEntries[0];
    if (!entry) throw new Error('Expected a journal fixture.');
    mocks.transactionGet.mockResolvedValue({ exists: () => false, data: () => undefined });

    await expect(saveJournalEntry(entry, entry)).rejects.toThrow(/no longer exists/i);
    expect(mocks.transactionSet).not.toHaveBeenCalled();
  });

  it('creates only when the slug is unused', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    mocks.transactionGet.mockResolvedValue({ exists: () => false, data: () => undefined });

    await expect(saveProject(project)).resolves.toEqual(project);
    expect(mocks.transactionSet).toHaveBeenCalledOnce();
  });

  it('rejects a stale editor snapshot instead of overwriting a newer project', async () => {
    const project = portfolioProjects[0];
    if (!project) throw new Error('Expected a project fixture.');
    mocks.transactionGet.mockResolvedValue({
      exists: () => true,
      data: () => ({
        ...project,
        title: { ...project.title, en: 'Changed in another Studio session' },
        schemaVersion: 2,
        createdAt: 'existing',
        updatedAt: 'newer',
      }),
    });

    await expect(saveProject(project, project)).rejects.toThrow(/changed in another session/i);
    expect(mocks.transactionSet).not.toHaveBeenCalled();
  });

  it('does not create fallback settings over an existing production document', async () => {
    mocks.transactionGet.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...siteSettings, schemaVersion: 2, createdAt: 'existing', updatedAt: 'newer' }),
    });

    await expect(saveSiteSettings(siteSettings, null)).rejects.toThrow(/already exist/i);
    expect(mocks.transactionSet).not.toHaveBeenCalled();
  });

  it('returns a stable cursor instead of hiding inquiries beyond the first 200', async () => {
    const rawInquiry = {
      name: 'Example Person',
      email: 'person@example.com',
      inquiryType: 'employment',
      message: 'This is a sufficiently detailed inquiry for the portfolio owner.',
      locale: 'en',
      privacyConsent: true,
      status: 'new',
      createdAt: '2026-08-04T12:00:00.000Z',
    };
    const documents = Array.from({ length: 201 }, (_, index) => ({
      id: `inquiry-${index + 1}`,
      data: () => rawInquiry,
    }));
    mocks.getDocs.mockResolvedValueOnce({ docs: documents });

    const firstPage = await loadInquiries();
    expect(firstPage.valid).toHaveLength(200);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).toBe(documents[199]);
    expect(mocks.startAfter).not.toHaveBeenCalled();

    mocks.getDocs.mockResolvedValueOnce({ docs: [documents[200]] });
    const finalPage = await loadInquiries(firstPage.nextCursor);
    expect(mocks.startAfter).toHaveBeenCalledWith(documents[199]);
    expect(finalPage.valid).toHaveLength(1);
    expect(finalPage.hasMore).toBe(false);
    expect(finalPage.nextCursor).toBeNull();
  });
});
