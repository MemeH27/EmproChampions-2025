import { useEffect, useState } from 'react';
import { ref, onValue, off, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModalAsignacion from '../components/ModalAsignacion';
import PartidoCard from '../components/PartidoCard';
import ModalSeleccionFinal from '../components/ModalSeleccionFinal';
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
  const [modalFinalOpen, setModalFinalOpen] = useState(false);
  const [hasUploadedInitialData, setHasUploadedInitialData] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const calendarioRef = ref(db, `calendario/${generoActivo}`);
    const tablasRef = ref(db, `tablas/${generoActivo}`);

    const onCalendarioValue = onValue(calendarioRef, async (snapshot) => {
      if (!snapshot.exists() && !hasUploadedInitialData) {
        const calendarioInicial = initialData.calendario[generoActivo];
        if (calendarioInicial) {
          await set(ref(db, `calendario/${generoActivo}`), {
            asignaciones: {},
            partidos: calendarioInicial,
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

  const handleGuardarFinalistas = ({ granFinal, tercerLugar }) => {
    const finalesRef = ref(db, `calendario/masculino/partidos/finales`);
    set(finalesRef, {
      granFinal,
      tercerLugar
    }).then(() => {
      alert("Finalistas guardados correctamente");
      setModalAbierto(false);
    }).catch((error) => {
      console.error("Error al guardar:", error);
      alert("Error al guardar finalistas");
    });
  };


  const calendario = liveData.calendario || {};
  const asignaciones = calendario.asignaciones || {};
  const partidos = calendario.partidos || {};
  const plantillas = initialData.plantillas[generoActivo] || {};
  const equiposInfo = liveData.equiposInfo || {};

  const equiposSemis = [...new Set(
    (partidos?.semifinales || [])
      .flatMap(p => [p.equipo1, p.equipo2])
      .map((e) => asignaciones[e] || e)
      .filter((nombre) => nombre && !nombre.toLowerCase().includes('lugar') && nombre !== 'undefined')
  )];

  return (
    <div className="w-full min-h-screen bg-main-background text-white font-qatar flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">Calendario de Partidos</h1>

        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
          <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Masculino
          </button>
          <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Femenino
          </button>
        </div>

        {/* Tarjetas de asignaciones */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(asignaciones).map(([letra, equipo]) => (
            <div key={letra} className="bg-white text-black px-4 py-2 rounded-xl shadow-md font-bold flex items-center gap-2">
              <span className="text-red-600">{letra}:</span>
              <span>{equipo || `Equipo ${letra}`}</span>
              {(rol === 'admin' || rol === 'superadmin') && (
                <button onClick={() => handleEditClick(letra, equipo)} className="text-blue-600 hover:underline text-sm">Editar</button>
              )}
            </div>
          ))}
        </div>

        {!partidos || Object.keys(partidos).length === 0 ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {Object.entries(partidos).map(([key, jornada]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-400/20 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-300">{formatGroupName(key)}</h2>

                    {rol === 'admin' && key === 'finales' && (
                      <button
                        onClick={() => setModalFinalOpen(true)}
                        className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-sm hover:bg-red-500"
                      >
                        Seleccionar Finalistas
                      </button>
                    )}

                    {rol === 'admin' && key === 'semifinales' && (
                      <button
                        onClick={async () => {
                          const tabla = Object.entries(equiposInfo)
                            .sort(([, a], [, b]) => b.puntos - a.puntos)
                            .slice(0, 4);

                          if (tabla.length < 4) {
                            alert("Se necesitan al menos 4 equipos para generar las semifinales.");
                            return;
                          }

                          const [eq1, eq2, eq3, eq4] = tabla.map(([nombre]) => nombre);
                          const semifinalesRef = ref(db, `calendario/${generoActivo}/partidos/semifinales`);

                          await set(semifinalesRef, [
                            {
                              cancha: "1",
                              equipo1: eq1,
                              equipo2: eq4,
                              fecha: "Domingo 29 Jun - 03:00 PM"
                            },
                            {
                              cancha: "2",
                              equipo1: eq2,
                              equipo2: eq3,
                              fecha: "Domingo 29 Jun - 03:00 PM"
                            }
                          ]);

                          alert("Semifinales generadas correctamente.");
                        }}
                        className="bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-sm hover:bg-green-500"
                      >
                        Generar Semifinales
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(jornada) && jornada.length > 0 ? (
                      jornada.map((partido, i) => (
                        <PartidoCard
                          key={i}
                          partido={partido}
                          asignaciones={asignaciones}
                          plantillas={plantillas}
                          equiposInfo={equiposInfo}
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
        todasLasAsignaciones={asignaciones}
        equiposYaAsignados={asignaciones}
      />

      <ModalSeleccionFinal
        open={modalFinalOpen}
        onClose={() => setModalAbierto(false)}
        genero="masculino"
        onGuardar={handleGuardarFinalistas}
      />


    </div>
  );
}
