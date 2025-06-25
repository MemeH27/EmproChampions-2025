import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

export default function ModalSeleccionFinal({ open, onClose, equiposDisponibles, onConfirmar }) {
  const [equipo1, setEquipo1] = useState('');
  const [equipo2, setEquipo2] = useState('');

  const handleConfirmar = () => {
    if (equipo1 && equipo2 && equipo1 !== equipo2) {
      onConfirmar({ equipo1, equipo2 });
      onClose();
    } else {
      alert('Seleccioná dos equipos diferentes.');
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

        <Dialog.Title className="text-xl font-semibold text-center mb-4">Seleccionar Equipos Finalistas</Dialog.Title>

        <div className="mb-4">
          <label className="block font-medium mb-1">Equipo 1:</label>
          <select
            value={equipo1}
            onChange={(e) => setEquipo1(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccionar equipo</option>
            {equiposDisponibles.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Equipo 2:</label>
          <select
            value={equipo2}
            onChange={(e) => setEquipo2(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Seleccionar equipo</option>
            {equiposDisponibles.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirmar}
          className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-500"
        >
          Confirmar Final
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}
