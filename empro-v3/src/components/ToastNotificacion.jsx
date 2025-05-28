import React from "react";

export default function ToastNotificacion({ mensaje, tipo = "info" }) {
  const estilos = {
    info: "bg-blue-600 text-white",
    gol: "bg-green-500 text-white",
    tarjeta: "bg-yellow-400 text-black",
    roja: "bg-red-600 text-white",
    success: "bg-emerald-500 text-white",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <div
        className={`px-6 py-3 rounded-full shadow-lg animate-fade-in-out transition duration-500 ${estilos[tipo] || estilos.info}`}
      >
        <p className="text-sm font-bold">{mensaje}</p>
      </div>
    </div>
  );
}
