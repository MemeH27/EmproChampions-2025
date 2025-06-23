import React from 'react';

// Función para obtener la ruta del ícono SVG correcto desde la carpeta public/img
const getIconoSrc = (evento) => {
  // La variable de entorno BASE_URL es manejada por Vite para apuntar a la raíz del sitio
  const baseUrl = import.meta.env.BASE_URL;
  let iconName = '';

  // Determina el nombre del archivo del ícono basado en el tipo de evento
  if (evento.tipo.includes('gol')) iconName = 'pelota.svg';
  else if (evento.tipo.includes('amarilla')) iconName = 'amarilla.svg';
  else if (evento.tipo.includes('roja')) iconName = 'roja.svg';
  else if (evento.tipo.includes('cambio')) iconName = 'cambio.svg';
  
  if (!iconName) return null; // Retorna null si no hay un ícono para el evento
  
  return `${baseUrl}img/${iconName}`;
};

const TimelineEventos = ({ eventos }) => {
  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center text-white text-opacity-70 mt-8 py-10">
        El partido está por comenzar.
      </div>
    );
  }

  return (
    <div className="relative mt-8 py-5 font-barcelona">
      {/* Línea vertical central */}
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500/30" />

      {/* Mapeo de cada evento en la línea de tiempo */}
      {eventos.map((evento, index) => {
        const esEquipo1 = evento.equipo === 'equipo1';
        const iconSrc = getIconoSrc(evento);

        // Componente que renderiza el detalle del evento (ícono y nombre)
        const DetalleEvento = () => (
          <div className={`flex items-center gap-3 w-full ${esEquipo1 ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-bold text-sm text-white truncate max-w-[150px] md:max-w-xs">
              {evento.jugador || `${evento.titular} ➜ ${evento.suplente}`}
            </span>
            {iconSrc && <img src={iconSrc} alt={evento.tipo} className="w-5 h-5" />}
          </div>
        );
        
        return (
          <div key={evento.id || index} className="relative flex items-center justify-center my-6 h-6">
            
            {/* Contenedor para el lado izquierdo (Equipo 1) */}
            <div className="w-1/2 pr-8 flex justify-end">
              {esEquipo1 && <DetalleEvento />}
            </div>

            {/* Círculo del minuto en el centro, sobre la línea */}
            <div className="absolute z-10 bg-[#1a1d23] px-1.5 py-0.5 rounded-full border border-gray-600/50">
              <span className="text-yellow-400 font-bold text-xs">{evento.minuto}'</span>
            </div>
            
            {/* Contenedor para el lado derecho (Equipo 2) */}
            <div className="w-1/2 pl-8 flex justify-start">
              {!esEquipo1 && <DetalleEvento />}
            </div>
            
          </div>
        );
      })}
    </div>
  );
};

export default TimelineEventos;