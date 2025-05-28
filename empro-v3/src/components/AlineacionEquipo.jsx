import React, { useState } from "react";
import jugadoresPorEquipo from "../data/jugadores.json";

export default function AlineacionEquipo({ equipo, onAlineacionLista }) {
  const jugadores = jugadoresPorEquipo[equipo] || [];
  // Array de nombres elegidos (máx 6)
  const [titulares, setTitulares] = useState(Array(6).fill(""));
  
  // Cuando seleccionas un jugador, actualizas esa posición de titular
  const handleSelect = (i, value) => {
    // Evita repetir jugador
    const nuevos = [...titulares];
    nuevos[i] = value;
    setTitulares(nuevos);
    if (onAlineacionLista) {
      // Llama callback con titulares y suplentes (objetos completos)
      const titularesObj = nuevos.map(n => jugadores.find(j => j.nombre === n)).filter(Boolean);
      const suplentesObj = jugadores.filter(j => !nuevos.includes(j.nombre));
      onAlineacionLista({ titulares: titularesObj, suplentes: suplentesObj });
    }
  };

  // Jugadores disponibles por cada select (filtra los que ya están elegidos en otros selects)
  const disponibles = (indiceActual) =>
    jugadores.filter(j =>
      !titulares.includes(j.nombre) || titulares[indiceActual] === j.nombre
    );

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-[#7a0026] mb-3">Titulares</h2>
      {titulares.map((nombre, i) => (
        <div key={i} className="mb-2 flex items-center gap-2">
          <span className="font-semibold text-gray-700">{i + 1}.</span>
          <select
            className="flex-1 px-3 py-2 border border-[#7a0026] rounded"
            value={nombre}
            onChange={e => handleSelect(i, e.target.value)}
          >
            <option value="">Selecciona un jugador</option>
            {disponibles(i).map(j => (
              <option key={j.dorsal + j.nombre} value={j.nombre}>
                {j.nombre} (#{j.dorsal})
              </option>
            ))}
          </select>
        </div>
      ))}
      <h2 className="text-lg font-bold text-[#7a0026] mt-6 mb-2">Suplentes</h2>
      <ul className="list-disc ml-6 text-gray-800">
        {jugadores
          .filter(j => !titulares.includes(j.nombre))
          .map(j => (
            <li key={j.nombre}>{j.nombre} (#{j.dorsal})</li>
          ))}
      </ul>
    </div>
  );
}
