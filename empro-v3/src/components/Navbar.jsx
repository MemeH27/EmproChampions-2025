// ✅ Navbar.jsx — con verificación robusta de sesión para evitar redirección errónea

import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { usuario, rol, cargando } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Evita redirigir al login si estamos ya en login o registro
    if (!cargando && !usuario && location.pathname !== "/login" && location.pathname !== "/registro") {
      setTimeout(() => navigate("/login"), 100);
    }
  }, [usuario, cargando, navigate, location.pathname]);

  if (cargando || !usuario) return null;

  return (
    <nav className="bg-[#7a0026] text-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/main" className="text-2xl font-bold font-qatar">🏆 Empro</Link>
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
            <Link to="/main" className="hover:text-yellow-400">Tabla</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/goleadores" className="hover:text-yellow-400">Goleadores</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/historial" className="hover:text-yellow-400">Historial</Link>
          </li>
          <li className="p-3 md:p-0 text-center">
            <Link to="/configuracion" className="hover:text-yellow-400">Cuenta</Link>
          </li>
          {rol === "admin" && (
            <li className="p-3 md:p-0 text-center">
              <Link to="/match" className="hover:text-yellow-400">➕ Nuevo Partido</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

