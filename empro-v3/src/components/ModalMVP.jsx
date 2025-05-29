import React, { useState } from "react";

export default function ModalMVP({ equipoGanador, equipo1, equipo2, onClose }) {
  const [jugadorMVP, setJugadorMVP] = useState(null);

  const guardarMVP = () => {
    if (!jugadorMVP) {
        alert("⚠️ Debes seleccionar un jugador MVP.");
        return;
    }

    const mvpData = {
      jugador: jugadorMVP.nombre,
      dorsal: jugadorMVP.dorsal,
      equipo: jugadorMVP.equipoPertenencia, // Añade esta propiedad si la tienes en el jugador
      logo: (jugadorMVP.equipoPertenencia === equipo1.nombre ? equipo1.logo : equipo2.logo),
    };

    const mvpsPrevios = JSON.parse(localStorage.getItem("mvps")) || [];
    localStorage.setItem("mvps", JSON.stringify([...mvpsPrevios, mvpData]));

    onClose(mvpData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-xl p-6 w-full max-w-2xl shadow-xl">
        <div className="text-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}img/${equipoGanador.logo}`}
            alt="Ganador"
            className="w-28 h-28 mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold">Selecciona el Jugador Más Valioso (MVP)</h2>
          <p className="text-sm text-gray-600">(Incluye titulares y suplentes que jugaron)</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-6">
          {/* Columna Equipo 1 */}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-[#7a0026] mb-3">{equipo1?.nombre}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border p-2 rounded">
              {(equipo1?.jugadores || []).filter(j => j.haJugado || j.enJuego).map((jug, index) => (
                <div
                  key={`${equipo1.nombre}-${jug.nombre}`}
                  onClick={() => setJugadorMVP({ ...jug, equipoPertenencia: equipo1.nombre })}
                  className={`cursor-pointer border-2 rounded-lg p-2 text-center hover:border-yellow-500 transition ${jugadorMVP?.nombre === jug.nombre && jugadorMVP?.equipoPertenencia === equipo1.nombre
                      ? "border-yellow-500 bg-yellow-100"
                      : "border-gray-300"
                    }`}
                >
                  <p className="text-sm font-bold text-gray-800">#{jug.dorsal}</p>
                  <p className="text-xs text-gray-700">{jug.nombre}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Equipo 2 */}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-[#7a0026] mb-3">{equipo2?.nombre}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border p-2 rounded">
              {(equipo2?.jugadores || []).filter(j => j.haJugado || j.enJuego).map((jug, index) => (
                <div
                  key={`${equipo2.nombre}-${jug.nombre}`}
                  onClick={() => setJugadorMVP({ ...jug, equipoPertenencia: equipo2.nombre })}
                  className={`cursor-pointer border-2 rounded-lg p-2 text-center hover:border-yellow-500 transition ${jugadorMVP?.nombre === jug.nombre && jugadorMVP?.equipoPertenencia === equipo2.nombre
                      ? "border-yellow-500 bg-yellow-100"
                      : "border-gray-300"
                    }`}
                >
                  <p className="text-sm font-bold text-gray-800">#{jug.dorsal}</p>
                  <p className="text-xs text-gray-700">{jug.nombre}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => onClose(null)} // Si cancela, no pasa MVP
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={guardarMVP}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
          >
            Guardar y Finalizar Partido
          </button>
        </div>
      </div>
    </div>
  );
}