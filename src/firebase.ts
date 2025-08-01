// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlMprCdNcj9aNb5WFEcsonjujysMBeZBI",
  authDomain: "neuraq-store.firebaseapp.com",
  projectId: "neuraq-store",
  storageBucket: "neuraq-store.firebasestorage.app",
  messagingSenderId: "1084360597252",
  appId: "1:1084360597252:web:a829a460d3905a1f5eba51",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;
