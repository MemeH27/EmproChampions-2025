import React from 'react';

export default function PartidoCard({ partido, asignaciones, equiposInfo }) {
  // Busca el nombre real del equipo usando la letra de la asignación
  const nombreEquipo1 = asignaciones[partido.equipo1] || partido.equipo1;
  const nombreEquipo2 = asignaciones[partido.equipo2] || partido.equipo2;

  // Busca la información completa del equipo (incluyendo el logo)
  const infoEquipo1 = equiposInfo[nombreEquipo1];
  const infoEquipo2 = equiposInfo[nombreEquipo2];

  // Define la ruta del logo, o usa uno por defecto si no se encuentra
  const logo1Src = infoEquipo1?.logo ? `<span class="math-inline">\{import\.meta\.env\.BASE\_URL\}img/escudos/</span>{infoEquipo1.logo}` : `${import.meta.env.BASE_URL}img/logo-empro.png`;
  const logo2Src = infoEquipo2?.logo ? `<span class="math-inline">\{import\.meta\.env\.BASE\_URL\}img/escudos/</span>{infoEquipo2.logo}` : `${import.meta.env.BASE_URL}img/logo-empro.png`;

  return (
    <div className="bg-gray-800/60 rounded-xl p-3 w-full text-white shadow-lg border border-white/10">
      <div className="text-center text-xs text-yellow-300 mb-3 font-semibold tracking-wider">
        <span>{partido.fecha}</span>
        {partido.cancha && <span className="mx-2 text-gray-500">|</span>}
        {partido.cancha && <span>CANCHA {partido.cancha}</span>}
        {partido.nombre && <span className="mx-2 text-gray-500">|</span>}
        {partido.nombre && <span className="text-red-400">{partido.nombre.toUpperCase()}</span>}
      </div>
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col items-center text-center w-[35%]">
          <img src={logo1Src} alt={nombreEquipo1} className="h-10 md:h-12 mb-2 object-contain"/>
          <span className="text-xs md:text-sm font-bold truncate w-full">{nombreEquipo1}</span>
        </div>
        <span className="text-xl md:text-2xl font-light text-gray-400">VS</span>
        <div className="flex flex-col items-center text-center w-[35%]">
          <img src={logo2Src} alt={nombreEquipo2} className="h-10 md:h-12 mb-2 object-contain"/>
          <span className="text-xs md:text-sm font-bold truncate w-full">{nombreEquipo2}</span>
        </div>
      </div>
    </div>
  );
}