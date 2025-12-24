// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJyeAbX7cNjgTlY5F6KkAs3HcUS2h7SJU",
  authDomain: "thepreapprovalacademy.firebaseapp.com",
  projectId: "thepreapprovalacademy",
  storageBucket: "thepreapprovalacademy.firebasestorage.app",
  messagingSenderId: "1017634473660",
  appId: "1:1017634473660:web:a5475d3caa5a99d75bf2b9",
  measurementId: "G-QTB4ZLS4KF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();