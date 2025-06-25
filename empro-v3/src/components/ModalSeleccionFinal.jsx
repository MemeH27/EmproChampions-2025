import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { db } from '../firebase';
import { ref, get, update } from 'firebase/database';

export default function ModalSeleccionFinal({ open, onClose, genero }) {
  const [equiposSemis, setEquiposSemis] = useState([]);
  const [final1, setFinal1] = useState('');
  const [final2, setFinal2] = useState('');
  const [tercer1, setTercer1] = useState('');
  const [tercer2, setTercer2] = useState('');

  useEffect(() => {
    if (!genero) return;

    const fetchSemis = async () => {
      try {
        const semisRef = ref(db, `calendario/${genero}/partidos/semifinales`);
        const snapshot = await get(semisRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const equipos = Object.values(data)
            .flatMap(partido => [partido.equipo1, partido.equipo2])
            .filter(Boolean);
          setEquiposSemis(equipos);
        } else {
          setEquiposSemis([]);
        }
      } catch (err) {
        console.error("Error cargando semifinalistas:", err);
        setEquiposSemis([]);
      }
    };

    fetchSemis();
  }, [genero]);

  const handleGuardar = async () => {
    if (!final1 || !final2 || !tercer1 || !tercer2) {
      alert("Seleccioná los 4 equipos.");
      return;
    }

    try {
      const finalesRef = ref(db, `calendario/${genero}/finales`);
      await update(finalesRef, {
        final1: { equipo1: final1, equipo2: final2 },
        tercerLugar: { equipo1: tercer1, equipo2: tercer2 }
      });
      alert("Finales guardadas con éxito.");
      onClose();
    } catch (error) {
      console.error("Error al guardar finales:", error);
      alert("Error al guardar.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white text-black rounded-2xl p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-semibold text-center mb-4">Seleccionar Finalistas</Dialog.Title>

        <div className="mb-4">
          <label className="block font-bold mb-1">Gran Final:</label>
          <select value={final1} onChange={e => setFinal1(e.target.value)} className="w-full border px-3 py-2 rounded mb-2">
            <option value="">Seleccionar equipo</option>
            {equiposSemis.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={final2} onChange={e => setFinal2(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Seleccionar equipo</option>
            {equiposSemis.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-1">Tercer Lugar:</label>
          <select value={tercer1} onChange={e => setTercer1(e.target.value)} className="w-full border px-3 py-2 rounded mb-2">
            <option value="">Seleccionar equipo</option>
            {equiposSemis.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={tercer2} onChange={e => setTercer2(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Seleccionar equipo</option>
            {equiposSemis.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <button
          onClick={handleGuardar}
          className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-500"
        >
          Guardar Final
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}