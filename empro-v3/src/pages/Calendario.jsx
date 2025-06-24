import React, { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModalAsignacion from '../components/ModalAsignacion';
import PartidoCard from '../components/PartidoCard'; // Importamos el nuevo componente

// Helper para dar formato a los nombres de las jornadas/fases
const formatGroupName = (key) => {
    if (key.startsWith('jornada')) return `JORNADA ${key.replace('jornada', '')}`;
    if (key.startsWith('semifinales')) return 'SEMIFINALES';
    if (key.startsWith('finales')) return 'FINALES';
    return key.toUpperCase();
}

export default function Calendario() {
  const { user } = useAuth();
  const [generoActivo, setGeneroActivo] = useState("masculino");
  const [data, setData] = useState({ calendario: null, equiposInfo: {} });
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ letra: '', asignacionActual: '' });

  useEffect(() => {
    setLoading(true);
    const calendarioRef = ref(db, `calendario/${generoActivo}`);
    const tablasRef = ref(db, `tablas/${generoActivo}`);

    const onCalendarioValue = onValue(calendarioRef, (snapshot) => {
      setData(prevData => ({ ...prevData, calendario: snapshot.exists() ? snapshot.val() : null }));
      setLoading(false);
    });

    const onTablasValue = onValue(tablasRef, (snapshot) => {
      setData(prevData => ({ ...prevData, equiposInfo: snapshot.exists() ? snapshot.val() : {} }));
    });

    return () => {
      off(calendarioRef, 'value', onCalendarioValue);
      off(tablasRef, 'value', onTablasValue);
    };
  }, [generoActivo]);

  const handleEditClick = (letra, asignacionActual) => {
    setModalData({ letra, asignacionActual });
    setModalOpen(true);
  };

  const { calendario, equiposInfo } = data;

  return (
    <div className="w-full min-h-screen bg-main-background text-white font-qatar flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">Calendario de Partidos</h1>

        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
            <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>Masculino</button>
            <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>Femenino</button>
        </div>

        {loading ? <p className="text-center">Cargando calendario...</p> : !calendario ? <p className="text-center">No hay calendario disponible para esta categoría.</p> : (
          <div className="max-w-4xl mx-auto">
            {/* Sección de Asignaciones (Sorteo) */}
            <div className="bg-black/50 p-4 rounded-xl mb-8">
                <h2 className="text-xl font-bold text-yellow-300 mb-3 text-center">Equipos del Sorteo</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {Object.entries(calendario.asignaciones).map(([letra, equipo]) => (
                    <div key={letra} className="bg-gray-800/70 p-2 rounded-lg text-center text-xs">
                      <span className="font-bold text-gray-400">Letra {letra}</span>
                      <p className="text-yellow-200 font-semibold truncate">{equipo}</p>
                      {user && <button onClick={() => handleEditClick(letra, equipo)} className="text-xs mt-1 text-blue-400 hover:text-blue-300">Editar</button>}
                    </div>
                  ))}
                </div>
            </div>

            {/* Secciones de Partidos */}
            <div className="space-y-8">
              {Object.entries(calendario.partidos).map(([key, jornada]) =>(
                <div key={key}>
                  <h2 className="text-2xl font-bold text-yellow-300 mb-4 border-b-2 border-yellow-400/20 pb-2">{formatGroupName(key)}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jornada.map((partido, i) => (
                       <PartidoCard key={i} partido={partido} asignaciones={calendario.asignaciones} equiposInfo={equiposInfo} />
                    ))}
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
      />
    </div>
  );
}