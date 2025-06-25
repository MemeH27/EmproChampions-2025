import React from 'react';

// --- CORRECCIÓN ---
// Ahora recibe 'plantillas' como prop, en lugar del antiguo 'equiposInfo'
export default function PartidoCard({ partido, asignaciones, plantillas }) {
  const nombreEquipo1 = (asignaciones && partido.equipo1 && asignaciones[partido.equipo1]) || partido.equipo1;
  const nombreEquipo2 = (asignaciones && partido.equipo2 && asignaciones[partido.equipo2]) || partido.equipo2;

  const plantillaEquipo1 = (plantillas && plantillas[nombreEquipo1]) || {};
  const plantillaEquipo2 = (plantillas && plantillas[nombreEquipo2]) || {};


  const logo1Src = plantillaEquipo1.logo ? `${import.meta.env.BASE_URL}img/escudos/${plantillaEquipo1.logo}` : `${import.meta.env.BASE_URL}img/logo-empro.png`;
  const logo2Src = plantillaEquipo2.logo ? `${import.meta.env.BASE_URL}img/escudos/${plantillaEquipo2.logo}` : `${import.meta.env.BASE_URL}img/logo-empro.png`;

  return (
    <div className="bg-black/50 rounded-xl p-4 flex flex-col items-center shadow-lg border border-white/10 h-full">
      <div className="text-center text-xs text-yellow-300 mb-3 font-semibold tracking-wider">
        <span>{partido.fecha}</span>
        {partido.cancha && <span className="mx-2 text-gray-500">|</span>}
        {partido.cancha && <span>CANCHA {partido.cancha}</span>}
        {partido.nombre && <span className="mx-2 text-gray-500">|</span>}
        {partido.nombre && <span className="text-red-400 font-bold">{partido.nombre.toUpperCase()}</span>}
      </div>
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex flex-col items-center text-center w-2/5">
          <img src={logo1Src} alt={`Logo ${nombreEquipo1}`} className="h-14 w-14 md:h-16 md:w-16 object-contain mb-2" />
          <span className="font-bold text-sm truncate w-full">{nombreEquipo1}</span>
        </div>
        <span className="text-2xl font-bold text-gray-400">VS</span>
        <div className="flex flex-col items-center text-center w-2/5">
          <img src={logo2Src} alt={`Logo ${nombreEquipo2}`} className="h-14 w-14 md:h-16 md:w-16 object-contain mb-2" />
          <span className="font-bold text-sm truncate w-full">{nombreEquipo2}</span>
        </div>
      </div>
    </div>
  );
}