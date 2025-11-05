import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyDR0YjeL84RPNCsM1egVCu8wYIl-D3W4no",
  authDomain: "ackaraca-siteler.firebaseapp.com",
  projectId: "ackaraca-siteler",
  storageBucket: "ackaraca-siteler.firebasestorage.app",
  messagingSenderId: "1019043453541",
  appId: "1:1019043453541:web:344d7b17b135ea292d048c"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
