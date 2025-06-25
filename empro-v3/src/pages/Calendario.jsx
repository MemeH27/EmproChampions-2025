// ... (tus imports sin cambios)
import { useEffect, useState } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModalAsignacion from '../components/ModalAsignacion';
import PartidoCard from '../components/PartidoCard';
import { initialData } from '../data/initialData';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const formatGroupName = (key) => {
  if (key.startsWith('jornada')) return `JORNADA ${key.replace('jornada', '')}`;
  if (key.startsWith('semifinales')) return 'SEMIFINALES';
  if (key.startsWith('finales')) return 'FINALES';
  return key.toUpperCase();
};

export default function Calendario() {
  const { user, rol } = useAuth();
  const [generoActivo, setGeneroActivo] = useState("masculino");
  const [liveData, setLiveData] = useState({ calendario: null, equiposInfo: {} });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ letra: '', asignacionActual: '' });
  const [isLoadingFases, setIsLoadingFases] = useState(false);
  const [isLoadingFinal, setIsLoadingFinal] = useState(false);
  const [hasUploadedInitialData, setHasUploadedInitialData] = useState(false);

  useEffect(() => {
    const calendarioRef = ref(db, `calendario/${generoActivo}`);
    const tablasRef = ref(db, `tablas/${generoActivo}`);

    const onCalendarioValue = onValue(calendarioRef, async (snapshot) => {
      if (!snapshot.exists() && !hasUploadedInitialData) {
        const calendarioInicial = initialData.calendario[generoActivo];
        if (calendarioInicial) {
          await set(ref(db, `calendario/${generoActivo}`), {
            partidos: {
              asignaciones: {},
              partidos: calendarioInicial,
            }
          });
          setHasUploadedInitialData(true);
        }
      }
      setLiveData(prev => ({
        ...prev,
        calendario: snapshot.exists() ? snapshot.val() : null,
      }));
    });

    const onTablasValue = onValue(tablasRef, (snapshot) => {
      setLiveData(prev => ({
        ...prev,
        equiposInfo: snapshot.exists() ? snapshot.val() : {}
      }));
    });

    return () => {
      off(calendarioRef, 'value', onCalendarioValue);
      off(tablasRef, 'value', onTablasValue);
    };
  }, [generoActivo]);

  const handleEditClick = (letra, equipo) => {
    setModalData({ letra, asignacionActual: equipo });
    setModalOpen(true);
  };

  const handleGenerarSemis = async () => {
    if (!window.confirm(`¿Estás seguro de generar las semifinales para ${generoActivo}?`)) return;
    setIsLoadingFases(true);
    try {
      const functions = getFunctions();
      if (import.meta.env.DEV) connectFunctionsEmulator(functions, "localhost", 5001);
      const generarFasesFinales = httpsCallable(functions, 'generarFasesFinales');
      const result = await generarFasesFinales({ genero: generoActivo });
      alert(`¡Éxito!\n${result.data.enfrentamientos.join('\n')}`);
    } catch (error) {
      console.error("Error:", error);
      alert(`Error al generar semifinales: ${error.message}`);
    } finally {
      setIsLoadingFases(false);
    }
  };

  const handleGenerarFinal = async () => {
    if (!window.confirm(`¿Deseás generar la final para ${generoActivo}?`)) return;
    setIsLoadingFinal(true);
    try {
      const functions = getFunctions();
      if (import.meta.env.DEV) connectFunctionsEmulator(functions, "localhost", 5001);
      const generarFinal = httpsCallable(functions, 'generarFinal');
      const result = await generarFinal({ genero: generoActivo });
      alert(`¡Final generada!\n${result.data.enfrentamiento}`);
    } catch (error) {
      console.error("Error:", error);
      alert(`Error al generar final: ${error.message}`);
    } finally {
      setIsLoadingFinal(false);
    }
  };

  const calendario = liveData.calendario || {};
  const plantillas = initialData.plantillas[generoActivo] || {};
  const equiposInfo = liveData.equiposInfo || {};

  return (
    <div className="w-full min-h-screen bg-main-background text-white font-qatar flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">Calendario de Partidos</h1>

        {!calendario ? <p className="text-center">Cargando...</p> : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {calendario.partidos?.partidos && Object.entries(calendario.partidos.partidos).map(([key, jornada]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-400/20 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-300">{formatGroupName(key)}</h2>

                    {(rol === 'admin' || rol === 'superadmin') && (
                      key === 'semifinales' ? (
                        <button
                          onClick={handleGenerarSemis}
                          disabled={isLoadingFases}
                          className="bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-sm hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                          {isLoadingFases ? 'Generando...' : 'Generar Semis'}
                        </button>
                      ) : key === 'finales' ? (
                        <button
                          onClick={handleGenerarFinal}
                          disabled={isLoadingFinal}
                          className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-sm hover:bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                          {isLoadingFinal ? 'Generando...' : 'Generar Final'}
                        </button>
                      ) : null
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(jornada) && jornada.length > 0 ? (
                      jornada.map((partido, i) => (
                        <PartidoCard
                          key={i}
                          partido={partido}
                          asignaciones={calendario.partidos.asignaciones}
                          plantillas={plantillas}
                        />
                      ))
                    ) : (
                      <p className="col-span-full text-center text-sm text-gray-400">No hay partidos disponibles.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      <ModalAsignacion
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        letra={modalData.letra}
        genero={generoActivo}
        asignacionActual={modalData.asignacionActual}
        todasLasAsignaciones={calendario.partidos?.asignaciones}
      />
    </div>
  );
}
