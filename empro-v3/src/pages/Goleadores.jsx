import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Footer from '../components/Footer';

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [generoActivo, setGeneroActivo] = useState("masculino");
  // 1. Nuevo estado para saber qué jugador tiene los detalles visibles
  const [detallesVisibles, setDetallesVisibles] = useState(null); // Guardará el nombre del jugador

  useEffect(() => {
    const goleadoresRef = ref(db, `goleadores/${generoActivo}`);
    onValue(goleadoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaGoleadores = Object.values(data).sort((a, b) => b.goles - a.goles);
        setGoleadores(listaGoleadores);
      } else {
        setGoleadores([]);
      }
    });
  }, [generoActivo]);

  // 2. Función para mostrar u ocultar los detalles de un jugador
  const toggleDetalles = (nombreJugador) => {
    if (detallesVisibles === nombreJugador) {
      setDetallesVisibles(null); // Si ya está abierto, lo cerramos
    } else {
      setDetallesVisibles(nombreJugador); // Si está cerrado, lo abrimos
    }
  };

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar bg-main-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">
          Tabla de Goleadores
        </h1>

        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
          <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Masculino
          </button>
          <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Femenino
          </button>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {goleadores.map((goleador, index) => (
            <div key={goleador.nombre} className="bg-black/50 backdrop-blur-sm rounded-xl shadow-lg p-4 transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-yellow-400 w-8 text-center">{index + 1}</span>
                <img src={`${import.meta.env.BASE_URL}img/escudos/${goleador.logo}`} alt={goleador.equipo} className="w-12 h-12 object-contain" />
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold">{goleador.nombre}</h2>
                  <p className="text-sm opacity-80">{goleador.equipo}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-4xl font-extrabold">{goleador.goles}</p>
                    <p className="text-sm opacity-80 -mt-1">Goles</p>
                  </div>
                  {/* 3. El nuevo botón de Detalles */}
                  <button
                    onClick={() => toggleDetalles(goleador.nombre)}
                    className="bg-yellow-400 text-black font-bold h-10 px-4 rounded-lg text-sm transition hover:bg-yellow-300"
                  >
                    Detalles
                  </button>
                </div>
              </div>
              
              {/* 4. El contenedor de detalles ahora solo se muestra si el jugador está seleccionado */}
              {detallesVisibles === goleador.nombre && (
                <div className="pl-14 mt-4 border-t border-white/10 pt-3">
                  <h4 className="font-bold text-yellow-300 mb-2 text-sm">DETALLE DE GOLES:</h4>
                  {goleador.detalles && goleador.detalles.length > 0 ? (
                    goleador.detalles.map((gol, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm opacity-90 mt-1">
                        <span>⚽</span>
                        <span>vs {gol.partidoNombre?.replace(goleador.equipo, '').replace('vs', '').trim()}</span>
                        <span className="ml-auto font-mono bg-white/10 px-2 rounded">{gol.minuto}'</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm opacity-70">No hay detalles de goles disponibles.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}