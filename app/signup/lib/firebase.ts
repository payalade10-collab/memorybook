import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBATeSyQzbuPZNAVqsdOXQ1ocJ8FPIn_o8",
  authDomain: "memora-e7f29.firebaseapp.com",
  projectId: "memora-e7f29",
  storageBucket: "memora-e7f29.firebasestorage.app",
  messagingSenderId: "83425776528",
  appId: "1:83425776528:web:96ea13d8970c15259f1915",
  measurementId: "G-8WJWHKZZH8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;