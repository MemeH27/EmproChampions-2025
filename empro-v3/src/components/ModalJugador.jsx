import React, { useState } from "react";
import jugadoresPorEquipo from "../data/jugadores.json";

export default function ModalJugador({
  tipo,
  index,
  jugador,
  onSave,
  onClose,
  camiseta,
  dorsalColor,
  jugadoresActuales,
  nombreEquipo
}) {
  // Lista base de jugadores del equipo
  const equipoNombre = nombreEquipo?.toLowerCase();
  const listaJugadores = jugadoresPorEquipo[equipoNombre] || [];

  // Jugadores ya elegidos (excepto el de esta posición, para permitir editar el mismo)
  const nombresYaSeleccionados = jugadoresActuales
    .filter((j, i) => i !== index && j.nombre)
    .map(j => j.nombre);

  // Solo disponibles los que no están en nombresYaSeleccionados
  const jugadoresDisponibles = listaJugadores.filter(
    j => !nombresYaSeleccionados.includes(j.nombre)
  );

  // Estado para la selección
  const valorInicial = jugador && jugador.nombre && jugador.dorsal
    ? `${jugador.nombre}|${jugador.dorsal}`
    : "";

  const [seleccion, setSeleccion] = useState(valorInicial);

  const handleGuardar = () => {
    if (!seleccion) return;
    const [nombre, dorsal] = seleccion.split("|");
    onSave(index, tipo, { nombre, dorsal });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 text-black relative w-80 md:w-96 mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#7a0026] font-bold text-xl"
          title="Cerrar"
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          <img src={camiseta} alt="camiseta" className="w-16 h-16 mb-2" />
        </div>
        <label className="block font-bold mb-1 text-[#7a0026]">Jugador</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={seleccion}
          onChange={e => setSeleccion(e.target.value)}
        >
          <option value="">Selecciona un jugador</option>
          {jugadoresDisponibles.map(j => (
            <option key={j.dorsal + j.nombre} value={`${j.nombre}|${j.dorsal}`}>
              {j.nombre} (#{j.dorsal})
            </option>
          ))}
        </select>
        <button
          disabled={!seleccion}
          onClick={handleGuardar}
          className="w-full bg-[#FFD700] text-[#7a0026] font-bold py-2 rounded mt-4 hover:bg-yellow-400 transition disabled:bg-gray-400"
        >
          Guardar
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-[#7a0026] font-bold py-2 rounded mt-2 hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
