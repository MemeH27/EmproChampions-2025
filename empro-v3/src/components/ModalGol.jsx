import { useState } from "react";

export default function ModalGol({ equipo, jugadores, minuto, onSeleccion, onClose }) {
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState("");

  const confirmar = () => {
    if (!jugadorSeleccionado) return;
    onSeleccion({ nombre: jugadorSeleccionado, minuto });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Registrar Gol</h2>
        <div>
          <label className="block font-semibold mb-1">¿Quién anotó?</label>
          <select
            value={jugadorSeleccionado}
            onChange={(e) => setJugadorSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Seleccionar jugador</option>
            {jugadores.map((j, i) => (
              <option key={i} value={j.nombre}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
          <button onClick={confirmar} className="bg-green-500 text-white px-4 py-2 rounded font-bold">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
