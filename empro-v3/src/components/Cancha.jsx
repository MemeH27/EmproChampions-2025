import React from "react";

export default function Cancha({ equipo1, equipo2 }) {
  return (
    <div className="flex justify-center mt-6 px-4">
      <div
        className="w-full max-w-5xl h-[500px] bg-no-repeat bg-contain bg-center flex justify-between px-2"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/cancha-vertical.svg')` }}
      >

        {/* Lado izquierdo - equipo 1 */}
        <div className="w-1/2 flex flex-col items-center justify-around">
          {equipo1.jugadores
            .filter((jug) => jug.enJuego)
            .map((jugador, i) => (
              <div key={i} className="relative text-center">
                <img
                  src={`/camisas/${equipo1.camisa}`}
                  alt="camisa"
                  className="w-14 mx-auto"
                />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-sm drop-shadow">
                  {jugador.dorsal}
                </div>
                <div className="text-white text-xs mt-1">{jugador.nombre}</div>
              </div>
            ))}
        </div>

        {/* Lado derecho - equipo 2 */}
        <div className="w-1/2 flex flex-col items-center justify-around">
          {equipo2.jugadores
            .filter((jug) => jug.enJuego)
            .map((jugador, i) => (
              <div key={i} className="relative text-center">
                <img
                  src={`/camisas/${equipo2.camisa}`}
                  alt="camisa"
                  className="w-14 mx-auto"
                />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-sm drop-shadow">
                  {jugador.dorsal}
                </div>
                <div className="text-white text-xs mt-1">{jugador.nombre}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
