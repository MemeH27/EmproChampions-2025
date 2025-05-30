// empro-v3/src/components/Navbar.jsx

import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { usuario, rol, cargando } = useContext(AuthContext); // 'rol' se obtiene del AuthContext
  const location = useLocation();

  // No mostramos el Navbar en las páginas de login o registro,
  // o si el usuario aún está cargando o no está autenticado.
  if (cargando || !usuario || location.pathname === "/login" || location.pathname === "/registro") {
    return null;
  }

  // Determinar si el usuario es admin o superadmin
  const isAdmin = rol === "admin" || rol === "superadmin";

  return (
    <nav className="bg-[#7a0026] text-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold font-qatar">🏆 Empro</Link>
        <button
          className="md:hidden transition-transform"
          onClick={() => setOpen(!open)}
        >
          <svg
            className={`w-7 h-7 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
        <ul className={`md:flex gap-6 text-lg font-bold absolute md:static top-16 left-0 w-full md:w-auto bg-[#7a0026] md:bg-transparent transition-all duration-300 ease-in-out ${open ? "block" : "hidden"}`}>
          <li className="p-3 md:p-0 text-center">
            <Link to="/" className="hover:text-yellow-400" onClick={() => setOpen(false)}>Tabla</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/goleadores" className="hover:text-yellow-400" onClick={() => setOpen(false)}>Goleadores</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/historial" className="hover:text-yellow-400" onClick={() => setOpen(false)}>Historial</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/configuracion" className="hover:text-yellow-400" onClick={() => setOpen(false)}>Cuenta</Link>
          </li>
          {/* Mostrar "Nuevo Partido" solo si es admin o superadmin */}
          {isAdmin && (
            <li className="p-3 md:p-0 text-center">
              <Link to="/partido/configurar" className="hover:text-yellow-400" onClick={() => setOpen(false)}>➕ Nuevo Partido</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}