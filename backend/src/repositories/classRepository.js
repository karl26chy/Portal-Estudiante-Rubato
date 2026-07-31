// repositories/classRepository.js - Capa de acceso a datos para clases
const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM classes');
  return rows;
}

async function create(classData) {
  const { asignatura, profesor_nombre, profesor_titulo, horario, aula, nota, asistencia } = classData;
  const [result] = await pool.query(
    'INSERT INTO classes (asignatura, profesor_nombre, profesor_titulo, horario, aula, nota, asistencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [asignatura, profesor_nombre, profesor_titulo, horario, aula, nota, asistencia]
  );
  
  const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [result.insertId]);
  return rows[0];
}

module.exports = {
  findAll,
  create
};
