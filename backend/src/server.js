// server.js - Punto de entrada del servidor Express
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3001;

// Probar conexión a MySQL al iniciar
testConnection();

// Arrancar el servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
