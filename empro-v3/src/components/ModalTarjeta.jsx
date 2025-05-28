import { useState } from "react";

export default function ModalTarjeta({ equipo, jugadores, minuto, onConfirm, onClose }) {
  const [jugador, setJugador] = useState("");
  const [tipo, setTipo] = useState("");

  const confirmar = () => {
    if (!jugador || !tipo) return;
    onConfirm({ jugador, tipo, minuto });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Registrar Tarjeta</h2>
        <div>
          <label className="block font-semibold mb-1">Jugador</label>
          <select
            value={jugador}
            onChange={(e) => setJugador(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Seleccionar jugador</option>
            {jugadores.map((j, i) => (
              <option key={i} value={j.nombre}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tipo de tarjeta</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" value="amarilla" checked={tipo === "amarilla"} onChange={() => setTipo("amarilla")} />
              <span className="ml-2">🟨 Amarilla</span>
            </label>
            <label className="flex items-center">
              <input type="radio" value="roja" checked={tipo === "roja"} onChange={() => setTipo("roja")} />
              <span className="ml-2">🟥 Roja</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
          <button onClick={confirmar} className="bg-yellow-500 px-4 py-2 rounded font-bold">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
