import type { FirebaseOptions } from 'firebase/app';

const env = import.meta.env;

export const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID,
};

const requiredConfig = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId];
const looksLikePlaceholder = (value: unknown) => typeof value === 'string' && /your_|example|placeholder/i.test(value);

export const firebaseConfigured = requiredConfig.every(
  (value) => typeof value === 'string' && value.trim().length > 0 && !looksLikePlaceholder(value),
);

export const publicInquiryConfigured = firebaseConfigured && (
  import.meta.env.DEV
  || (typeof env.VITE_FIREBASE_APPCHECK_SITE_KEY === 'string'
    && env.VITE_FIREBASE_APPCHECK_SITE_KEY.trim().length > 0
    && !looksLikePlaceholder(env.VITE_FIREBASE_APPCHECK_SITE_KEY))
);
