// empro-v3/src/App.jsx
import { useEffect, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase'; // Asegúrate que app está exportada desde firebase.js
import { AuthContext, AuthProvider } // AuthProvider envuelve tu app
  from './context/AuthContext';

// Importa tus componentes de página
import Login from './pages/Login';
import Registro from './pages/Registro';
import Main from './pages/Main';
import ControlPartido from './pages/ControlPartido';
import Goleadores from './pages/Goleadores';
import Historial from './pages/Historial';
import Match from './pages/Match';
import Alineacion from './pages/Alineacion';
import Configuracion from './pages/Configuracion';
import Navbar from './components/Navbar'; // Asumo que tienes un Navbar
import ToastNotificacion from './components/ToastNotificacion'; // Asumo este componente

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const authContextValue = useContext(AuthContext);
  const { usuario, cargando, rol } = authContextValue; // CAMBIO AQUÍ: usa 'usuario' en lugar de 'currentUser' para desestructurar

  console.log("[ProtectedRoute] Evaluando...", {
    cargando: cargando,
    currentUserObtenido: usuario, // Logueamos lo que realmente obtenemos
    rol: rol
  });

  if (cargando) {
    console.log("[ProtectedRoute] AuthContext todavía está cargando...");
    return <div>Cargando aplicación...</div>;
  }

  // Ahora 'usuario' es el que viene del contexto
  if (!usuario) {
    console.log("[ProtectedRoute] DECISIÓN: No hay usuario (después de cargar), redirigiendo a /login. Estado del contexto en este punto:", authContextValue);
    return <Navigate to="/login" replace />;
  }

  console.log("[ProtectedRoute] DECISIÓN: Hay usuario (después de cargar), renderizando children. Usuario:", usuario, "Rol:", rol);
  return children;
}


// Componente para rutas de admin
function AdminRoute({ children }) {
  const authContextValue = useContext(AuthContext);
  // CAMBIO AQUÍ: usa 'usuario' y 'rol' consistentemente con lo que provee AuthContext
  const { usuario, rol, cargando } = authContextValue;

  console.log("[AdminRoute] Evaluando...", {
    cargando: cargando,
    currentUserObtenido: usuario,
    rolObtenido: rol
  });

  if (cargando) {
    console.log("[AdminRoute] AuthContext todavía está cargando...");
    return <div>Cargando aplicación...</div>;
  }

  if (!usuario) {
    console.log("[AdminRoute] DECISIÓN: No hay usuario (después de cargar), redirigiendo a /login. Estado del contexto:", authContextValue);
    return <Navigate to="/login" replace />;
  }

  if (rol !== 'admin' && rol !== 'superadmin') {
    console.log("[AdminRoute] DECISIÓN: Usuario existe pero rol no es admin/superadmin (rol:", rol, "), redirigiendo a /. Estado del contexto:", authContextValue);
    return <Navigate to="/" replace />;
  }

  console.log("[AdminRoute] DECISIÓN: Usuario es admin/superadmin (después de cargar), renderizando children. Usuario:", usuario, "Rol:", rol);
  return children;
}

function App() {
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ title: '', body: '' });

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const messaging = getMessaging(app);
          // TU CLAVE VAPID PÚBLICA AQUÍ
          const currentToken = await getToken(messaging, { vapidKey: 'BGq64U5eNzfqCtAtHTqnz9mh2oaeLpOZiJHMMama_1L9h_K1I9qScieLNbW8uHvEnRFlNVR2ZSBqAc61dtaW0Mc' });
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Aquí puedes enviar el token a tu servidor si es necesario
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while requesting permission or getting token. ', error);
      }
    };

    requestPermission();

    const messaging = getMessaging(app);
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      setToastData({
        title: payload.notification.title,
        body: payload.notification.body,
        // image: payload.notification.image // Si envías imagen
      });
      setShowToast(true);
    });

    return () => {
      unsubscribeOnMessage(); // Limpiar el listener al desmontar
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter basename="/EmproChampions-2025">
        {showToast && (
          <ToastNotificacion
            title={toastData.title}
            body={toastData.body}
            image={toastData.image}
            onClose={() => setShowToast(false)}
          />
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />

          {/* FLUJO DE CREACIÓN DE PARTIDO */}
          <Route
            path="/partido/configurar" // 1. Navbar lleva aquí. Match.jsx se encarga de seleccionar equipos/fecha/género
            element={<AdminRoute><Match /></AdminRoute>}
          />
          <Route
            path="/partido/alineacion" // 2. Match.jsx redirige aquí después de crear un ID temporal o guardar datos temp.
            // O podrías pasar datos por estado de ruta si no quieres ID temporal aún.
            element={<AdminRoute><Alineacion /></AdminRoute>}
          />
          {/* Alternativamente, si Alineacion no necesita un ID de partido AÚN, sino solo los nombres de equipo y género: */}
         

          {/* CONTROL Y VISUALIZACIÓN DE PARTIDO EXISTENTE */}
          <Route
            path="/control/:partidoId"
            element={<AdminRoute><ControlPartido /></AdminRoute>}
          />
          <Route
            path="/match/:partidoId" // Para ver detalles de un partido ya creado (si es diferente a Control)
            element={<ProtectedRoute><Match modo="ver" /></ProtectedRoute>} // Si Match.jsx también puede ver
          />

          <Route path="/goleadores" element={<ProtectedRoute><Goleadores /></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />
          {/* <Route path="/alineacion/equipo/:genero/:equipoId" element={<ProtectedRoute><Alineacion modo="equipo"/> </ProtectedRoute>} /> */}
          <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
          <Route path="*" element={<div>Página no encontrada</div>} /> {/* Ruta fallback */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;