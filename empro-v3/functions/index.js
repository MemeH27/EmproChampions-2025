const {onValueWritten} = require("firebase-functions/v2/database");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.actualizarTablaDeGoleadores = onValueWritten(
    "/goleadoresDetalles/{genero}/{jugadorKey}",
    (event) => {
        // Los parámetros ahora están en event.params
        const {genero, jugadorKey} = event.params;

        // El objeto "change" que usábamos antes, ahora es "event.data"
        if (!event.data.after.exists()) {
            logger.log(
                `Datos eliminados para clave: ${jugadorKey} en género: ${genero}.`,
                "Eliminando de la tabla de goleadores.",
            );
            return admin.database().ref(`/goleadores/${genero}/${jugadorKey}`)
                .remove();
        }

        const detallesDeGoles = event.data.after.val();

        if (!detallesDeGoles || Object.keys(detallesDeGoles).length === 0) {
            logger.log(
                `No hay detalles de goles para la clave ${jugadorKey}. `,
                "No se hará nada.",
            );
            return null;
        }

        const totalGoles = Object.keys(detallesDeGoles).length;
        const ultimoGol =
          detallesDeGoles[Object.keys(detallesDeGoles)[totalGoles - 1]];

        if (!ultimoGol || !ultimoGol.jugador) {
            logger.error(
                `El objeto 'ultimoGol' para la clave ${jugadorKey} no tiene ` +
                "el formato esperado.",
                ultimoGol,
            );
            return null;
        }

        const datosGoleador = {
            nombre: ultimoGol.jugador,
            goles: totalGoles,
            equipo: ultimoGol.equipo,
            logo: ultimoGol.logo,
            detalles: Object.values(detallesDeGoles),
        };

        logger.log(
            `Actualizando goleador: ${datosGoleador.nombre} ` +
            `(clave: ${jugadorKey}) con ${totalGoles} goles.`,
        );

        return admin.database().ref(`/goleadores/${genero}/${jugadorKey}`)
            .set(datosGoleador);
    },
);