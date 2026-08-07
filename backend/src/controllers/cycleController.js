// controllers/cycleController.js - Controladores para gestión de ciclos académicos
const cycleService = require('../services/cycleService');

async function getCycles(req, res) {
  try {
    const cycles = await cycleService.getAllCycles();
    return res.json({ cycles });
  } catch (error) {
    console.error('Error al obtener ciclos:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno al obtener los ciclos.' });
  }
}

async function createCycle(req, res) {
  try {
    const cycle = await cycleService.createCycle(req.body);
    return res.status(201).json({ cycle });
  } catch (error) {
    console.error('Error al crear ciclo:', error);
    return res.status(error.status || 400).json({ error: error.message || 'Error al crear el ciclo.' });
  }
}

async function updateCycle(req, res) {
  try {
    const { id } = req.params;
    const cycle = await cycleService.updateCycle(id, req.body);
    return res.json({ cycle });
  } catch (error) {
    console.error('Error al actualizar ciclo:', error);
    return res.status(error.status || 400).json({ error: error.message || 'Error al actualizar el ciclo.' });
  }
}

async function closeCycle(req, res) {
  try {
    const { id } = req.params;
    const cycle = await cycleService.closeCycle(id, req.user);
    return res.json({ cycle, message: 'Ciclo cerrado exitosamente.' });
  } catch (error) {
    console.error('Error al cerrar ciclo:', error);
    return res.status(error.status || 400).json({ error: error.message || 'Error al cerrar el ciclo.' });
  }
}

async function deleteCycle(req, res) {
  try {
    const { id } = req.params;
    const result = await cycleService.deleteCycle(id, req.user);
    return res.json({ ...result, message: 'Ciclo y todos sus datos asociados fueron eliminados definitivamente.' });
  } catch (error) {
    console.error('Error al eliminar ciclo:', error);
    return res.status(error.status || 400).json({ error: error.message || 'Error al eliminar el ciclo.' });
  }
}

module.exports = {
  getCycles,
  createCycle,
  updateCycle,
  closeCycle,
  deleteCycle
};
