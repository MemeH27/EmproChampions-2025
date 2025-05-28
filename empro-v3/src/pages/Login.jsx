// ✅ Login.jsx actualizado para verificar correo de admin desde Firebase y asignar rol dinámico

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, database } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const asignarRolEnFirebase = async (user) => {
    const usuarioRef = ref(database, `usuarios/${user.uid}`);
    const snapshot = await get(usuarioRef);

    const correoFormateado = user.email.replace(/\./g, ",");
    const adminRef = ref(database, `admins/${correoFormateado}`);
    const adminSnap = await get(adminRef);

    let rol = "usuario";

    if (adminSnap.exists()) {
      rol = "admin";
    } else if (user.email === "yayirobe2305@gmail.com") {
      // Agregar automáticamente a la lista de admins en Firebase si es el correo del creador
      const nuevoAdminRef = ref(database, `admins/${correoFormateado}`);
      await set(nuevoAdminRef, true);
      rol = "admin";
    }

    if (!snapshot.exists()) {
      await set(usuarioRef, {
        correo: user.email,
        rol,
      });
    }

    navigate("/main");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await asignarRolEnFirebase(result.user);
    } catch (error) {
      alert("Correo o contraseña incorrectos");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await asignarRolEnFirebase(result.user);
    } catch (error) {
      alert("Error al iniciar con Google");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <img src="/img/logo-empro.png" alt="Logo Empro" className="w-24 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#7a0026] mb-6">Empro Champions 2025</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-lg text-[#7a0026] font-bold">¡HOLA, INICIA SESIÓN!</h2>
          <input
            type="email"
            placeholder="CORREO"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <button
            type="submit"
            className="w-full bg-[#FFD700] text-[#7a0026] font-bold py-2 rounded-md hover:bg-yellow-400 transition"
          >
            INICIAR SESIÓN
          </button>
        </form>
        <div className="my-4 text-[#7a0026] font-semibold">o</div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
        >
          INGRESA CON GOOGLE
        </button>
        <p className="mt-4 text-sm text-[#7a0026]">
          ¿No tienes cuenta? <a href="#" className="font-bold underline">Crea una</a>
        </p>
      </div>
    </div>
  );
}
