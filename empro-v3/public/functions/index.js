// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Función que se dispara cuando se añade un gol
exports.notificarGol = functions.database.ref('/partidos/{partidoId}/eventos/goles/{golId}')
  .onCreate(async (snapshot, context) => {
    const gol = snapshot.val();
    const partidoId = context.params.partidoId;

    // Recuperar información del partido (equipos)
    const partidoSnapshot = await admin.database().ref(`/partidos/${partidoId}/alineacion`).once('value');
    const alineacion = partidoSnapshot.val();
    const equipo1Nombre = alineacion.equipo1.nombre;
    const equipo2Nombre = alineacion.equipo2.nombre;

    const equipoAnotador = gol.equipo === 'equipo1' ? equipo1Nombre : equipo2Nombre;

    const payload = {
      notification: {
        title: '¡Gooooool!',
        body: `<span class="math-inline">\{equipoAnotador\}\: ¡</span>{gol.jugador} anotó en el minuto ${gol.minuto}!`,
        icon: 'URL_DEL_ICONO_DE_TU_APP.png', // Opcional: un icono para la notificación
        click_action: 'URL_DE_TU_APP' // Opcional: a dónde ir al hacer clic en la notificación
      },
      data: {
        tipoEvento: 'gol',
        partidoId: partidoId,
        jugador: gol.jugador,
        equipo: equipoAnotador
      }
    };

    // Obtener todos los tokens de dispositivos suscritos (debes guardarlos previamente en una ruta como 'deviceTokens')
    const tokensSnapshot = await admin.database().ref('deviceTokens').once('value');
    const tokens = [];
    tokensSnapshot.forEach(childSnapshot => {
      tokens.push(childSnapshot.key); // Asume que el token es la clave
    });

    if (tokens.length > 0) {
      return admin.messaging().sendToDevice(tokens, payload);
    } else {
      console.log('No hay tokens de dispositivos registrados para enviar notificaciones.');
      return null;
    }
  });

// Función similar para tarjetas
exports.notificarTarjeta = functions.database.ref('/partidos/{partidoId}/eventos/tarjetas/{tarjetaId}')
  .onCreate(async (snapshot, context) => {
    const tarjeta = snapshot.val();
    const partidoId = context.params.partidoId;

    // Recuperar información del partido y equipos
    const partidoSnapshot = await admin.database().ref(`/partidos/${partidoId}/alineacion`).once('value');
    const alineacion = partidoSnapshot.val();
    const equipo1Nombre = alineacion.equipo1.nombre;
    const equipo2Nombre = alineacion.equipo2.nombre;

    const equipoAfectado = tarjeta.equipo === 'equipo1' ? equipo1Nombre : equipo2Nombre;

    const payload = {
      notification: {
        title: '¡Tarjeta!',
        body: `${equipoAfectado}: ${tarjeta.jugador} recibió tarjeta ${tarjeta.tipo} en el minuto ${tarjeta.minuto}.`,
        icon: 'URL_DEL_ICONO_DE_TU_APP.png',
        click_action: 'URL_DE_TU_APP'
      },
      data: {
        tipoEvento: 'tarjeta',
        partidoId: partidoId,
        jugador: tarjeta.jugador,
        tipoTarjeta: tarjeta.tipo,
        equipo: equipoAfectado
      }
    };

    const tokensSnapshot = await admin.database().ref('deviceTokens').once('value');
    const tokens = [];
    tokensSnapshot.forEach(childSnapshot => {
      tokens.push(childSnapshot.key);
    });

    if (tokens.length > 0) {
      return admin.messaging().sendToDevice(tokens, payload);
    } else {
      console.log('No hay tokens de dispositivos registrados para enviar notificaciones.');
      return null;
    }
  });

// Puedes crear más funciones para otros eventos (cambios, final de partido, etc.)