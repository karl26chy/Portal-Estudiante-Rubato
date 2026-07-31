// services/classService.js - Capa de lógica de negocio para clases
const classRepository = require('../repositories/classRepository');

const MOCK_CLASSES = [
  { id: 101, asignatura: 'Piano Complementario I', profesor: 'Maestro Carlos Silva', horario: 'Lunes y Miércoles 10:00 - 11:30 AM', aula: 'Sala 4', nota: '4.8', asistencia: '95%' },
  { id: 102, asignatura: 'Teoría y Solfeo Avanzado', profesora: 'Dra. María Fernández', horario: 'Martes y Jueves 02:00 - 04:00 PM', aula: 'Auditorio Principal', nota: '4.5', asistencia: '90%' },
  { id: 103, asignatura: 'Ensayo de Orquesta Filarmónica', director: 'Maestro Carlos Silva', horario: 'Viernes 03:00 - 06:00 PM', aula: 'Teatro Rubato', nota: '5.0', asistencia: '100%' }
];

async function getAllClasses() {
  const isMockMode = process.env.MOCK_MODE === 'true';

  if (isMockMode) {
    return MOCK_CLASSES;
  }

  const classes = await classRepository.findAll();
  
  // Transformar los datos de la base de datos para coincidir exactamente con el contrato del frontend
  return classes.map(c => {
    const classObj = {
      id: c.id,
      asignatura: c.asignatura,
      horario: c.horario,
      aula: c.aula,
      nota: c.nota,
      asistencia: c.asistencia
    };
    
    // Asignar el nombre del profesor a la llave correcta ("profesor", "profesora", "director")
    const titulo = (c.profesor_titulo || 'profesor').toLowerCase();
    classObj[titulo] = c.profesor_nombre;
    
    return classObj;
  });
}

async function createClass(classData, user) {
  const isMockMode = process.env.MOCK_MODE === 'true';
  const { asignatura, horario, aula } = classData;
  
  if (isMockMode) {
    const newClass = {
      id: Date.now(),
      asignatura: asignatura || 'Nueva Asignatura Musical',
      profesor: user.nombre,
      horario: horario || 'Por definir',
      aula: aula || 'Sala por asignar',
      nota: 'N/A',
      asistencia: '100%'
    };
    MOCK_CLASSES.push(newClass);
    return newClass;
  }

  // Lógica con BD
  const newClassData = {
    asignatura: asignatura || 'Nueva Asignatura Musical',
    profesor_nombre: user.nombre,
    profesor_titulo: 'profesor', // Default para nuevos registros por la UI actual
    horario: horario || 'Por definir',
    aula: aula || 'Sala por asignar',
    nota: 'N/A',
    asistencia: '100%'
  };

  const createdDbClass = await classRepository.create(newClassData);
  
  // Adaptar para el response
  const classObj = {
    id: createdDbClass.id,
    asignatura: createdDbClass.asignatura,
    horario: createdDbClass.horario,
    aula: createdDbClass.aula,
    nota: createdDbClass.nota,
    asistencia: createdDbClass.asistencia
  };
  classObj[createdDbClass.profesor_titulo.toLowerCase()] = createdDbClass.profesor_nombre;
  
  return classObj;
}

module.exports = {
  getAllClasses,
  createClass
};
