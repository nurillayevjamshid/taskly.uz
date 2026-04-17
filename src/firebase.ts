import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyClx1nTp_t-LGeJpsgj2bEWGvL-oIbGb5E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taskly-de0b5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskly-de0b5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taskly-de0b5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "816744541754",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:816744541754:web:298152bd4a2630f3618f03"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
