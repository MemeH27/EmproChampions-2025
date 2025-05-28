// ✅ historial.jsx — Historial de partidos con Firebase y detalles desplegables

import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import Navbar from "../components/Navbar";

export default function Historial() {
  const [partidos, setPartidos] = useState([]);
  const [genero, setGenero] = useState("masculino");
  const [detallesVisibles, setDetallesVisibles] = useState({});

  useEffect(() => {
    const refHistorial = ref(database, `historial/${genero}`);
    onValue(refHistorial, (snap) => {
      const data = snap.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([id, info]) => ({ id, ...info }))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setPartidos(lista);
      } else {
        setPartidos([]);
      }
    });
  }, [genero]);

  const toggleDetalles = (id) => {
    setDetallesVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <Navbar />
      <div className="text-center py-6">
        <img src={`${import.meta.env.BASE_URL}img/logo4.png`} alt="Historial de Partidos" className="mx-auto w-auto px-8 mb-4" />
        <button
          onClick={() => setGenero(genero === "masculino" ? "femenino" : "masculino")}
          className="bg-yellow-400 text-[#7a0026] font-bold px-6 py-2 rounded-full"
        >
          Cambiar a {genero === "masculino" ? "Femenino" : "Masculino"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-10 space-y-4">
        {partidos.length === 0 ? (
          <p className="text-center text-xl">No hay partidos registrados aún.</p>
        ) : (
          partidos.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg p-4 bg-white text-black shadow relative flex flex-col md:flex-row justify-between gap-3 md:gap-6 ${genero === "masculino" ? "md:items-start" : "md:items-end"}`}
            >
              <div className="flex flex-col">
                <p className="text-sm text-gray-600">{p.fecha}</p>
                <p className="text-lg font-bold">{p.equipo1} vs {p.equipo2}</p>
                <p className="text-xl font-extrabold text-[#7a0026]">{p.goles1} - {p.goles2}</p>
                <p className="text-sm">Minutos jugados: {p.minutos}</p>
              </div>
              <div className="text-right md:text-left">
                <button
                  onClick={() => toggleDetalles(p.id)}
                  className="text-sm text-blue-600 underline"
                >
                  {detallesVisibles[p.id] ? "Ocultar" : "Ver más"}
                </button>
                {detallesVisibles[p.id] && p.detalles && (
                  <ul className="mt-2 text-sm list-disc pl-4">
                    {p.detalles.map((d, i) => (
                      <li key={i}>{d.tipo}: {d.jugador} ({d.minuto})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
