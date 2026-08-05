import { useMemo, useState } from 'react';
import type { Inquiry } from '../../domain/content';
import {
  deleteInquiry,
  updateInquiryStatus,
  type AdminInquiryRecord,
} from '../../lib/firebase/adminRepository';
import { readableError } from './editorUtils';
import { ConfirmDialog, StudioDialog } from './StudioDialog';

const inquiryStatuses: Inquiry['status'][] = ['new', 'in-review', 'replied', 'archived'];

const statusLabel: Record<Inquiry['status'], string> = {
  new: 'Yeni',
  'in-review': 'İnceleniyor',
  replied: 'Yanıtlandı',
  archived: 'Arşivlendi',
};

interface InboxPanelProps {
  inquiries: AdminInquiryRecord[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onUpdated: (record: AdminInquiryRecord) => void;
  onDeleted: (documentId: string) => void;
}

export const InboxPanel = ({
  inquiries,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onUpdated,
  onDeleted,
}: InboxPanelProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Inquiry['status']>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInquiryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    return inquiries.filter(({ inquiry }) => {
      if (status !== 'all' && inquiry.status !== status) return false;
      if (!needle) return true;
      return [inquiry.name, inquiry.email, inquiry.organization, inquiry.message, inquiry.inquiryType]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase('tr-TR').includes(needle));
    });
  }, [inquiries, query, status]);

  const selected = inquiries.find((record) => record.documentId === selectedId) || null;

  const changeStatus = async (record: AdminInquiryRecord, nextStatus: Inquiry['status']) => {
    if (record.inquiry.status === nextStatus || updatingId) return;
    setUpdatingId(record.documentId);
    setError(null);
    try {
      await updateInquiryStatus(record.documentId, nextStatus);
      onUpdated({ ...record, inquiry: { ...record.inquiry, status: nextStatus } });
    } catch (updateError) {
      setError(readableError(updateError));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteInquiry(deleteTarget.documentId);
      onDeleted(deleteTarget.documentId);
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(readableError(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="studio-panel" aria-labelledby="inbox-title">
      <header className="studio-panel__header">
        <div><p className="studio-kicker">Private correspondence</p><h2 id="inbox-title">Inbox</h2><p>İş, mimarlık ve işbirliği taleplerini takip edin.</p></div>
        <span className="studio-count-pill">{inquiries.filter(({ inquiry }) => inquiry.status === 'new').length} yeni</span>
      </header>

      <div className="studio-toolbar">
        <label className="studio-search"><span className="sr-only">Mesajlarda ara</span><input type="search" placeholder="İsim, e-posta veya mesaj ara…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="studio-filter"><span>Durum</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">Tümü</option>{inquiryStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
      </div>

      {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
      {loading ? <div className="studio-list-loading" aria-live="polite">Mesajlar yükleniyor…</div> : null}
      {!loading && filtered.length === 0 ? <div className="studio-empty-state"><strong>Bu görünümde mesaj yok.</strong><p>Arama veya durum filtresini değiştirebilirsiniz.</p></div> : null}

      <div className="studio-inbox-list">
        {filtered.map((record) => (
          <article className={`studio-inbox-row${record.inquiry.status === 'new' ? ' studio-inbox-row--unread' : ''}`} key={record.documentId}>
            <button type="button" className="studio-inbox-row__open" onClick={() => setSelectedId(record.documentId)} aria-label={`${record.inquiry.name} mesajını aç`}>
              <span className={`studio-status studio-status--${record.inquiry.status}`}>{statusLabel[record.inquiry.status]}</span>
              <strong>{record.inquiry.name}</strong>
              <span>{record.inquiry.organization || record.inquiry.email}</span>
              <p>{record.inquiry.message}</p>
              <time dateTime={record.inquiry.createdAt}>{record.inquiry.createdAt ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.inquiry.createdAt)) : 'Tarih yok'}</time>
            </button>
            <label className="studio-inline-status"><span className="sr-only">Mesaj durumu</span><select value={record.inquiry.status} disabled={Boolean(updatingId)} onChange={(event) => void changeStatus(record, event.target.value as Inquiry['status'])}>{inquiryStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
          </article>
        ))}
      </div>
      {hasMore ? (
        <div className="studio-button-row">
          <button type="button" className="studio-button studio-button--quiet" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore ? 'Eski mesajlar yükleniyor…' : 'Daha eski mesajları yükle'}
          </button>
        </div>
      ) : null}

      <StudioDialog
        open={Boolean(selected)}
        title={selected?.inquiry.name || 'Mesaj'}
        description={selected ? `${selected.inquiry.inquiryType} · ${selected.inquiry.email}` : undefined}
        onClose={() => setSelectedId(null)}
        actions={selected ? (
          <>
            <a className="studio-button studio-button--ghost" href={`mailto:${encodeURIComponent(selected.inquiry.email)}`}>E-posta yaz</a>
            <label className="studio-field studio-dialog-status"><span>Durum</span><select value={selected.inquiry.status} disabled={Boolean(updatingId)} onChange={(event) => void changeStatus(selected, event.target.value as Inquiry['status'])}>{inquiryStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
            <button type="button" className="studio-button studio-button--danger" onClick={() => { setDeleteTarget(selected); setSelectedId(null); }}>Kalıcı sil</button>
          </>
        ) : undefined}
      >
        {selected ? (
          <div className="studio-inquiry-detail">
            <dl>
              <div><dt>E-posta</dt><dd><a href={`mailto:${encodeURIComponent(selected.inquiry.email)}`}>{selected.inquiry.email}</a></dd></div>
              <div><dt>Organizasyon</dt><dd>{selected.inquiry.organization || 'Belirtilmedi'}</dd></div>
              <div><dt>Dil</dt><dd>{selected.inquiry.locale.toUpperCase()}</dd></div>
              <div><dt>Bütçe</dt><dd>{selected.inquiry.budgetBand || 'Belirtilmedi'}</dd></div>
              <div><dt>Zamanlama</dt><dd>{selected.inquiry.timeline || 'Belirtilmedi'}</dd></div>
            </dl>
            <div className="studio-inquiry-message"><span>Mesaj</span><p>{selected.inquiry.message}</p></div>
          </div>
        ) : null}
      </StudioDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Mesajı kalıcı sil"
        description={deleteTarget ? `${deleteTarget.inquiry.name} tarafından gönderilen mesaj ve iletişim bilgileri kalıcı olarak silinir. Bu işlem geri alınamaz.` : 'Mesaj kalıcı olarak silinir.'}
        confirmLabel="Mesajı sil"
        danger
        pending={deleting}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
};
