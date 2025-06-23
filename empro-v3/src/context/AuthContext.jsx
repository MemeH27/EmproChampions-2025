import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, get } from "firebase/database";

const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider();
    // ==================================================================
    // ========= INICIO DE LA CORRECCIÓN ================================
    // ==================================================================
    // Esta línea le dice a Google que SIEMPRE muestre la pantalla
    // de selección de cuenta, en lugar de iniciar sesión automáticamente.
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    // ================================================================
    // ================= FIN DE LA CORRECCIÓN =========================
    // ================================================================
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, `usuarios/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setRol(snapshot.val().rol);
        } else {
          setRol('usuario');
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setRol(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <authContext.Provider
      value={{
        signup,
        login,
        user,
        rol,
        logout,
        loading,
        loginWithGoogle,
      }}
    >
      {children}
    </authContext.Provider>
  );
}