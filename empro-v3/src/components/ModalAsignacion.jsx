import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase';
import { initialData } from '../data/initialData';

export default function ModalAsignacion({
  open,
  onClose,
  letra,
  genero,
  asignacionActual,
  todasLasAsignaciones,
  equiposYaAsignados = {}
}) {
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');

  const equiposDisponibles = Object.values(initialData.plantillas[genero] || {});

  const nombresEquipos = Object.keys(initialData.plantillas[genero] || {});

  useEffect(() => {
    setEquipoSeleccionado(asignacionActual || '');
  }, [asignacionActual]);

  const handleGuardar = async () => {
    if (!equipoSeleccionado) {
      alert("Seleccioná un equipo");
      return;
    }

    try {
      // CORREGIDO: ahora guarda en el nodo correcto
      const asignacionesRef = ref(db, `calendario/${genero}/asignaciones`);
      await update(asignacionesRef, {
        [letra]: equipoSeleccionado
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar asignación:", error);
      alert("Hubo un problema al guardar. Intentalo de nuevo.");
    }
  };
  const equiposDisponiblesFiltrados = nombresEquipos.filter(
    (e) => e === asignacionActual || !Object.values(equiposYaAsignados).includes(e)
  );

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white text-black rounded-2xl p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-semibold text-center mb-4">Asignar equipo a la letra {letra}</Dialog.Title>

        <div className="mb-6">
          <label className="block font-medium mb-2">Equipo:</label>
          <select
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccionar equipo</option>
            {equiposDisponiblesFiltrados.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGuardar}
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
        >
          Guardar
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}