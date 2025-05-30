// empro-v3/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth"; // IMPORTA GoogleAuthProvider
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  databaseURL: "https://emprochampions2025-default-rtdb.firebaseio.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.appspot.com", // Corregido: suele ser .appspot.com
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb",
  measurementId: "G-3TX5J3NDT5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const firestore = getFirestore(app);
const messaging = getMessaging(app);
const provider = new GoogleAuthProvider();

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectDatabaseEmulator(db, "localhost", 9000);
  connectStorageEmulator(storage, "localhost", 9199);
  connectFirestoreEmulator(firestore, "localhost", 8080);
  console.log("Conectado a emuladores de Firebase");
}

export { app, auth, db, storage, firestore, messaging, provider }; 