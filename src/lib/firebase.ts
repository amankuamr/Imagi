import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC1BAZ2friJvnquqmqxGcljonp8F19sGS0",
  authDomain: "imagi-74caa.firebaseapp.com",
  projectId: "imagi-74caa",
  storageBucket: "imagi-74caa.firebasestorage.app",
  messagingSenderId: "699603159279",
  appId: "1:699603159279:web:577f9326d6acf9c0ff331a",
  measurementId: "G-C8QV8P9888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
