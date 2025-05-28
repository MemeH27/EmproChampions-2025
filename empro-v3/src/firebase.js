// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  databaseURL: "https://emprochampions2025-default-rtdb.firebaseio.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.appspot.com", // ✅ CAMBIO AQUÍ
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb",
  measurementId: "G-3TX5J3NDT5"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
const database = getDatabase(app);
export const storage = getStorage(app);
export {
  auth,
  provider,
  database,
  signInWithPopup,
  signInWithEmailAndPassword // 👈 agregá esto
};
