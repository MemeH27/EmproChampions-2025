// empro-v3/functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarGol = functions.database
  .ref("/partidos/{partidoId}/eventos/goles/{golId}")
  .onCreate(async (snapshot, context) => {
    const golData = snapshot.val();
    const partidoId = context.params.partidoId;

    // Obtener información del partido para el nombre del equipo
    const partidoSnap = await admin
      .database()
      .ref(`/partidos/${partidoId}/info`)
      .once("value");
    const partidoInfo = partidoSnap.val();
    const equipoMarcador = golData.equipo === "local" ?
      partidoInfo.equipoLocal :
      partidoInfo.equipoVisitante;

    const payload = {
      notification: {
        title: "¡GOOOL! ⚽",
        body: `Gol de ${golData.jugador} (${equipoMarcador}) al minuto ${golData.minuto}'`,
        icon: "https://memeh27.github.io/EmproChampions-2025/img/favicon.ico", // URL completa del icono
        click_action: `https://memeh27.github.io/EmproChampions-2025/match/${partidoId}`, // URL de tu app
      },
      data: {
        partidoId: partidoId,
        tipo: "gol",
      },
    };

    // Obtener todos los tokens de los usuarios
    // (Esto es muy general, idealmente segmentarías a quién notificar)
    const tokensSnapshot = await admin.database().ref("/usuarios").once("value");
    if (!tokensSnapshot.exists()) {
      console.log("No users found to notify.");
      return null;
    }

    const tokens = [];
    tokensSnapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length > 0) {
      console.log("Sending notification to tokens:", tokens);
      try {
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log("Successfully sent message:", response);
        // Limpiar tokens inválidos si es necesario
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error(
              "Failure sending notification to",
              tokens[index],
              error,
            );
            // Cleanup the tokens who are not registered anymore.
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              // Consider removing the token from your database
              // admin.database().ref(`/usuarios/${userId}/fcmToken`).remove();
            }
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
      return response;
    }
    console.log("No tokens to send notification.");
    return null;
  });

exports.notificarTarjeta = functions.database
  .ref("/partidos/{partidoId}/eventos/tarjetas/{tarjetaId}")
  .onCreate(async (snapshot, context) => {
    const tarjetaData = snapshot.val();
    const partidoId = context.params.partidoId;

    const partidoSnap = await admin
      .database()
      .ref(`/partidos/${partidoId}/info`)
      .once("value");
    const partidoInfo = partidoSnap.val();
    const equipoSancionado = tarjetaData.equipo === "local" ?
      partidoInfo.equipoLocal :
      partidoInfo.equipoVisitante;

    const tipoTarjetaEmoji = tarjetaData.tipo === "amarilla" ? "🟨" : "🟥";
    const payload = {
      notification: {
        title: `Tarjeta ${tarjetaData.tipo.toUpperCase()} ${tipoTarjetaEmoji}`,
        body: `Tarjeta para ${tarjetaData.jugador} (${equipoSancionado}) al minuto ${tarjetaData.minuto}'.`,
        icon: "https://memeh27.github.io/EmproChampions-2025/img/favicon.ico", // URL completa del icono
        click_action: `https://memeh27.github.io/EmproChampions-2025/match/${partidoId}`, // URL de tu app
      },
      data: {
        partidoId: partidoId,
        tipo: "tarjeta",
      },
    };

    const tokensSnapshot = await admin.database().ref("/usuarios").once("value");
    if (!tokensSnapshot.exists()) {
      console.log("No users found to notify.");
      return null;
    }
    const tokens = [];
    tokensSnapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length > 0) {
      console.log("Sending notification to tokens:", tokens);
      try {
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log("Successfully sent message:", response);
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error(
              "Failure sending notification to",
              tokens[index],
              error,
            );
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              // Consider removing the token
            }
          }
        });
        return response;
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    console.log("No tokens to send notification.");
    return null;
  });