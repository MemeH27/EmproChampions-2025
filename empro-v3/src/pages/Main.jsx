import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import SponsorBanner from '../components/SponsorBanner';
import Footer from '../components/Footer';

export default function Main() {
  const [tablaMasculina, setTablaMasculina] = useState([]);
  const [tablaFemenina, setTablaFemenina] = useState([]);
  const [generoActivo, setGeneroActivo] = useState("masculino");

  useEffect(() => {
    const cargarTabla = (genero, setter) => {
      const tablaRef = ref(db, `tablas/${genero}`);
      onValue(tablaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listaEquipos = Object.keys(data)
            .map((key) => ({
              nombre: key,
              ...data[key],
            }))
            .sort((a, b) => b.puntos - a.puntos || (b.gf - b.gc) - (a.gf - a.gc));
          setter(listaEquipos);
        }
      });
    };
    cargarTabla("masculino", setTablaMasculina);
    cargarTabla("femenino", setTablaFemenina);
  }, []);

  const tablaActiva = generoActivo === "masculino" ? tablaMasculina : tablaFemenina;

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white font-qatar bg-main-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center text-yellow-400 drop-shadow-lg mb-6">
          Tabla de Posiciones
        </h1>

        <div className="flex justify-center mb-8 bg-black/30 rounded-full p-1 max-w-sm mx-auto">
          <button onClick={() => setGeneroActivo("masculino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'masculino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Masculino
          </button>
          <button onClick={() => setGeneroActivo("femenino")} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${generoActivo === 'femenino' ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'}`}>
            Femenino
          </button>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
          {/* Encabezados */}
          <div className="grid grid-cols-10 md:grid-cols-12 text-center font-bold text-yellow-400 p-4 border-b border-yellow-400/20">
            {/* CORRECCIÓN: Se cambia md:col-span-6 por md:col-span-5 */}
            <div className="col-span-4 md:col-span-5 text-left pl-3">Club</div>
            <div className="hidden md:block">PJ</div>
            <div className="hidden md:block">PG</div>
            <div className="hidden md:block">PE</div>
            <div className="hidden md:block">PP</div>
            <div className="col-span-2 md:col-span-1">GF</div>
            <div className="col-span-2 md:col-span-1">GC</div>
            <div className="col-span-2 md:col-span-1">Pts</div>
          </div>

          {/* Cuerpo de la tabla */}
          <div>
            {tablaActiva.map((equipo, index) => (
              <div key={equipo.nombre} className="grid grid-cols-10 md:grid-cols-12 items-center text-center p-3 border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                
                {/* CORRECCIÓN: Se cambia md:col-span-6 por md:col-span-5 para que la suma sea 12 */}
                <div className="col-span-4 md:col-span-5 flex items-center gap-3 text-left">
                  <span className="font-bold text-lg w-6 text-center text-gray-400">{index + 1}</span>
                  <img src={`${import.meta.env.BASE_URL}img/escudos/${equipo.logo}`} alt={equipo.nombre} className="w-8 h-8 md:w-10 md:h-10 object-contain"/>
                  <span className="font-bold text-base md:text-lg">{equipo.nombre}</span>
                </div>

                <div className="hidden md:block">{equipo.pj}</div>
                <div className="hidden md:block">{equipo.pg}</div>
                <div className="hidden md:block">{equipo.pe}</div>
                <div className="hidden md:block">{equipo.pp}</div>
                <div className="col-span-2 md:col-span-1">{equipo.gf}</div>
                <div className="col-span-2 md:col-span-1">{equipo.gc}</div>
                <div className="col-span-2 md:col-span-1 font-extrabold text-lg">{equipo.puntos}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SponsorBanner />
      <Footer />
    </div>
    
  );
}