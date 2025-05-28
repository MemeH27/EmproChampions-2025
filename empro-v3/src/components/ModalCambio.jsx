import { useState } from "react";

export default function ModalCambio({ equipo, jugadores, minuto, onConfirm, onClose }) {
  const [titular, setTitular] = useState("");
  const [suplente, setSuplente] = useState("");

  const confirmar = () => {
    if (!titular || !suplente.trim()) return;
    onConfirm(titular, suplente.trim(), minuto);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Realizar Cambio</h2>
        <div>
          <label className="block font-semibold mb-1">Titular que sale</label>
          <select
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Seleccionar</option>
            {jugadores.map((j, i) => (
              <option key={i} value={j.nombre}>{j.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Suplente que entra</label>
          <input
            type="text"
            placeholder="Escribí el nombre"
            value={suplente}
            onChange={(e) => setSuplente(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded font-bold">Cancelar</button>
          <button onClick={confirmar} className="bg-blue-500 text-white px-4 py-2 rounded font-bold">Confirmar Cambio</button>
        </div>
      </div>
    </div>
  );
}
