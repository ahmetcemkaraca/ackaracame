import {
  connectAuthEmulator,
  getAuth,
  setPersistence,
  browserSessionPersistence,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfigured } from './config';
import { getPublicFirebaseServices, type PublicFirebaseServices } from './publicClient';

export { firebaseConfigured } from './config';

export interface FirebaseServices extends PublicFirebaseServices {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

const env = import.meta.env;

let services: FirebaseServices | null = null;
let emulatorConnected = false;

const createServices = (): FirebaseServices | null => {
  if (!firebaseConfigured) return null;
  if (services) return services;

  const publicServices = getPublicFirebaseServices();
  if (!publicServices) return null;

  const { app } = publicServices;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  void setPersistence(auth, browserSessionPersistence).catch(() => {
    // Auth still works when hardened browser settings disallow session storage.
  });

  if (env.DEV && env.VITE_FIREBASE_USE_EMULATORS === 'true' && !emulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    emulatorConnected = true;
  }

  services = { ...publicServices, auth, db, storage };
  return services;
};

export const getFirebaseServices = () => createServices();

export const requireFirebaseServices = (): FirebaseServices => {
  const resolved = createServices();
  if (!resolved) {
    throw new Error('Firebase is not configured. Add the required environment values before using the content studio.');
  }
  return resolved;
};
