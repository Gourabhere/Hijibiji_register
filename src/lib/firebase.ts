// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// To connect your app to a persistent database, you need to replace the placeholder
// values below with your actual Firebase project's configuration.
//
// HOW TO GET YOUR FIREBASE CONFIG:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. If you don't have a project, create one. It's free to get started.
// 3. In your project, navigate to Project Settings (click the gear icon ⚙️).
// 4. In the "General" tab, scroll down to the "Your apps" section.
// 5. If you haven't already, add a web app (</> icon).
// 6. Find and copy the `firebaseConfig` object.
// 7. Paste it here, replacing the placeholder object below.
//
// For security in a real production app, it's best to use environment variables
// to store these sensitive keys, but for now, pasting them here will work.
// =================================================================================

const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG OBJECT HERE
  // It will look something like this:
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
// This code checks if Firebase has already been initialized.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a reference to the Firestore database service
const db = getFirestore(app);

// Export the database instance to be used in other parts of the app
export { db };