// empro-v3/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"; // Asegúrate de importar esto

const firebaseConfig = {
  // ... tu configuración de Firebase de producción ...
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  databaseURL: "https://emprochampions2025-default-rtdb.firebaseio.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.appspot.com",
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb",
  measurementId: "G-3TX5J3NDT5"
};

const app = initializeApp(firebaseConfig);

// Inicializaciones de servicios Firebase
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
const database = getDatabase(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const functions = getFunctions(app); // Exporta functions aquí

// --- BLOQUE PARA CONECTAR A EMULADORES (AHORA EN EL LUGAR CORRECTO) ---
if (window.location.hostname === "localhost") {
  console.log("Conectando a los emuladores de Firebase...");
  // Asegúrate de que los puertos coincidan con los que te dio `firebase init emulators`
  connectDatabaseEmulator(database, "localhost", 9000);
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFunctionsEmulator(functions, "localhost", 5001);
}
// --- FIN CONEXIÓN A EMULADORES ---

export {
  auth,
  provider,
  database,
  signInWithPopup,
  signInWithEmailAndPassword
  // No necesitas exportar 'functions', 'storage', 'messaging' de nuevo aquí,
  // ya que se exportan directamente donde se declaran (ej. `export const storage = getStorage(app);`).
};