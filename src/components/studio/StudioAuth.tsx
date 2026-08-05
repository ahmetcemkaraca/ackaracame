import { useState, type FormEvent } from 'react';

interface LoginPanelProps {
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onClearError?: () => void;
}

export const LoginPanel = ({ error, onLogin, onClearError }: LoginPanelProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="studio-auth-shell">
      <section className="studio-auth-card" aria-labelledby="studio-login-title">
        <div className="studio-auth-card__intro">
          <p className="studio-kicker">ACK / private</p>
          <h1 id="studio-login-title">İçerik stüdyosu</h1>
          <p>Projeleri, yazıları ve site iletişimlerini tek güvenli çalışma alanından yönetin.</p>
        </div>

        <form className="studio-form studio-auth-form" onSubmit={handleSubmit} aria-busy={submitting}>
          <label className="studio-field">
            <span>E-posta</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              required
              onChange={(event) => {
                setEmail(event.target.value);
                onClearError?.();
              }}
            />
          </label>
          <label className="studio-field">
            <span>Parola</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              required
              minLength={8}
              onChange={(event) => {
                setPassword(event.target.value);
                onClearError?.();
              }}
            />
          </label>
          {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
          <button type="submit" className="studio-button studio-button--primary studio-button--wide" disabled={submitting}>
            {submitting ? 'Doğrulanıyor…' : 'Güvenli giriş'}
          </button>
        </form>

        <p className="studio-auth-card__note">Yalnız doğrulanmış, admin yetkili ve MFA korumalı hesaplar erişebilir.</p>
      </section>
    </main>
  );
};

interface MfaPanelProps {
  label: string | null;
  error: string | null;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  onClearError?: () => void;
}

export const MfaPanel = ({ label, error, onVerify, onCancel, onClearError }: MfaPanelProps) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onVerify(code.replace(/\s/g, ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="studio-auth-shell">
      <section className="studio-auth-card" aria-labelledby="studio-mfa-title">
        <div className="studio-auth-card__intro">
          <p className="studio-kicker">İkinci adım</p>
          <h1 id="studio-mfa-title">Doğrulama kodu</h1>
          <p><strong>{label || 'Authenticator'}</strong> uygulamasındaki güncel altı haneli kodu girin.</p>
        </div>
        <form className="studio-form studio-auth-form" onSubmit={handleSubmit} aria-busy={submitting}>
          <label className="studio-field">
            <span>Tek kullanımlık kod</span>
            <input
              className="studio-mfa-input"
              type="text"
              name="mfa-code"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9 ]{6,8}"
              maxLength={8}
              value={code}
              required
              autoFocus
              onChange={(event) => {
                setCode(event.target.value.replace(/[^0-9 ]/g, ''));
                onClearError?.();
              }}
            />
          </label>
          {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
          <div className="studio-button-row">
            <button type="button" className="studio-button studio-button--ghost" onClick={onCancel} disabled={submitting}>
              Geri dön
            </button>
            <button type="submit" className="studio-button studio-button--primary" disabled={submitting || code.replace(/\s/g, '').length !== 6}>
              {submitting ? 'Kontrol ediliyor…' : 'Kodu doğrula'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export const MisconfiguredPanel = () => (
  <main className="studio-auth-shell">
    <section className="studio-auth-card studio-auth-card--warning" aria-labelledby="studio-config-title">
      <div className="studio-auth-card__intro">
        <p className="studio-kicker">Kurulum gerekli</p>
        <h1 id="studio-config-title">Firebase bağlantısı yapılandırılmamış</h1>
        <p>
          Stüdyo güvenli biçimde kapalı tutuldu. Dağıtım ortamında gerekli Firebase web uygulaması
          değişkenlerini ve App Check yapılandırmasını sağlayın; gizli anahtarları istemci koduna yazmayın.
        </p>
      </div>
      <div className="studio-config-list" aria-label="Gerekli yapılandırma grupları">
        <span>Authentication + MFA</span>
        <span>Firestore rules</span>
        <span>Storage rules</span>
        <span>Admin claim</span>
      </div>
      <a className="studio-button studio-button--ghost" href="/">Siteye dön</a>
    </section>
  </main>
);

export const StudioLoading = () => (
  <main className="studio-auth-shell" aria-busy="true" aria-live="polite">
    <div className="studio-loading-card">
      <span className="studio-spinner" aria-hidden="true" />
      <p>Güvenli oturum hazırlanıyor…</p>
    </div>
  </main>
);
