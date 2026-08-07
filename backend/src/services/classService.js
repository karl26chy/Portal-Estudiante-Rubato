// services/classService.js - Capa de lógica de negocio para clases
const classRepository = require('../repositories/classRepository');
const cycleRepository = require('../repositories/cycleRepository');

async function getAllClasses(user, options = {}) {
  const { activeOnly } = options;
  if (user.role === 'ESTUDIANTE') {
    return classRepository.findByEstudianteId(user.id);
  }
  if (user.role === 'ADMIN') {
    return classRepository.findAll();
  }
  if (activeOnly) {
    return classRepository.findByDocenteIdAndActiveCycle(user.id);
  }
  return classRepository.findByDocenteId(user.id);
}

async function createClass(classData, user) {
  const {
    asignatura, subject,
    module, modulo,
    semester, semestre,
    day, startTime, endTime, horario,
    teacherName, studentNames, studentIds,
    docente_id, teacherId,
    ciclo_id, cicloId
  } = classData;

  const targetCicloId = ciclo_id || cicloId;
  if (!targetCicloId) {
    const error = new Error('Debe seleccionar un ciclo académico para la clase.');
    error.status = 400;
    throw error;
  }

  const isCycleOpen = await cycleRepository.isOpen(targetCicloId);
  if (!isCycleOpen) {
    const error = new Error('El ciclo académico seleccionado no existe o está cerrado.');
    error.status = 403;
    throw error;
  }

  const finalHorario = horario || `${day || 'Lunes'} ${startTime || '08:00'} - ${endTime || '10:00'}`;
  const diaSemana = day || 'Lunes';
  const rawStart = startTime || '08:00';
  const rawEnd = endTime || '10:00';
  const horaInicio = rawStart.length === 5 ? `${rawStart}:00` : rawStart;
  const horaFin = rawEnd.length === 5 ? `${rawEnd}:00` : rawEnd;
  const newDocenteId = docente_id || teacherId || user.id;

  const conflicts = await classRepository.findConflictsByTeacher({
    docente_id: newDocenteId,
    ciclo_id: targetCicloId,
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    hora_fin: horaFin
  });

  if (conflicts.length > 0) {
    const existing = conflicts[0];
    const error = new Error(
      `El docente ya tiene programada la clase "${existing.asignatura}" el día ${existing.dia_semana} ` +
      `(horario actual: ${existing.horario}) que se cruza con el nuevo horario ${rawStart} - ${rawEnd}.`
    );
    error.status = 409;
    error.conflictClass = existing;
    throw error;
  }

  const newClassData = {
    asignatura: asignatura || subject || 'Asignatura Musical',
    modulo: modulo || module || 'Módulo 1',
    semestre: semestre || semester || 'Módulo 1-1',
    profesor_nombre: teacherName || `${user.nombre} ${user.apellido || ''}`.trim(),
    profesor_titulo: 'profesor',
    dia_semana: diaSemana,
    horario: finalHorario,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    aula: 'Sala 1',
    nota: 'N/A',
    asistencia: '100%',
    docente_id: newDocenteId,
    ciclo_id: targetCicloId
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
    startTime: rawStart,
    endTime: rawEnd,
    studentNames: studentNames || [],
    studentIds: studentIds || [],
    aula: createdDbClass.aula,
    nota: createdDbClass.nota,
    asistencia: createdDbClass.asistencia,
    docente_id: createdDbClass.docente_id,
    ciclo_id: createdDbClass.ciclo_id,
    cicloNombre: createdDbClass.ciclo_nombre,
    cicloEstado: createdDbClass.ciclo_estado,
    cicloAbierto: createdDbClass.ciclo_abierto
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

  if (user.role === 'DOCENTE') {
    if (cls.docente_id !== user.id) {
      const error = new Error('No tienes acceso a esta clase.');
      error.status = 403;
      throw error;
    }
    const isCycleOpen = await cycleRepository.isOpen(cls.ciclo_id);
    if (!isCycleOpen) {
      const error = new Error('El ciclo académico de esta clase está cerrado.');
      error.status = 403;
      throw error;
    }
  }

  const removed = await classRepository.removeStudentFromClass(claseId, estudianteId);
  if (!removed) {
    const error = new Error('El estudiante no está inscrito en esta clase.');
    error.status = 404;
    throw error;
  }

  return { claseId, estudianteId, removed: true };
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  if (String(timeStr).toUpperCase().includes('AM') || String(timeStr).toUpperCase().includes('PM')) {
    return timeStr;
  }
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minStr = String(m).padStart(2, '0');
  const hourStr = String(hour12).padStart(2, '0');
  return `${hourStr}:${minStr} ${period}`;
}

async function updateClass(id, classData, user) {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }

  if (user.role === 'DOCENTE') {
    if (cls.docente_id !== user.id) {
      const error = new Error('No tienes permiso para modificar esta clase.');
      error.status = 403;
      throw error;
    }
    const isCycleOpen = await cycleRepository.isOpen(cls.ciclo_id);
    if (!isCycleOpen) {
      const error = new Error('El ciclo académico de esta clase está cerrado.');
      error.status = 403;
      throw error;
    }
  }

  const finalDay = classData.day || classData.dia_semana || cls.dia_semana;
  const finalStartTime = classData.startTime || classData.hora_inicio || cls.hora_inicio;
  const finalEndTime = classData.endTime || classData.hora_fin || cls.hora_fin;

  const dayChanged = classData.day !== undefined || classData.dia_semana !== undefined;
  const startChanged = classData.startTime !== undefined || classData.hora_inicio !== undefined;
  const endChanged = classData.endTime !== undefined || classData.hora_fin !== undefined;

  const targetDocenteId = classData.docente_id || classData.teacherId || cls.docente_id;
  const targetCicloId = classData.ciclo_id || classData.cicloId || cls.ciclo_id;

  const conflicts = await classRepository.findConflictsByTeacher({
    docente_id: targetDocenteId,
    ciclo_id: targetCicloId,
    dia_semana: finalDay,
    hora_inicio: finalStartTime,
    hora_fin: finalEndTime,
    excludeId: id
  });

  if (conflicts.length > 0) {
    const existing = conflicts[0];
    const error = new Error(
      `El docente ya tiene programada la clase "${existing.asignatura}" el día ${existing.dia_semana} ` +
      `(horario actual: ${existing.horario}) que se cruza con el nuevo horario.`
    );
    error.status = 409;
    error.conflictClass = existing;
    throw error;
  }

  let finalHorario;
  if (!classData.horario || dayChanged || startChanged || endChanged) {
    const formattedStart = formatTime12h(finalStartTime);
    const formattedEnd = formatTime12h(finalEndTime);
    finalHorario = `${finalDay || 'Lunes'} ${formattedStart} - ${formattedEnd}`;
  } else {
    finalHorario = classData.horario;
  }

  await classRepository.updateById(id, {
    asignatura: classData.asignatura || classData.subject || cls.asignatura,
    modulo: classData.modulo || classData.module || cls.modulo,
    semestre: classData.semestre || classData.semester || cls.semestre,
    profesor_nombre: classData.teacherName || cls.profesor_nombre,
    dia_semana: finalDay,
    horario: finalHorario,
    hora_inicio: finalStartTime,
    hora_fin: finalEndTime,
    aula: cls.aula,
    docente_id: classData.docente_id || classData.teacherId || cls.docente_id,
    ciclo_id: classData.ciclo_id || classData.cicloId || cls.ciclo_id
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

  if (user.role === 'DOCENTE') {
    if (cls.docente_id !== user.id) {
      const error = new Error('No tienes permiso para eliminar esta clase.');
      error.status = 403;
      throw error;
    }
    const isCycleOpen = await cycleRepository.isOpen(cls.ciclo_id);
    if (!isCycleOpen) {
      const error = new Error('El ciclo académico de esta clase está cerrado.');
      error.status = 403;
      throw error;
    }
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
