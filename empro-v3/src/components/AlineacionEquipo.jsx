import React from 'react';

export default function AlineacionEquipo({ equipo, lado }) {
  if (!equipo || !equipo.jugadores) {
    return <div>Cargando equipo...</div>;
  }

  const logoSrc = `${import.meta.env.BASE_URL}img/escudos/${equipo.logo}`;

  return (
    // min-w-0 es CRÍTICO para forzar que el contenido se encoja y no se desborde.
    <div className={`flex flex-col min-w-0`}>
      
      {/* ===== ENCABEZADO DE EQUIPO (VERSIÓN ULTRA-COMPACTA) ===== */}
      <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg mb-2 w-full">
        {lado === 'izquierda' && 
            // Se reduce el logo al mínimo tamaño razonable en móvil (w-8)
            <img src={logoSrc} alt={equipo.nombre} className="w-2 h-2 object-contain flex-shrink-0" />
        }

        {lado === 'derecha' && 
            <img src={logoSrc} alt={equipo.nombre} className="w-8 h-8 object-contain flex-shrink-0" />
        }
      </div>

      {/* ===== LISTA DE JUGADORES (VERSIÓN ULTRA-COMPACTA) ===== */}
      <div className="space-y-1 w-full">
        {equipo.jugadores.filter(j => j.enJuego).map((jugador) => (
          <div 
            key={jugador.nombre}
            // Se reduce el padding para ahorrar espacio
            className={`bg-black/60 p-1 rounded-md text-white text-xs w-full`}
          >
            <div className={`flex items-center gap-1.5`}>
               {/* Se le da un ancho fijo al dorsal para que el nombre tenga espacio flexible */}
              <span className="font-bold opacity-70 w-6 text-center flex-shrink-0">{jugador.dorsal}</span>
              {/* 'truncate' es la clave para que nombres largos no rompan el diseño */}
              <span className="truncate">{jugador.nombre}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}