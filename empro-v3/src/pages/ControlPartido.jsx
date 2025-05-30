import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ModalGol from "../components/ModalGol";
import ModalTarjeta from "../components/ModalTarjeta";
import ModalCambio from "../components/ModalCambio";
import ModalMVP from "../components/ModalMVP";
import ToastNotificacion from "../components/ToastNotificacion";
import useCronometro from "../hooks/useCronometro";
import { ref, onValue, set, push, get } from "firebase/database";
import { db } from "../firebase";
import { useParams, useNavigate } from "react-router-dom";

// Helper para responsive
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

export default function ControlPartido() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  const [equipo1, setEquipo1] = useState(null);
  const [equipo2, setEquipo2] = useState(null);
  const [goles, setGoles] = useState({ equipo1: 0, equipo2: 0 });
  const [golesRegistrados, setGolesRegistrados] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [mostrarModalGol, setMostrarModalGol] = useState(null);
  const [mostrarModalTarjeta, setMostrarModalTarjeta] = useState(null);
  const [mostrarModalCambio, setMostrarModalCambio] = useState(null);
  const [mostrarMVP, setMostrarMVP] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  const cronometro = useCronometro();
  const isMobile = useIsMobile();

  // Posiciones camisetas (sólo para escritorio)
  const posiciones = [
    { top: "12%", left: "25%" },
    { top: "12%", left: "75%" },
    { top: "33%", left: "50%" },
    { top: "58%", left: "24%" },
    { top: "58%", left: "76%" },
    { top: "85%", left: "50%" },
  ];

  // Carga inicial de datos
  useEffect(() => {
    if (!partidoId) return;

    const refAlineacion = ref(db, `partidos/${partidoId}/alineacion`);
    const refGoles = ref(db, `partidos/${partidoId}/eventos/goles`);
    const refMarcador = ref(db, `partidos/${partidoId}/marcador`);
    const refCambios = ref(db, `partidos/${partidoId}/eventos/cambios`);
    const refTarjetas = ref(db, `partidos/${partidoId}/eventos/tarjetas`);

    onValue(refAlineacion, (snap) => {
      if (snap.exists()) {
        const alineacion = snap.val();
        setEquipo1(alineacion.equipo1);
        setEquipo2(alineacion.equipo2);
      }
    });

    onValue(refGoles, (snap) => {
      const lista = [];
      snap.forEach(s => lista.push(s.val()));
      setGolesRegistrados(lista);
    });

    onValue(refMarcador, (snap) => {
      if (snap.exists()) setGoles(snap.val());
    });

    onValue(refCambios, (snap) => {
      const lista = [];
      snap.forEach(s => lista.push(s.val()));
      setCambios(lista);
    });

    onValue(refTarjetas, (snap) => {
      const lista = [];
      snap.forEach(s => lista.push(s.val()));
      setTarjetas(lista);
    });

  }, [partidoId]);

  const mostrarToast = (mensaje, tipo = "info") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const obtenerMinuto = () => {
    const min = String(Math.floor(cronometro.tiempo / 60)).padStart(2, "0");
    const seg = String(cronometro.tiempo % 60).padStart(2, "0");
    return `${min}:${seg}`;
  };

  const registrarGol = (equipoKey) => {
    if (!cronometro.enMarcha) {
      mostrarToast("El cronómetro debe estar en marcha para marcar un gol", "error");
      return;
    }
    cronometro.pausar();
    setMostrarModalGol(equipoKey);
  };

  const confirmarGol = async (jugador) => {
    const equipoKey = mostrarModalGol;
    const marcadorRef = ref(db, `partidos/${partidoId}/marcador`);
    const nuevoMarcador = { ...goles, [equipoKey]: (goles[equipoKey] || 0) + 1 };
    await set(marcadorRef, nuevoMarcador);
    setGoles(nuevoMarcador);

    const golesRef = ref(db, `partidos/${partidoId}/eventos/goles`);
    await push(golesRef, {
      equipo: equipoKey,
      jugador: jugador.nombre,
      minuto: obtenerMinuto(),
    });

    setMostrarModalGol(null);
    cronometro.iniciar();
    mostrarToast("¡Gol registrado!", "success");
  };

  const registrarTarjeta = (equipoKey) => setMostrarModalTarjeta(equipoKey);

  const confirmarTarjeta = async ({ jugador, tipo, minuto }) => {
    const tarjetasRef = ref(db, `partidos/${partidoId}/eventos/tarjetas`);
    await push(tarjetasRef, {
      equipo: mostrarModalTarjeta,
      jugador,
      tipo,
      minuto
    });
    setMostrarModalTarjeta(null);
    mostrarToast(`Tarjeta ${tipo} a ${jugador} (${minuto})`, tipo === "roja" ? "roja" : "tarjeta");
  };

  const registrarCambio = (equipoKey) => setMostrarModalCambio(equipoKey);

  const confirmarCambio = async (titular, suplente, minuto) => {
    const equipoKey = mostrarModalCambio;
    let equipoObj = equipoKey === "equipo1" ? equipo1 : equipo2;

    // 1. Marcar jugador saliente como no 'enJuego' pero sí 'haJugado'
    let nuevaAlineacionJugadores = equipoObj.jugadores.map(j => {
      if (j.nombre === titular) {
        return { ...j, enJuego: false, haJugado: true };
      }
      return j;
    });

    // 2. Preparar jugador entrante
    let suplenteObj = equipoObj.todosJugadores.find(j => j.nombre === suplente);
    if (!suplenteObj) {
      // Si el suplente no está en la lista predefinida (ej. se escribió manualmente), añadirlo
      suplenteObj = { nombre: suplente, dorsal: '?', enJuego: true, haJugado: true };
    } else {
      suplenteObj = { ...suplenteObj, enJuego: true, haJugado: true };
    }

    // 3. Añadir el suplente a la alineación activa
    // Si ya existe en la alineación (ej. fue titular y salió, y ahora vuelve a entrar), actualizar su estado.
    if (!nuevaAlineacionJugadores.some(j => j.nombre === suplenteObj.nombre)) {
      nuevaAlineacionJugadores.push(suplenteObj);
    } else {
      nuevaAlineacionJugadores = nuevaAlineacionJugadores.map(j =>
        j.nombre === suplenteObj.nombre ? { ...j, enJuego: true, haJugado: true } : j
      );
    }

    // 4. Actualizar la alineación en Firebase para reflejar el cambio
    const refAlineacionJugadores = ref(db, `partidos/${partidoId}/alineacion/${equipoKey}/jugadores`);
    await set(refAlineacionJugadores, nuevaAlineacionJugadores);

    // 5. Actualizar el estado local de equipo1 o equipo2
    if (equipoKey === "equipo1") {
      setEquipo1({ ...equipo1, jugadores: nuevaAlineacionJugadores });
    } else {
      setEquipo2({ ...equipo2, jugadores: nuevaAlineacionJugadores });
    }

    // 6. Registrar el evento de cambio
    const cambiosRef = ref(db, `partidos/${partidoId}/eventos/cambios`);
    await push(cambiosRef, {
      equipo: equipoKey,
      titular,
      suplente,
      minuto
    });
    setMostrarModalCambio(null);
    mostrarToast(`Cambio: sale ${titular}, entra ${suplente} (${minuto})`, "info");
  };

  const finalizarPartido = () => {
    cronometro.pausar();
    setMostrarMVP(true);
    mostrarToast("Partido finalizado. Selecciona el MVP", "success");
  };

  // Guardado total al cerrar MVP
  const guardarTodoEnFirebase = async (mvpSeleccionado) => {
    // Obtener el género del partido desde la alineación
    const alineacionSnapshot = await get(ref(db, `partidos/${partidoId}/alineacion`));
    const generoPartido = alineacionSnapshot.val()?.genero || "masculino";

    const datosPartido = {
      marcador: goles,
      goles: golesRegistrados,
      tarjetas: tarjetas,
      cambios: cambios,
      duracion: obtenerMinuto(),
      mvp: mvpSeleccionado,
      equipo1: equipo1,
      equipo2: equipo2,
      terminado: true,
      timestamp: Date.now(),
    };
    await set(ref(db, `partidos/${partidoId}/resultado`), datosPartido);

    // 1. Actualizar Tablas de Posiciones
    const refTablas = ref(db, `tablas/${generoPartido}`);
    const snapTablas = await get(refTablas);
    const tablasActuales = snapTablas.val() || {};

    const actualizarEstadisticas = (equipoActual, golesAFavor, golesEnContra, resultado) => {
        const stats = { ...tablasActuales[equipoActual.nombre] || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0, logo: equipoActual.logo } };
        stats.pj++;
        stats.gf += golesAFavor;
        stats.gc += golesEnContra;

        if (resultado === 'victoria') {
            stats.pg++;
            stats.puntos += 3;
        } else if (resultado === 'empate') {
            stats.pe++;
            stats.puntos += 1;
        } else { // derrota
            stats.pp++;
        }
        tablasActuales[equipoActual.nombre] = stats;
    };

    if (goles.equipo1 > goles.equipo2) {
        actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'victoria');
        actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'derrota');
    } else if (goles.equipo2 > goles.equipo1) {
        actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'derrota');
        actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'victoria');
    } else {
        actualizarEstadisticas(equipo1, goles.equipo1, goles.equipo2, 'empate');
        actualizarEstadisticas(equipo2, goles.equipo2, goles.equipo1, 'empate');
    }

    await set(refTablas, tablasActuales);

    // 2. Actualizar Goleadores
    const refGoleadoresDetalles = ref(db, `goleadoresDetalles/${generoPartido}`);
    const snapGoleadoresDetalles = await get(refGoleadoresDetalles);
    const goleadoresDetallesActuales = snapGoleadoresDetalles.val() || {};

    for (const gol of golesRegistrados) {
        if (!goleadoresDetallesActuales[gol.jugador]) {
            goleadoresDetallesActuales[gol.jugador] = [];
        }

        const equipoGoleador = gol.equipo === "equipo1" ? equipo1 : equipo2;

        goleadoresDetallesActuales[gol.jugador].push({
            minuto: gol.minuto,
            partido: `${equipo1.nombre} vs ${equipo2.nombre}`,
            fecha: new Date().toLocaleDateString(),
            equipo: equipoGoleador.nombre,
            logo: equipoGoleador.logo
        });
    }
    await set(refGoleadoresDetalles, goleadoresDetallesActuales);

    // 3. Actualizar Historial
    const refHistorial = ref(db, `historial/${generoPartido}`);
    await push(refHistorial, {
        fecha: new Date().toLocaleDateString(),
        genero: generoPartido,
        equipo1: equipo1.nombre,
        equipo2: equipo2.nombre,
        goles1: goles.equipo1,
        goles2: goles.equipo2,
        minutos: obtenerMinuto(),
        mvp: mvpSeleccionado ? mvpSeleccionado.jugador : "N/A",
        detalles: [
            ...golesRegistrados.map(g => ({ tipo: 'gol', jugador: g.jugador, minuto: g.minuto })),
            ...tarjetas.map(t => ({ tipo: `${t.tipo} tarjeta`, jugador: t.jugador, minuto: t.minuto })),
            ...cambios.map(c => ({ tipo: 'cambio', jugador: `${c.titular} por ${c.suplente}`, minuto: c.minuto }))
        ]
    });

    setMostrarMVP(false);
    mostrarToast("Partido guardado correctamente", "success");
    setTimeout(() => navigate("/main"), 2000);
  };

  const determinarGanador = () => {
    if (goles.equipo1 > goles.equipo2) return equipo1;
    if (goles.equipo2 > goles.equipo1) return equipo2;
    return { nombre: "Empate", logo: "logo-empro.png" };
  };

  const getCamiseta = (nombre) => {
    const id = nombre.toLowerCase().replace(/\s+/g, "-");
    return `${import.meta.env.BASE_URL}camisas/camisa-${id}.png`;
  };

  const getColorDorsal = (nombre) => {
    const negros = ["don bosco", "luz", "emprosaurios"];
    return negros.includes(nombre?.toLowerCase()) ? "#000" : "#fff";
  };
  const renderJugador = (jug, i, equipoObj) => (
    <div
      key={jug.nombre} // Usar jug.nombre como key para identificar unívocamente
      className="absolute"
      style={{
        top: posiciones[i].top,
        left: posiciones[i].left,
        transform: "translate(-50%, -50%)",
        opacity: jug.enJuego === false ? 0.4 : 1, // Opacidad si el jugador ya no está en juego
        transition: 'opacity 0.3s ease-in-out' // Transición suave para la opacidad
      }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="absolute top-[8%] font-barcelona text-[20px] md:text-[28px] z-20"
          style={{
            color: getColorDorsal(equipoObj?.nombre || ''),
            textShadow: "1px 1px 1px rgba(0,0,0,0.7)"
          }}
        >
          {jug.dorsal}
        </div>
        <img src={getCamiseta(equipoObj?.nombre)} className="w-10 md:w-14" alt="jugador" />
        <div className="absolute bottom-[-14px] font-barcelona text-[10px] md:text-[13px] text-white bg-black/80 px-2 py-[2px] rounded text-center z-20 whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
          {jug.nombre}
        </div>
        {/* Indicador visual si el jugador ha sido sustituido y no está en juego */}
        {jug.haJugado && jug.enJuego === false && (
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '30px',
            color: 'red',
            textShadow: '0 0 5px black',
            pointerEvents: 'none' // Asegurarse de que no interfiera con clics
          }}>
            ⬇️
          </span>
        )}
      </div>
    </div>
  );

  if (!equipo1 || !equipo2) {
    return (
      <div className="text-white text-center mt-20 px-4">
        <h2 className="text-3xl font-bold">No hay equipos cargados</h2>
        <p className="mt-4 text-lg">Confirmá la alineación para continuar.</p>
      </div>
    );
  }

  const minutoActual = obtenerMinuto();

  const suplentes1 = (equipo1?.todosJugadores || []).filter(
    j => !(equipo1.jugadores || []).some(t => t.nombre === j.nombre)
  );
  const suplentes2 = (equipo2?.todosJugadores || []).filter(
    j => !(equipo2.jugadores || []).some(t => t.nombre === j.nombre)
  );

  const golesEq1 = golesRegistrados.filter(g => g.equipo === "equipo1");
  const golesEq2 = golesRegistrados.filter(g => g.equipo === "equipo2");

  const renderEscritorio = () => (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-center w-full mt-4 gap-2 md:gap-24">
        <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo1.logo}`} className="w-20 h-20 md:w-40 md:h-40 object-contain" />
        <div className="flex flex-col items-center justify-center flex-shrink">
          <span className="font-extrabold text-yellow-400 text-7xl md:text-[7.5rem] leading-none drop-shadow-xl select-none">
            {goles.equipo1} <span className="text-white">-</span> {goles.equipo2}
          </span>
          <span className="text-white text-3xl md:text-5xl font-bold mt-1">{minutoActual}</span>
          <div className="flex justify-center gap-3 mt-2">
            <button onClick={cronometro.iniciar} className="bg-blue-600 text-white text-2xl md:text-3xl px-5 py-2 rounded-full">▶</button>
            <button onClick={cronometro.pausar} className="bg-blue-600 text-white text-2xl md:text-3xl px-5 py-2 rounded-full">⏸</button>
            <button onClick={cronometro.reiniciar} className="bg-blue-600 text-white text-2xl md:text-3xl px-5 py-2 rounded-full">🔁</button>
          </div>
        </div>
        <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo2.logo}`} className="w-20 h-20 md:w-40 md:h-40 object-contain" />
      </div>

      {/* Mostrar eventos: Ajustado para mostrar más elementos y con overflow */}
      <div className="w-full flex flex-row items-start justify-center mt-2 gap-6">
        <div className="flex-1 max-h-[150px] overflow-y-auto"> {/* Ajustado para scroll */}
          {golesEq1.map((gol, i) => (
            <div key={i} className="text-lg md:text-2xl flex items-center gap-2 justify-end">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{gol.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
          {tarjetas.filter(t => t.equipo === "equipo1").map((t, i) => (
            <div key={`tarjeta1-${i}`} className="text-lg md:text-2xl flex items-center gap-2 justify-end">
              <span>{t.tipo === 'amarilla' ? '🟨' : '🟥'}</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{t.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{t.minuto}'</span>
            </div>
          ))}
          {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
            <div key={`cambio1-${i}`} className="text-lg md:text-2xl flex items-center gap-2 justify-end">
              <span>🔄</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{c.titular} por {c.suplente}</span>
              <span className="ml-2 text-sm text-gray-200">{c.minuto}'</span>
            </div>
          ))}
        </div>
        <div className="flex-1 max-h-[150px] overflow-y-auto"> {/* Ajustado para scroll */}
          {golesEq2.map((gol, i) => (
            <div key={i} className="text-lg md:text-2xl flex items-center gap-2 justify-start">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{gol.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
          {tarjetas.filter(t => t.equipo === "equipo2").map((t, i) => (
            <div key={`tarjeta2-${i}`} className="text-lg md:text-2xl flex items-center gap-2 justify-start">
              <span>{t.tipo === 'amarilla' ? '🟨' : '🟥'}</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{t.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{t.minuto}'</span>
            </div>
          ))}
          {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
            <div key={`cambio2-${i}`} className="text-lg md:text-2xl flex items-center gap-2 justify-start">
              <span>🔄</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{c.titular} por {c.suplente}</span>
              <span className="ml-2 text-sm text-gray-200">{c.minuto}'</span>
            </div>
          ))}
        </div>
      </div>
      {/* Fin de eventos */}

      <div className="flex flex-row justify-between items-start gap-8 mt-6 w-full">
        <div className="w-full md:w-1/2 flex flex-row items-start justify-center">
          <div className="relative w-[60vw] max-w-[340px] h-[220px] md:w-[300px] md:h-[400px]">
            <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha local" className="w-full h-full" />
            {(equipo1.jugadores || []).map((jug, i) => renderJugador(jug, i, equipo1))}
          </div>

          <div className="flex flex-col items-center gap-3 ml-3 mt-0 md:mt-8 w-36">
            <button onClick={() => registrarGol("equipo1")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol</button>
            <button onClick={() => registrarTarjeta("equipo1")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta</button>
            <button onClick={() => registrarCambio("equipo1")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio</button>
            <div className="mt-2 w-full">
              <h3 className="text-center font-bold text-base text-yellow-400">Suplentes</h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {suplentes1.map((s, i) => (
                  <div key={s.nombre} className="bg-white/80 text-[#7a0026] rounded-xl px-2 py-0.5 font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                    {s.nombre} (#{s.dorsal})
                  </div>
                ))}
              </div>
            </div>
            {/* Cambios registrados debajo de suplentes para escritorio */}
            <div className="w-full max-h-[100px] overflow-y-auto">
              {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
                <div key={`cambio-desktop-1-${i}`} className="flex items-center gap-1 justify-center text-base mt-1">
                  <span className="text-red-500">⬅️</span>
                  <span className="font-bold whitespace-nowrap">{c.titular}</span>
                  <span className="text-green-500">➡️</span>
                  <span className="font-bold whitespace-nowrap">{c.suplente}</span>
                  <span className="text-gray-300 text-xs">{c.minuto}'</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-row-reverse items-start justify-center">
          <div className="relative w-[60vw] max-w-[340px] h-[220px] md:w-[300px] md:h-[400px]">
            <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha visita" className="w-full h-full" />
            {(equipo2.jugadores || []).map((jug, i) => renderJugador(jug, i, equipo2))}
          </div>

          <div className="flex flex-col items-center gap-3 mr-3 mt-0 md:mt-8 w-36">
            <button onClick={() => registrarGol("equipo2")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol</button>
            <button onClick={() => registrarTarjeta("equipo2")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta</button>
            <button onClick={() => registrarCambio("equipo2")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio</button>
            <div className="mt-2 w-full">
              <h3 className="text-center font-bold text-base text-yellow-400">Suplentes</h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {suplentes2.map((s, i) => (
                  <div key={s.nombre} className="bg-white/80 text-[#7a0026] rounded-xl px-2 py-0.5 font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                    {s.nombre} (#{s.dorsal})
                  </div>
                ))}
              </div>
            </div>
            {/* Cambios registrados debajo de suplentes para escritorio */}
            <div className="w-full max-h-[100px] overflow-y-auto">
              {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
                <div key={`cambio-desktop-2-${i}`} className="flex items-center gap-1 justify-center text-sm mt-1">
                  <span className="text-red-500">⬅️</span>
                  <span className="font-bold whitespace-nowrap">{c.titular}</span>
                  <span className="text-green-500">➡️</span>
                  <span className="font-bold whitespace-nowrap">{c.suplente}</span>
                  <span className="text-gray-300 text-xs">{c.minuto}'</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-12">
        <button
          onClick={finalizarPartido}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-3xl px-14 py-5 rounded-full shadow-xl"
        >
          Finalizar Partido
        </button>
      </div>
    </div>
  );

  const renderMovil = () => (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center justify-center w-full mt-4 gap-3">
        <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo1.logo}`} className="w-16 h-16 object-contain" />
        <div className="flex flex-col items-center justify-center">
          <span className="font-extrabold text-yellow-400 text-5xl leading-none drop-shadow-xl select-none">
            {goles.equipo1} <span className="text-white">-</span> {goles.equipo2}
          </span>
          <span className="text-white text-2xl font-bold mt-1">{minutoActual}</span>
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={cronometro.iniciar} className="bg-blue-600 text-white text-xl px-3 py-1 rounded-full">▶</button>
            <button onClick={cronometro.pausar} className="bg-blue-600 text-white text-xl px-3 py-1 rounded-full">⏸</button>
            <button onClick={cronometro.reiniciar} className="bg-blue-600 text-white text-xl px-3 py-1 rounded-full">🔁</button>
          </div>
        </div>
        <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo2.logo}`} className="w-16 h-16 object-contain" />
      </div>

      {/* Mostrar eventos: Ajustado para móviles con scroll */}
      <div className="flex flex-row w-full max-w-lg mt-3 gap-2">
        <div className="flex-1 max-h-[150px] overflow-y-auto"> {/* Ajustado para scroll */}
          {golesEq1.map((gol, i) => (
            <div key={i} className="text-base flex items-center gap-2 justify-end">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{gol.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
          {tarjetas.filter(t => t.equipo === "equipo1").map((t, i) => (
            <div key={`tarjeta1-m-${i}`} className="text-base flex items-center gap-2 justify-end">
              <span>{t.tipo === 'amarilla' ? '🟨' : '🟥'}</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{t.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{t.minuto}'</span>
            </div>
          ))}
          {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
            <div key={`cambio1-m-${i}`} className="flex items-center gap-1 justify-end text-sm mt-1">
              <span className="text-red-500">⬅️</span>
              <span className="font-bold whitespace-nowrap">{c.titular}</span>
              <span className="text-green-500">➡️</span>
              <span className="font-bold whitespace-nowrap">{c.suplente}</span>
              <span className="text-gray-300 text-xs">{c.minuto}'</span>
            </div>
          ))}
        </div>
        <div className="flex-1 max-h-[150px] overflow-y-auto"> {/* Ajustado para scroll */}
          {golesEq2.map((gol, i) => (
            <div key={i} className="text-base flex items-center gap-2 justify-start">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{gol.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
          {tarjetas.filter(t => t.equipo === "equipo2").map((t, i) => (
            <div key={`tarjeta2-m-${i}`} className="text-base flex items-center gap-2 justify-start">
              <span>{t.tipo === 'amarilla' ? '🟨' : '🟥'}</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{t.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{t.minuto}'</span>
            </div>
          ))}
          {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
            <div key={`cambio2-m-${i}`} className="flex items-center gap-1 justify-start text-sm mt-1">
              <span className="text-red-500">⬅️</span>
              <span className="font-bold whitespace-nowrap">{c.titular}</span>
              <span className="text-green-500">➡️</span>
              <span className="font-bold whitespace-nowrap">{c.suplente}</span>
              <span className="text-gray-300 text-xs">{c.minuto}'</span>
            </div>
          ))}
        </div>
      </div>
      {/* Fin de eventos */}
      <div className="w-full flex flex-col items-center gap-3 mt-6 max-w-[250px]">
        <button onClick={() => registrarGol("equipo1")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol Equipo 1</button>
        <button onClick={() => registrarTarjeta("equipo1")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta Equipo 1</button>
        <button onClick={() => registrarCambio("equipo1")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio Equipo 1</button>
        <div className="mt-1 w-full">
          <h3 className="text-center font-bold text-base text-yellow-400">Suplentes</h3>
          <div className="flex flex-wrap gap-1 justify-center">
            {suplentes1.map((s, i) => (
              <div key={s.nombre} className="bg-white/80 text-[#7a0026] rounded-xl px-2 py-0.5 font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                {s.nombre} (#{s.dorsal})
              </div>
            ))}
          </div>
        </div>
        <div className="w-full max-h-[100px] overflow-y-auto">
          {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
            <div key={`cambio-movil-1-${i}`} className="flex items-center gap-1 justify-center text-sm mt-1">
              <span className="text-red-500">⬅️</span>
              <span className="font-bold whitespace-nowrap">{c.titular}</span>
              <span className="text-green-500">➡️</span>
              <span className="font-bold whitespace-nowrap">{c.suplente}</span>
              <span className="text-gray-300 text-xs">{c.minuto}'</span>
            </div>
          ))}
        </div>
        <button onClick={() => registrarGol("equipo2")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol Equipo 2</button>
        <button onClick={() => registrarTarjeta("equipo2")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta Equipo 2</button>
        <button onClick={() => registrarCambio("equipo2")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio Equipo 2</button>
        <div className="mt-1 w-full">
          <h3 className="text-center font-bold text-base text-yellow-400">Suplentes</h3>
          <div className="flex flex-wrap gap-1 justify-center">
                {suplentes2.map((s, i) => (
                  <div key={s.nombre} className="bg-white/80 text-[#7a0026] rounded-xl px-2 py-0.5 font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                    {s.nombre} (#{s.dorsal})
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full max-h-[100px] overflow-y-auto">
              {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
                <div key={`cambio-movil-2-${i}`} className="flex items-center gap-1 justify-center text-sm mt-1">
                  <span className="text-red-500">⬅️</span>
                  <span className="font-bold whitespace-nowrap">{c.titular}</span>
                  <span className="text-green-500">➡️</span>
                  <span className="font-bold whitespace-nowrap">{c.suplente}</span>
                  <span className="text-gray-300 text-xs">{c.minuto}'</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={finalizarPartido}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-2xl px-10 py-4 rounded-full shadow-xl"
            >
              Finalizar Partido
            </button>
          </div>
        </div>
  );

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white font-qatar px-2 md:px-8 py-4"
      style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}
    >
      <Navbar />
      {isMobile ? renderMovil() : renderEscritorio()}

      {mostrarModalGol && equipo1 && equipo2 && (
        <ModalGol
          equipo={mostrarModalGol}
          jugadores={mostrarModalGol === "equipo1" ? equipo1.jugadores : equipo2.jugadores}
          minuto={minutoActual}
          onSeleccion={confirmarGol}
          onClose={() => {
            setMostrarModalGol(null);
            cronometro.iniciar();
          }}
        />
      )}
      {mostrarModalTarjeta && (
        <ModalTarjeta
          equipo={mostrarModalTarjeta}
          jugadores={mostrarModalTarjeta === "equipo1" ? equipo1.jugadores : equipo2.jugadores}
          minuto={minutoActual}
          onConfirm={confirmarTarjeta}
          onClose={() => setMostrarModalTarjeta(null)}
        />
      )}
      {mostrarModalCambio && (
        <ModalCambio
          equipo={mostrarModalCambio}
          // Pasar todos los jugadores disponibles para el equipo actual al modal de cambio
          // Esto incluye a los titulares y suplentes para que pueda elegir quién sale y quién entra.
          jugadores={mostrarModalCambio === "equipo1" ? equipo1.todosJugadores : equipo2.todosJugadores}
          minuto={minutoActual}
          onConfirm={confirmarCambio}
          onClose={() => setMostrarModalCambio(null)}
        />
      )}
      {mostrarMVP && (
        <ModalMVP
          equipoGanador={determinarGanador()}
          equipo1={equipo1}
          equipo2={equipo2}
          onClose={guardarTodoEnFirebase}
        />
      )}
      {notificacion && (
        <ToastNotificacion mensaje={notificacion.mensaje} tipo={notificacion.tipo} />
      )}
    </div>
  );
}