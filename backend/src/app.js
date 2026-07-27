// app.js - Configuración central de Express
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Ruta de prueba (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Rubato funcionando correctamente' });
});

// Redirigir cualquier otra ruta a la SPA (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

module.exports = app;
