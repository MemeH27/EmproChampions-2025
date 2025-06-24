// src/data/initialData.js

export const initialData = {
  "calendario": {
    "femenino": {
      "asignaciones": { "A": "Equipo A", "B": "Equipo B", "C": "Equipo C", "D": "Equipo D", "E": "Equipo E" },
      "partidos": {
        "jornada1": [{ "cancha": "1", "equipo1": "A", "equipo2": "B", "fecha": "Sábado 28 Jun - 08:00 AM" }, { "cancha": "2", "equipo1": "C", "equipo2": "D", "fecha": "Sábado 28 Jun - 08:00 AM" }],
        "jornada2": [{ "cancha": "1", "equipo1": "A", "equipo2": "C", "fecha": "Sábado 28 Jun - 09:00 AM" }, { "cancha": "2", "equipo1": "B", "equipo2": "E", "fecha": "Sábado 28 Jun - 09:00 AM" }],
        "jornada3": [{ "cancha": "1", "equipo1": "A", "equipo2": "D", "fecha": "Sábado 28 Jun - 10:00 AM" }, { "cancha": "2", "equipo1": "C", "equipo2": "E", "fecha": "Sábado 28 Jun - 10:00 AM" }],
        "jornada4": [{ "cancha": "1", "equipo1": "A", "equipo2": "E", "fecha": "Sábado 28 Jun - 11:00 AM" }, { "cancha": "2", "equipo1": "B", "equipo2": "D", "fecha": "Sábado 28 Jun - 11:00 AM" }],
        "jornada5": [{ "cancha": "1", "equipo1": "B", "equipo2": "C", "fecha": "Sábado 28 Jun - 12:00 PM" }, { "cancha": "2", "equipo1": "D", "equipo2": "E", "fecha": "Sábado 28 Jun - 12:00 PM" }],
        "semifinales": [{ "cancha": "1", "equipo1": "1er Lugar", "equipo2": "4to Lugar", "fecha": "Domingo 29 Jun - 09:00 AM" }, { "cancha": "2", "equipo1": "2do Lugar", "equipo2": "3er Lugar", "fecha": "Domingo 29 Jun - 09:00 AM" }],
        "finales": [{ "cancha": "2", "equipo1": "Perdedor Semi 1", "equipo2": "Perdedor Semi 2", "fecha": "Domingo 29 Jun - 11:00 AM", "nombre": "Tercer Lugar" }, { "cancha": "1", "equipo1": "Ganador Semi 1", "equipo2": "Ganador Semi 2", "fecha": "Domingo 29 Jun - 12:00 PM", "nombre": "Gran Final" }]
      }
    },
    "masculino": {
      "asignaciones": { "A": "Equipo A", "B": "Equipo B", "C": "Equipo C", "D": "Equipo D", "E": "Equipo E", "F": "Equipo F" },
      "partidos": {
        "jornada1": [{ "cancha": "1", "equipo1": "A", "equipo2": "F", "fecha": "Sábado 28 Jun - 02:00 PM" }, { "cancha": "2", "equipo1": "B", "equipo2": "E", "fecha": "Sábado 28 Jun - 02:00 PM" }, { "cancha": "1", "equipo1": "C", "equipo2": "D", "fecha": "Sábado 28 Jun - 03:00 PM" }],
        "jornada2": [{ "cancha": "2", "equipo1": "A", "equipo2": "E", "fecha": "Sábado 28 Jun - 03:00 PM" }, { "cancha": "1", "equipo1": "B", "equipo2": "D", "fecha": "Sábado 28 Jun - 04:00 PM" }, { "cancha": "2", "equipo1": "C", "equipo2": "F", "fecha": "Sábado 28 Jun - 04:00 PM" }],
        "jornada3": [{ "cancha": "1", "equipo1": "A", "equipo2": "D", "fecha": "Domingo 29 Jun - 08:00 AM" }, { "cancha": "2", "equipo1": "B", "equipo2": "C", "fecha": "Domingo 29 Jun - 08:00 AM" }, { "cancha": "1", "equipo1": "E", "equipo2": "F", "fecha": "Domingo 29 Jun - 10:00 AM" }],
        "jornada4": [{ "cancha": "2", "equipo1": "A", "equipo2": "C", "fecha": "Domingo 29 Jun - 10:00 AM" }, { "cancha": "1", "equipo1": "B", "equipo2": "F", "fecha": "Domingo 29 Jun - 11:00 AM" }, { "cancha": "2", "equipo1": "D", "equipo2": "E", "fecha": "Domingo 29 Jun - 11:00 AM" }],
        "jornada5": [{ "cancha": "1", "equipo1": "A", "equipo2": "B", "fecha": "Domingo 29 Jun - 01:00 PM" }, { "cancha": "2", "equipo1": "C", "equipo2": "E", "fecha": "Domingo 29 Jun - 01:00 PM" }, { "cancha": "1", "equipo1": "D", "equipo2": "F", "fecha": "Domingo 29 Jun - 02:00 PM" }],
        "semifinales": [{ "cancha": "1", "equipo1": "1er Lugar", "equipo2": "4to Lugar", "fecha": "Domingo 29 Jun - 03:00 PM" }, { "cancha": "2", "equipo1": "2do Lugar", "equipo2": "3er Lugar", "fecha": "Domingo 29 Jun - 03:00 PM" }],
        "finales": [{ "cancha": "2", "equipo1": "Perdedor Semi 1", "equipo2": "Perdedor Semi 2", "fecha": "Domingo 29 Jun - 04:00 PM", "nombre": "Tercer Lugar" }, { "cancha": "1", "equipo1": "Ganador Semi 1", "equipo2": "Ganador Semi 2", "fecha": "Domingo 29 Jun - 05:00 PM", "nombre": "Gran Final" }]
      }
    }
  },
  "plantillas": {
    "femenino": {
      "Don Bosco": { "logo": "bosco.png", "jugadores": [] }, "Atrapados en su Red": { "logo": "atrapados.png", "jugadores": [] }, "Luz en mi Camino": { "logo": "luz.png", "jugadores": [] }, "Mensajeros de Paz": { "logo": "mensajeros.png", "jugadores": [] }, "Huellas de Jesus": { "logo": "huellas.png", "jugadores": [] }
    },
    "masculino": {
      "Don Bosco": { "logo": "bosco.png", "jugadores": [] }, "Atrapados en su Red": { "logo": "atrapados.png", "jugadores": [] }, "Luz en mi Camino": { "logo": "luz.png", "jugadores": [] }, "Mensajeros de Paz": { "logo": "mensajeros.png", "jugadores": [] }, "Huellas de Jesus": { "logo": "huellas.png", "jugadores": [] }, "Emprosaurios": { "logo": "emprosaurios.png", "jugadores": [] }
    }
  }
};