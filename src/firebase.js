// Firebase (Google Sign-In) configuration — Go Julex project.
// Source: Firebase Console → Project Settings → Your apps → Web app → Config
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBWOFzuQbbD42vmSLKxzL9m2Vy7sgHsVyM',
  authDomain: 'go-julex.firebaseapp.com',
  projectId: 'go-julex',
  storageBucket: 'go-julex.firebasestorage.app',
  messagingSenderId: '691031136286',
  appId: '1:691031136286:web:fdd4fcff894636b45e360f'
};

export const firebaseConfigured = () =>
  !Object.values(FIREBASE_CONFIG).some((v) => String(v || '').startsWith('REPLACE_WITH_'));
