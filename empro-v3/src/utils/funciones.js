export function obtenerEquiposDesdeLocalStorage() {
  const equipo1 = JSON.parse(localStorage.getItem("equipo1"));
  const equipo2 = JSON.parse(localStorage.getItem("equipo2"));

  return { equipo1, equipo2 };
}
