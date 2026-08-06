// server.js - Punto de entrada del servidor Express
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

testConnection();

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
