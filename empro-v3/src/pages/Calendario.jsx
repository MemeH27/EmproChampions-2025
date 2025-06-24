import React, { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModalAsignacion from '../components/ModalAsignacion';
import PartidoCard from '../components/PartidoCard';
import { initialData } from '../data/initialData';
import { getFunctions, httpsCallable } from 'firebase/functions'; // <-- Se importan funciones de Firebase

const formatGroupName = (key) => {
    if (key.startsWith('jornada')) return `JORNADA ${key.replace('jornada', '')}`;
    if (key.startsWith('semifinales')) return 'SEMIFINALES';
    if (key.startsWith('finales')) return 'FINALES';
    return key.toUpperCase();
}

export default function Calendario() {
  const { user, rol } = useAuth(); // Se obtiene el rol para mostrar el botón de admin
  const [generoActivo, setGeneroActivo] = useState("masculino");
  const [liveData, setLiveData] = useState({ calendario: null, equiposInfo: {} });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ letra: '', asignacionActual: '' });
  const [isLoadingFases, setIsLoadingFases] = useState(false); // Estado para el botón de carga

  useEffect(() => {
    const calendarioRef = ref(db, `calendario/${generoActivo}`);
    const tablasRef = ref(db, `tablas/${generoActivo}`);
    const onCalendarioValue = onValue(calendarioRef, (snapshot) => { setLiveData(prev => ({ ...prev, calendario: snapshot.exists() ? snapshot.val() : null })) });
    const onTablasValue = onValue(tablasRef, (snapshot) => { setLiveData(prev => ({ ...prev, equiposInfo: snapshot.exists() ? snapshot.val() : {} })) });
    return () => { off(calendarioRef, 'value', onCalendarioValue); off(tablasRef, 'value', onTablasValue); };
  }, [generoActivo]);

  const handleEditClick = (letra, equipo) => {
    setModalData({ letra, asignacionActual: equipo });
    setModalOpen(true);
  };

  // --- INICIO DE LA NUEVA LÓGICA PARA LLAMAR A LA CLOUD FUNCTION ---
  const handleGenerarFases = async () => {
    if (!window.confirm(`¿Estás seguro de generar las semifinales para la categoría ${generoActivo}? Esta acción se basará en la tabla de posiciones actual.`)) return;

    setIsLoadingFases(true);
    try {
      const functions = getFunctions();
      const generarFasesFinales = httpsCallable(functions, 'generarFasesFinales');
      const result = await generarFasesFinales({ genero: generoActivo });
      alert(`¡Éxito! Semifinales generadas:\n${result.data.enfrentamientos.join('\n')}`);
    } catch (error) {
      console.error("Error al llamar a la función:", error);
      alert(`Error al generar fases: ${error.message}`);
    } finally {
      setIsLoadingFases(false);
    }
  };
  // --- FIN DE LA NUEVA LÓGICA ---

  const calendario = liveData.calendario || initialData.calendario[generoActivo];
  const plantillas = initialData.plantillas[generoActivo] || {};
  const equiposInfo = liveData.equiposInfo || {};

  return (
    <div className="w-full min-h-screen bg-main-background text-white font-qatar flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">Calendario de Partidos</h1>
        {/* ... (botones de género) ... */}
        {!calendario ? <p className="text-center">Cargando...</p> : (
          <div className="max-w-4xl mx-auto">
            {/* ... (sección de asignaciones) ... */}
            <div className="space-y-8">
              {calendario.partidos && Object.entries(calendario.partidos).map(([key, jornada]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-400/20 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-300">{formatGroupName(key)}</h2>
                    {/* El botón solo aparece en semifinales y para el admin */}
                    {key === 'semifinales' && (rol === 'admin' || rol === 'superadmin') && (
                       <button onClick={handleGenerarFases} disabled={isLoadingFases} className="bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-sm hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                         {isLoadingFases ? 'Calculando...' : 'Generar Semis'}
                       </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jornada.map((partido, i) => <PartidoCard key={i} partido={partido} asignaciones={calendario.asignaciones} plantillas={plantillas} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <ModalAsignacion open={modalOpen} onClose={() => setModalOpen(false)} letra={modalData.letra} genero={generoActivo} asignacionActual={modalData.asignacionActual} todasLasAsignaciones={calendario.asignaciones} />
    </div>
  );
}