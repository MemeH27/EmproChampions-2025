import React from 'react';

export default function PartidoCard({ partido, asignaciones, plantillas, equiposInfo }) {
  // Obtiene el nombre real desde asignaciones o tabla
  const obtenerNombreReal = (equipo) => {
    if (asignaciones && asignaciones[equipo]) {
      return asignaciones[equipo];
    }

    // Detectar si es algo tipo "1er Lugar", "2do Lugar", etc.
    const lugarMatch = equipo.match(/^(\d)(er|do|to) Lugar$/);
    if (lugarMatch && equiposInfo) {
      const pos = parseInt(lugarMatch[1]);
      const equiposOrdenados = Object.entries(equiposInfo)
        .sort((a, b) => b[1].puntos - a[1].puntos); // orden descendente por puntos

      if (equiposOrdenados[pos - 1]) {
        return equiposOrdenados[pos - 1][0]; // nombre del equipo
      }
    }

    return equipo;
  };

  // Obtiene solo el nombre del archivo del logo
  const obtenerLogo = (nombre) => {
    if (plantillas[nombre]?.logo) return plantillas[nombre].logo;

    const encontrado = Object.entries(plantillas).find(([nombrePlantilla]) =>
      nombrePlantilla.toLowerCase().includes(nombre.toLowerCase())
    );

    // Si es "Ganador", "Perdedor", "Finalista", devolvés un logo genérico
    if (/ganador|perdedor|finalista/i.test(nombre)) {
      return 'logo-empro.png';
    }

    return encontrado?.[1]?.logo || 'logo-empro.png';
  };


  // Procesar nombres y rutas
  const nombreEquipo1 = obtenerNombreReal(partido.equipo1);
  const nombreEquipo2 = obtenerNombreReal(partido.equipo2);

  const logo1Src = `${import.meta.env.BASE_URL}img/escudos/${obtenerLogo(nombreEquipo1)}`;
  const logo2Src = `${import.meta.env.BASE_URL}img/escudos/${obtenerLogo(nombreEquipo2)}`;

  return (
    <div className="bg-black/50 rounded-xl p-4 flex flex-col items-center shadow-lg border border-white/10 h-full">
      {/* Parte superior: fecha, cancha, título */}
      <div className="text-center text-xs text-yellow-300 mb-3 font-semibold tracking-wider">
        <span>{partido.fecha}</span>
        {partido.cancha && <span className="mx-2 text-gray-500">|</span>}
        {partido.cancha && <span>CANCHA {partido.cancha}</span>}
        {partido.nombre && <span className="mx-2 text-gray-500">|</span>}
        {partido.nombre && <span className="text-red-400 font-bold">{partido.nombre.toUpperCase()}</span>}
      </div>

      {/* Equipos */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex flex-col items-center text-center w-2/5">
          <img src={logo1Src} alt={`Logo ${nombreEquipo1}`} className="h-14 w-14 md:h-16 md:w-16 object-contain mb-2" />
          <span className="font-bold text-sm text-white">{nombreEquipo1}</span>
        </div>

        <span className="text-2xl font-bold text-gray-400">VS</span>

        <div className="flex flex-col items-center text-center w-2/5">
          <img src={logo2Src} alt={`Logo ${nombreEquipo2}`} className="h-14 w-14 md:h-16 md:w-16 object-contain mb-2" />
          <span className="font-bold text-sm text-white">{nombreEquipo2}</span>
        </div>
      </div>
    </div>
  );
}
