// Firebase (Google Sign-In) configuration.
// Firebase Console → Project Settings → Your apps → Web app → Config
// Paste your project's values here — everything else is wired automatically.
export const FIREBASE_CONFIG = {
  apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
  authDomain: 'REPLACE_WITH_FIREBASE_AUTH_DOMAIN', // e.g. go-julex.firebaseapp.com
  projectId: 'REPLACE_WITH_FIREBASE_PROJECT_ID',  // e.g. go-julex
  appId: 'REPLACE_WITH_FIREBASE_APP_ID'
};

export const firebaseConfigured = () =>
  !Object.values(FIREBASE_CONFIG).some((v) => String(v || '').startsWith('REPLACE_WITH_'));
