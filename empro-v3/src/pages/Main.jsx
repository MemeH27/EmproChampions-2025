// ✅ Main.jsx — Tabla de posiciones con Firebase y diseño responsive

import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import Navbar from "../components/Navbar";

export default function Main() {
  const [tabla, setTabla] = useState([]);
  const [genero, setGenero] = useState("masculino");

  useEffect(() => {
    const tablaRef = ref(database, `tablas/${genero}`);
    const off = onValue(tablaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arreglo = Object.entries(data).map(([id, info]) => ({ id, ...info }));
        const ordenada = arreglo.sort((a, b) => b.puntos - a.puntos);
        setTabla(ordenada);
      }
    });
    return () => off();
  }, [genero]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white font-qatar"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/fondoempro-horizontal.png')` }}
    >

      <Navbar />

      <div className="text-center py-6">
        <img src={`${import.meta.env.BASE_URL}img/logo2.png`} alt="Tabla de Posiciones" className="mx-auto w-auto mb-4 px-8" />
        <button
          onClick={() => setGenero(genero === "masculino" ? "femenino" : "masculino")}
          className="bg-yellow-400 text-[#7a0026] font-bold px-6 py-2 rounded-full"
        >
          Cambiar a {genero === "masculino" ? "Femenino" : "Masculino"}
        </button>
      </div>

      <div className="overflow-x-auto px-4 pb-10">
        <table className="min-w-[600px] w-full border-collapse text-center">
          <thead>
            <tr className="bg-[#FFD700] text-[#7a0026]">
              <th className="px-4 py-2 sticky left-0 bg-[#FFD700]">Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>+/-</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((equipo, i) => (
              <tr key={i} className="bg-white text-black border-b">
                <td className="flex items-center gap-2 font-bold sticky left-0 bg-white px-2 py-2">
                  <img
                    src={`${import.meta.env.BASE_URL}img/escudos/${equipo.logo}`}
                    alt={equipo.nombre}
                    className="w-4 h-4 object-contain mx-1"
                  />

                  {equipo.nombre}
                </td>
                <td>{equipo.pj || 0}</td>
                <td>{equipo.pg || 0}</td>
                <td>{equipo.pe || 0}</td>
                <td>{equipo.pp || 0}</td>
                <td>{equipo.gf || 0}</td>
                <td>{equipo.gc || 0}</td>
                <td>{(equipo.gf || 0) - (equipo.gc || 0)}</td>
                <td className="font-extrabold text-[#7a0026]">{equipo.puntos || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

