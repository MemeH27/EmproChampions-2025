import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ModalJugador from "../components/ModalJugador";
import { useNavigate } from "react-router-dom";
import "../fonts/barcelona.css";
import { motion, AnimatePresence } from "framer-motion";
import { ref, push, set, get } from "firebase/database";
import { database } from "../firebase";

// Importar los datos de jugadores separados por género o una estructura que permita filtrarlos
// Por simplicidad, aquí se hardcodea si no tienes un sistema de base de datos para esto aún.
import jugadoresData from "../data/jugadores.json";

export default function Alineacion() {
  const navigate = useNavigate();
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisita, setEquipoVisita] = useState(null);
  const [genero, setGenero] = useState("masculino"); // 'masculino' o 'femenino'
  const [jugadoresLocal, setJugadoresLocal] = useState(Array(6).fill({ nombre: "", dorsal: "" }));
  const [jugadoresVisita, setJugadoresVisita] = useState(Array(6).fill({ nombre: "", dorsal: "" }));
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    async function cargarEquiposYGenero() {
      const snapLocal = await get(ref(database, `selecciones/equipoLocal`));
      const snapVisita = await get(ref(database, `selecciones/equipoVisita`));
      const snapGenero = await get(ref(database, `selecciones/generoPartido`));

      if (snapLocal.exists() && snapVisita.exists() && snapGenero.exists()) {
        setEquipoLocal(snapLocal.val());
        setEquipoVisita(snapVisita.val());
        setGenero(snapGenero.val());
      } else {
        navigate("/match");
      }
    }
    cargarEquiposYGenero();
  }, [navigate]);

  const abrirModal = (index, tipo) => {
    const jugador = tipo === "local" ? jugadoresLocal[index] : jugadoresVisita[index];
    const jugadoresActuales = tipo === "local" ? jugadoresLocal : jugadoresVisita;
    const nombreEquipo = tipo === "local" ? equipoLocal?.nombre : equipoVisita?.nombre;
    
    // Pasar el género actual para que ModalJugador cargue la lista correcta
    setModalData({ tipo, index, jugador, jugadoresActuales, nombreEquipo, generoPartido: genero });
  };

  const guardarJugador = (index, tipo, datos) => {
    if (tipo === "local") {
      const nuevos = [...jugadoresLocal];
      nuevos[index] = datos;
      setJugadoresLocal(nuevos);
    } else {
      const nuevos = [...jugadoresVisita];
      nuevos[index] = datos;
      setJugadoresVisita(nuevos);
    }
    setModalData(null);
  };

  const confirmar = async () => {
    let partidoId = null;
    try {
      const validar = (jugadores) =>
        jugadores.every(
          (j) => j.nombre.trim() !== "" && j.dorsal.trim() !== ""
        );

      if (!validar(jugadoresLocal) || !validar(jugadoresVisita)) {
        alert("Todos los jugadores deben tener nombre y dorsal antes de continuar.");
        return;
      }

      const partidosRef = ref(database, "partidos");
      const nuevoPartidoRef = push(partidosRef);
      partidoId = nuevoPartidoRef.key;

      // Cargar TODOS los jugadores del equipo según el género desde Firebase o JSON
      // Asumiendo que ahora tu estructura en Firebase para plantillas es algo como:
      // /plantillas/masculino/atrapados [...]
      // /plantillas/femenino/bosco [...]

      let todosJugadoresLocal = [];
      let todosJugadoresVisita = [];

      try {
        const snapLocalPlantilla = await get(ref(database, `plantillas/${genero.toLowerCase()}/${equipoLocal.nombre.toLowerCase()}`));
        const snapVisitaPlantilla = await get(ref(database, `plantillas/${genero.toLowerCase()}/${equipoVisita.nombre.toLowerCase()}`));

        if (snapLocalPlantilla.exists()) todosJugadoresLocal = snapLocalPlantilla.val();
        else todosJugadoresLocal = jugadoresData[equipoLocal.nombre.toLowerCase()] || []; // Fallback a JSON local si no está en Firebase

        if (snapVisitaPlantilla.exists()) todosJugadoresVisita = snapVisitaPlantilla.val();
        else todosJugadoresVisita = jugadoresData[equipoVisita.nombre.toLowerCase()] || []; // Fallback a JSON local
      } catch (e) {
        console.error("Error cargando plantillas de suplentes (Alineacion.jsx):", e);
        // Si hay error en Firebase, intentar cargar desde JSON local como fallback
        todosJugadoresLocal = jugadoresData[equipoLocal.nombre.toLowerCase()] || [];
        todosJugadoresVisita = jugadoresData[equipoVisita.nombre.toLowerCase()] || [];
      }


      const equipo1Data = {
        nombre: equipoLocal.nombre,
        logo: equipoLocal.escudo.split("/").pop(),
        camisa: `camisa-${equipoLocal.nombre.toLowerCase().replace(/\s+/g, "-")}.png`,
        jugadores: jugadoresLocal.map((j) => ({
          ...j,
          enJuego: true,
          haJugado: true,
        })),
        todosJugadores: todosJugadoresLocal,
        genero: genero // Asegura que el género también se guarde en los datos del equipo
      };

      const equipo2Data = {
        nombre: equipoVisita.nombre,
        logo: equipoVisita.escudo.split("/").pop(),
        camisa: `camisa-${equipoVisita.nombre.toLowerCase().replace(/\s+/g, "-")}.png`,
        jugadores: jugadoresVisita.map((j) => ({
          ...j,
          enJuego: true,
          haJugado: true,
        })),
        todosJugadores: todosJugadoresVisita,
        genero: genero // Asegura que el género también se guarde en los datos del equipo
      };

      console.log("Guardando alineación", { equipo1: equipo1Data, equipo2: equipo2Data, genero, partidoId });

      await set(ref(database, `partidos/${partidoId}/alineacion`), {
        equipo1: equipo1Data,
        equipo2: equipo2Data,
        genero: genero, // Guarda el género a nivel de partido también
      });

      await set(ref(database, `partidos/${partidoId}/marcador`), {
        equipo1: 0,
        equipo2: 0
      });

      console.log("🚀 Navegando a control (OK)", partidoId);
      navigate(`/control/${partidoId}`);

    } catch (error) {
      alert("❌ ERROR al confirmar alineación: " + error.message);
      console.error("Error al confirmar alineación:", error);
      const idFallback = partidoId || "debug-fallback";
      console.log("⚠️ Forzando navegación a control:", idFallback);
      navigate(`/control/${idFallback}`);
    }
  };

  const getCamiseta = (nombre) => {
    const id = nombre.toLowerCase().replace(/\s+/g, "-");
    return `${import.meta.env.BASE_URL}camisas/camisa-${id}.png`;
  };

  const getColorDorsal = (nombre) => {
    const negros = ["don bosco", "luz", "emprosaurios"];
    return negros.includes(nombre.toLowerCase()) ? "#000" : "#fff";
  };

  const posiciones = [
    { top: "15%", left: "18%" },
    { top: "15%", left: "62%" },
    { top: "38%", left: "40%" },
    { top: "55%", left: "17%" },
    { top: "55%", left: "63%" },
    { top: "74%", left: "40%" },
  ];

  const renderJugador = (jug, i, tipo, camisetaSrc) => {
    const seleccionado = modalData?.index === i && modalData?.tipo === tipo;
    return (
      <motion.div
        key={i}
        className="absolute cursor-pointer"
        style={{ top: posiciones[i].top, left: posiciones[i].left, transform: 'translate(-50%, -50%)' }}
        animate={seleccionado ? { scale: 1.5, rotate: 1.5 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => abrirModal(i, tipo)}
      >
        <div className="relative w-fit flex flex-col items-center">
          <div
            className="absolute top-[12%] font-barcelona text-[24px] md:text-[30px] z-20 pointer-events-none"
            style={{
              color: getColorDorsal((tipo === 'local' ? equipoLocal?.nombre : equipoVisita?.nombre) || ''),
              textShadow: '1px 1px 1px rgba(0,0,0,0.6)',
            }}
          >
            {jug.dorsal}
          </div>

          <img
            src={camisetaSrc}
            className="w-16 md:w-20 relative z-10"
            alt={`jugador-${tipo}`}
          />

          {jug.nombre && (
            <div className="absolute bottom-[-18px] font-barcelona text-[11px] text-white bg-black/80 px-2 py-[2px] rounded text-center z-20">
              {jug.nombre}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!equipoLocal || !equipoVisita) return null;

  return (
    <div
      className="min-h-screen bg-cover bg-center font-qatar text-white"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}
    >

      <Navbar />

      <h1 className="text-3xl sm:text-5xl font-bold text-center mt-6 text-yellow-400 drop-shadow">
        Alineación Inicial
      </h1>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4 lg:p-6">
        <div className="relative w-[320px] h-[540px] md:w-[400px] md:h-[640px]">
          <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha local" className="w-full h-full" />
          {jugadoresLocal.map((jug, i) => renderJugador(jug, i, "local", getCamiseta(equipoLocal.nombre)))}
        </div>


        <div className="flex flex-col items-center gap-6">
          <img src="/img/logo-empro.png" alt="logo empro" className="w-24 md:w-32" />
          <div className="flex items-center gap-10">
            <img src={equipoLocal.escudo} className="w-50 h-60 object-contain" alt="local logo" />
            <span className="text-white text-4xl font-black">V</span>
            <img src={equipoVisita.escudo} className="w-50 h-60 object-contain" alt="visita logo" />
          </div>
          <button
            onClick={() => navigate("/match")}
            className="bg-white/80 text-[#7a0026] font-bold px-6 py-2 rounded-full hover:bg-white transition"
          >
            ⬅ Volver a Equipos
          </button>
        </div>

        <div className="relative w-[320px] h-[540px] md:w-[400px] md:h-[640px]">
          <img src={`${import.meta.env.BASE_URL}img/cancha-vertical.svg`} alt="cancha visita" className="w-full h-full" />
          {jugadoresVisita.map((jug, i) => renderJugador(jug, i, "visita", getCamiseta(equipoVisita.nombre)))}
        </div>

      </div>

      <div className="flex justify-center mt-6 pb-10">
        <button
          onClick={confirmar}
          className="bg-[#FFD700] text-[#7a0026] font-bold px-10 py-3 rounded-full hover:bg-yellow-300 transition text-xl shadow-lg"
        >
          Confirmar Alineación
        </button>
      </div>

      <AnimatePresence>
        {modalData && (
          <ModalJugador
            tipo={modalData.tipo}
            index={modalData.index}
            jugador={modalData.jugador}
            onSave={guardarJugador}
            onClose={() => setModalData(null)}
            camiseta={getCamiseta((modalData.tipo === "local" ? equipoLocal.nombre : equipoVisita.nombre))}
            dorsalColor={getColorDorsal((modalData.tipo === "local" ? equipoLocal.nombre : equipoVisita.nombre))}
            jugadoresActuales={modalData.jugadoresActuales}
            nombreEquipo={modalData.nombreEquipo}
            generoPartido={modalData.generoPartido} // Pasa el género al modal del jugador
          />
        )}
      </AnimatePresence>
    </div>
  );
}