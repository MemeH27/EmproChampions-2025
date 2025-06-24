import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';

export default function ModalAsignacion({ open, onClose, letra, genero, asignacionActual }) {
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(asignacionActual || '');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open) {
      // ==================================================================
      // ========= INICIO DE LA CORRECCIÓN ================================
      // ==================================================================
      // Se cambia la ruta para leer la lista de equipos desde las plantillas,
      // que es la fuente de datos correcta y completa.
      const plantillasRef = ref(db, `plantillas/${genero}`);
      get(plantillasRef).then((snapshot) => {
        if (snapshot.exists()) {
          // Obtenemos los nombres de los equipos, que son las claves en este nodo
          setEquiposDisponibles(Object.keys(snapshot.val()));
        }
      });
      // ================================================================
      // ================= FIN DE LA CORRECCIÓN =========================
      // ================================================================
      setEquipoSeleccionado(asignacionActual);
    }
  }, [open, genero, asignacionActual]);

  const handleSave = async () => {
    if (!equipoSeleccionado) {
      alert("Por favor, selecciona un equipo.");
      return;
    }
    setCargando(true);
    const asignacionRef = ref(db, `calendario/${genero}/asignaciones`);
    try {
      // Usamos update para modificar solo la letra correspondiente
      await update(asignacionRef, { [letra]: equipoSeleccionado });
      alert("Asignación guardada correctamente.");
      onClose();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 text-white rounded-xl w-full max-w-sm p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Asignar Equipo a la Letra "{letra}"</h2>
        <select
          value={equipoSeleccionado}
          onChange={(e) => setEquipoSeleccionado(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded-lg text-white mb-6"
        >
          <option value="">Selecciona un equipo</option>
          {equiposDisponibles.map(equipo => (
            <option key={equipo} value={equipo}>{equipo}</option>
          ))}
        </select>
        <div className="flex justify-between gap-4">
          <button onClick={onClose} className="w-1/2 bg-gray-600 hover:bg-gray-500 font-bold py-2 rounded-lg transition">Cancelar</button>
          <button onClick={handleSave} disabled={cargando} className="w-1/2 bg-green-600 hover:bg-green-500 font-bold py-2 rounded-lg transition disabled:bg-gray-400">
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}