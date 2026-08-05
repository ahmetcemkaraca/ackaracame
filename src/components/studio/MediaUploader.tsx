import { useEffect, useId, useRef, useState } from 'react';
import {
  deleteAdminImage,
  uploadAdminImage,
} from '../../lib/firebase/adminRepository';
import { readableError } from './editorUtils';

export type UploadRole = 'cover' | 'gallery';
export type AdminImageUpload = Awaited<ReturnType<typeof uploadAdminImage>> & {
  previewUrl: string;
  width: number;
  height: number;
};

const readImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    if (dimensions.width > 0 && dimensions.height > 0) return dimensions;
  }

  if (typeof Image !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const objectUrl = URL.createObjectURL(file);
    try {
      return await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0
          ? resolve({ width: image.naturalWidth, height: image.naturalHeight })
          : reject(new Error('Görselin boyutları okunamadı.'));
        image.onerror = () => reject(new Error('Görsel dosyası çözümlenemedi.'));
        image.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  throw new Error('Bu tarayıcı görsel boyutlarını doğrulayamıyor. Güncel bir tarayıcıyla tekrar deneyin.');
};

interface MediaUploaderProps {
  onUploaded: (upload: AdminImageUpload, role: UploadRole) => void;
  onBusyChange?: (busy: boolean) => void;
}

export const MediaUploader = ({ onUploaded, onBusyChange }: MediaUploaderProps) => {
  const inputId = useId();
  const mountedRef = useRef(true);
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<UploadRole>('gallery');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(uploading);
  }, [onBusyChange, uploading]);

  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setLastUrl(null);
    try {
      const dimensions = await readImageDimensions(file);
      if (typeof URL.createObjectURL !== 'function') {
        throw new Error('Bu tarayıcı güvenli yerel görsel önizlemesini desteklemiyor.');
      }
      const previewUrl = URL.createObjectURL(file);
      try {
        const result = await uploadAdminImage(file, setProgress);
        const upload = { ...result, previewUrl, ...dimensions };
        if (!mountedRef.current) {
          URL.revokeObjectURL(previewUrl);
          await deleteAdminImage(result.storagePath).catch(() => undefined);
          return;
        }
        setLastUrl(previewUrl);
        onUploaded(upload, role);
        setFile(null);
      } catch (uploadError) {
        URL.revokeObjectURL(previewUrl);
        throw uploadError;
      }
    } catch (uploadError) {
      if (mountedRef.current) setError(readableError(uploadError));
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };

  return (
    <div className="studio-uploader" aria-busy={uploading}>
      <div className="studio-uploader__fields">
        <label className="studio-field studio-field--grow" htmlFor={inputId}>
          <span>Görsel dosyası</span>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            disabled={uploading}
          />
          <small>JPEG, PNG, WebP veya AVIF · en fazla 8 MB</small>
        </label>
        <label className="studio-field">
          <span>Hedef</span>
          <select value={role} onChange={(event) => setRole(event.target.value as UploadRole)} disabled={uploading}>
            <option value="gallery">Galeri</option>
            <option value="cover">Kapak medyası</option>
          </select>
        </label>
        <button type="button" className="studio-button studio-button--secondary" disabled={!file || uploading} onClick={() => void handleUpload()}>
          {uploading ? 'Yükleniyor…' : 'Yükle ve ekle'}
        </button>
      </div>

      {uploading ? (
        <div className="studio-progress" aria-label={`Yükleme yüzde ${progress}`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
      {lastUrl ? (
        <p className="studio-message studio-message--success" role="status">
          Görsel güvenli staging alanına yüklendi. Public {role === 'cover' ? 'kapak' : 'galeri'} aktarımı bekliyor.
        </p>
      ) : null}
    </div>
  );
};
