const {onCall} = require("firebase-functions/v2/https");
const {onValueWritten} = require("firebase-functions/v2/database");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ==================================================================
// ========= FUNCIÓN #1: Sincronizar Rol de Usuario (Corregida) =====
// ==================================================================
exports.syncUserRoleToAuth = onValueWritten("/usuarios/{uid}/rol", async (event) => {
  const uid = event.params.uid;
  const nuevoRol = event.data.after.val(); // El nuevo rol (ej: 'admin')

  try {
    functions.logger.log(`Estableciendo rol '${nuevoRol || "ninguno"}' para el usuario ${uid}`);
    // Estampamos el "sello" oficial en el token del usuario
    await admin.auth().setCustomUserClaims(uid, {rol: nuevoRol});
    return {result: `Rol ${nuevoRol} asignado a ${uid}.`};
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
      const {genero, jugadorKey} = event.params;
      if (!event.data.after.exists()) {
        return admin.database().ref(`/goleadores/<span class="math-inline">\{genero\}/</span>{jugadorKey}`).remove();
      }
      const detallesDeGoles = event.data.after.val();
      const totalGoles = Object.keys(detallesDeGoles).length;
      const ultimoGol = detallesDeGoles[Object.keys(detallesDeGoles)[totalGoles - 1]];
      if (!ultimoGol || !ultimoGol.jugador) {
        return null;
      }
      const datosGoleador = {
        nombre: ultimoGol.jugador,
        goles: totalGoles,
        equipo: ultimoGol.equipo,
        logo: ultimoGol.logo,
        detalles: Object.values(detallesDeGoles),
      };
      return admin.database().ref(`/goleadores/<span class="math-inline">\{genero\}/</span>{jugadorKey}`)
          .set(datosGoleador);
    },
);


// ==================================================================
// ====== FUNCIÓN #3: Generar Fases Finales (Ya estaba bien) ========
// ==================================================================
exports.generarFasesFinales = onCall(async (request) => {
  if (request.auth?.token?.rol !== "admin" && request.auth?.token?.rol !== "superadmin") {
    throw new functions.https.HttpsError("permission-denied", "Solo un administrador puede ejecutar esta acción.");
  }
  const genero = request.data.genero;
  if (!genero) {
    throw new functions.https.HttpsError("invalid-argument", "Se debe especificar el género.");
  }
  const db = admin.database();
  const tablasRef = db.ref(`/tablas/${genero}`);
  const calendarioRef = db.ref(`/calendario/${genero}/partidos`);
  try {
    const tablasSnap = await tablasRef.once("value");
    if (!tablasSnap.exists()) {
      throw new functions.https.HttpsError("not-found", "La tabla de posiciones está vacía.");
    }
    const tablas = tablasSnap.val();
    const equiposOrdenados = Object.values(tablas).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      const difGolesB = (b.gf || 0) - (b.gc || 0);
      const difGolesA = (a.gf || 0) - (a.gc || 0);
      if (difGolesB !== difGolesA) return difGolesB - difGolesA;
      return (b.gf || 0) - (a.gf || 0);
    });
    if (equiposOrdenados.length < 4) {
      throw new functions.https.HttpsError("failed-precondition", "No hay suficientes equipos.");
    }
    const [primerLugar, segundoLugar, tercerLugar, cuartoLugar] = equiposOrdenados.map((e) => e.nombre);
    const updates = {};
    updates["semifinales/0/equipo1"] = primerLugar;
    updates["semifinales/0/equipo2"] = cuartoLugar;
    updates["semifinales/1/equipo1"] = segundoLugar;
    updates["semifinales/1/equipo2"] = tercerLugar;
    await calendarioRef.update(updates);
    return {status: "success", message: "Fases finales generadas.", enfrentamientos: [`${primerLugar} vs ${cuartoLugar}`, `${segundoLugar} vs ${tercerLugar}`]};
  } catch (error) {
    functions.logger.error("Error al generar fases finales:", error);
    throw new functions.https.HttpsError("internal", "Ocurrió un error en el servidor.", error.message);
  }
});