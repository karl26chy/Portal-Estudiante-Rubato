// server.js - Punto de entrada del servidor Express
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3001;

// Probar conexión a MySQL al iniciar si no estamos en Mock Mode
if (process.env.MOCK_MODE !== 'true') {
  testConnection();
} else {
  console.log('⚠️ Servidor iniciando en MOCK_MODE (Sin Base de Datos)');
}

// Arrancar el servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
