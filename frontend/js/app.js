// app.js - Lógica cliente de la SPA

// Cambiar la vista activa inyectando el HTML desde vistas.js
function showView(nombreVista, boton) {
  const contenedor = document.getElementById('app-view');
  
  if (vistas[nombreVista]) {
    contenedor.innerHTML = vistas[nombreVista];
  }

  // Actualizar estilos activos de los botones con clases de Tailwind
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.className = 'nav-btn px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 font-medium transition-all';
  });

  if (boton) {
    boton.className = 'nav-btn px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium transition-all';
  }
}

// Cargar vista inicial y verificar API al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  showView('inicio', document.querySelector('.nav-btn'));
  verificarApi();
});

// Comprobar la conexión con la API REST Backend (/api/health)
function verificarApi() {
  const badge = document.getElementById('api-status');

  fetch('/api/health')
    .then(res => res.json())
    .then(() => {
      badge.textContent = '🟢 API Conectada';
      badge.className = 'px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium';
    })
    .catch(() => {
      badge.textContent = '🔴 Servidor Desconectado';
      badge.className = 'px-3 py-1 text-xs rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium';
    });
}
