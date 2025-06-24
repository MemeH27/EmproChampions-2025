import React, { useState, useEffect } from 'react';
// Se añade 'get' y 'set' para el nuevo método de guardado
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { initialData } from '../data/initialData';

export default function ModalAsignacion({ open, onClose, letra, genero, asignacionActual }) {
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open) {
      const plantillasParaGenero = initialData.plantillas[genero];
      if (plantillasParaGenero) {
        setEquiposDisponibles(Object.keys(plantillasParaGenero));
      }
      setEquipoSeleccionado(asignacionActual);
    }
  }, [open, genero, asignacionActual]);

  // ==================================================================
  // ========= INICIO DE LA NUEVA FUNCIÓN DE GUARDADO =================
  // ==================================================================
  const handleSave = async () => {
    if (!equipoSeleccionado) {
      alert("Por favor, selecciona un equipo.");
      return;
    }
    setCargando(true);
    
    // 1. Apuntamos al nodo del género completo (ej: /calendario/masculino)
    const generoRef = ref(db, `calendario/${genero}`);

    try {
      // 2. LEEMOS el estado actual completo de ese nodo desde la base de datos
      const snapshot = await get(generoRef);
      
      let calendarioActual;
      if (snapshot.exists()) {
        calendarioActual = snapshot.val();
      } else {
        // Si no hay nada en la base de datos, usamos los datos iniciales como base
        calendarioActual = initialData.calendario[genero];
      }
      
      // 3. MODIFICAMOS la asignación en la copia local que acabamos de leer
      // Nos aseguramos de que el objeto 'asignaciones' exista
      if (!calendarioActual.asignaciones) {
        calendarioActual.asignaciones = {};
      }
      calendarioActual.asignaciones[letra] = equipoSeleccionado;

      // 4. REEMPLAZAMOS todo el nodo en la base de datos con nuestra versión modificada y completa
      await set(generoRef, calendarioActual);

      alert("Asignación guardada correctamente.");
      onClose();

    } catch (error) {
      alert("Error al guardar: " + error.message);
      console.error("Error en handleSave:", error);
    } finally {
      setCargando(false);
    }
  };
  // ================================================================
  // ================= FIN DE LA NUEVA FUNCIÓN ======================
  // ================================================================

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