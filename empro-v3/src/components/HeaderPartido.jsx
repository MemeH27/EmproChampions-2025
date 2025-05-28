// src/components/HeaderPartido.jsx
import React from "react";

export default function HeaderPartido({
  equipo1,
  equipo2,
  tiempo,
  enMarcha,
  iniciar,
  pausar,
  reiniciar
}) {
  const formatoTiempo = (t) => {
    const min = String(Math.floor(t / 60)).padStart(2, "0");
    const sec = String(t % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-6xl px-4">
        {/* Logo equipo 1 */}
        <img
          src={`${import.meta.env.BASE_URL}img/escudos/${equipo1.logo}`}
          alt={equipo1.nombre}
          className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-contain"
        />


        {/* Marcador + Tiempo */}
        <div className="text-center">
          <div className="text-6xl font-extrabold mb-2 drop-shadow-md">
            {equipo1.goles ?? 0} - {equipo2.goles ?? 0}
          </div>
          <div className="text-2xl font-bold">{formatoTiempo(tiempo)}</div>
          <div className="mt-2 flex justify-center space-x-2">
            <button onClick={iniciar} className="bg-blue-500 px-3 py-1 rounded text-white text-sm">▶</button>
            <button onClick={pausar} className="bg-blue-500 px-3 py-1 rounded text-white text-sm">⏸</button>
            <button onClick={reiniciar} className="bg-blue-500 px-3 py-1 rounded text-white text-sm">🔁</button>
          </div>
        </div>

        {/* Logo equipo 2 */}
        <img
          src={`${import.meta.env.BASE_URL}img/escudos/${equipo2.logo}`}
          alt={equipo2.nombre}
          className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-contain"
        />

      </div>
    </div>
  );
}
