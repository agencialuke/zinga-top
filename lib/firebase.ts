// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ IMPORTANTE

const firebaseConfig = {
  apiKey: "AIzaSyDNmZOXK2yD0TjoE9p8Z4XK2NROyV8tAbw",
  authDomain: "zinga-top.firebaseapp.com",
  projectId: "zinga-top",
  storageBucket: "zinga-top.appspot.com", // ⚠️ Corrigido aqui
  messagingSenderId: "286827435869",
  appId: "1:286827435869:web:d8712465e801dd5fbb3ab4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ EXPORTADO
