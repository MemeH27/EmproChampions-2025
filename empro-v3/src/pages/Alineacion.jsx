import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ModalJugador from "../components/ModalJugador";
import { useNavigate, useLocation } from "react-router-dom";
import "../fonts/barcelona.css";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push, set, get } from "firebase/database";
import { db } from "../firebase";
import jugadoresData from "../data/jugadores.json";
import Footer from '../components/Footer';

export default function Alineacion() {
  const navigate = useNavigate();
  const location = useLocation();

  const [partidoConfig, setPartidoConfig] = useState(null);
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisita, setEquipoVisita] = useState(null);
  const [genero, setGenero] = useState(null);

  const [jugadoresLocal, setJugadoresLocal] = useState(Array(6).fill({ nombre: "", dorsal: "" }));
  const [jugadoresVisita, setJugadoresVisita] = useState(Array(6).fill({ nombre: "", dorsal: "" }));
  const [modalData, setModalData] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (location.state?.equipoLocal && location.state?.equipoVisita) {
      setPartidoConfig(location.state);
      setEquipoLocal(location.state.equipoLocal);
      setEquipoVisita(location.state.equipoVisita);
      setGenero(location.state.genero);
    } else {
      console.warn("[Alineacion.jsx] No se recibieron datos de configuración del partido. Redirigiendo.");
      navigate("/partido/configurar");
    }
  }, [location.state, navigate]);

  const abrirModal = (index, tipo) => {
    const jugador = tipo === "local" ? jugadoresLocal[index] : jugadoresVisita[index];
    const jugadoresActuales = tipo === "local" ? jugadoresLocal : jugadoresVisita;
    const nombreEquipo = tipo === "local" ? equipoLocal?.nombre : equipoVisita?.nombre;
    setModalData({ tipo, index, jugador, jugadoresActuales, nombreEquipo, generoPartido: genero });
  };

  const guardarJugador = (index, tipo, datos) => {
    const setter = tipo === "local" ? setJugadoresLocal : setJugadoresVisita;
    const jugadores = tipo === "local" ? jugadoresLocal : jugadoresVisita;
    const nuevos = [...jugadores];
    nuevos[index] = datos;
    setter(nuevos);
    setModalData(null);
  };

  const confirmar = async () => {
    let partidoId = null;
    try {
      const validar = (jugadores) => jugadores.every((j) => j.nombre.trim() !== "" && j.dorsal.trim() !== "");
      if (!validar(jugadoresLocal) || !validar(jugadoresVisita)) {
        alert("Todos los jugadores deben tener nombre y dorsal antes de continuar.");
        return;
      }

      const partidosRef = ref(db, "partidos");
      const nuevoPartidoRef = push(partidosRef);
      partidoId = nuevoPartidoRef.key;

      const [snapLocalPlantilla, snapVisitaPlantilla] = await Promise.all([
        get(ref(db, `plantillas/${genero.toLowerCase()}/${equipoLocal.nombre.toLowerCase()}`)),
        get(ref(db, `plantillas/${genero.toLowerCase()}/${equipoVisita.nombre.toLowerCase()}`))
      ]);

      const todosJugadoresLocal = snapLocalPlantilla.exists() ? snapLocalPlantilla.val() : (jugadoresData[equipoLocal.nombre.toLowerCase()] || []);
      const todosJugadoresVisita = snapVisitaPlantilla.exists() ? snapVisitaPlantilla.val() : (jugadoresData[equipoVisita.nombre.toLowerCase()] || []);
      
      const equipo1Data = {
        nombre: equipoLocal.nombre,
        logo: equipoLocal.escudo.split("/").pop(),
        jugadores: jugadoresLocal.map((j) => ({ ...j, enJuego: true, haJugado: true })),
        todosJugadores: todosJugadoresLocal,
      };

      const equipo2Data = {
        nombre: equipoVisita.nombre,
        logo: equipoVisita.escudo.split("/").pop(),
        jugadores: jugadoresVisita.map((j) => ({ ...j, enJuego: true, haJugado: true })),
        todosJugadores: todosJugadoresVisita,
      };

      await set(ref(db, `partidos/${partidoId}/alineacion`), { equipo1: equipo1Data, equipo2: equipo2Data, genero: genero });
      await set(ref(db, `partidos/${partidoId}/marcador`), { equipo1: 0, equipo2: 0 });

      navigate(`/control-partido/${partidoId}`);
    } catch (error) {
      alert("❌ ERROR al confirmar alineación: " + error.message);
      console.error("Error al confirmar alineación:", error);
    }
  };

  const getCamiseta = (nombre) => `${import.meta.env.BASE_URL}camisas/camisa-${nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
  const getColorDorsal = (nombre) => ["don bosco", "luz", "emprosaurios"].includes(nombre.toLowerCase()) ? "#000" : "#fff";

  const posiciones = [{ top: "15%", left: "18%" }, { top: "15%", left: "62%" }, { top: "38%", left: "40%" }, { top: "55%", left: "17%" }, { top: "55%", left: "63%" }, { top: "74%", left: "40%" }];

  const renderJugador = (jug, i, tipo, camisetaSrc) => (
    <motion.div key={i} className="absolute cursor-pointer" style={{ top: posiciones[i].top, left: posiciones[i].left, transform: 'translate(-50%, -50%)' }}
      animate={{ scale: modalData?.index === i && modalData?.tipo === tipo ? 1.5 : 1 }} transition={{ duration: 0.3 }} onClick={() => abrirModal(i, tipo)}
    >
      <div className="relative w-fit flex flex-col items-center">
        <div className="absolute top-[12%] font-barcelona text-[24px] md:text-[30px] z-20 pointer-events-none"
          style={{ color: getColorDorsal((tipo === 'local' ? equipoLocal?.nombre : equipoVisita?.nombre) || ''), textShadow: '1px 1px 1px rgba(0,0,0,0.6)' }}
        >
          {jug.dorsal}
        </div>
        <img src={camisetaSrc} className="w-16 md:w-20 relative z-10" alt={`jugador-${tipo}`} />
        {jug.nombre && (
          <div className="absolute bottom-[-18px] font-barcelona text-[11px] text-white bg-black/80 px-2 py-[2px] rounded text-center z-20">
            {jug.nombre}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!equipoLocal || !equipoVisita) return null;

  return (
    <div className="min-h-screen bg-cover bg-center font-qatar text-white" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <Navbar />
      <h1 className="text-3xl sm:text-5xl font-bold text-center mt-6 text-yellow-400 drop-shadow">
        Alineación Inicial
      </h1>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 p-2 lg:p-6">
        <div className="relative w-[300px] h-[510px] sm:w-[320px] sm:h-[540px] md:w-[400px] md:h-[640px]">
          <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha local" className="w-full h-full" />
          {jugadoresLocal.map((jug, i) => renderJugador(jug, i, "local", getCamiseta(equipoLocal.nombre)))}
        </div>

        <div className="flex flex-col items-center gap-4 my-4 lg:my-0">
          <img src="/img/logo-empro.png" alt="logo empro" className="w-20 md:w-32" />
          <div className="flex items-center gap-4 md:gap-10">
            {/* ===================================================================================== */}
            {/* ===== CORRECCIÓN FINAL: Tamaños responsivos para los logos ===== */}
            {/* ===================================================================================== */}
            <img src={equipoLocal.escudo} className="w-20 h-20 md:w-24 md:h-24 object-contain" alt="local logo" />
            <span className="text-white text-3xl md:text-4xl font-black">VS</span>
            <img src={equipoVisita.escudo} className="w-20 h-20 md:w-24 md:h-24 object-contain" alt="visita logo" />
          </div>
          <button onClick={() => navigate("/partido/configurar")} className="bg-white/80 text-[#7a0026] font-bold px-6 py-2 rounded-full hover:bg-white transition">
            ⬅ Volver
          </button>
        </div>

        <div className="relative w-[300px] h-[510px] sm:w-[320px] sm:h-[540px] md:w-[400px] md:h-[640px]">
          <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha visita" className="w-full h-full" />
          {jugadoresVisita.map((jug, i) => renderJugador(jug, i, "visita", getCamiseta(equipoVisita.nombre)))}
        </div>
      </div>

      <div className="flex justify-center mt-6 pb-10">
        <button onClick={confirmar} className="bg-[#FFD700] text-[#7a0026] font-bold px-10 py-3 rounded-full hover:bg-yellow-300 transition text-xl shadow-lg">
          Confirmar Alineación
        </button>
      </div>

      <AnimatePresence>
        {modalData && (
          <ModalJugador {...modalData} onSave={guardarJugador} onClose={() => setModalData(null)}
            camiseta={getCamiseta((modalData.tipo === "local" ? equipoLocal.nombre : equipoVisita.nombre))}
            dorsalColor={getColorDorsal((modalData.tipo === "local" ? equipoLocal.nombre : equipoVisita.nombre))}
          />
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}