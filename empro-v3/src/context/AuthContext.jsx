import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../firebase";
// Se añade 'update' para poder actualizar el rol si es necesario
import { ref, get, set, update } from "firebase/database"; 

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
  const logout = () => signOut(auth);

  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, googleProvider);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // --- LÓGICA DE ROLES MEJORADA ---

        // 1. Determina el rol correcto basado en el email SIEMPRE
        const correosAdmin = [
          "yayirobe2305@gmail.com",
          "gersonespino@gmail.com",
          "andiescobar8@gmail.com",
          "rodriguezmerary42@gmail.com"
        ];
        const rolCorrecto = correosAdmin.includes(currentUser.email) ? 'admin' : 'usuario';
        
        // 2. Actualiza el estado de la aplicación inmediatamente
        setRol(rolCorrecto);
        setUser(currentUser);

        // 3. Verifica y sincroniza la base de datos en segundo plano
        const userRef = ref(db, `usuarios/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
          // Si el perfil no existe, créalo con el rol correcto
          const nuevoPerfil = {
            correo: currentUser.email,
            rol: rolCorrecto,
            nombre: currentUser.displayName?.split(" ")[0] || "",
            apellido: currentUser.displayName?.split(" ")[1] || "",
          };
          await set(userRef, nuevoPerfil);
        } else {
          // Si el perfil ya existe, asegúrate de que el rol sea el correcto
          const perfilExistente = snapshot.val();
          if (perfilExistente.rol !== rolCorrecto) {
            await update(userRef, { rol: rolCorrecto });
          }
        }
      } else {
        // Si no hay usuario, limpia todo
        setUser(null);
        setRol(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <authContext.Provider value={{ user, rol, loading, signup, login, logout, loginWithGoogle }}>
      {children}
    </authContext.Provider>
  );
}