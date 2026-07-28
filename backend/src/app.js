// app.js - Configuración central de Express con middlewares de seguridad y cookies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');

const app = express();

// Middlewares globales
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos del frontend de producción si existen
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Rutas de API REST
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);

// Ruta de prueba (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Rubato funcionando correctamente con JWT HttpOnly Cookies' });
});

// Fallback para SPA React Router
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, '../../frontend/dist/index.html');
  res.sendFile(distIndex, (err) => {
    if (err) {
      res.status(200).send('API Backend Rubato activa. Ejecuta el servidor de frontend en http://localhost:5173 para el portal React.');
    }
  });
});

module.exports = app;
