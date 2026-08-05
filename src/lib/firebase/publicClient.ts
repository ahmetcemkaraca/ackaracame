import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { firebaseConfig, firebaseConfigured } from './config';

export interface PublicFirebaseServices {
  app: FirebaseApp;
  functions: Functions;
  appCheck: AppCheck | null;
}

const env = import.meta.env;

let services: PublicFirebaseServices | null = null;
let functionsEmulatorConnected = false;

const createServices = (): PublicFirebaseServices | null => {
  if (!firebaseConfigured) return null;
  if (services) return services;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const functions = getFunctions(app, env.VITE_FIREBASE_FUNCTIONS_REGION || 'europe-west1');

  if (env.DEV && env.VITE_FIREBASE_USE_EMULATORS === 'true' && !functionsEmulatorConnected) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    functionsEmulatorConnected = true;
  }

  let appCheck: AppCheck | null = null;
  const appCheckKey = env.VITE_FIREBASE_APPCHECK_SITE_KEY;
  if (env.PROD && appCheckKey && typeof window !== 'undefined') {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {
      appCheck = null;
    }
  }

  services = { app, functions, appCheck };
  return services;
};

export const getPublicFirebaseServices = () => createServices();

export const requirePublicFirebaseServices = (): PublicFirebaseServices => {
  const resolved = createServices();
  if (!resolved) {
    throw new Error('Firebase is not configured. Add the required environment values before using public Firebase features.');
  }
  return resolved;
};
