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
  const { asignatura, module, semester, day, startTime, endTime, horario, teacherName, studentNames } = classData;
  
  const finalHorario = horario || `${day || 'Lunes'} ${startTime || '08:00'} - ${endTime || '10:00'}`;

  if (isMockMode) {
    const newClass = {
      id: Date.now(),
      asignatura: asignatura || 'Asignatura Musical',
      subject: asignatura || 'Asignatura Musical',
      module: module || 'Módulo 1',
      semester: semester || 'Módulo 1-1',
      profesor: teacherName || user.nombre,
      teacherName: teacherName || user.nombre,
      horario: finalHorario,
      startTime: startTime || '08:00',
      endTime: endTime || '10:00',
      studentNames: studentNames || [],
      aula: 'Sala por asignar',
      nota: 'N/A',
      asistencia: '100%'
    };
    MOCK_CLASSES.push(newClass);
    return newClass;
  }

  // Lógica con BD
  const newClassData = {
    asignatura: asignatura || 'Asignatura Musical',
    modulo: module || 'Módulo 1',
    semestre: semester || 'Módulo 1-1',
    profesor_nombre: teacherName || user.nombre,
    profesor_titulo: 'profesor',
    horario: finalHorario,
    hora_inicio: startTime || '08:00:00',
    hora_fin: endTime || '10:00:00',
    aula: 'Sala 1',
    nota: 'N/A',
    asistencia: '100%'
  };

  const createdDbClass = await classRepository.create(newClassData);
  
  // Adaptar para el response
  const classObj = {
    id: createdDbClass.id,
    asignatura: createdDbClass.asignatura,
    subject: createdDbClass.asignatura,
    module: createdDbClass.modulo,
    semester: createdDbClass.semestre,
    horario: createdDbClass.horario,
    startTime: startTime,
    endTime: endTime,
    studentNames: studentNames || [],
    aula: createdDbClass.aula,
    nota: createdDbClass.nota,
    asistencia: createdDbClass.asistencia
  };
  classObj[createdDbClass.profesor_titulo ? createdDbClass.profesor_titulo.toLowerCase() : 'profesor'] = createdDbClass.profesor_nombre;
  
  return classObj;
}

module.exports = {
  getAllClasses,
  createClass
};
