import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Match from "./pages/Match";
import Alineacion from "./pages/Alineacion";
import ControlPartido from "./pages/ControlPartido";
import Registro from "./pages/Registro";
import Goleadores from "./pages/Goleadores";
import Historial from "./pages/Historial";
import Configuracion from "./pages/Configuracion";

import { AuthContext } from "./context/AuthContext";
import { messaging, database } from './firebase'; // Importa 'messaging' y 'database'
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set } from 'firebase/database'; // Importa ref y set para guardar el token
import React, { useEffect, useContext } from 'react';

export default function App() {
  // Puedes obtener el usuario o el rol si quieres guardar el token asociado a un usuario.
  // const { usuario } = useContext(AuthContext);

  useEffect(() => {
    const requestPermissionAndSaveToken = async () => {
      console.log('Solicitando permiso para notificaciones...');
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Permiso de notificación concedido.');
        try {
          // Reemplaza 'TU_CLAVE_VAPID_PUBLICA_AQUI' con tu clave VAPID pública de Firebase
          const currentToken = await getToken(messaging, { vapidKey: 'TU_CLAVE_VAPID_PUBLICA_AQUI' });

          if (currentToken) {
            console.log('Token de registro de FCM:', currentToken);
            await set(ref(database, `deviceTokens/${currentToken}`), true);
            console.log('Token de FCM guardado en la base de datos.');

          } else {
            console.log('No se pudo obtener el token de registro de FCM. Es posible que el usuario haya bloqueado las notificaciones.');
          }
        } catch (error) {
          console.error('Error al obtener o guardar el token de FCM:', error);
        }
      } else {
        console.log('No se concedió el permiso de notificación.');
      }
    };

    requestPermissionAndSaveToken();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensaje de FCM recibido en primer plano:', payload);
      // Aquí puedes mostrar un toast o una notificación dentro de la UI de tu app
      // Por ejemplo: mostrarToast(payload.notification.body, "info");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/main" element={<Main />} />
      <Route path="/match" element={<Match />} />
      <Route path="/alineacion" element={<Alineacion />} />
      <Route path="/control/:partidoId" element={<ControlPartido />} />
      <Route path="/goleadores" element={<Goleadores />} />
      <Route path="/historial" element={<Historial />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}