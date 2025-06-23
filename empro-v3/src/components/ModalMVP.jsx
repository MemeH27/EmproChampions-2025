import React, { useState } from 'react';

export default function ModalMVP({ equipoGanador, equipo1, equipo2, onClose }) {
  const [mvpSeleccionado, setMvpSeleccionado] = useState(null);

  // Filtramos los jugadores que participaron por cada equipo.
  const jugadoresEquipo1 = (equipo1?.jugadores || []).filter(j => j.haJugado);
  const jugadoresEquipo2 = (equipo2?.jugadores || []).filter(j => j.haJugado);

  const handleSeleccionarMVP = (jugador) => {
    setMvpSeleccionado(jugador);
  };

  const handleConfirmar = () => {
    if (mvpSeleccionado) {
      onClose(mvpSeleccionado);
    } else {
      onClose(null); 
    }
  };

  // Componente reutilizable para renderizar un jugador con textos más grandes
  const JugadorItem = ({ jugador }) => (
    <div
      key={jugador.nombre}
      onClick={() => handleSeleccionarMVP(jugador)}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-center ${mvpSeleccionado?.nombre === jugador.nombre ? 'bg-yellow-400 text-black scale-105 ring-2 ring-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
    >
      {/* Texto de nombre de jugador más grande */}
      <span className="font-bold text-base">{jugador.nombre}</span>
      {/* Texto de dorsal más grande */}
      <span className="block text-sm opacity-80 mt-1">#{jugador.dorsal}</span>
    </div>
  );

  return (
    // Aplicamos la fuente Qatar a todo el modal
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 font-qatar">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 border border-yellow-400/30">
        
        <div className="text-center">
          {/* CORRECCIÓN: Se muestra el logo del ganador o un ícono de empate */}
          {equipoGanador.nombre !== "Empate" ? (
            <img src={`${import.meta.env.BASE_URL}img/escudos/${equipoGanador.logo}`} alt={equipoGanador.nombre} className="w-28 h-28 mx-auto mb-4 object-contain" />
          ) : (
            <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center bg-gray-700 rounded-full">
              <span className="text-5xl" role="img" aria-label="empate">🤝</span>
            </div>
          )}

          {/* Textos más grandes */}
          <h2 className="text-4xl font-extrabold text-yellow-400">¡Partido Finalizado!</h2>
          <p className="text-white mt-2 text-xl">
            {equipoGanador.nombre !== "Empate" ? `Ganador: ${equipoGanador.nombre}` : "El partido terminó en empate"}
          </p>
          <p className="text-white mt-5 font-bold text-2xl">Selecciona al MVP del partido</p>
        </div>

        <div className="my-6 flex flex-row gap-4 md:gap-6">
          
          <div className="w-1/2">
            {/* Título de columna más grande */}
            <h3 className="text-center font-bold text-white mb-4 text-xl">{equipo1.nombre}</h3>
            <div className="max-h-[35vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
              {jugadoresEquipo1.map((jugador) => (
                <JugadorItem key={jugador.nombre} jugador={jugador} />
              ))}
            </div>
          </div>

          <div className="w-px bg-gray-600/50"></div>

          <div className="w-1/2">
            {/* Título de columna más grande */}
            <h3 className="text-center font-bold text-white mb-4 text-xl">{equipo2.nombre}</h3>
            <div className="max-h-[35vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
              {jugadoresEquipo2.map((jugador) => (
                <JugadorItem key={jugador.nombre} jugador={jugador} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-600/50">
          <button onClick={() => onClose(null)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">Cancelar</button>
          <button onClick={handleConfirmar} disabled={!mvpSeleccionado} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-lg">Confirmar MVP y Guardar</button>
        </div>
      </div>
    </div>
  );
}