# Taskly - Netlify Deploy

## Qadam 1: Build
```bash
npm run build
```

## Qadam 2: Netlify ga yuklash
1. Netlify.com ga kiring
2. "Add new site" ni bosing
3. "Deploy manually" ni tanlang
4. `dist` papkasini tanlang
5. Build settings uchun `netlify.toml` faylini yuklang

## Environment Variables
Netlify da quyidagi environment variableslarni o'rnatish kerak:

```
VITE_FIREBASE_API_KEY=AIzaSyClx1nTp_t-LGeJpsgj2bEWGvL-oIbGb5E
VITE_FIREBASE_AUTH_DOMAIN=taskly-de0b5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=taskly-de0b5
VITE_FIREBASE_STORAGE_BUCKET=taskly-de0b5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=816744541754
VITE_FIREBASE_APP_ID=1:816744541754:web:298152bd4a2630f3618f03
```

## Build Command
```
npm run build
```

## Publish Directory
```
dist
```

## Firebase Security Rules
Firebase Console da Firestore security rules ni o'rnating:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 1, 1);
    }
  }
}
```

Keyin quyidagi rules ga o'zgartiring:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
