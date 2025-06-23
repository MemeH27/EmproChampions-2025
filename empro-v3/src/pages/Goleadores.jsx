import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [generoActivo, setGeneroActivo] = useState("masculino");

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

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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
            <div key={goleador.nombre} className="bg-black/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-yellow-400 w-8 text-center">{index + 1}</span>
                <img src={`${import.meta.env.BASE_URL}img/escudos/${goleador.logo}`} alt={goleador.equipo} className="w-12 h-12 object-contain" />
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold">{goleador.nombre}</h2>
                  <p className="text-sm opacity-80">{goleador.equipo}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-extrabold">{goleador.goles}</p>
                  <p className="text-sm opacity-80 -mt-1">Goles</p>
                </div>
              </div>
              {/* CORRECCIÓN: Muestra el detalle de cada gol */}
              <div className="pl-14 mt-3 border-t border-white/10 pt-3">
                {goleador.detalles.map((gol, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm opacity-90 mt-1">
                    <span>⚽</span>
                    <span>vs {gol.partidoNombre.replace(goleador.equipo, '').replace('vs', '').trim()}</span>
                    <span className="ml-auto font-mono bg-white/10 px-2 rounded">{gol.minuto}'</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}