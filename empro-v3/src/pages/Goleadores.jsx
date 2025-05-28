// ✅ goleadores.jsx — Tabla de goleadores con detalles y cambio de género

import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import Navbar from "../components/Navbar";

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [genero, setGenero] = useState("masculino");
  const [detallesVisibles, setDetallesVisibles] = useState({});

  useEffect(() => {
    const refGoles = ref(database, `goleadoresDetalles/${genero}`);
    onValue(refGoles, (snap) => {
      const data = snap.val();
      if (data) {
        const resumen = {};
        Object.values(data).forEach((gol) => {
          if (!resumen[gol.jugador]) {
            resumen[gol.jugador] = {
              equipo: gol.equipo,
              goles: 0,
              detalles: [],
              logo: gol.logo || "default.png",
            };
          }
          resumen[gol.jugador].goles++;
          resumen[gol.jugador].detalles.push({ minuto: gol.minuto, partido: gol.partido });
        });

        const lista = Object.entries(resumen)
          .map(([jugador, info]) => ({ jugador, ...info }))
          .sort((a, b) => b.goles - a.goles);

        setGoleadores(lista);
      } else {
        setGoleadores([]);
      }
    });
  }, [genero]);

  const toggleDetalles = (nombre) => {
    setDetallesVisibles((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
      <Navbar />
      <div className="text-center py-6">
        <img src="/img/logo3.png" alt="Máximos Goleadores" className="mx-auto w-auto px-8 mb-4" />
        <button
          onClick={() => setGenero(genero === "masculino" ? "femenino" : "masculino")}
          className="bg-yellow-400 text-[#7a0026] font-bold px-6 py-2 rounded-full"
        >
          Cambiar a {genero === "masculino" ? "Femenino" : "Masculino"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-10">
        {goleadores.length === 0 ? (
          <p className="text-center text-xl">No hay goles registrados aún.</p>
        ) : (
          <ul className="space-y-4">
            {goleadores.map((g, i) => (
              <li key={i} className="bg-white text-black rounded-lg shadow px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={`/img/escudos/${g.logo}`} alt={g.equipo} className="w-6 h-6" />
                    <span className="font-bold">{g.jugador} ({g.equipo})</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-lg font-extrabold text-[#7a0026]">{g.goles} ⚽</span>
                    <button
                      onClick={() => toggleDetalles(g.jugador)}
                      className="text-sm text-blue-600 underline"
                    >
                      {detallesVisibles[g.jugador] ? "Ocultar" : "Ver detalles"}
                    </button>
                  </div>
                </div>
                {detallesVisibles[g.jugador] && (
                  <ul className="mt-2 text-sm pl-4 list-disc">
                    {g.detalles.map((det, j) => (
                      <li key={j}>Min {det.minuto} — {det.partido || "Partido desconocido"}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
