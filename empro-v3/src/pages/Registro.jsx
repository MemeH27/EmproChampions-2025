import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// MODIFICADO AQUÍ:
import { auth, db } from "../firebase"; // Cambia 'database' por 'db'
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const generarIniciales = (nombre, apellido) => {
    const n = nombre?.charAt(0).toUpperCase() || "";
    const a = apellido?.charAt(0).toUpperCase() || "";
    return `${n}${a}`;
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      const usuarioData = {
        nombre,
        apellido,
        correo: email,
        rol: "usuario", // Todos los nuevos registros son 'usuario' por defecto
        iniciales: generarIniciales(nombre, apellido),
        foto: null, // O una URL a una foto por defecto si la tienes
      };

      // USA 'db' aquí:
      await set(ref(db, `usuarios/${uid}`), usuarioData);

      // Enviar correo de verificación
      await sendEmailVerification(result.user);
      alert("¡Cuenta creada exitosamente! Se ha enviado un correo de verificación a tu dirección de email. Por favor, verifica tu correo para activar tu cuenta.");

      navigate("/login"); // Redirige a login para que inicien sesión después de verificar

    } catch (error) {
      console.error("Error al crear la cuenta:", error); // Es bueno loguear el error completo
      if (error.code === "auth/email-already-in-use") {
        alert("Este correo electrónico ya está registrado. Por favor, intenta con otro o inicia sesión.");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
      }
      else {
        alert("Error al crear la cuenta. Por favor, inténtalo de nuevo. Detalles: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <img src={`${import.meta.env.BASE_URL}img/logo-empro.png`} alt="Logo Empro" className="w-24 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#7a0026] mb-6">Crear Cuenta</h1>
        <form onSubmit={registrarUsuario} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <button
            type="submit"
            className="w-full bg-[#FFD700] text-[#7a0026] font-bold py-2 rounded-md hover:bg-yellow-400 transition"
          >
            Registrarme
          </button>
        </form>
        <p className="mt-4 text-sm text-[#7a0026]">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-bold underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}