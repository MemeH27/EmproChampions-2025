export function generarNavbar(paginaActual) {
  const rol = localStorage.getItem("rol");
  const isAdmin = rol === "admin";

  const menuLinks = `
    <a href="index.html">📊 Tabla</a>
    ${isAdmin ? '<a href="match.html">🎮 Nuevo Partido</a>' : ''}
    <a href="goleadores.html">🥇 Goleadores</a>
    <a href="historial.html">📋 Historial de Partidos</a>
  `;

  document.body.insertAdjacentHTML('afterbegin', `
    <nav>
      <img src="logo.png" alt="Logo" />
      <div class="menu-toggle" onclick="toggleMenu()">
        <span></span><span></span><span></span>
      </div>
      <div class="links" id="navLinks">${menuLinks}</div>
    </nav>
  `);

  window.toggleMenu = () => {
    document.getElementById('navLinks').classList.toggle('active');
  };
}
