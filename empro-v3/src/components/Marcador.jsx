import React from 'react';

const Marcador = ({ equipo1, equipo2, goles, minuto }) => {
  return (
    <div className="bg-gray-900 bg-opacity-60 backdrop-blur-sm rounded-xl p-4 shadow-lg text-white font-qatar">
      <div className="flex justify-between items-center">
        {/* Equipo Local */}
        <div className="flex flex-col items-center w-1/3 text-center">
          <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo1.logo}`} alt={equipo1.nombre} className="h-16 w-16 md:h-24 md:w-24 object-contain" />
          <span className="mt-2 text-sm md:text-lg font-bold">{equipo1.nombre}</span>
        </div>

        {/* Marcador y Cronómetro */}
        <div className="flex flex-col items-center w-1/3 text-center">
          <div className="text-4xl md:text-6xl font-black tracking-wider">
            <span>{goles.equipo1}</span>
            <span className="mx-2 text-yellow-400">-</span>
            <span>{goles.equipo2}</span>
          </div>
          <div className="text-lg md:text-2xl mt-2 font-semibold bg-black/50 px-3 py-1 rounded-md">
            {minuto}
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="flex flex-col items-center w-1/3 text-center">
          <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo2.logo}`} alt={equipo2.nombre} className="h-16 w-16 md:h-24 md:w-24 object-contain" />
          <span className="mt-2 text-sm md:text-lg font-bold">{equipo2.nombre}</span>
        </div>
      </div>
    </div>
  );
};

export default Marcador;