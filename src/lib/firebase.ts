// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Analytics conditionally
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export const db = getFirestore(app);
