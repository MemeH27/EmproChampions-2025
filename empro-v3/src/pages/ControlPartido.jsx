import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ModalGol from "../components/ModalGol";
import ModalTarjeta from "../components/ModalTarjeta";
import ModalCambio from "../components/ModalCambio";
import ModalMVP from "../components/ModalMVP";
import ToastNotificacion from "../components/ToastNotificacion";
import useCronometro from "../hooks/useCronometro";
import { ref, onValue, off, set, push, get } from "firebase/database";
import { db } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Marcador from "../components/Marcador";
import TimelineEventos from "../components/TimelineEventos";

export default function ControlPartido() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  const [equipo1, setEquipo1] = useState(null);
  const [equipo2, setEquipo2] = useState(null);
  const [goles, setGoles] = useState({ equipo1: 0, equipo2: 0 });
  
  // Estados individuales para la lógica de guardado
  const [golesRegistrados, setGolesRegistrados] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cambios, setCambios] = useState([]);
  
  // Estado unificado para la línea de tiempo visual
  const [eventosUnificados, setEventosUnificados] = useState([]);

  const [mostrarModalGol, setMostrarModalGol] = useState(null);
  const [mostrarModalTarjeta, setMostrarModalTarjeta] = useState(null);
  const [mostrarModalCambio, setMostrarModalCambio] = useState(null);
  const [mostrarMVP, setMostrarMVP] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  const cronometro = useCronometro();

  // useEffect CORREGIDO para actualizar TODOS los estados necesarios
  useEffect(() => {
    if (!partidoId) return;

    const refs = {
      alineacion: ref(db, `partidos/${partidoId}/alineacion`),
      marcador: ref(db, `partidos/${partidoId}/marcador`),
      eventos: ref(db, `partidos/${partidoId}/eventos`),
    };

    const listeners = [
      onValue(refs.alineacion, (snap) => { if (snap.exists()) { setEquipo1(snap.val().equipo1); setEquipo2(snap.val().equipo2); }}),
      onValue(refs.marcador, (snap) => { if (snap.exists()) setGoles(snap.val()); }),
      onValue(refs.eventos, (snap) => {
        if (!snap.exists()) {
          setEventosUnificados([]);
          return;
        }
        const todosLosEventosObj = snap.val();
        const listaCompleta = [];
        const listaGoles = [];
        const listaTarjetas = [];
        const listaCambios = [];

        // Iteramos y separamos los eventos en sus respectivos arrays
        for (const id in todosLosEventosObj.goles) {
          const evento = { ...todosLosEventosObj.goles[id], id };
          listaGoles.push(evento);
          listaCompleta.push(evento);
        }
        for (const id in todosLosEventosObj.tarjetas) {
          const evento = { ...todosLosEventosObj.tarjetas[id], id };
          listaTarjetas.push(evento);
          listaCompleta.push(evento);
        }
        for (const id in todosLosEventosObj.cambios) {
          const evento = { ...todosLosEventosObj.cambios[id], id };
          listaCambios.push(evento);
          listaCompleta.push(evento);
        }
        
        // Actualizamos los estados individuales para la lógica de guardado
        setGolesRegistrados(listaGoles);
        setTarjetas(listaTarjetas);
        setCambios(listaCambios);

        // Ordenamos y actualizamos el estado para la línea de tiempo visual
        listaCompleta.sort((a, b) => {
          if (!a.minuto || !b.minuto) return 0;
          const [aMin, aSeg] = a.minuto.split(":").map(Number);
          const [bMin, bSeg] = b.minuto.split(":").map(Number);
          return (aMin * 60 + aSeg) - (bMin * 60 + bSeg);
        });
        setEventosUnificados(listaCompleta);
      })
    ];
    
    return () => {
      Object.keys(refs).forEach((key, index) => {
          if (listeners[index]) {
            off(refs[key], 'value', listeners[index]);
          }
      });
    };
  }, [partidoId]);

  const mostrarToast = (mensaje, tipo = "info") => { setNotificacion({ mensaje, tipo }); setTimeout(() => setNotificacion(null), 4000); };
  const obtenerMinuto = () => { const min = String(Math.floor(cronometro.tiempo / 60)).padStart(2, "0"); const seg = String(cronometro.tiempo % 60).padStart(2, "0"); return `${min}:${seg}`; };
  const registrarGol = (equipoKey) => { if (!cronometro.enMarcha) { mostrarToast("El cronómetro debe estar en marcha", "error"); return; } cronometro.pausar(); setMostrarModalGol(equipoKey); };
  const registrarTarjeta = (equipoKey) => setMostrarModalTarjeta(equipoKey);
  const registrarCambio = (equipoKey) => setMostrarModalCambio(equipoKey);
  const confirmarGol = async (jugador) => { const equipoKey = mostrarModalGol; const marcadorRef = ref(db, `partidos/${partidoId}/marcador`); const nuevoMarcador = { ...goles, [equipoKey]: (goles[equipoKey] || 0) + 1 }; await set(marcadorRef, nuevoMarcador); const golesRef = ref(db, `partidos/${partidoId}/eventos/goles`); await push(golesRef, { tipo: 'gol', equipo: equipoKey, jugador: jugador.nombre, minuto: obtenerMinuto() }); setMostrarModalGol(null); cronometro.iniciar(); mostrarToast("¡Gol registrado!", "success"); };
  const confirmarTarjeta = async ({ jugador, tipo, minuto }) => { const equipoKey = mostrarModalTarjeta; const tarjetasRef = ref(db, `partidos/${partidoId}/eventos/tarjetas`); await push(tarjetasRef, { tipo: tipo, equipo: equipoKey, jugador, minuto }); setMostrarModalTarjeta(null); mostrarToast(`Tarjeta ${tipo} a ${jugador} (${minuto})`, tipo === "roja" ? "roja" : "tarjeta"); };
  const confirmarCambio = async (titular, suplente, minuto) => { const equipoKey = mostrarModalCambio; let equipoObj = equipoKey === "equipo1" ? equipo1 : equipo2; let nuevaAlineacionJugadores = equipoObj.jugadores.map(j => j.nombre === titular ? { ...j, enJuego: false, haJugado: true } : j); let suplenteObj = equipoObj.todosJugadores.find(j => j.nombre === suplente) || { nombre: suplente, dorsal: '?', enJuego: true, haJugado: true }; suplenteObj = { ...suplenteObj, enJuego: true, haJugado: true }; if (!nuevaAlineacionJugadores.some(j => j.nombre === suplenteObj.nombre)) nuevaAlineacionJugadores.push(suplenteObj); else nuevaAlineacionJugadores = nuevaAlineacionJugadores.map(j => j.nombre === suplenteObj.nombre ? { ...j, enJuego: true, haJugado: true } : j); await set(ref(db, `partidos/${partidoId}/alineacion/${equipoKey}/jugadores`), nuevaAlineacionJugadores); if (equipoKey === "equipo1") setEquipo1({ ...equipo1, jugadores: nuevaAlineacionJugadores }); else setEquipo2({ ...equipo2, jugadores: nuevaAlineacionJugadores }); const cambiosRef = ref(db, `partidos/${partidoId}/eventos/cambios`); await push(cambiosRef, { tipo: 'cambio', equipo: equipoKey, titular, suplente, minuto }); setMostrarModalCambio(null); mostrarToast(`Cambio: sale ${titular}, entra ${suplente} (${minuto})`, "info"); };
  
  const finalizarPartido = () => {
    cronometro.pausar();
    setMostrarMVP(true);
    mostrarToast("Partido finalizado. Selecciona el MVP", "success");
  };
  
  const guardarTodoEnFirebase = async (mvpSeleccionado) => {
    if (!mvpSeleccionado) {
      console.log("Guardado cancelado porque no se seleccionó MVP.");
      setMostrarMVP(false);
      return;
    }
    console.log("Iniciando guardado final del partido...");
    try {
      const alineacionSnapshot = await get(ref(db, `partidos/${partidoId}/alineacion`));
      const generoPartido = alineacionSnapshot.val()?.genero || "masculino";
      const datosResultado = { marcador: goles, mvp: mvpSeleccionado, terminado: true, timestamp: Date.now() };
      await set(ref(db, `partidos/${partidoId}/resultado`), datosResultado);
      console.log("Paso 1/4: Resultado del partido guardado.");
      const refTablas = ref(db, `tablas/${generoPartido}`);
      const snapTablas = await get(refTablas);
      const tablasActuales = snapTablas.val() || {};
      const actualizarEstadisticas = (equipoActual, golesAFavor, golesEnContra, resultado) => {
        const stats = tablasActuales[equipoActual.nombre] || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0, logo: equipoActual.logo };
        stats.pj++; stats.gf += golesAFavor; stats.gc += golesEnContra;
        if (resultado === 'victoria') { stats.pg++; stats.puntos += 3; }
        else if (resultado === 'empate') { stats.pe++; stats.puntos += 1; }
        else { stats.pp++; }
        tablasActuales[equipoActual.nombre] = stats;
      };
      if (goles.equipo1 > goles.equipo2) { actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'victoria'); actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'derrota'); }
      else if (goles.equipo2 > goles.equipo1) { actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'derrota'); actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'victoria'); }
      else { actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'empate'); actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'empate'); }
      await set(refTablas, tablasActuales);
      console.log("Paso 2/4: Tabla de posiciones actualizada.");
      const refGoleadoresDetalles = ref(db, `goleadoresDetalles/${generoPartido}`);
      const snapGoleadoresDetalles = await get(refGoleadoresDetalles);
      const goleadoresDetallesActuales = snapGoleadoresDetalles.val() || {};
      for (const gol of golesRegistrados) {
        if (!goleadoresDetallesActuales[gol.jugador]) { goleadoresDetallesActuales[gol.jugador] = []; }
        const equipoGoleador = gol.equipo === "equipo1" ? equipo1 : equipo2;
        goleadoresDetallesActuales[gol.jugador].push({ minuto: gol.minuto, partidoId: partidoId, partidoNombre: `${equipo1.nombre} vs ${equipo2.nombre}`, fecha: new Date().toLocaleDateString("es-HN"), equipo: equipoGoleador.nombre, logo: equipoGoleador.logo });
      }
      await set(refGoleadoresDetalles, goleadoresDetallesActuales);
      console.log("Paso 3/4: Detalles de goleadores actualizados.");
      const refHistorial = ref(db, `historial/${generoPartido}/${partidoId}`);
      await set(refHistorial, { fecha: new Date().toLocaleDateString("es-HN"), equipo1: equipo1.nombre, equipo2: equipo2.nombre, logo1: equipo1.logo, logo2: equipo2.logo, goles1: goles.equipo1, goles2: goles.equipo2, mvp: mvpSeleccionado.nombre });
      console.log("Paso 4/4: Historial de partidos actualizado.");
      setMostrarMVP(false);
      mostrarToast("Partido guardado correctamente", "success");
      console.log("¡Éxito! Redirigiendo a /main...");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("ERROR AL GUARDAR EL PARTIDO:", error);
      mostrarToast("Error al guardar. Revisa la consola.", "error");
    }
  };
  
  const determinarGanador = () => { if (goles.equipo1 > goles.equipo2) return equipo1; if (goles.equipo2 > goles.equipo1) return equipo2; return { nombre: "Empate", logo: "logo-empro.png" }; };

  if (!equipo1 || !equipo2) {
    return (
      <div className="w-full min-h-screen bg-cover bg-center text-white flex flex-col" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div><h2 className="text-3xl font-bold">Cargando datos del partido...</h2></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar px-2 md:px-8 py-4" style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}>
      <Navbar />
      <div className="container mx-auto">
        <Marcador equipo1={equipo1} equipo2={equipo2} goles={goles} minuto={obtenerMinuto()}/>
        <div className="flex justify-center gap-4 my-6">
            <button onClick={cronometro.iniciar} disabled={cronometro.enMarcha} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">▶️ Iniciar</button>
            <button onClick={cronometro.pausar} disabled={!cronometro.enMarcha} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">⏸️ Pausar</button>
            <button onClick={cronometro.reiniciar} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">🔁 Reiniciar</button>
        </div>
        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg flex flex-wrap justify-center gap-x-6 gap-y-3 shadow-lg">
            <button onClick={() => registrarGol("equipo1")} className="text-white font-semibold hover:text-green-400 transition-colors">Gol {equipo1.nombre}</button>
            <button onClick={() => registrarTarjeta("equipo1")} className="text-white font-semibold hover:text-yellow-400 transition-colors">Tarjeta {equipo1.nombre}</button>
            <button onClick={() => registrarCambio("equipo1")} className="text-white font-semibold hover:text-blue-400 transition-colors">Cambio {equipo1.nombre}</button>
            <div className="w-full md:w-auto h-px md:h-auto md:w-px bg-white/20"></div>
            <button onClick={() => registrarGol("equipo2")} className="text-white font-semibold hover:text-green-400 transition-colors">Gol {equipo2.nombre}</button>
            <button onClick={() => registrarTarjeta("equipo2")} className="text-white font-semibold hover:text-yellow-400 transition-colors">Tarjeta {equipo2.nombre}</button>
            <button onClick={() => registrarCambio("equipo2")} className="text-white font-semibold hover:text-blue-400 transition-colors">Cambio {equipo2.nombre}</button>
        </div>
        <TimelineEventos eventos={eventosUnificados} />
        <div className="text-center mt-12">
            <button onClick={finalizarPartido} className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-2xl px-12 py-4 rounded-full shadow-xl">Finalizar Partido</button>
        </div>
      </div>
      {mostrarModalGol && ( <ModalGol equipo={mostrarModalGol} jugadores={(mostrarModalGol === "equipo1" ? equipo1.jugadores : equipo2.jugadores).filter(j => j.enJuego !== false)} minuto={obtenerMinuto()} onSeleccion={confirmarGol} onClose={() => { setMostrarModalGol(null); cronometro.iniciar(); }} /> )}
      {mostrarModalTarjeta && ( <ModalTarjeta equipo={mostrarModalTarjeta} jugadores={(mostrarModalTarjeta === "equipo1" ? equipo1.jugadores : equipo2.jugadores).filter(j => j.enJuego !== false)} minuto={obtenerMinuto()} onConfirm={confirmarTarjeta} onClose={() => setMostrarModalTarjeta(null)} /> )}
      {mostrarModalCambio && ( <ModalCambio equipo={mostrarModalCambio} jugadores={(mostrarModalCambio === "equipo1" ? equipo1.todosJugadores : equipo2.todosJugadores)} minuto={obtenerMinuto()} onConfirm={confirmarCambio} onClose={() => setMostrarModalCambio(null)} /> )}
      {mostrarMVP && ( <ModalMVP equipoGanador={determinarGanador()} equipo1={equipo1} equipo2={equipo2} onClose={guardarTodoEnFirebase} /> )}
      {notificacion && ( <ToastNotificacion mensaje={notificacion.mensaje} tipo={notificacion.tipo} /> )}
    </div>
  );
}