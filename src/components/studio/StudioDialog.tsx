import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface StudioDialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  danger?: boolean;
}

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const StudioDialog = ({
  open,
  title,
  description,
  children,
  actions,
  onClose,
  closeLabel = 'Kapat',
  danger = false,
}: StudioDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="studio-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`studio-dialog${danger ? ' studio-dialog--danger' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onKeyDown={handleKeyDown}
      >
        <div className="studio-dialog__header">
          <div>
            <p className="studio-kicker">Content studio</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="studio-icon-button" onClick={onClose} aria-label={closeLabel}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {description ? <p id={descriptionId} className="studio-dialog__description">{description}</p> : null}
        {children ? <div className="studio-dialog__content">{children}</div> : null}
        {actions ? <div className="studio-dialog__actions">{actions}</div> : null}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Vazgeç',
  pending = false,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <StudioDialog
    open={open}
    title={title}
    description={description}
    onClose={pending ? () => undefined : onClose}
    danger={danger}
    actions={
      <>
        <button type="button" className="studio-button studio-button--ghost" onClick={onClose} disabled={pending}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`studio-button${danger ? ' studio-button--danger' : ' studio-button--primary'}`}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? 'İşleniyor…' : confirmLabel}
        </button>
      </>
    }
  />
);
