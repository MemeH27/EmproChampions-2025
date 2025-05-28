import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ModalGol from "../components/ModalGol";
import ModalTarjeta from "../components/ModalTarjeta";
import ModalCambio from "../components/ModalCambio";
import ModalMVP from "../components/ModalMVP";
import ToastNotificacion from "../components/ToastNotificacion";
import useCronometro from "../hooks/useCronometro";
import { ref, onValue, set, push, get } from "firebase/database";
import { database } from "../firebase";
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
  const [mvp, setMVP] = useState(null);

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

    const refAlineacion = ref(database, `partidos/${partidoId}/alineacion`);
    const refGoles = ref(database, `partidos/${partidoId}/eventos/goles`);
    const refMarcador = ref(database, `partidos/${partidoId}/marcador`);
    const refCambios = ref(database, `partidos/${partidoId}/eventos/cambios`);
    const refTarjetas = ref(database, `partidos/${partidoId}/eventos/tarjetas`);

    onValue(refAlineacion, (snap) => {
      if (snap.exists()) {
        setEquipo1(snap.val().equipo1);
        setEquipo2(snap.val().equipo2);
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
    const sec = String(cronometro.tiempo % 60).padStart(2, "0");
    return `${min}:${sec}`;
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
    const marcadorRef = ref(database, `partidos/${partidoId}/marcador`);
    const nuevoMarcador = { ...goles, [equipoKey]: (goles[equipoKey] || 0) + 1 };
    await set(marcadorRef, nuevoMarcador);
    setGoles(nuevoMarcador);

    // Ahora empujamos correctamente el gol
    const golesRef = ref(database, `partidos/${partidoId}/eventos/goles`);
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
    const tarjetasRef = ref(database, `partidos/${partidoId}/eventos/tarjetas`);
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
    const cambiosRef = ref(database, `partidos/${partidoId}/eventos/cambios`);
    await push(cambiosRef, {
      equipo: mostrarModalCambio,
      titular,
      suplente,
      minuto
    });
    setMostrarModalCambio(null);
    mostrarToast(`Cambio: sale ${titular}, entra ${suplente} (${minuto})`, "info");
  };

  const finalizarPartido = async () => {
    cronometro.pausar();
    setMostrarMVP(true);
    mostrarToast("Partido finalizado. Selecciona el MVP", "success");
  };

  // Guardado total al cerrar MVP
  const guardarTodoEnFirebase = async (mvpSeleccionado) => {
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
    await set(ref(database, `partidos/${partidoId}/resultado`), datosPartido);
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
    return `/camisas/camisa-${id}.png`;
  };
  const getColorDorsal = (nombre) => {
    const negros = ["don bosco", "luz", "emprosaurios"];
    return negros.includes(nombre?.toLowerCase()) ? "#000" : "#fff";
  };
  const renderJugador = (jug, i, equipoObj) => (
    <div
      key={i}
      className="absolute"
      style={{
        top: posiciones[i].top,
        left: posiciones[i].left,
        transform: "translate(-50%, -50%)"
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
        {/* Nombre nunca se corta: ellipsis */}
        <div className="absolute bottom-[-14px] font-barcelona text-[10px] md:text-[13px] text-white bg-black/80 px-2 py-[2px] rounded text-center z-20 whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
          {jug.nombre}
        </div>
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

  // Suplentes correctos
  const suplentes1 = (equipo1?.todosJugadores || []).filter(
    j => !(equipo1.jugadores || []).some(t => t.nombre === j.nombre)
  );
  const suplentes2 = (equipo2?.todosJugadores || []).filter(
    j => !(equipo2.jugadores || []).some(t => t.nombre === j.nombre)
  );

  // Goles por equipo (para mostrar en columna)
  const golesEq1 = golesRegistrados.filter(g => g.equipo === "equipo1");
  const golesEq2 = golesRegistrados.filter(g => g.equipo === "equipo2");

  // --- VISTA ESCRITORIO ---
  const renderEscritorio = () => (
    <div className="flex flex-col">
      {/* Logos y marcador */}
      <div className="flex flex-row items-center justify-center w-full mt-4 gap-2 md:gap-24">
        <img src={`/img/escudos/${equipo1.logo}`} className="w-20 h-20 md:w-40 md:h-40 object-contain" />
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
        <img src={`/img/escudos/${equipo2.logo}`} className="w-20 h-20 md:w-40 md:h-40 object-contain" />
      </div>
      {/* Goles abajo del marcador, dos columnas */}
      <div className="w-full flex flex-row items-start justify-center mt-2 gap-6">
        <div className="flex-1">
          {golesEq1.map((gol, i) => (
            <div key={i} className="text-lg md:text-2xl flex items-center gap-2 justify-end">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{gol.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
        </div>
        <div className="flex-1">
          {golesEq2.map((gol, i) => (
            <div key={i} className="text-lg md:text-2xl flex items-center gap-2 justify-start">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{gol.jugador}</span>
              <span className="ml-2 text-sm text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
        </div>
      </div>
      {/* Layout canchas + controles */}
      <div className="flex flex-row justify-between items-start gap-8 mt-6 w-full">
        {/* Equipo 1 */}
        <div className="w-full md:w-1/2 flex flex-row items-start justify-center">
          <div className="relative w-[60vw] max-w-[340px] h-[220px] md:w-[300px] md:h-[400px]">
            <img src="/img/cancha-vertical.svg" alt="cancha local" className="w-full h-full" />
            {(equipo1.jugadores || []).map((jug, i) => renderJugador(jug, i, equipo1))}
          </div>
          {/* Controles a la DERECHA */}
          <div className="flex flex-col items-center gap-3 ml-3 mt-0 md:mt-8 w-36">
            <button onClick={() => registrarGol("equipo1")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol</button>
            <button onClick={() => registrarTarjeta("equipo1")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta</button>
            <button onClick={() => registrarCambio("equipo1")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio</button>
            {/* Suplentes */}
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
            {/* Cambios */}
            <div className="w-full">
              {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
                <div key={i} className="flex items-center gap-1 justify-center text-base mt-1">
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
        {/* Equipo 2 */}
        <div className="w-full md:w-1/2 flex flex-row-reverse items-start justify-center">
          <div className="relative w-[60vw] max-w-[340px] h-[220px] md:w-[300px] md:h-[400px]">
            <img src="/img/cancha-vertical.svg" alt="cancha visita" className="w-full h-full" />
            {(equipo2.jugadores || []).map((jug, i) => renderJugador(jug, i, equipo2))}
          </div>
          {/* Controles a la IZQUIERDA */}
          <div className="flex flex-col items-center gap-3 mr-3 mt-0 md:mt-8 w-36">
            <button onClick={() => registrarGol("equipo2")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol</button>
            <button onClick={() => registrarTarjeta("equipo2")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta</button>
            <button onClick={() => registrarCambio("equipo2")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio</button>
            {/* Suplentes */}
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
            {/* Cambios */}
            <div className="w-full">
              {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
                <div key={i} className="flex items-center gap-1 justify-center text-base mt-1">
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
      {/* Finalizar partido */}
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

  // --- VISTA MÓVIL ---
  const renderMovil = () => (
    <div className="flex flex-col items-center">
      {/* Logos y marcador */}
      <div className="flex flex-row items-center justify-center w-full mt-4 gap-3">
        <img src={`/img/escudos/${equipo1.logo}`} className="w-16 h-16 object-contain" />
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
        <img src={`/img/escudos/${equipo2.logo}`} className="w-16 h-16 object-contain" />
      </div>
      {/* Goles: dos columnas */}
      <div className="flex flex-row w-full max-w-lg mt-3 gap-2">
        <div className="flex-1">
          {golesEq1.map((gol, i) => (
            <div key={i} className="text-base flex items-center gap-2 justify-end">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{gol.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
        </div>
        <div className="flex-1">
          {golesEq2.map((gol, i) => (
            <div key={i} className="text-base flex items-center gap-2 justify-start">
              <span>⚽</span>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px]">{gol.jugador}</span>
              <span className="ml-1 text-xs text-gray-200">{gol.minuto}'</span>
            </div>
          ))}
        </div>
      </div>
      {/* Controles verticales, sin canchas */}
      <div className="w-full flex flex-col items-center gap-3 mt-6 max-w-[250px]">
        <button onClick={() => registrarGol("equipo1")} className="bg-green-500 w-full py-3 rounded-full font-bold text-lg">Gol Equipo 1</button>
        <button onClick={() => registrarTarjeta("equipo1")} className="bg-yellow-400 w-full py-3 rounded-full font-bold text-lg text-black">Tarjeta Equipo 1</button>
        <button onClick={() => registrarCambio("equipo1")} className="bg-blue-500 w-full py-3 rounded-full font-bold text-lg">Cambio Equipo 1</button>
        {/* Suplentes equipo 1 */}
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
        {/* Cambios equipo 1 */}
        <div className="w-full">
          {cambios.filter(c => c.equipo === "equipo1").map((c, i) => (
            <div key={i} className="flex items-center gap-1 justify-center text-sm mt-1">
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
        {/* Suplentes equipo 2 */}
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
        {/* Cambios equipo 2 */}
        <div className="w-full">
          {cambios.filter(c => c.equipo === "equipo2").map((c, i) => (
            <div key={i} className="flex items-center gap-1 justify-center text-sm mt-1">
              <span className="text-red-500">⬅️</span>
              <span className="font-bold whitespace-nowrap">{c.titular}</span>
              <span className="text-green-500">➡️</span>
              <span className="font-bold whitespace-nowrap">{c.suplente}</span>
              <span className="text-gray-300 text-xs">{c.minuto}'</span>
            </div>
          ))}
        </div>
      </div>
      {/* Finalizar partido */}
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

  // ---- RETURN PRINCIPAL ----
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white font-qatar px-2 md:px-8 py-4"
      style={{ backgroundImage: "url('/img/fondoempro-horizontal.png')" }}
    >
      <Navbar />
      {isMobile ? renderMovil() : renderEscritorio()}

      {/* Modales */}
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
          jugadores={mostrarModalCambio === "equipo1" ? equipo1.jugadores : equipo2.jugadores}
          minuto={minutoActual}
          onConfirm={confirmarCambio}
          onClose={() => setMostrarModalCambio(null)}
        />
      )}
      {mostrarMVP && (
        <ModalMVP
          equipoGanador={determinarGanador()}
          jugadoresParticipantes={[...(equipo1?.jugadores || []), ...(equipo2?.jugadores || [])]}
          onClose={guardarTodoEnFirebase}
        />
      )}
      {notificacion && (
        <ToastNotificacion mensaje={notificacion.mensaje} tipo={notificacion.tipo} />
      )}
    </div>
  );
}
