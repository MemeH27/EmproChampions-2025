// src/hooks/useCronometro.js
import { useState, useRef, useEffect } from "react";

export default function useCronometro() {
  const [tiempo, setTiempo] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const intervalo = useRef(null);

  const iniciar = () => {
    if (!enMarcha) {
      setEnMarcha(true);
      intervalo.current = setInterval(() => {
        setTiempo((prev) => prev + 1);
      }, 1000);
    }
  };

  const pausar = () => {
    setEnMarcha(false);
    clearInterval(intervalo.current);
  };

  const reiniciar = () => {
    setTiempo(0);
    pausar();
  };

  useEffect(() => {
    return () => clearInterval(intervalo.current); // limpieza
  }, []);

  return { tiempo, enMarcha, iniciar, pausar, reiniciar };
}
