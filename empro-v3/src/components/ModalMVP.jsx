import React, { useState } from "react";

export default function ModalMVP({ equipoGanador, jugadoresParticipantes, onClose }) {
  const [jugadorMVP, setJugadorMVP] = useState(null);

  const guardarMVP = () => {
    if (!jugadorMVP) return;

    const mvpData = {
      jugador: jugadorMVP.nombre,
      dorsal: jugadorMVP.dorsal,
      equipo: equipoGanador.nombre,
      logo: equipoGanador.logo,
    };

    const mvpsPrevios = JSON.parse(localStorage.getItem("mvps")) || [];
    localStorage.setItem("mvps", JSON.stringify([...mvpsPrevios, mvpData]));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="text-center mb-6">
          <img
            src={`/img/${equipoGanador.logo}`}
            alt="Ganador"
            className="w-28 h-28 mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold">Selecciona el MVP del Partido</h2>
          <p className="text-sm text-gray-600">(Incluye titulares y suplentes que jugaron)</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto">
          {jugadoresParticipantes
            .filter((j) => j.haJugado || j.enJuego)
            .map((jug, index) => (
              <div
                key={index}
                onClick={() => setJugadorMVP(jug)}
                className={`cursor-pointer border-2 rounded-lg p-3 text-center hover:border-yellow-500 transition ${
                  jugadorMVP?.nombre === jug.nombre
                    ? "border-yellow-500 bg-yellow-100"
                    : "border-gray-300"
                }`}
              >
                <p className="text-lg font-bold text-gray-800">#{jug.dorsal}</p>
                <p className="text-sm text-gray-700">{jug.nombre}</p>
              </div>
            ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={guardarMVP}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
          >
            Confirmar MVP
          </button>
        </div>
      </div>
    </div>
  );
}
