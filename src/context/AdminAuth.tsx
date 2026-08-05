import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  getIdTokenResult,
  getMultiFactorResolver,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type MultiFactorResolver,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { firebaseConfigured, getFirebaseServices } from '../lib/firebase/client';

export type AdminAuthStatus = 'loading' | 'signed-out' | 'mfa-required' | 'authenticated' | 'misconfigured';

interface AdminAuthValue {
  status: AdminAuthStatus;
  user: User | null;
  error: string | null;
  mfaLabel: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  cancelMfa: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const publicErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError && error.code === 'auth/too-many-requests') {
    return 'Çok fazla deneme yapıldı. Bir süre bekleyip yeniden deneyin.';
  }
  if (error instanceof FirebaseError && error.code === 'auth/invalid-verification-code') {
    return 'Doğrulama kodu geçersiz veya süresi dolmuş.';
  }
  return 'Giriş doğrulanamadı. Bilgilerinizi kontrol edip yeniden deneyin.';
};

const ensureAdmin = async (candidate: User, forceRefresh = false) => {
  const token = await getIdTokenResult(candidate, forceRefresh);
  const authorized = candidate.emailVerified
    && token.claims.admin === true
    && token.signInSecondFactor === TotpMultiFactorGenerator.FACTOR_ID;
  if (!authorized) {
    const services = getFirebaseServices();
    if (services) await signOut(services.auth);
    throw new Error('This account is not authorized for the content studio.');
  }
  return candidate;
};

export const AdminAuthProvider = ({ children }: PropsWithChildren) => {
  const services = getFirebaseServices();
  const [status, setStatus] = useState<AdminAuthStatus>(firebaseConfigured ? 'loading' : 'misconfigured');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mfaLabel, setMfaLabel] = useState<string | null>(null);
  const resolverRef = useRef<MultiFactorResolver | null>(null);

  useEffect(() => {
    if (!services) return undefined;
    return onIdTokenChanged(services.auth, async (candidate) => {
      if (!candidate) {
        setUser(null);
        setStatus(resolverRef.current ? 'mfa-required' : 'signed-out');
        return;
      }
      try {
        // Token listeners must never force a refresh: a forced refresh emits
        // another token event and can otherwise create an authentication loop.
        const admin = await ensureAdmin(candidate);
        resolverRef.current = null;
        setMfaLabel(null);
        setUser(admin);
        setStatus('authenticated');
        setError(null);
      } catch {
        setUser(null);
        setStatus('signed-out');
        setError('Bu hesap içerik stüdyosu için yetkili değil.');
      }
    });
  }, [services]);

  const login = useCallback(async (email: string, password: string) => {
    if (!services) {
      setStatus('misconfigured');
      return;
    }
    setStatus('loading');
    setError(null);
    resolverRef.current = null;
    try {
      const credential = await signInWithEmailAndPassword(services.auth, email.trim(), password);
      // Explicit sign-in is the one controlled point where freshly assigned
      // custom claims may be requested from the server.
      const admin = await ensureAdmin(credential.user, true);
      setUser(admin);
      setStatus('authenticated');
    } catch (loginError) {
      if (loginError instanceof FirebaseError && loginError.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(services.auth, loginError as MultiFactorError);
        const totpHint = resolver.hints.find((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID);
        if (totpHint) {
          resolverRef.current = resolver;
          setMfaLabel(totpHint.displayName || 'Authenticator');
          setStatus('mfa-required');
          return;
        }
      }
      setUser(null);
      setStatus('signed-out');
      setError(publicErrorMessage(loginError));
    }
  }, [services]);

  const verifyMfa = useCallback(async (code: string) => {
    const resolver = resolverRef.current;
    if (!resolver) {
      setStatus('signed-out');
      setError('Doğrulama oturumu sona erdi. Yeniden giriş yapın.');
      return;
    }
    const totpHint = resolver.hints.find((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    if (!totpHint) {
      setError('Desteklenen doğrulama yöntemi bulunamadı.');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, code.replace(/\s/g, ''));
      const credential = await resolver.resolveSignIn(assertion);
      const admin = await ensureAdmin(credential.user, true);
      resolverRef.current = null;
      setMfaLabel(null);
      setUser(admin);
      setStatus('authenticated');
    } catch (verifyError) {
      setStatus('mfa-required');
      setError(publicErrorMessage(verifyError));
    }
  }, []);

  const cancelMfa = useCallback(() => {
    resolverRef.current = null;
    setMfaLabel(null);
    setError(null);
    setStatus(services ? 'signed-out' : 'misconfigured');
  }, [services]);

  const logout = useCallback(async () => {
    if (services) await signOut(services.auth);
    resolverRef.current = null;
    setMfaLabel(null);
    setUser(null);
    setError(null);
    setStatus(services ? 'signed-out' : 'misconfigured');
  }, [services]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AdminAuthValue>(() => ({
    status,
    user,
    error,
    mfaLabel,
    login,
    verifyMfa,
    cancelMfa,
    logout,
    clearError,
  }), [status, user, error, mfaLabel, login, verifyMfa, cancelMfa, logout, clearError]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return value;
};
