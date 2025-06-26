import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

export default function ModalSeleccionFinal({ open, onClose, genero, onGuardar = () => {} }) {
  const [equiposTop4, setEquiposTop4] = useState([]);
  const [granFinal, setGranFinal] = useState({ equipo1: '', equipo2: '' });
  const [tercerLugar, setTercerLugar] = useState({ equipo1: '', equipo2: '' });

  // Obtener los 4 primeros lugares
  useEffect(() => {
    const tablaRef = ref(db, `tablas/${genero}`);
    const unsubscribe = onValue(tablaRef, (snapshot) => {
      if (snapshot.exists()) {
        const datos = snapshot.val();
        const lista = Object.entries(datos).map(([nombre, data]) => ({
          nombre,
          puntos: data.puntos ?? 0,
          logo: data.logo ?? '',
        }));

        const top4 = lista
          .sort((a, b) => b.puntos - a.puntos)
          .slice(0, 4);

        setEquiposTop4(top4);
      }
    });

    return () => unsubscribe();
  }, [genero]);

  // Evitar equipos duplicados
  const equiposSeleccionados = new Set([
    granFinal.equipo1,
    granFinal.equipo2,
    tercerLugar.equipo1,
    tercerLugar.equipo2
  ]);

  const equiposFiltrados = (actual) =>
    equiposTop4.filter((e) => e.nombre === actual || !equiposSeleccionados.has(e.nombre));

  const renderSelect = (label, valor, onChange) => (
    <div className="mb-2">
      <label className="block font-medium mb-1">{label}:</label>
      <select
        value={valor}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2"
      >
        <option value="">Seleccionar equipo</option>
        {equiposFiltrados(valor).map((e) => (
          <option key={e.nombre} value={e.nombre}>
            {e.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  const handleGuardar = () => {
    if (
      !granFinal.equipo1 ||
      !granFinal.equipo2 ||
      !tercerLugar.equipo1 ||
      !tercerLugar.equipo2
    ) {
      alert('Seleccioná todos los equipos');
      return;
    }

    onGuardar({
      granFinal: [granFinal.equipo1, granFinal.equipo2],
      tercerLugar: [tercerLugar.equipo1, tercerLugar.equipo2],
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <Dialog.Panel className="bg-white text-black p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Seleccionar Finalistas</h2>

        {renderSelect("Gran Final - Equipo 1", granFinal.equipo1, (e) => setGranFinal(p => ({ ...p, equipo1: e.target.value })))}
        {renderSelect("Gran Final - Equipo 2", granFinal.equipo2, (e) => setGranFinal(p => ({ ...p, equipo2: e.target.value })))}

        <hr className="my-4" />

        {renderSelect("Tercer Lugar - Equipo 1", tercerLugar.equipo1, (e) => setTercerLugar(p => ({ ...p, equipo1: e.target.value })))}
        {renderSelect("Tercer Lugar - Equipo 2", tercerLugar.equipo2, (e) => setTercerLugar(p => ({ ...p, equipo2: e.target.value })))}

        <button
          onClick={handleGuardar}
          className="mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
        >
          Guardar
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}
