import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, onValue, get } from "firebase/database";

// Modal para ver detalles del partido
const ModalDetalles = ({ partidoId, onClose }) => {
  const [detalles, setDetalles] = useState(null);

  useEffect(() => {
    // Apuntamos al nodo 'resultado' que tiene toda la info consolidada
    const detallesRef = ref(db, `partidos/${partidoId}/resultado`);
    get(detallesRef).then((snapshot) => {
      if (snapshot.exists()) {
        setDetalles(snapshot.val());
      }
    });
  }, [partidoId]);

  if (!detalles) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <p className="text-white text-xl">Cargando detalles...</p>
      </div>
    );
  }
  
  // Unificamos todos los eventos para mostrarlos en orden
  const eventos = [
    ...(detalles.goles || []).map(e => ({...e, tipoVisual: '⚽ Gol', jugador: e.jugador})),
    ...(detalles.tarjetas || []).map(e => ({...e, tipoVisual: e.tipo === 'amarilla' ? '🟨 Tarjeta' : '🟥 Tarjeta', jugador: e.jugador})),
    ...(detalles.cambios || []).map(e => ({...e, tipoVisual: '🔄 Cambio', jugador: `${e.titular} ➜ ${e.suplente}`}))
  ].sort((a,b) => a.minuto.localeCompare(b.minuto));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 font-qatar" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Detalles del Partido</h2>
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-lg font-bold"><img src={`${import.meta.env.BASE_URL}img/escudos/${detalles.equipo1.logo}`} className="w-8"/><span>{detalles.equipo1.nombre}</span></div>
            <span className="font-bold text-2xl">{detalles.marcador.equipo1} - {detalles.marcador.equipo2}</span>
            <div className="flex items-center gap-2 text-lg font-bold"><span className="text-right">{detalles.equipo2.nombre}</span><img src={`${import.meta.env.BASE_URL}img/escudos/${detalles.equipo2.logo}`} className="w-8"/></div>
        </div>
        <div className="text-center mb-4 text-sm">
            <p>MVP: <span className="font-bold text-yellow-300">{detalles.mvp.nombre}</span></p>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2 border-t border-white/10 pt-3">
            {eventos.map((evento, i) => (
                <div key={i} className="flex items-center text-sm p-2 bg-white/5 rounded">
                    <span className="font-mono w-12">{evento.minuto}'</span>
                    <span className="w-24">{evento.tipoVisual}</span>
                    <span className="font-bold flex-grow">{evento.jugador}</span>
                </div>
            ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-yellow-400 text-black font-bold py-2 rounded-lg">Cerrar</button>
      </div>
    </div>
  );
};


export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [generoActivo, setGeneroActivo] = useState("masculino");
  const [detallesVisible, setDetallesVisible] = useState(null); // Para guardar el ID del partido a ver

  useEffect(() => {
    const historialRef = ref(db, `historial/${generoActivo}`);
    onValue(historialRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaPartidos = Object.entries(data).map(([id, partido]) => ({ id, ...partido })).reverse();
        setHistorial(listaPartidos);
      } else {
        setHistorial([]);
      }
    });
  }, [generoActivo]);

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">
          Historial de Partidos
        </h1>

        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
          <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Masculino
          </button>
          <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Femenino
          </button>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {historial.map((partido) => (
            <div key={partido.id} className="bg-black/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex items-center w-full">
                {/* Equipos */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3"><img src={`${import.meta.env.BASE_URL}img/escudos/${partido.logo1}`} className="w-8 h-8"/><span>{partido.equipo1}</span></div>
                  <div className="flex items-center gap-3"><img src={`${import.meta.env.BASE_URL}img/escudos/${partido.logo2}`} className="w-8 h-8"/><span>{partido.equipo2}</span></div>
                </div>
                
                {/* CORRECCIÓN: Marcador a la derecha y más grande */}
                <div className="px-6 text-center">
                    <p className="text-4xl font-extrabold">{partido.goles1} - {partido.goles2}</p>
                    <p className="text-xs opacity-70">{partido.fecha}</p>
                </div>

                <button onClick={() => setDetallesVisible(partido.id)} className="bg-yellow-400 text-black font-bold h-10 px-4 rounded-lg ml-auto">
                  Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {detallesVisible && (
        <ModalDetalles partidoId={detallesVisible} onClose={() => setDetallesVisible(null)} />
      )}
    </div>
  );
}