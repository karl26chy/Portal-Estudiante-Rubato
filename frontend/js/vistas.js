// vistas.js - Plantillas de vistas de la SPA usando Tailwind CSS
const vistas = {
  inicio: `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-white">Bienvenido al Portal Estudiante 👋</h2>
      <p class="text-slate-400">Selecciona una opción del menú superior para consultar tu información académica y musical.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-all">
          <div class="text-3xl mb-2">🎼</div>
          <h3 class="font-semibold text-indigo-300">Horarios</h3>
          <p class="text-sm text-slate-400 mt-1">Consulta tus clases de instrumento y ensayos asignados.</p>
        </div>
        <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-all">
          <div class="text-3xl mb-2">🏆</div>
          <h3 class="font-semibold text-indigo-300">Calificaciones</h3>
          <p class="text-sm text-slate-400 mt-1">Revisa tu rendimiento, audiciones y notas de evaluación.</p>
        </div>
        <div class="p-4 bg-slate-900/60 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-all">
          <div class="text-3xl mb-2">📌</div>
          <h3 class="font-semibold text-indigo-300">Asistencia</h3>
          <p class="text-sm text-slate-400 mt-1">Monitorea tu porcentaje de asistencia por asignatura.</p>
        </div>
      </div>
    </div>
  `,

  horarios: `
    <div class="space-y-3">
      <h2 class="text-xl font-bold text-white">📅 Horarios de Clases</h2>
      <p class="text-slate-400 italic">Próximamente: Consulta tus horarios semanales de clases e instrumentos.</p>
    </div>
  `,

  notas: `
    <div class="space-y-3">
      <h2 class="text-xl font-bold text-white">🎵 Dashboard de Calificaciones</h2>
      <p class="text-slate-400 italic">Próximamente: Notas de evaluaciones y audiciones musicales.</p>
    </div>
  `,

  asistencia: `
    <div class="space-y-3">
      <h2 class="text-xl font-bold text-white">✅ Registro de Asistencia</h2>
      <p class="text-slate-400 italic">Próximamente: Historial de asistencia a clases y ensayos.</p>
    </div>
  `,

  login: `
    <div class="max-w-sm mx-auto space-y-4 py-4">
      <h2 class="text-2xl font-bold text-white text-center">🔐 Iniciar Sesión</h2>
      <form onsubmit="event.preventDefault();" class="space-y-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
          <input type="email" placeholder="estudiante@rubato.org" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
          <input type="password" placeholder="••••••••" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required>
        </div>
        <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all">
          Ingresar al Portal
        </button>
      </form>
    </div>
  `
};
