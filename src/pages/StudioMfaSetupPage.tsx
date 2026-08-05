import { useEffect, useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  multiFactor,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type TotpSecret,
  type User,
} from 'firebase/auth';
import { Link } from 'wouter';
import { useAppPreferences } from '../context/AppPreferences';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { firebaseConfigured, getFirebaseServices } from '../lib/firebase/client';
import '../styles/studio.css';

interface PendingEnrollment {
  user: User;
  secret: TotpSecret;
  secretKey: string;
  authenticatorUri: string;
}

const setupError = (error: unknown) => {
  if (error instanceof FirebaseError && error.code === 'auth/multi-factor-auth-required') {
    return 'Bu hesapta TOTP zaten etkin. Normal Studio girişinden devam edin.';
  }
  if (error instanceof FirebaseError && error.code === 'auth/invalid-verification-code') {
    return 'Kod doğrulanamadı. Authenticator uygulamasındaki güncel altı haneli kodu deneyin.';
  }
  if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
    return 'Güvenlik oturumu sona erdi. Yeniden giriş yapıp kurulumu tekrarlayın.';
  }
  return 'Kurulum doğrulanamadı. Firebase TOTP yapılandırmasını ve hesap bilgilerini kontrol edin.';
};

export default function StudioMfaSetupPage() {
  const { locale } = useAppPreferences();
  const services = getFirebaseServices();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState<PendingEnrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [complete, setComplete] = useState(false);

  useDocumentMeta({
    title: 'Studio TOTP kurulumu — ACKaraca',
    description: 'Private one-time administrator MFA enrolment.',
    path: '/studio/setup',
    locale,
    noIndex: true,
  });

  useEffect(() => () => {
    if (services?.auth.currentUser) void signOut(services.auth);
  }, [services]);

  const beginEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!services || busy) return;
    setBusy(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(services.auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(services.auth);
        setError('E-posta doğrulaması gerekli. Yeni doğrulama bağlantısı gönderildi; bağlantıyı açtıktan sonra yeniden giriş yapın.');
        return;
      }
      const factors = multiFactor(credential.user);
      if (factors.enrolledFactors.some((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
        await signOut(services.auth);
        setComplete(true);
        return;
      }
      const session = await factors.getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setPending({
        user: credential.user,
        secret,
        secretKey: secret.secretKey,
        authenticatorUri: secret.generateQrCodeUrl(credential.user.email || 'owner', 'ACKaraca Studio'),
      });
      setPassword('');
    } catch (enrollmentError) {
      setError(setupError(enrollmentError));
    } finally {
      setBusy(false);
    }
  };

  const finishEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!services || !pending || busy) return;
    setBusy(true);
    setError(null);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        pending.secret,
        code.replace(/\s/g, ''),
      );
      await multiFactor(pending.user).enroll(assertion, 'ACKaraca Studio Authenticator');
      await signOut(services.auth);
      setPending(null);
      setCode('');
      setComplete(true);
    } catch (verificationError) {
      setError(setupError(verificationError));
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!pending) return;
    try {
      await navigator.clipboard.writeText(pending.secretKey);
      setCopied(true);
    } catch {
      setError('Anahtar otomatik kopyalanamadı; seçip elle kopyalayın.');
    }
  };

  if (!firebaseConfigured || !services) {
    return (
      <main id="main-content" tabIndex={-1} className="studio-root studio-auth-shell">
        <section className="studio-auth-card studio-auth-card--warning">
          <p className="studio-kicker">Kurulum gerekli</p>
          <h1>Firebase bağlantısı yok</h1>
          <p>Bu yüzey yalnız doğru Firebase web yapılandırması sağlandığında kullanılabilir.</p>
          <Link className="studio-button studio-button--ghost" href="/">Siteye dön</Link>
        </section>
      </main>
    );
  }

  if (complete) {
    return (
      <main id="main-content" tabIndex={-1} className="studio-root studio-auth-shell">
        <section className="studio-auth-card">
          <p className="studio-kicker">İkinci faktör hazır</p>
          <h1>TOTP kaydı tamamlandı</h1>
          <p>Şimdi güvenli yönetim makinesinde admin claim komutunu çalıştırın. Claim verildikten sonra normal Studio girişinde parola ve authenticator kodu istenir.</p>
          <Link className="studio-button studio-button--primary" href="/studio">Studio girişine dön</Link>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="studio-root studio-auth-shell">
      <section className="studio-auth-card" aria-labelledby="studio-setup-title">
        <div className="studio-auth-card__intro">
          <p className="studio-kicker">Tek seferlik güvenlik kurulumu</p>
          <h1 id="studio-setup-title">Authenticator bağla</h1>
          <p>Bu işlem admin yetkisi vermez. Yalnız doğrulanmış Firebase hesabınıza TOTP ikinci faktörünü kaydeder.</p>
        </div>

        {!pending ? (
          <form className="studio-form studio-auth-form" onSubmit={beginEnrollment} aria-busy={busy}>
            <label className="studio-field"><span>E-posta</span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="studio-field"><span>Parola</span><input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
            <button className="studio-button studio-button--primary studio-button--wide" type="submit" disabled={busy}>{busy ? 'Hazırlanıyor…' : 'Güvenli anahtar oluştur'}</button>
          </form>
        ) : (
          <form className="studio-form studio-auth-form" onSubmit={finishEnrollment} aria-busy={busy}>
            <div className="studio-setup-instructions">
              <p>Authenticator uygulamanızda yeni bir zaman tabanlı hesap ekleyin ve aşağıdaki anahtarı girin.</p>
              <code tabIndex={0}>{pending.secretKey}</code>
              <div className="studio-button-row">
                <button className="studio-button studio-button--ghost" type="button" onClick={() => void copySecret()}>{copied ? 'Kopyalandı' : 'Anahtarı kopyala'}</button>
                <a className="studio-button studio-button--ghost" href={pending.authenticatorUri}>Authenticator’da aç</a>
              </div>
            </div>
            <label className="studio-field"><span>Altı haneli kod</span><input className="studio-mfa-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,8}" maxLength={8} required value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9 ]/g, ''))} /></label>
            {error ? <p className="studio-message studio-message--error" role="alert">{error}</p> : null}
            <button className="studio-button studio-button--primary studio-button--wide" type="submit" disabled={busy || code.replace(/\s/g, '').length !== 6}>{busy ? 'Doğrulanıyor…' : 'TOTP kaydını tamamla'}</button>
          </form>
        )}

        <p className="studio-auth-card__note">Bu URL’yi yalnız ilk kurulum veya kontrollü hesap kurtarma sırasında kullanın.</p>
      </section>
    </main>
  );
}
