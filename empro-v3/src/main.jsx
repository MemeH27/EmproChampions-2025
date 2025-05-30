// empro-v3/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Tailwind y otros estilos globales
import { AuthProvider } from './context/AuthContext.jsx'; // Asegúrate que la ruta es correcta

const path = sessionStorage.getItem('redirect');
sessionStorage.removeItem('redirect'); // Limpia la redirección

if (path && path !== window.location.pathname.replace('/EmproChampions-2025', '')) { // Evita bucle si ya está en la ruta
  // Asegúrate de que no estás añadiendo el base path dos veces si ya está en `path`
  let newPath = path;
  const basePath = '/EmproChampions-2025';
  
  // Si 'path' ya contiene el basePath, no lo añadas de nuevo
  // Pero para window.history.replaceState, necesitas la ruta relativa a la base.
  if (path.startsWith(basePath)) {
      newPath = path.substring(basePath.length);
      if (!newPath.startsWith('/')) {
        newPath = '/' + newPath;
      }
  } else if (!path.startsWith('/')) {
    newPath = '/' + path;
  }

  if (newPath !== window.location.pathname.replace(basePath, '')) {
    window.history.replaceState(null, null, basePath + (newPath === '/' ? '' : newPath) );
    console.log('Redirecting to:', basePath + (newPath === '/' ? '' : newPath));
  }
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider ya está en App.jsx, no es necesario aquí si App.jsx es el entry point */}
    <App />
  </React.StrictMode>,
);