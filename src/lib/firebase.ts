// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT:
// Replace the placeholder values below with your own Firebase project's configuration.
// You can find these details in your Firebase project settings.
// For security, it's recommended to use environment variables to store these keys.
const firebaseConfig = {
  apiKey: "AIzaSy_your_api_key_here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "1:your_sender_id:web:your_app_id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
