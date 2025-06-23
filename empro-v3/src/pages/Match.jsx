import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ref, set } from "firebase/database";
import { db } from "../firebase";
import Footer from '../components/Footer';

// Equipos por género
const equiposMasculino = [
  { nombre: "Atrapados", escudo: `${import.meta.env.BASE_URL}img/escudos/atrapados.png` },
  { nombre: "Bosco", escudo: `${import.meta.env.BASE_URL}img/escudos/bosco.png` },
  { nombre: "Emprosaurios", escudo: `${import.meta.env.BASE_URL}img/escudos/emprosaurios.png` },
  { nombre: "Huellas", escudo: `${import.meta.env.BASE_URL}img/escudos/huellas.png` },
  { nombre: "Luz", escudo: `${import.meta.env.BASE_URL}img/escudos/luz.png` },
  { nombre: "Mensajeros", escudo: `${import.meta.env.BASE_URL}img/escudos/mensajeros.png` },
];

const equiposFemenino = [
  { nombre: "Atrapados", escudo: `${import.meta.env.BASE_URL}img/escudos/atrapados.png` },
  { nombre: "Bosco", escudo: `${import.meta.env.BASE_URL}img/escudos/bosco.png` },
  { nombre: "Huellas", escudo: `${import.meta.env.BASE_URL}img/escudos/huellas.png` },
  { nombre: "Luz", escudo: `${import.meta.env.BASE_URL}img/escudos/luz.png` },
  { nombre: "Mensajeros", escudo: `${import.meta.env.BASE_URL}img/escudos/mensajeros.png` },
];


export default function Match() {
  const [genero, setGenero] = useState("masculino");
  const navigate = useNavigate();

  const equipos = genero === "masculino" ? equiposMasculino : equiposFemenino;

  const [indexLocal, setIndexLocal] = useState(0);
  const [indexVisita, setIndexVisita] = useState(1);

  const [fadeLocal, setFadeLocal] = useState(true);
  const [fadeVisita, setFadeVisita] = useState(true);

  const cambiarEquipo = (tipo, direccion) => {
    const total = equipos.length;

    if (tipo === "local") {
      setFadeLocal(false);
      setTimeout(() => {
        setIndexLocal((prev) => (prev + direccion + total) % total);
        setFadeLocal(true);
      }, 150);
    } else {
      setFadeVisita(false);
      setTimeout(() => {
        setIndexVisita((prev) => (prev + direccion + total) % total);
        setFadeVisita(true);
      }, 150);
    }
  };

  const iniciarPartido = async () => {
    const equipoLocal = equipos[indexLocal];
    const equipoVisita = equipos[indexVisita];

    if (equipoLocal.nombre === equipoVisita.nombre) {
      alert("El equipo local y visitante no pueden ser el mismo.");
      return;
    }

    await set(ref(db, `selecciones/equipoLocal`), equipoLocal);
    await set(ref(db, `selecciones/equipoVisita`), equipoVisita);
    await set(ref(db, `selecciones/generoPartido`), genero);

    navigate("/partido/alineacion", {
      state: {
        equipoLocal,
        equipoVisita,
        genero,
        fecha: Date.now()
      }
    });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center font-qatar text-white flex flex-col"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}
    >
      <Navbar />

      {/* Selector de género */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => {
            setGenero("masculino");
            setIndexLocal(0);
            setIndexVisita(1);
          }}
          className={`px-4 py-2 font-bold rounded-full border-2 ${genero === "masculino"
            ? "bg-[#FFD700] text-[#7a0026] border-yellow-400"
            : "bg-transparent border-white text-white"
            } transition`}
        >
          Masculino
        </button>
        <button
          onClick={() => {
            setGenero("femenino");
            setIndexLocal(0);
            setIndexVisita(1);
          }}
          className={`px-4 py-2 font-bold rounded-full border-2 ${genero === "femenino"
            ? "bg-[#FFD700] text-[#7a0026] border-yellow-400"
            : "bg-transparent border-white text-white"
            } transition`}
        >
          Femenino
        </button>
      </div>

      {/* Título */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center mt-6 text-yellow-400 drop-shadow">
        Selección de Equipos
      </h1>

      {/* Tarjetas */}
      <div className="flex flex-col items-center justify-center px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 mx-auto px-4 max-w-6xl">
          {/* Tarjeta Local */}
          <div className="flex flex-col bg-white/90 rounded-2xl p-8 w-full max-w-[460px] text-[#7a0026] shadow-xl transition-all duration-300 min-h-[460px] justify-center items-center">
            <h2 className="font-bold text-2xl mb-4">Equipo Local</h2>

            <div className={`flex flex-col items-center transition-opacity duration-300 ease-in-out ${fadeLocal ? "opacity-100" : "opacity-0"}`}>
              <img
                src={equipos[indexLocal].escudo}
                alt={equipos[indexLocal].nombre}
                className="w-32 h-32 object-contain mb-4 drop-shadow-md"
              />
              <p className="text-3xl font-black">{equipos[indexLocal].nombre}</p>
            </div>

            <div className="flex gap-10 mt-6">
              <button
                onClick={() => cambiarEquipo("local", -1)}
                className="text-4xl text-[#FFD700] hover:scale-110 transition"
              >
                ◀
              </button>
              <button
                onClick={() => cambiarEquipo("local", 1)}
                className="text-4xl text-[#FFD700] hover:scale-110 transition"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Tarjeta Visitante */}
          <div className="flex flex-col bg-white/90 rounded-2xl p-8 w-full max-w-[460px] text-[#7a0026] shadow-xl transition-all duration-300 min-h-[460px] justify-center items-center">
            <h2 className="font-bold text-2xl mb-4">Equipo Visitante</h2>

            <div className={`flex flex-col items-center transition-opacity duration-300 ease-in-out ${fadeVisita ? "opacity-100" : "opacity-0"}`}>
              <img
                src={equipos[indexVisita].escudo}
                alt={equipos[indexVisita].nombre}
                className="w-32 h-32 object-contain mb-4 drop-shadow-md"
              />
              <p className="text-3xl font-black">{equipos[indexVisita].nombre}</p>
            </div>

            <div className="flex gap-10 mt-6">
              <button
                onClick={() => cambiarEquipo("visita", -1)}
                className="text-4xl text-[#FFD700] hover:scale-110 transition"
              >
                ◀
              </button>
              <button
                onClick={() => cambiarEquipo("visita", 1)}
                className="text-4xl text-[#FFD700] hover:scale-110 transition"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÓN SIGUIENTE */}
      <div className="flex justify-center mt-12 mb-20">
        <button
          onClick={iniciarPartido}
          className="bg-[#FFD700] text-[#7a0026] font-bold px-10 py-4 rounded-full hover:bg-yellow-300 transition text-xl shadow-lg"
        >
          Siguiente
        </button>
      </div>
      <Footer />
    </div>
  );
}
