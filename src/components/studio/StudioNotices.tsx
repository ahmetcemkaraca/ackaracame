import { useState } from 'react';
import type { InvalidContentRecord } from '../../lib/firebase/adminRepository';
import { StudioDialog } from './StudioDialog';

export const InvalidRecordsNotice = ({
  records,
  label,
}: {
  records: InvalidContentRecord[];
  label: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  if (!records.length) return null;

  return (
    <aside className="studio-invalid-notice" role="alert">
      <div>
        <strong>{records.length} geçersiz {label} kaydı izole edildi.</strong>
        <p>Bu kayıtlar public içeriğe veya editöre alınmadı. Firestore belgesini doğrulayıp yeniden yükleyin.</p>
      </div>
      <button type="button" className="studio-button studio-button--quiet" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        {expanded ? 'Ayrıntıları gizle' : 'Ayrıntıları göster'}
      </button>
      {expanded ? (
        <ul>
          {records.map((record) => <li key={record.id}><code>{record.id}</code><span>{record.reason}</span></li>)}
        </ul>
      ) : null}
    </aside>
  );
};

interface SeedDialogProps {
  open: boolean;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const SeedDialog = ({ open, pending, error, onConfirm, onClose }: SeedDialogProps) => {
  const [confirmation, setConfirmation] = useState('');
  const close = () => {
    if (pending) return;
    setConfirmation('');
    onClose();
  };

  return (
    <StudioDialog
      open={open}
      title="Eksik başlangıç içeriğini oluştur"
      description="Bu işlem yetkili sunucu işlevini çağırır ve yalnız eksik başlangıç kayıtlarını oluşturur. Mevcut içeriklerin üzerine yazmaz; yine de toplu ve geri alınamayan bir işlemdir."
      onClose={close}
      danger
      actions={
        <>
          <button type="button" className="studio-button studio-button--ghost" onClick={close} disabled={pending}>Vazgeç</button>
          <button type="button" className="studio-button studio-button--danger" disabled={pending || confirmation !== 'SEED'} onClick={onConfirm}>{pending ? 'Yazılıyor…' : 'Riski kabul et ve yaz'}</button>
        </>
      }
    >
      <div className="studio-risk-box">
        <strong>Yalnız ilk kurulum veya bilinçli kurtarma için kullanın.</strong>
        <p>Devam etmek için aşağıdaki alana büyük harflerle <code>SEED</code> yazın.</p>
      </div>
      <label className="studio-field"><span>Onay ifadesi</span><input value={confirmation} autoComplete="off" onChange={(event) => setConfirmation(event.target.value)} /></label>
      {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
    </StudioDialog>
  );
};
