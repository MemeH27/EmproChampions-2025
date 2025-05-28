export default function ControlesEquipo({ equipo, onGol, onTarjeta, onCambio }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={onGol}
        className="bg-green-600 w-40 py-4 text-xl font-bold rounded-full shadow-lg"
      >
        ⚽ Gol
      </button>
      <button
        onClick={onTarjeta}
        className="bg-yellow-400 w-40 py-4 text-xl font-bold text-black rounded-full shadow-lg"
      >
        🟨 Tarjeta
      </button>
      <button
        onClick={onCambio}
        className="bg-blue-500 w-40 py-4 text-xl font-bold rounded-full shadow-lg"
      >
        🔁 Cambio
      </button>
    </div>
  );
}

