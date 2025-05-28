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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/main" element={<Main />} />
      <Route path="/match" element={<Match />} />
      <Route path="/alineacion" element={<Alineacion />} />
      <Route path="/control/:partidoId" element={<ControlPartido />} />   {/* <--- CORREGIDO */}
      <Route path="/goleadores" element={<Goleadores />} />
      <Route path="/historial" element={<Historial />} />
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
