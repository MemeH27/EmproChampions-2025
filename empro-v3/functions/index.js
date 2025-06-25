const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onValueWritten } = require("firebase-functions/v2/database");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ==================================================================
// ========= FUNCIÓN #1: Sincronizar Rol de Usuario (Corregida) =====
// ==================================================================
exports.syncUserRoleToAuth = onValueWritten("/usuarios/{uid}/rol", async (event) => {
  const uid = event.params.uid;
  const nuevoRol = event.data.after.val();

  try {
    functions.logger.log(`Estableciendo rol '${nuevoRol || "ninguno"}' para el usuario ${uid}`);
    await admin.auth().setCustomUserClaims(uid, { rol: nuevoRol });
    return { result: `Rol ${nuevoRol} asignado a ${uid}.` };
  } catch (error) {
    functions.logger.error(`Error al establecer custom claim para ${uid}`, error);
    return null;
  }
});

// ==================================================================
// ========= FUNCIÓN #2: Actualizar Goleadores (Ya estaba bien) =====
// ==================================================================
exports.actualizarTablaDeGoleadores = onValueWritten(
  "/goleadoresDetalles/{genero}/{jugadorKey}",
  async (event) => {
    const { genero, jugadorKey } = event.params;
    if (!event.data.after.exists()) {
      return admin.database().ref(`/goleadores/${genero}/${jugadorKey}`).remove();
    }
    const detallesDeGoles = event.data.after.val();
    const totalGoles = Object.keys(detallesDeGoles).length;
    const ultimoGol = detallesDeGoles[Object.keys(detallesDeGoles)[totalGoles - 1]];
    if (!ultimoGol || !ultimoGol.jugador) return null;

    const datosGoleador = {
      nombre: ultimoGol.jugador,
      goles: totalGoles,
      equipo: ultimoGol.equipo,
      logo: ultimoGol.logo,
      detalles: Object.values(detallesDeGoles),
    };
    return admin.database().ref(`/goleadores/${genero}/${jugadorKey}`).set(datosGoleador);
  }
);

// ==================================================================
// ========== FUNCIÓN #3: Generar Fases Finales (Corregida) ============
// ==================================================================
exports.generarFasesFinales = onCall(async (request) => {
  console.log("🔥 INICIO función generarFasesFinales");

  if (request.auth?.token?.rol !== "admin" && request.auth?.token?.rol !== "superadmin") {
    console.log("🚫 Usuario sin permisos");
    throw new HttpsError("permission-denied", "Solo un administrador puede ejecutar esta acción.");
  }

  const genero = request.data.genero;
  if (!genero) {
    console.log("⚠️ Género no especificado");
    throw new HttpsError("invalid-argument", "Se debe especificar el género.");
  }

  const db = admin.database();
  const tablasRef = db.ref(`/tablas/${genero}`);
  const calendarioPartidosRef = db.ref(`/partidos/${genero}`);

  try {
    console.log("📥 Leyendo tabla de posiciones...");
    const tablasSnap = await tablasRef.once("value");

    if (!tablasSnap.exists()) {
      console.log("🚫 Tabla vacía");
      throw new HttpsError("not-found", "La tabla de posiciones está vacía.");
    }

    const tablas = tablasSnap.val();
    console.log("✅ Tabla cargada:", tablas);

    const equiposArray = Object.entries(tablas).map(([id, data]) => ({
      id,
      ...data,
      nombre: data.nombre || id,
    }));

    if (equiposArray.length < 4) {
      console.log("🚫 Menos de 4 equipos");
      throw new HttpsError("failed-precondition", "No hay suficientes equipos.");
    }

    const equiposOrdenados = equiposArray.sort((a, b) => {
      const puntosDiff = (b.puntos || 0) - (a.puntos || 0);
      if (puntosDiff !== 0) return puntosDiff;
      const difB = (b.gf || 0) - (b.gc || 0);
      const difA = (a.gf || 0) - (a.gc || 0);
      return (difB - difA) || ((b.gf || 0) - (a.gf || 0));
    });

    console.log("📈 Equipos ordenados:", equiposOrdenados);

    const [eq1, eq2, eq3, eq4] = equiposOrdenados;

    const semifinales = {
      0: { equipo1: eq1.id, equipo2: eq4.id },
      1: { equipo1: eq2.id, equipo2: eq3.id }
    };

    // ✅ Usar update para no borrar los partidos anteriores
    await calendarioPartidosRef.update({ semifinales });

    console.log("✅ Semifinales agregadas sin eliminar otros partidos");

    return {
      status: "success",
      message: "Fases finales generadas.",
      enfrentamientos: [
        `${eq1.nombre} vs ${eq4.nombre}`,
        `${eq2.nombre} vs ${eq3.nombre}`
      ]
    };

  } catch (error) {
    console.error("💥 Error en generarFasesFinales:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Ocurrió un error interno", error.message);
  }
});