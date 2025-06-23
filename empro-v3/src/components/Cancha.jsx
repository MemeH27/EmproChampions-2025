import React from "react";

export default function Cancha({ children }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-4 md:mt-8">
      <img src="/img/cancha.png" alt="Cancha de futbol" className="w-full h-auto" />

      {/* Usamos una cuadrícula de 3 columnas para alinear todo perfectamente */}
      <div className="absolute inset-0 grid grid-cols-3 items-start p-2 gap-2">

        {/* Columna Izquierda para el Equipo 1 */}
        <div className="text-white">
          {children[0]}
        </div>

        {/* Columna Central para el Logo de Empro */}
        <div className="flex justify-center items-center h-full">
          <img 
            src={`${import.meta.env.BASE_URL}img/logo-empro.png`} 
            alt="Logo Empro" 
            className="w-16 h-16 md:w-24 md:h-24 opacity-80" 
          />
        </div>

        {/* Columna Derecha para el Equipo 2 */}
        <div className="text-white">
          {children[1]}
        </div>

      </div>
    </div>
  );
}