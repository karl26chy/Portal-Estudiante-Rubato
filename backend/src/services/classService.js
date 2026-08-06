// services/classService.js - Capa de lógica de negocio para clases
const classRepository = require('../repositories/classRepository');

async function getAllClasses(user) {
  if (user.role === 'ESTUDIANTE') {
    return classRepository.findByEstudianteId(user.id);
  }
  if (user.role === 'ADMIN') {
    return classRepository.findAll();
  }
  return classRepository.findByDocenteId(user.id);
}

async function createClass(classData, user) {
  const { asignatura, module, semester, day, startTime, endTime, horario, teacherName, studentNames, studentIds, docente_id } = classData;

  const finalHorario = horario || `${day || 'Lunes'} ${startTime || '08:00'} - ${endTime || '10:00'}`;
  const diaSemana = day || 'Lunes';
  const horaInicio = startTime || '08:00:00';
  const horaFin = endTime || '10:00:00';
  const newDocenteId = docente_id || user.id;

  const conflicts = await classRepository.findConflictsByTeacher({
    docente_id: newDocenteId,
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    hora_fin: horaFin
  });

  if (conflicts.length > 0) {
    const existing = conflicts[0];
    const error = new Error(
      `El docente ya tiene programada la clase "${existing.asignatura}" el día ${existing.dia_semana} ` +
      `(horario actual: ${existing.horario}) que se cruza con el nuevo horario ${horaInicio} - ${horaFin}.`
    );
    error.status = 409;
    error.conflictClass = existing;
    throw error;
  }

  const newClassData = {
    asignatura: asignatura || 'Asignatura Musical',
    modulo: module || 'Módulo 1',
    semestre: semester || 'Módulo 1-1',
    profesor_nombre: teacherName || `${user.nombre} ${user.apellido || ''}`.trim(),
    profesor_titulo: 'profesor',
    dia_semana: diaSemana,
    horario: finalHorario,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    aula: 'Sala 1',
    nota: 'N/A',
    asistencia: '100%',
    docente_id: newDocenteId
  };

  const createdDbClass = await classRepository.create(newClassData);

  if (Array.isArray(studentIds) && studentIds.length > 0) {
    await classRepository.addStudentsToClass(createdDbClass.id, studentIds);
  }

  const classObj = {
    id: createdDbClass.id,
    asignatura: createdDbClass.asignatura,
    subject: createdDbClass.asignatura,
    module: createdDbClass.modulo,
    semester: createdDbClass.semestre,
    horario: createdDbClass.horario,
    startTime,
    endTime,
    studentNames: studentNames || [],
    studentIds: studentIds || [],
    aula: createdDbClass.aula,
    nota: createdDbClass.nota,
    asistencia: createdDbClass.asistencia,
    docente_id: createdDbClass.docente_id
  };
  classObj[createdDbClass.profesor_titulo ? createdDbClass.profesor_titulo.toLowerCase() : 'profesor'] = createdDbClass.profesor_nombre;

  return classObj;
}

async function getClassStudents(claseId, user) {
  const cls = await classRepository.findById(claseId);
  if (!cls) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }

  if (user.role === 'DOCENTE' && cls.docente_id !== user.id) {
    const error = new Error('No tienes acceso a esta clase.');
    error.status = 403;
    throw error;
  }

  return classRepository.findStudentsByClassId(claseId);
}

async function removeStudentFromClass(claseId, estudianteId, user) {
  const cls = await classRepository.findById(claseId);
  if (!cls) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }

  if (user.role === 'DOCENTE' && cls.docente_id !== user.id) {
    const error = new Error('No tienes acceso a esta clase.');
    error.status = 403;
    throw error;
  }

  const removed = await classRepository.removeStudentFromClass(claseId, estudianteId);
  if (!removed) {
    const error = new Error('El estudiante no está inscrito en esta clase.');
    error.status = 404;
    throw error;
  }

  return { claseId, estudianteId, removed: true };
}

async function updateClass(id, classData, user) {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }

  if (user.role === 'DOCENTE' && cls.docente_id !== user.id) {
    const error = new Error('No tienes permiso para modificar esta clase.');
    error.status = 403;
    throw error;
  }

  await classRepository.updateById(id, {
    asignatura: classData.asignatura || classData.subject || cls.asignatura,
    modulo: classData.modulo || classData.module || cls.modulo,
    semestre: classData.semestre || classData.semester || cls.semestre,
    profesor_nombre: classData.teacherName || cls.profesor_nombre,
    dia_semana: classData.day || classData.dia_semana || cls.dia_semana,
    horario: classData.horario || cls.horario,
    hora_inicio: classData.startTime || cls.hora_inicio,
    hora_fin: classData.endTime || cls.hora_fin,
    aula: cls.aula,
    docente_id: classData.docente_id || classData.teacherId || cls.docente_id
  });

  if (Array.isArray(classData.studentIds)) {
    await classRepository.setClassStudents(id, classData.studentIds);
  }

  return classRepository.findById(id);
}

async function deleteClass(id, user) {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }

  if (user.role === 'DOCENTE' && cls.docente_id !== user.id) {
    const error = new Error('No tienes permiso para eliminar esta clase.');
    error.status = 403;
    throw error;
  }

  await classRepository.deleteById(id);

  return { id, deleted: true };
}

module.exports = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  removeStudentFromClass
};
