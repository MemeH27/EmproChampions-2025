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
import { ref, get } from "firebase/database"; // Se importa 'ref' y 'get'

const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null); // Nuevo estado para guardar el rol
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
  };
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Si hay un usuario, buscamos su rol en la base de datos
        const userRef = ref(db, `usuarios/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setRol(snapshot.val().rol); // Guardamos el rol encontrado
        } else {
          setRol('usuario'); // Rol por defecto si no hay datos
        }
        setUser(currentUser);
      } else {
        // Si no hay usuario, limpiamos todo
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
        rol, // <-- AHORA PROVEEMOS EL ROL AL RESTO DE LA APP
        logout,
        loading,
        loginWithGoogle,
      }}
    >
      {children}
    </authContext.Provider>
  );
}