import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

import { useAuth, AuthProvider } from './context/AuthContext';

// 🔥 NUEVO: Importamos la función para subir los datos iniciales
import { subirInitialDataAFirebase } from './utils/subirInitialData';

// Páginas
import Login from './pages/Login';
import Registro from './pages/Registro';
import Main from './pages/Main';
import ControlPartido from './pages/ControlPartido';
import Goleadores from './pages/Goleadores';
import Historial from './pages/Historial';
import Match from './pages/Match';
import Alineacion from './pages/Alineacion';
import Configuracion from './pages/Configuracion';
import ToastNotificacion from './components/ToastNotificacion';
import EditarPartido from './pages/EditarPartido';
import Calendario from './pages/Calendario';

// Rutas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando aplicación...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, rol, loading } = useAuth();
  if (loading) return <div>Cargando aplicación...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (rol !== 'admin' && rol !== 'superadmin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ title: '', body: '' });

  useEffect(() => {
    // 🔥 SOLO UNA VEZ: Subimos datos a Firebase al cargar
    subirInitialDataAFirebase();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          const currentToken = await getToken(messaging, {
            vapidKey: 'BGq64U5eNzfqCtAtHTqnz9mh2oaeLpOZiJHMMama_1L9h_K1I9qScieLNbW8uHvEnRFlNVR2ZSBqAc61dtaW0Mc',
          });
          if (currentToken) {
            console.log('FCM Token:', currentToken);
          } else {
            console.log('No registration token available.');
          }
        }
      } catch (error) {
        console.error('Error al pedir permiso de notificación:', error);
      }
    };

    requestPermission();
    const messaging = getMessaging(app);
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
      setToastData({
        title: payload.notification.title,
        body: payload.notification.body,
      });
      setShowToast(true);
    });

    return () => unsubscribeOnMessage();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter basename="/EmproChampions-2025">
        {showToast && (
          <ToastNotificacion
            title={toastData.title}
            body={toastData.body}
            onClose={() => setShowToast(false)}
          />
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/partido/configurar" element={<AdminRoute><Match /></AdminRoute>} />
          <Route path="/partido/alineacion" element={<AdminRoute><Alineacion /></AdminRoute>} />
          <Route path="/control-partido/:partidoId" element={<AdminRoute><ControlPartido /></AdminRoute>} />
          <Route path="/match/:partidoId" element={<ProtectedRoute><Match modo="ver" /></ProtectedRoute>} />
          <Route path="/goleadores" element={<ProtectedRoute><Goleadores /></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
          <Route path="/partido/editar/:partidoId" element={<AdminRoute><EditarPartido /></AdminRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
