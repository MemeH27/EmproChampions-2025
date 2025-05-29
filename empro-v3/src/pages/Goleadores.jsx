import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import Navbar from "../components/Navbar";

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [genero, setGenero] = useState("masculino");
  const [detallesVisibles, setDetallesVisibles] = useState({});

  useEffect(() => {
    const refGoles = ref(database, `goleadoresDetalles/${genero}`);
    onValue(refGoles, (snap) => {
      const data = snap.val();
      if (data) {
        const resumen = {};
        Object.entries(data).forEach(([jugadorNombre, golesLista]) => {
          // Filtrar goles por género (ya hecho a nivel de ruta de Firebase)
          // Asegurarse de que golesLista es un array
          if (Array.isArray(golesLista)) {
            golesLista.forEach((gol) => {
              if (!resumen[gol.jugador]) {
                resumen[gol.jugador] = {
                  equipo: gol.equipo, // Nombre del equipo del goleador
                  goles: 0,
                  detalles: [],
                  logo: gol.logo || "default.png", // Asegura un logo por defecto
                };
              }
              resumen[gol.jugador].goles++;
              resumen[gol.jugador].detalles.push({ minuto: gol.minuto, partido: gol.partido, fecha: gol.fecha });
            });
          }
        });

        const lista = Object.entries(resumen)
          .map(([jugador, info]) => ({ jugador, ...info }))
          .sort((a, b) => b.goles - a.goles);

        setGoleadores(lista);
      } else {
        setGoleadores([]);
      }
    });
  }, [genero]);

  const toggleDetalles = (nombre) => {
    setDetallesVisibles((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white font-qatar" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}>
      <Navbar />
      <div className="text-center py-6">
        <img src={`${import.meta.env.BASE_URL}img/logo3.png`} alt="Máximos Goleadores" className="mx-auto w-auto px-8 mb-4" />
        <button
          onClick={() => setGenero(genero === "masculino" ? "femenino" : "masculino")}
          className="bg-yellow-400 text-[#7a0026] font-bold px-6 py-2 rounded-full"
        >
          Cambiar a {genero === "masculino" ? "Femenino" : "Masculino"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-10">
        {goleadores.length === 0 ? (
          <p className="text-center text-xl">No hay goles registrados aún.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#FFD700] text-[#7a0026]">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Jugador</th>
                <th className="px-4 py-2">Equipo</th>
                <th className="px-4 py-2">Goles</th>
                <th className="px-4 py-2">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {goleadores.map((g, i) => (
                <React.Fragment key={g.jugador}>
                  <tr className="bg-white text-black border-b border-[#C72C48]">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-bold">{g.jugador}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}img/escudos/${g.logo}`} alt={g.equipo} className="w-6 h-6 object-contain" />
                        {g.equipo}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#7a0026]">{g.goles} ⚽</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleDetalles(g.jugador)}
                        className="btn-detalle"
                      >
                        {detallesVisibles[g.jugador] ? "Ocultar" : "Ver detalles"}
                      </button>
                    </td>
                  </tr>
                  {detallesVisibles[g.jugador] && (
                    <tr>
                      <td colSpan="5">
                        <div className="detalles">
                          {g.detalles.length === 0 ? (
                            "<em>Sin detalles registrados</em>"
                          ) : (
                            g.detalles.map((det, j) => (
                              <div key={j} className="detalle-item">
                                📅 <strong>{det.fecha}</strong><br />
                                ⚽ {det.partido}<br />
                                ⏱️ Min {det.minuto}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}