import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, get, update, off } from 'firebase/database';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EditarPartido() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [goles, setGoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!partidoId) { navigate("/"); return; }

    const partidoRef = ref(db, `partidos/${partidoId}`);
    const listener = onValue(partidoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPartido(data);
        const listaGoles = data.eventos?.goles ? Object.entries(data.eventos.goles).map(([id, gol]) => ({ id, ...gol })) : [];
        setGoles(listaGoles);
      } else {
        navigate("/historial");
      }
      setLoading(false);
    });

    return () => off(partidoRef, 'value', listener);
  }, [partidoId, navigate]);

  const handleDeleteGoal = (goalIdToDelete) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este gol?")) {
      setGoles(currentGoles => currentGoles.filter(g => g.id !== goalIdToDelete));
      alert("Gol eliminado de la lista de edición. Recuerda guardar los cambios para que sea permanente.");
    }
  };

  const handleSaveChanges = useCallback(async () => {
    // ==================================================================
    // ========= INICIO DE LA CORRECCIÓN: Verificación de seguridad =====
    // ==================================================================
    if (!partido?.alineacion?.equipo1 || !partido?.alineacion?.equipo2) {
      alert("Error: Faltan datos de alineación en este partido. No se pueden recalcular las estadísticas.");
      setIsSaving(false);
      return;
    }
    // ================================================================
    // ================= FIN DE LA CORRECCIÓN =========================
    // ================================================================

    if (isSaving) return;
    setIsSaving(true);
    alert("Procesando... Esto puede tardar unos segundos. Por favor, espera.");

    try {
      const genero = partido.alineacion.genero;
      const equipo1Info = partido.alineacion.equipo1;
      const equipo2Info = partido.alineacion.equipo2;
      const oldHistorial = (await get(ref(db, `historial/${genero}/${partidoId}`))).val();
      const tablasSnap = await get(ref(db, `tablas/${genero}`));
      let tablas = tablasSnap.val() || {};

      if (oldHistorial) {
        const { equipo1, equipo2, goles1, goles2 } = oldHistorial;
        const rollbackStats = (equipoNombre, golesFavor, golesContra, resultadoAnterior) => {
          if (!tablas[equipoNombre]) return;
          let stats = { ...tablas[equipoNombre] };
          stats.pj -= 1;
          stats.gf -= golesFavor;
          stats.gc -= golesContra;
          if (resultadoAnterior === 'victoria') { stats.pg -= 1; stats.puntos -= 3; }
          else if (resultadoAnterior === 'empate') { stats.pe -= 1; stats.puntos -= 1; }
          else { stats.pp -= 1; }
          tablas[equipoNombre] = stats;
        };
        if (goles1 > goles2) { rollbackStats(equipo1, goles1, goles2, 'victoria'); rollbackStats(equipo2, goles2, goles1, 'derrota');}
        else if (goles2 > goles1) { rollbackStats(equipo1, goles1, goles2, 'derrota'); rollbackStats(equipo2, goles2, goles1, 'victoria');}
        else { rollbackStats(equipo1, goles1, goles2, 'empate'); rollbackStats(equipo2, goles2, goles1, 'empate');}
      }

      const nuevoMarcador = { equipo1: 0, equipo2: 0 };
      goles.forEach(gol => {
        if (gol.equipo === 'equipo1') nuevoMarcador.equipo1++;
        if (gol.equipo === 'equipo2') nuevoMarcador.equipo2++;
      });
      
      const applyNewStats = (equipo, golesFavor, golesContra, nuevoResultado) => {
        if (!equipo?.nombre) return;
        let stats = tablas[equipo.nombre] || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0, logo: equipo.logo };
        stats.pj = (stats.pj || 0) + 1; 
        stats.gf = (stats.gf || 0) + golesFavor;
        stats.gc = (stats.gc || 0) + golesContra;
        if (nuevoResultado === 'victoria') { stats.pg = (stats.pg || 0) + 1; stats.puntos = (stats.puntos || 0) + 3; }
        else if (nuevoResultado === 'empate') { stats.pe = (stats.pe || 0) + 1; stats.puntos = (stats.puntos || 0) + 1; }
        else { stats.pp = (stats.pp || 0) + 1; }
        tablas[equipo.nombre] = stats;
      };

      if (nuevoMarcador.equipo1 > nuevoMarcador.equipo2) { applyNewStats(equipo1Info, nuevoMarcador.equipo1, nuevoMarcador.equipo2, 'victoria'); applyNewStats(equipo2Info, nuevoMarcador.equipo2, nuevoMarcador.equipo1, 'derrota');}
      else if (nuevoMarcador.equipo2 > nuevoMarcador.equipo1) { applyNewStats(equipo1Info, nuevoMarcador.equipo1, nuevoMarcador.equipo2, 'derrota'); applyNewStats(equipo2Info, nuevoMarcador.equipo2, nuevoMarcador.equipo1, 'victoria');}
      else { applyNewStats(equipo1Info, nuevoMarcador.equipo1, nuevoMarcador.equipo2, 'empate'); applyNewStats(equipo2Info, nuevoMarcador.equipo2, nuevoMarcador.equipo1, 'empate');}

      const updates = {};
      const golesParaGuardar = goles.reduce((acc, gol) => ({ ...acc, [gol.id]: { equipo: gol.equipo, jugador: gol.jugador, minuto: gol.minuto, tipo: gol.tipo } }), {});
      updates[`/partidos/${partidoId}/eventos/goles`] = golesParaGuardar;
      updates[`/partidos/${partidoId}/resultado/marcador`] = nuevoMarcador;
      updates[`/historial/${genero}/${partidoId}/goles1`] = nuevoMarcador.equipo1;
      updates[`/historial/${genero}/${partidoId}/goles2`] = nuevoMarcador.equipo2;
      updates[`/tablas/${genero}`] = tablas;
      
      const goleadoresDetallesSnap = await get(ref(db, `goleadoresDetalles/${genero}`));
      let goleadoresDetalles = goleadoresDetallesSnap.val() || {};
      Object.keys(goleadoresDetalles).forEach(jugadorKey => {
          goleadoresDetalles[jugadorKey] = goleadoresDetalles[jugadorKey].filter(g => g.partidoId !== partidoId);
          if (goleadoresDetalles[jugadorKey].length === 0) { delete goleadoresDetalles[jugadorKey]; }
      });
      goles.forEach(gol => {
          const jugadorKey = gol.jugador.replace(/[.#$[\]]/g, '_');
          if (!goleadoresDetalles[jugadorKey]) goleadoresDetalles[jugadorKey] = [];
          goleadoresDetalles[jugadorKey].push({
              idDelGol: gol.id, minuto: gol.minuto, partidoId, partidoNombre: `${equipo1Info.nombre} vs ${equipo2Info.nombre}`,
              fecha: oldHistorial?.fecha || new Date().toLocaleDateString("es-HN"), equipo: gol.equipo === 'equipo1' ? equipo1Info.nombre : equipo2Info.nombre,
              logo: gol.equipo === 'equipo1' ? equipo1Info.logo : equipo2Info.logo, jugador: gol.jugador,
          });
      });
      updates[`/goleadoresDetalles/${genero}`] = goleadoresDetalles;

      await update(ref(db), updates);

      alert("¡Éxito! Todas las tablas han sido recalculadas y actualizadas.");
      navigate("/historial");

    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert(`Hubo un error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [partido, goles, partidoId, navigate, isSaving]);

  if (loading) { return <div className="w-full min-h-screen bg-main-background text-white flex justify-center items-center">Cargando datos...</div>; }

  return (
    <div className="w-full min-h-screen bg-main-background text-white font-qatar flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-2">Editar Partido</h1>
        <p className="text-center text-gray-300 mb-8">{partido.alineacion?.equipo1?.nombre || 'Equipo 1'} vs {partido.alineacion?.equipo2?.nombre || 'Equipo 2'}</p>
        <div className="max-w-2xl mx-auto bg-black/50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Eventos del Partido</h2>
          <div className="space-y-3">
            {goles.length > 0 ? goles.map(evento => (
              <div key={evento.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                <div><p className="font-bold">{evento.jugador} (Gol)</p><p className="text-sm opacity-70">Minuto: {evento.minuto}</p></div>
                <button onClick={() => handleDeleteGoal(evento.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-sm">Eliminar</button>
              </div>
            )) : <p>No hay goles para editar.</p>}
          </div>
          <div className="mt-8 pt-6 border-t border-yellow-400/20 flex justify-between items-center">
              <button onClick={() => navigate('/historial')} className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-6 rounded">Cancelar</button>
              <button onClick={handleSaveChanges} disabled={isSaving} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400">
                {isSaving ? 'Guardando...' : 'Guardar Cambios y Recalcular'}
              </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}