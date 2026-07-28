// controllers/classController.js - Gestión de clases, horarios y calificaciones
const MOCK_CLASSES = [
  { id: 101, asignatura: 'Piano Complementario I', profesor: 'Maestro Carlos Silva', horario: 'Lunes y Miércoles 10:00 - 11:30 AM', aula: 'Sala 4', nota: '4.8', asistencia: '95%' },
  { id: 102, asignatura: 'Teoría y Solfeo Avanzado', profesora: 'Dra. María Fernández', horario: 'Martes y Jueves 02:00 - 04:00 PM', aula: 'Auditorio Principal', nota: '4.5', asistencia: '90%' },
  { id: 103, asignatura: 'Ensayo de Orquesta Filarmónica', director: 'Maestro Carlos Silva', horario: 'Viernes 03:00 - 06:00 PM', aula: 'Teatro Rubato', nota: '5.0', asistencia: '100%' }
];

function getClasses(req, res) {
  return res.json({
    role: req.user.role,
    usuario: req.user.nombre,
    classes: MOCK_CLASSES
  });
}

function createClass(req, res) {
  const { asignatura, horario, aula } = req.body;
  const newClass = {
    id: Date.now(),
    asignatura: asignatura || 'Nueva Asignatura Musical',
    profesor: req.user.nombre,
    horario: horario || 'Por definir',
    aula: aula || 'Sala por asignar',
    nota: 'N/A',
    asistencia: '100%'
  };
  MOCK_CLASSES.push(newClass);
  return res.status(201).json({ message: 'Clase creada correctamente', newClass });
}

module.exports = {
  getClasses,
  createClass
};
