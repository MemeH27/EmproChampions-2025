// ✅ Configuracion.jsx — corregido para usar el hook useAuth()

import React, { useEffect, useState } from "react";
// --- CORRECCIÓN #1: Se importa 'useAuth' en lugar de 'AuthContext' ---
import { useAuth } from "../context/AuthContext";
import { ref as dbRef, get, update, set } from "firebase/database";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ModalFoto from "../components/ModalFoto";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Footer from '../components/Footer';

export default function Configuracion() {
  // --- CORRECCIÓN #2: Se usa el hook useAuth() para obtener el usuario ---
  const { user: usuario } = useAuth(); // Renombramos 'user' a 'usuario' para que coincida con tu código

  const [datos, setDatos] = useState(null);
  const [editable, setEditable] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [requiereDatos, setRequiereDatos] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);

  const navigate = useNavigate();

  const generarIniciales = (n, a) => {
    return (n?.charAt(0).toUpperCase() || "") + (a?.charAt(0).toUpperCase() || "");
  };

  useEffect(() => {
    if (usuario) {
      const refUsuario = dbRef(db, `usuarios/${usuario.uid}`);
      get(refUsuario).then(async (snap) => {
        const displayName = usuario.displayName || "";
        const nombreGoogle = displayName.split(" ")[0] || "";
        const apellidoGoogle = displayName.split(" ")[1] || "";
        const fotoGoogle = usuario.photoURL || null;

        const fotoLocal = localStorage.getItem(`fotoPerfil_${usuario.uid}`);
        const fotoFinal = fotoLocal || fotoGoogle || (snap.exists() && snap.val().foto) || null;

        const nuevoUsuario = {
          nombre: nombreGoogle,
          apellido: apellidoGoogle,
          correo: usuario.email,
          rol: "usuario",
          iniciales: generarIniciales(nombreGoogle, apellidoGoogle),
          foto: fotoFinal,
        };

        const requiere = !nombreGoogle || !apellidoGoogle;
        setRequiereDatos(requiere);
        setEditable(requiere);
        setNombre(nombreGoogle);
        setApellido(apellidoGoogle);

        if (!snap.exists()) {
          await set(refUsuario, nuevoUsuario);
          setDatos(nuevoUsuario);
        } else {
          const data = snap.val();
          const actualizaciones = {};
          if (!data.nombre) actualizaciones.nombre = nombreGoogle;
          if (!data.apellido) actualizaciones.apellido = apellidoGoogle;
          if (!data.foto && fotoFinal) actualizaciones.foto = fotoFinal;

          if (Object.keys(actualizaciones).length > 0) {
            await update(refUsuario, actualizaciones);
            setDatos({ ...data, ...actualizaciones, foto: fotoFinal });
          } else {
            setDatos({ ...data, foto: fotoFinal });
          }

          setNombre(data.nombre || nombreGoogle);
          setApellido(data.apellido || apellidoGoogle);
        }
      });
    }
  }, [usuario]);


  const guardarCambios = async () => {
    if (!usuario) return;
    const refUsuario = dbRef(db, `usuarios/${usuario.uid}`);
    const nuevosDatos = {
      nombre,
      apellido,
      iniciales: generarIniciales(nombre, apellido),
    };

    await update(refUsuario, nuevosDatos);
    setEditable(false);
    setRequiereDatos(false);
    alert("Datos actualizados correctamente");
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const actualizarFoto = (url) => {
    setDatos((prev) => ({ ...prev, foto: url }));
  };

  if (!datos) return <div className="text-white text-center mt-10">Cargando...</div>;

  return (
    <div className="min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <Navbar />
      <div className="flex items-center justify-center px-4 py-10">
        <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md text-center text-black">
          <h1 className="text-3xl font-bold text-[#7a0026] mb-6">Configuración de Cuenta</h1>

          {requiereDatos && (
            <div className="mb-4 text-red-700 font-semibold">
              Tu cuenta no tiene nombre ni foto. Por favor completa tu perfil 👇
            </div>
          )}

          <div className="mb-4 relative w-24 h-24 mx-auto">
            {datos.foto ? (
              <img src={datos.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#7a0026] text-white text-3xl flex items-center justify-center">
                {generarIniciales(nombre, apellido) || "U"}
              </div>
            )}
            <button
              type="button"
              onClick={() => setModalFoto(true)}
              className="absolute bottom-0 right-0 bg-yellow-400 text-black rounded-full p-1 shadow-md hover:bg-yellow-500"
              aria-label="Editar foto de perfil"
            >
              ✏️
            </button>
          </div>

          <div className="space-y-4 text-left">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-[#7a0026] rounded-md"
              disabled={!editable}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-4 py-2 border border-[#7a0026] rounded-md"
              disabled={!editable}
            />
            <p className="text-gray-700 font-sans text-sm break-all">Correo: {datos.correo}</p>
          </div>

          <div className="mt-6">
            {editable ? (
              <button
                onClick={guardarCambios}
                className="w-full bg-[#FFD700] text-[#7a0026] font-bold py-2 rounded-md hover:bg-yellow-400 transition"
              >
                Guardar Cambios
              </button>
            ) : (
              <button
                onClick={() => setEditable(true)}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
              >
                Editar
              </button>
            )}

            <button
              onClick={() => setModalCerrar(true)}
              className="mt-4 w-full bg-red-600 text-white font-bold py-2 rounded-md hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalCerrar} onClose={() => setModalCerrar(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, textAlign: 'center' }}>
          <h2 className="text-xl font-bold mb-4 text-black">¿Cerrar sesión?</h2>
          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => setModalCerrar(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={cerrarSesion}
            >
              Confirmar
            </button>
          </div>
        </Box>
      </Modal>

      <ModalFoto
        open={modalFoto}
        onClose={() => setModalFoto(false)}
        usuario={usuario}
        onUploadSuccess={actualizarFoto}
      />
      <Footer />
    </div>
  );
}