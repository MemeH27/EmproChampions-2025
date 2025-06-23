import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
// --- CORRECCIÓN --- Se añade 'off' a la lista de importaciones de Firebase
import { ref, onValue, get, off } from "firebase/database";
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// El componente ModalDetalles no necesita cambios
const ModalDetalles = ({ partidoId, onClose }) => {
  const [detalles, setDetalles] = useState(null);

  useEffect(() => {
    const detallesRef = ref(db, `partidos/${partidoId}`);
    get(detallesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const infoConsolidada = {
          marcador: data.resultado?.marcador,
          mvp: data.resultado?.mvp,
          equipo1: data.alineacion?.equipo1,
          equipo2: data.alineacion?.equipo2,
          eventos: data.eventos || {},
        };
        setDetalles(infoConsolidada);
      }
    });
  }, [partidoId]);

  if (!detalles) {
    return <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><p className="text-white text-xl">Cargando detalles...</p></div>;
  }

  const eventos = [];
  if (detalles.eventos.goles) { Object.values(detalles.eventos.goles).forEach(e => eventos.push({ ...e, tipoVisual: '⚽ Gol' })); }
  eventos.sort((a, b) => (a.minuto || "00:00").localeCompare(b.minuto || "00:00"));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 font-qatar" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Detalles del Partido</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-lg font-bold w-2/5"><img src={`${import.meta.env.BASE_URL}img/escudos/${detalles.equipo1?.logo}`} className="w-8 h-8 object-contain" alt={detalles.equipo1?.nombre} /><span>{detalles.equipo1?.nombre}</span></div>
          <span className="font-bold text-2xl">{detalles.marcador?.equipo1} - {detalles.marcador?.equipo2}</span>
          <div className="flex items-center justify-end gap-2 text-lg font-bold w-2/5"><span className="text-right">{detalles.equipo2?.nombre}</span><img src={`${import.meta.env.BASE_URL}img/escudos/${detalles.equipo2?.logo}`} className="w-8 h-8 object-contain" alt={detalles.equipo2?.nombre} /></div>
        </div>
        {detalles.mvp?.nombre && <p className="text-center mb-4 text-sm">MVP: <span className="font-bold text-yellow-300">{detalles.mvp.nombre}</span></p>}
        <div className="max-h-64 overflow-y-auto space-y-2 border-t border-white/10 pt-3">
          {eventos.map((evento, i) => (
            <div key={i} className="flex items-center text-sm p-2 bg-white/5 rounded">
              <span className="font-mono w-12">{evento.minuto}'</span><span className="w-24">{evento.tipoVisual}</span><span className="font-bold flex-grow">{evento.jugador}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-yellow-400 text-black font-bold py-2 rounded-lg">Cerrar</button>
      </div>
    </div>
  );
};

export default function Historial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [generoActivo, setGeneroActivo] = useState("masculino");
  const [detallesVisible, setDetallesVisible] = useState(null);

  useEffect(() => {
    const historialRef = ref(db, `historial/${generoActivo}`);
    // Se guarda la referencia al listener para poder limpiarlo después
    const listener = onValue(historialRef, (snapshot) => {
      if (snapshot.exists()) {
        const listaPartidos = Object.entries(snapshot.val()).map(([id, partido]) => ({ id, ...partido })).reverse();
        setHistorial(listaPartidos);
      } else {
        setHistorial([]);
      }
    });

    // Esta es la función de limpieza que se ejecuta cuando sales de la página
    // Aquí es donde ocurría el error porque 'off' no estaba definido
    return () => {
      off(historialRef, 'value', listener);
    };
  }, [generoActivo]);

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar bg-main-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">Historial de Partidos</h1>
        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
          <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>Masculino</button>
          <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>Femenino</button>
        </div>
        <div className="space-y-4 max-w-4xl mx-auto">
          {historial.map((partido) => (
            <div key={partido.id} className="bg-black/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex items-center w-full">
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3"><img src={`${import.meta.env.BASE_URL}img/escudos/${partido.logo1}`} className="w-8 h-8 object-contain" alt={partido.equipo1} /><span>{partido.equipo1}</span></div>
                  <div className="flex items-center gap-3"><img src={`${import.meta.env.BASE_URL}img/escudos/${partido.logo2}`} className="w-8 h-8 object-contain" alt={partido.equipo2} /><span>{partido.equipo2}</span></div>
                </div>
                <div className="px-6 text-center">
                  <p className="text-4xl font-extrabold">{partido.goles1} - {partido.goles2}</p>
                  <p className="text-xs opacity-70">{partido.fecha}</p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {user && (
                    <button onClick={() => navigate(`/partido/editar/${partido.id}`)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold h-10 px-4 rounded-lg text-sm transition">
                      Editar
                    </button>
                  )}
                  <button onClick={() => setDetallesVisible(partido.id)} className="bg-yellow-400 text-black font-bold h-10 px-4 rounded-lg text-sm transition hover:bg-yellow-300">
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {detallesVisible && <ModalDetalles partidoId={detallesVisible} onClose={() => setDetallesVisible(null)} />}
      <Footer />
    </div>
  );
}