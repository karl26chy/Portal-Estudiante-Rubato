// services/cycleService.js - Lógica de negocio para ciclos académicos
const cycleRepository = require('../repositories/cycleRepository');

async function getAllCycles() {
  return cycleRepository.findAll();
}

async function getCycleById(id) {
  const cycle = await cycleRepository.findById(id);
  if (!cycle) {
    const error = new Error('Ciclo no encontrado.');
    error.status = 404;
    throw error;
  }
  return cycle;
}

async function createCycle(cycleData) {
  const { semestre, anio, fecha_inicio, fecha_fin } = cycleData;

  if (!semestre || !anio || !fecha_inicio || !fecha_fin) {
    const error = new Error('Faltan datos obligatorios para crear el ciclo (semestre, anio, fecha_inicio, fecha_fin).');
    error.status = 409;
    throw error;
  }

  const strSemestre = String(semestre);
  const numAnio = Number(anio);

  if (strSemestre !== '1' && strSemestre !== '2') {
    const error = new Error('El semestre debe ser "1" o "2".');
    error.status = 409;
    throw error;
  }

  const existing = await cycleRepository.findBySemestreAndAnio(strSemestre, numAnio);
  if (existing) {
    const error = new Error(`Ya existe un ciclo académico registrado para el Semestre ${strSemestre} - ${numAnio}.`);
    error.status = 409;
    throw error;
  }

  const startDate = new Date(fecha_inicio);
  const endDate = new Date(fecha_fin);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Formato de fecha inválido.');
  }

  if (endDate <= startDate) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio.');
  }

  const nombre = `Semestre ${strSemestre} - ${numAnio}`;

  return cycleRepository.create({
    nombre,
    semestre: strSemestre,
    anio: numAnio,
    fecha_inicio,
    fecha_fin
  });
}

async function updateCycle(id, cycleData) {
  const existingCycle = await cycleRepository.findById(id);
  if (!existingCycle) {
    const error = new Error('Ciclo no encontrado.');
    error.status = 404;
    throw error;
  }

  if (existingCycle.estado === 'CERRADO') {
    const error = new Error('No se puede modificar un ciclo que ya ha sido cerrado.');
    error.status = 409;
    throw error;
  }

  const strSemestre = String(cycleData.semestre || existingCycle.semestre || '1');
  const numAnio = Number(cycleData.anio || existingCycle.anio || new Date().getFullYear());

  const duplicate = await cycleRepository.findBySemestreAndAnio(strSemestre, numAnio);
  if (duplicate && Number(duplicate.id) !== Number(id)) {
    const error = new Error(`Ya existe otro ciclo académico para el Semestre ${strSemestre} - ${numAnio}.`);
    error.status = 409;
    throw error;
  }

  const startDate = new Date(cycleData.fecha_inicio || existingCycle.fecha_inicio);
  const endDate = new Date(cycleData.fecha_fin || existingCycle.fecha_fin);

  if (endDate <= startDate) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio.');
  }

  const nombre = `Semestre ${strSemestre} - ${numAnio}`;

  return cycleRepository.updateById(id, {
    ...cycleData,
    nombre,
    semestre: strSemestre,
    anio: numAnio
  });
}

async function closeCycle(id, adminUser) {
  const existingCycle = await cycleRepository.findById(id);
  if (!existingCycle) {
    const error = new Error('Ciclo no encontrado.');
    error.status = 404;
    throw error;
  }

  if (existingCycle.estado === 'CERRADO') {
    const error = new Error('El ciclo ya se encuentra cerrado.');
    error.status = 409;
    throw error;
  }

  const closed = await cycleRepository.close(id, adminUser.id);
  if (!closed) {
    throw new Error('No se pudo cerrar el ciclo académico.');
  }

  return closed;
}

async function deleteCycle(id, adminUser) {
  const existingCycle = await cycleRepository.findById(id);
  if (!existingCycle) {
    const error = new Error('Ciclo no encontrado.');
    error.status = 404;
    throw error;
  }

  const deleted = await cycleRepository.deleteById(id);
  if (!deleted) {
    throw new Error('No se pudo eliminar el ciclo académico.');
  }

  return { id: Number(id), deleted: true, nombre: existingCycle.nombre };
}

module.exports = {
  getAllCycles,
  getCycleById,
  createCycle,
  updateCycle,
  closeCycle,
  deleteCycle
};
