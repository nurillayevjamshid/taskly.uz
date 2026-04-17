import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config is sourced entirely from environment variables.
// Do NOT hardcode credentials in source - they get committed to git history
// and pin the deployment to a single Firebase project for every fork.
const requireEnv = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!value) {
    throw new Error(
      `Missing required env var ${key}. Copy .env.example to .env.local and fill in your Firebase config.`
    );
  }
  return value;
};

const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
