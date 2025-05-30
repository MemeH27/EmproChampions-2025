// empro-v3/src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get, onValue } from "firebase/database"; // Funciones de Firebase Realtime Database
import { auth, db } from "../firebase"; // MODIFICADO AQUÍ: cambia 'database' por 'db'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeRole;

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 [AuthContext] onAuthStateChanged - user:", user);
      if (user) {
        setUsuario(user);

        if (unsubscribeRole) {
          unsubscribeRole();
        }

        // Usa la variable 'db' importada correctamente
        const userRoleRef = ref(db, `usuarios/${user.uid}/rol`); 
        unsubscribeRole = onValue(userRoleRef, (snapshot) => {
          if (snapshot.exists()) {
            const userRole = snapshot.val();
            setRol(userRole || "usuario");
            console.log("Rol del usuario cargado desde DB:", userRole || "usuario");
          } else {
            setRol("usuario");
            console.log("Nodo de usuario o rol no encontrado, rol por defecto: usuario");
          }
          setCargando(false);
        }, (error) => {
          console.error("Error al leer el rol desde la base de datos:", error);
          setRol("usuario");
          setCargando(false);
        });

      } else {
        if (unsubscribeRole) {
          unsubscribeRole();
        }
        setUsuario(null);
        setRol(null);
        setCargando(false);
      }
    });

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      if (unsubscribeRole) {
        unsubscribeRole();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}