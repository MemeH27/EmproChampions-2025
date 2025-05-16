import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.appspot.com",
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const equipo1 = JSON.parse(localStorage.getItem("equipo1"));
const equipo2 = JSON.parse(localStorage.getItem("equipo2"));
const genero = localStorage.getItem("genero") || "masculino";

let goles1 = 0, goles2 = 0;
let tiempo = 0;
let intervalo = null;
let enJuego = false;
let partidoFinalizado = false;
let estabaJugando = false;
let equipoActual = 0;
const goleadores = [];

function mostrarToast(mensaje) {
  const contenedor = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensaje;
  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function mensajeNarrado(nombre, equipo, g1, g2) {
  const total = g1 + g2;
  if (total === 1) return `¡${equipo} abre el marcador con gol de ${nombre}!`;
  if (g1 === g2) return `¡${equipo} empata el partido gracias a ${nombre}!`;
  if ((equipo === equipo1.name && g1 > g2) || (equipo === equipo2.name && g2 > g1)) return `¡${equipo} toma la delantera con gol de ${nombre}!`;
  return `¡Gol de ${nombre} para ${equipo}!`;
}

window.iniciar = () => {
  if (intervalo || partidoFinalizado) return;
  intervalo = setInterval(() => {
    tiempo++;
    actualizarCrono();
  }, 1000);
  enJuego = true;
};

window.pausar = () => {
  if (partidoFinalizado) return;
  clearInterval(intervalo);
  intervalo = null;
  enJuego = false;
};

window.reiniciar = () => {
  if (partidoFinalizado) return;
  pausar();
  tiempo = 0;
  actualizarCrono();
};

window.gol = (equipo) => {
  if (!enJuego || partidoFinalizado) {
    alert("⛔ El cronómetro está pausado o el partido ha finalizado");
    return;
  }
  equipoActual = equipo;
  estabaJugando = enJuego;
  pausar();
  document.getElementById("modalGoleador").style.display = "flex";
};

window.guardarGol = () => {
  const nombre = document.getElementById("goleador").value.trim();
  if (!nombre) return alert("⚠️ Escribí el nombre del goleador");

  if (equipoActual === 1) goles1++;
  else goles2++;

  const equipoNombre = equipoActual === 1 ? equipo1.name : equipo2.name;
  goleadores.push({ equipo: equipoActual, nombre });
  mostrarToast(mensajeNarrado(nombre, equipoNombre, goles1, goles2));

  document.getElementById("modalGoleador").style.display = "none";
  document.getElementById("goleador").value = "";
  document.getElementById("marcador").textContent = `${goles1} : ${goles2}`;
  document.getElementById("golSound").play();
  lanzarConfeti();
  if (estabaJugando) iniciar();
};

function actualizarCrono() {
  const min = String(Math.floor(tiempo / 60)).padStart(2, '0');
  const seg = String(tiempo % 60).padStart(2, '0');
  document.getElementById("cronometro").textContent = `${min}:${seg}`;
}

window.mostrarModalMVP = () => {
  if (!enJuego || partidoFinalizado) {
    alert("⛔ El partido no está en juego.");
    return;
  }
  pausar();
  document.getElementById("modalMVP").style.display = "flex";
};

window.finalizarPartidoConMVP = async () => {
  const mvp = document.getElementById("mvp").value.trim();
  if (!mvp) return alert("⚠️ Debes escribir el nombre del MVP");
  document.getElementById("modalMVP").style.display = "none";
  partidoFinalizado = true;

  const posicionesRef = ref(db, genero === "femenino" ? "posicionesFemenino" : "posicionesMasculino");
  const posicionesSnap = await get(posicionesRef);
  const posiciones = posicionesSnap.val() || {};

  [equipo1.name, equipo2.name].forEach(name => {
    if (!posiciones[name]) {
      posiciones[name] = { PJ:0, G:0, E:0, P:0, GF:0, GC:0, Pts:0 };
    }
  });

  posiciones[equipo1.name].PJ++;
  posiciones[equipo2.name].PJ++;
  posiciones[equipo1.name].GF += goles1;
  posiciones[equipo1.name].GC += goles2;
  posiciones[equipo2.name].GF += goles2;
  posiciones[equipo2.name].GC += goles1;

  if (goles1 > goles2) {
    posiciones[equipo1.name].G++;
    posiciones[equipo1.name].Pts += 3;
    posiciones[equipo2.name].P++;
  } else if (goles2 > goles1) {
    posiciones[equipo2.name].G++;
    posiciones[equipo2.name].Pts += 3;
    posiciones[equipo1.name].P++;
  } else {
    posiciones[equipo1.name].E++;
    posiciones[equipo2.name].E++;
    posiciones[equipo1.name].Pts += 1;
    posiciones[equipo2.name].Pts += 1;
  }

  await set(posicionesRef, posiciones);

  const historialRef = ref(db, "historialPartidos");
  await push(historialRef, {
    fecha: new Date().toLocaleString(),
    genero,
    equipo1: equipo1.name,
    equipo2: equipo2.name,
    marcador: `${goles1} - ${goles2}`,
    minutos: `${String(Math.floor(tiempo / 60)).padStart(2, '0')}:${String(tiempo % 60).padStart(2, '0')}`,
    mvp
  });

  const tablaRef = ref(db, "goleadores");
  const detallesRef = ref(db, "goleadoresDetalles");

  for (const g of goleadores) {
    const nombre = g.nombre;
    const detalle = {
      fecha: new Date().toLocaleString(),
      equipo1: equipo1.name,
      equipo2: equipo2.name,
      minuto: `${String(Math.floor(tiempo / 60)).padStart(2, '0')}:${String(tiempo % 60).padStart(2, '0')}`,
      genero: genero
    };

    const contRef = ref(db, `goleadores/${nombre}`);
    const contSnap = await get(contRef);
    const actual = contSnap.val() || 0;
    await set(contRef, actual + 1);

    const detalleRef = ref(db, `goleadoresDetalles/${nombre}`);
    const detalleSnap = await get(detalleRef);
    const lista = detalleSnap.val() || [];
    lista.push(detalle);
    await set(detalleRef, lista);
  }

  alert("✅ Partido finalizado y registrado correctamente.");
  window.location.href = "index.html";
};

function lanzarConfeti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;
  const colors = ['#FFD700', '#FFFFFF', '#FF69B4'];
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const confettis = [];

  for (let i = 0; i < 150; i++) {
    confettis.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 10 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10
    });
  }

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettis.forEach(c => {
      c.y += c.d;
      c.tilt += Math.random() * 0.2 - 0.1;
      ctx.beginPath();
      ctx.arc(c.x + c.tilt, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
    });
    if (Date.now() > end) {
      clearInterval(interval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, 16);
}

window.addEventListener('beforeunload', function (e) {
  if (enJuego && !partidoFinalizado) {
    e.preventDefault();
    e.returnValue = '⚠️ Hay un partido en curso. ¿Estás seguro?';
  }
});
