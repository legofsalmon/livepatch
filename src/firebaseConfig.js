// Firebase configuration
// For production, set environment variables in .env file
// See .env.example for template
export const firebaseConfig = {
  apiKey: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_API_KEY) || "demo-api-key",
  authDomain: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_AUTH_DOMAIN) || "livepatch-demo.firebaseapp.com",
  databaseURL: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_DATABASE_URL) || "https://livepatch-demo-default-rtdb.firebaseio.com",
  projectId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_PROJECT_ID) || "livepatch-demo",
  storageBucket: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_STORAGE_BUCKET) || "livepatch-demo.appspot.com",
  messagingSenderId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID) || "123456789",
  appId: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_APP_ID) || "1:123456789:web:abcdef123456"
};

// Note: The demo credentials allow offline functionality for development
// For production deployment, create a Firebase project and set environment variables
