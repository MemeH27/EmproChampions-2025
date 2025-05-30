// empro-v3/src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, provider, db } from "../firebase"; // 'db' y 'provider' deben venir de firebase.js
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const asignarRolEnFirebase = async (user) => {
    console.log("[Login.jsx] LOG A: Iniciando asignarRolEnFirebase para:", user.email);
    const usuarioRef = ref(db, `usuarios/${user.uid}`);
    const snapshot = await get(usuarioRef);
    console.log("[Login.jsx] LOG B: Snapshot de usuario existente en DB:", snapshot.exists() ? snapshot.val() : "No existe");

    const correoFormateado = user.email.replace(/\./g, ",");
    const adminRef = ref(db, `admins/${correoFormateado}`);
    const adminSnap = await get(adminRef);
    console.log("[Login.jsx] LOG C: Snapshot de admin en DB:", adminSnap.exists() ? "Es admin" : "No es admin por DB");

    let rol = "usuario";
    const correosAdmin = [
      "yayirobe2305@gmail.com",
      "gersonespino@gmail.com",
      "andiescobar8@gmail.com",
      "rodriguezmerary42@gmail.com"
    ];

    if (adminSnap.exists()) {
      rol = "admin";
      console.log("[Login.jsx] LOG C.1: Rol asignado como admin (desde DB /admins).");
    } else if (correosAdmin.includes(user.email)) {
      const nuevoAdminRef = ref(db, `admins/${correoFormateado}`);
      await set(nuevoAdminRef, true);
      rol = "admin";
      console.log("[Login.jsx] LOG C.2: Rol asignado como admin (desde lista correosAdmin y añadido a DB).");
    }
    console.log("[Login.jsx] LOG D: Rol final determinado:", rol);

    if (!snapshot.exists()) {
      console.log("[Login.jsx] LOG E: Creando nuevo nodo de usuario en DB con rol:", rol);
      await set(usuarioRef, {
        correo: user.email,
        rol,
        // Considera añadir otros datos iniciales del usuario si es necesario
        // nombre: user.displayName?.split(' ')[0] || '',
        // apellido: user.displayName?.split(' ')[1] || '',
        // iniciales: (user.displayName?.charAt(0) || '') + (user.displayName?.split(' ')[1]?.charAt(0) || ''),
        // foto: user.photoURL || null,
      });
    } else {
      const datosUsuarioExistente = snapshot.val();
      if (datosUsuarioExistente.rol !== rol) {
        console.log("[Login.jsx] LOG F: Actualizando rol del usuario existente de", datosUsuarioExistente.rol, "a:", rol);
        await set(ref(db, `usuarios/${user.uid}/rol`), rol);
      } else {
        console.log("[Login.jsx] LOG F.1: Rol del usuario existente ya es correcto:", rol);
      }
    }
    console.log("[Login.jsx] LOG G: Navegando a '/' después de asignar rol.");
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("[Login.jsx] LOG 1: Intentando iniciar sesión con email:", email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log("[Login.jsx] LOG 2: Usuario autenticado por Firebase Auth:", user);

      if (!user.emailVerified) {
        console.log("[Login.jsx] LOG 3: Correo no verificado para:", user.email);
        try {
          await sendEmailVerification(user);
          alert("Tu correo no está verificado. Te hemos enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada y spam.");
        } catch (error) {
          console.error("[Login.jsx] Error al enviar correo de verificación:", error);
          alert("Tu correo no está verificado. No se pudo reenviar el correo de verificación. Intenta más tarde o contacta soporte.");
        }
        console.log("[Login.jsx] LOG 3.1: Deteniendo login por correo no verificado.");
        return;
      }

      console.log("[Login.jsx] LOG 4: Correo verificado, procediendo a llamar asignarRolEnFirebase...");
      await asignarRolEnFirebase(user);
      console.log("[Login.jsx] LOG 5: asignarRolEnFirebase completado (navegación debería haber ocurrido).");

    } catch (error) {
      console.error("[Login.jsx] Error en catch de handleLogin:", error);
      console.log("[Login.jsx] Código de error:", error.code);
      console.log("[Login.jsx] Mensaje de error:", error.message);
      let mensaje = "Ocurrió un error al intentar iniciar sesión.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        mensaje = "Las credenciales ingresadas son incorrectas. Verifica tu correo y contraseña.";
      } else if (error.code === 'auth/too-many-requests') {
        mensaje = "Demasiados intentos fallidos de inicio de sesión. Por favor, intenta más tarde.";
      }
      alert(mensaje);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("[Login.jsx] Iniciando handleGoogleLogin...");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("[Login.jsx] Usuario autenticado con Google:", user);

      if (!user.emailVerified) {
        // Aunque Firebase a menudo marca los correos de Google como verificados,
        // esta lógica se mantiene por si acaso o para flujos específicos.
        console.log("[Login.jsx] Usuario de Google con email no verificado por Firebase (según flag), intentando enviar verificación...");
        try {
          await sendEmailVerification(user);
          alert("Hemos detectado que tu correo de Google podría no estar verificado en nuestro sistema. Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada para asegurar el acceso completo.");
        } catch (error) {
          console.error("[Login.jsx] Error al enviar correo de verificación tras login con Google:", error);
          alert("No se pudo enviar un correo de verificación adicional. Podrás continuar, pero considera verificar tu correo si encuentras problemas.");
        }
        // Considera si quieres bloquear el login aquí con `return;` si la verificación es estrictamente necesaria.
      }
      console.log("[Login.jsx] Procediendo a llamar asignarRolEnFirebase para usuario de Google...");
      await asignarRolEnFirebase(user);
      console.log("[Login.jsx] asignarRolEnFirebase completado para usuario de Google.");
    } catch (error) {
      console.error("[Login.jsx] Error en catch de handleGoogleLogin:", error);
      console.log("[Login.jsx] Código de error de Google login:", error.code);
      console.log("[Login.jsx] Mensaje de error de Google login:", error.message);
      let mensaje = "Error al iniciar sesión con Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        mensaje = "Cancelaste el inicio de sesión con Google.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        mensaje = "Ya existe una cuenta con este correo electrónico pero con un método de inicio de sesión diferente. Intenta iniciar sesión con ese método.";
      }
      alert(mensaje);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{
      backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')`
    }}>
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <img
          src={`${import.meta.env.BASE_URL}img/logo-empro.png`}
          alt="Logo Empro"
          className="w-32 md:w-40 mx-auto mb-4"
        />
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
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            autoComplete="current-password"
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
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-bold underline">
            Crea una
          </Link>
        </p>
      </div>
    </div>
  );
}