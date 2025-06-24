import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Usamos el hook

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth(); // Obtenemos las funciones del contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/"); // Simplemente navegamos al inicio
    } catch (error) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      console.error("Error en login:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/"); // Simplemente navegamos al inicio
    } catch (error) {
      setError("Error al iniciar sesión con Google.");
      console.error("Error en login con Google:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <img src={`${import.meta.env.BASE_URL}img/logo-empro.png`} alt="Logo Empro" className="w-32 md:w-40 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#7a0026] mb-6">Empro Champions 2025</h1>
        {error && <p className="bg-red-500 text-white p-2 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-lg text-[#7a0026] font-bold">¡HOLA, INICIA SESIÓN!</h2>
          <input type="email" placeholder="CORREO" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            autoComplete="email"
          />
          <input type="password" placeholder="CONTRASEÑA" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2 border border-[#7a0026] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            autoComplete="current-password"
          />
          <button type="submit" className="w-full bg-[#FFD700] text-[#7a0026] font-bold py-2 rounded-md hover:bg-yellow-400 transition">
            INICIAR SESIÓN
          </button>
        </form>
        <div className="my-4 text-[#7a0026] font-semibold">o</div>
        <button onClick={handleGoogleLogin} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition">
          INGRESA CON GOOGLE
        </button>
        <p className="mt-4 text-sm text-[#7a0026]">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-bold underline">Crea una</Link>
        </p>
      </div>
    </div>
  );
}