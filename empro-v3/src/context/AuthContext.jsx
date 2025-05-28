import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "../firebase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 [AuthContext] onAuthStateChanged - user:", user);
      if (user) {
        setUsuario(user);

        try {
          const refUsuario = ref(database, `usuarios/${user.uid}`);
          const snap = await get(refUsuario);
          if (snap.exists()) {
            const data = snap.val();
            setRol(data.rol || "usuario");
          } else {
            setRol("usuario");
          }
        } catch (err) {
          setRol("usuario");
        }

        setCargando(false);
      } else {
        setUsuario(null);
        setRol(null);
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}
