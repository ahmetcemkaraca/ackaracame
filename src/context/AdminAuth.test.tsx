import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  getIdTokenResult: vi.fn(),
  getMultiFactorResolver: vi.fn(),
  onIdTokenChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(async () => undefined),
}));

const services = vi.hoisted(() => ({ auth: { currentUser: null } }));

vi.mock('firebase/auth', () => ({
  ...authMocks,
  TotpMultiFactorGenerator: {
    FACTOR_ID: 'totp',
    assertionForSignIn: vi.fn(),
  },
}));

vi.mock('firebase/app', () => ({
  FirebaseError: class FirebaseError extends Error {
    code: string;

    constructor(code: string, message = code) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('../lib/firebase/client', () => ({
  firebaseConfigured: true,
  getFirebaseServices: () => services,
}));

import { AdminAuthProvider, useAdminAuth } from './AdminAuth';

const adminUser = {
  email: 'admin@ackaraca.me',
  emailVerified: true,
};

const Probe = () => {
  const auth = useAdminAuth();
  return (
    <div>
      <output>{auth.status}</output>
      <button type="button" onClick={() => void auth.login('admin@ackaraca.me', 'secret')}>login</button>
    </div>
  );
};

describe('AdminAuthProvider token validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getIdTokenResult.mockResolvedValue({
      claims: { admin: true },
      signInSecondFactor: 'totp',
    });
  });

  it('does not force-refresh from the token listener', async () => {
    authMocks.onIdTokenChanged.mockImplementation((_auth, callback) => {
      void callback(adminUser);
      return vi.fn();
    });

    render(<AdminAuthProvider><Probe /></AdminAuthProvider>);

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
    expect(authMocks.getIdTokenResult).toHaveBeenCalledWith(adminUser, false);
    expect(authMocks.getIdTokenResult).not.toHaveBeenCalledWith(adminUser, true);
  });

  it('refreshes custom claims once during an explicit login', async () => {
    authMocks.onIdTokenChanged.mockImplementation((_auth, callback) => {
      void callback(null);
      return vi.fn();
    });
    authMocks.signInWithEmailAndPassword.mockResolvedValue({ user: adminUser });

    render(<AdminAuthProvider><Probe /></AdminAuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
    expect(authMocks.getIdTokenResult).toHaveBeenCalledTimes(1);
    expect(authMocks.getIdTokenResult).toHaveBeenCalledWith(adminUser, true);
  });
});
