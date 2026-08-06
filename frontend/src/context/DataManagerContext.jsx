import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeText } from '../utils/teacherUtils';
import * as authApi from '../api/authApi';
import * as classApi from '../api/classApi';

const DataManagerContext = createContext(null);

const getFullName = (item) => `${(item.nombre || '')} ${(item.apellido || '')}`.trim();

const toMinutes = (time) => {
  if (!time) return null;
  const parts = String(time).split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  return parts[0] * 60 + parts[1];
};

const mapUser = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  apellidos: u.apellido,
  email: u.email,
  username: u.username,
  role: u.role,
  especialidad: u.especialidad || '',
  specialty: u.especialidad || '',
  dbId: u.id
});

const mapClass = (c) => ({
  id: c.id,
  dbId: c.id,
  asignatura: c.asignatura,
  subject: c.asignatura,
  module: c.modulo,
  semester: c.semestre,
  teacherName: c.profesor_nombre,
  profesor: c.profesor_nombre,
  profesor_nombre: c.profesor_nombre,
  dia_semana: c.dia_semana,
  day: c.dia_semana,
  horario: c.horario,
  startTime: c.hora_inicio ? c.hora_inicio.substring(0, 5) : '08:00',
  endTime: c.hora_fin ? c.hora_fin.substring(0, 5) : '10:00',
  aula: c.aula,
  nota: c.nota,
  asistencia: c.asistencia,
  docente_id: c.docente_id
});

export function DataManagerProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdminState] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [classesRes, studentsRes, teachersRes, adminsRes] = await Promise.all([
        classApi.getClasses(),
        authApi.getUsersByRole('ESTUDIANTE'),
        authApi.getUsersByRole('DOCENTE'),
        authApi.getUsersByRole('ADMIN')
      ]);
      setClasses((classesRes.classes || []).map(mapClass));
      setStudents((studentsRes.users || []).map(mapUser));
      setTeachers((teachersRes.users || []).map(mapUser));
      setAdmins((adminsRes.users || []).map(mapUser));
    } catch {
      // silencioso — el admin ya ve toasts de error en sus handlers
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem('rubato_students');
    localStorage.removeItem('rubato_professors');
    localStorage.removeItem('rubato_teachers');
    localStorage.removeItem('rubato_admins');
    localStorage.removeItem('rubato_current_admin');
    localStorage.removeItem('rubato_classes');
    setLoading(false);
  }, []);

  const addStudent = async (studentData) => {
    const result = await authApi.registerUser({
      nombre: studentData.nombre,
      apellido: studentData.apellido,
      email: studentData.email,
      role: 'ESTUDIANTE',
      username: studentData.credentials?.usuario,
      password: studentData.credentials?.password
    });
    await fetchAll();
    return result;
  };

  const updateStudent = async (id, studentData) => {
    const result = await authApi.updateUser(id, {
      nombre: studentData.nombre,
      apellido: studentData.apellido,
      email: studentData.email,
      role: 'ESTUDIANTE'
    });
    await fetchAll();
    return result;
  };

  const deleteStudent = async (id) => {
    const result = await authApi.deleteUser(id);
    await fetchAll();
    return result;
  };

  const addTeacher = async (teacherData) => {
    const simplePwd = `Rubato${Math.floor(1000 + Math.random() * 9000)}!`;
    const result = await authApi.registerUser({
      nombre: teacherData.nombre,
      apellido: teacherData.apellido,
      email: teacherData.email,
      role: 'DOCENTE',
      password: simplePwd,
      especialidad: teacherData.specialty
    });
    await fetchAll();
    return result;
  };

  const updateTeacher = async (id, updatedTeacher) => {
    const result = await authApi.updateUser(id, {
      nombre: updatedTeacher.nombre,
      apellido: updatedTeacher.apellido,
      email: updatedTeacher.email,
      role: 'DOCENTE',
      especialidad: updatedTeacher.specialty
    });
    await fetchAll();
    return result;
  };

  const deleteTeacher = async (id) => {
    const result = await authApi.deleteUser(id);
    await fetchAll();
    return result;
  };

  const addAdmin = async (adminData) => {
    const simplePwd = `Rubato${Math.floor(1000 + Math.random() * 9000)}!`;
    const result = await authApi.registerUser({
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      email: adminData.email,
      role: 'ADMIN',
      password: simplePwd
    });
    await fetchAll();
    return result;
  };

  const updateAdmin = async (id, updatedAdmin) => {
    const result = await authApi.updateUser(id, {
      nombre: updatedAdmin.nombre,
      apellido: updatedAdmin.apellido,
      email: updatedAdmin.email,
      role: 'ADMIN'
    });
    await fetchAll();
    return result;
  };

  const deleteAdmin = async (id) => {
    const result = await authApi.deleteUser(id);
    await fetchAll();
    return result;
  };

  const setCurrentAdmin = (adminObj) => {
    setCurrentAdminState({ ...adminObj, role: 'SuperAdmin' });
  };

  const addClass = async (classData) => {
    const studentDbIds = (classData.studentIds || []).map(id => {
      const found = students.find(s => s.id === id);
      return found ? (found.dbId || found.id) : id;
    }).filter(Boolean);

    const result = await classApi.createClass({
      asignatura: classData.subject,
      modulo: classData.module,
      semestre: classData.semester,
      day: classData.day,
      startTime: classData.startTime,
      endTime: classData.endTime,
      horario: classData.horario,
      teacherName: classData.teacherName,
      docente_id: classData.teacherId,
      studentNames: classData.studentNames,
      studentIds: studentDbIds
    });
    await fetchAll();
    return result;
  };

  const updateClass = async (id, updatedClass) => {
    const result = await classApi.updateClass(id, {
      asignatura: updatedClass.subject,
      modulo: updatedClass.module,
      semestre: updatedClass.semester,
      day: updatedClass.day,
      startTime: updatedClass.startTime,
      endTime: updatedClass.endTime,
      horario: updatedClass.horario,
      teacherName: updatedClass.teacherName,
      docente_id: updatedClass.teacherId
    });
    await fetchAll();
    return result;
  };

  const deleteClass = async (id) => {
    const result = await classApi.deleteClass(id);
    await fetchAll();
    return result;
  };

  const removeStudentFromClass = async (classId, studentId, studentName = '') => {
    const numericId = Number(studentId);
    const studentRef = students.find((s) => s.id === numericId);
    const dbId = studentRef ? (studentRef.dbId || studentRef.id) : numericId;
    
    const cls = classes.find(c => c.id === classId);
    const classDbId = cls ? (cls.dbId || cls.id) : classId;

    if (classDbId && dbId) {
      await classApi.removeStudentFromClass(classDbId, dbId);
    }
    await fetchAll();
    return { removed: true };
  };

  const checkClassConflict = (classData, excludeId) => {
    const newTeacher = normalizeText(classData.teacherName || classData.profesor || classData.profesora || classData.director || '');
    const newStart = toMinutes(classData.startTime);
    const newEnd = toMinutes(classData.endTime);
    if (!newTeacher || newStart === null || newEnd === null) return null;

    const conflict = classes.find((c) => {
      if (excludeId !== undefined && excludeId !== null && c.id === excludeId) return false;
      const cTeacher = normalizeText(c.teacherName || c.profesor || c.profesora || c.director || '');
      if (!cTeacher || cTeacher !== newTeacher) return false;
      if (c.day !== classData.day) return false;
      const cStart = toMinutes(c.startTime);
      const cEnd = toMinutes(c.endTime);
      if (cStart === null || cEnd === null) return false;
      return newStart < cEnd && newEnd > cStart;
    });

    if (!conflict) return null;

    const horario = conflict.horario ||
      `${conflict.day || ''} ${conflict.startTime || ''} - ${conflict.endTime || ''}`.trim();
    return {
      conflict,
      message: `Conflicto de horario: el docente ya tiene la clase "${conflict.subject || conflict.asignatura}" el día ${conflict.day || 'programado'} (horario actual: ${horario}).`
    };
  };

  return (
    <DataManagerContext.Provider
      value={{
        students,
        teachers,
        admins,
        currentAdmin,
        classes,
        loading,
        refresh: fetchAll,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        setCurrentAdmin,
        addClass,
        updateClass,
        deleteClass,
        removeStudentFromClass,
        checkClassConflict,
      }}
    >
      {children}
    </DataManagerContext.Provider>
  );
}

export function useDataManager() {
  const context = useContext(DataManagerContext);
  if (!context) {
    throw new Error('useDataManager debe ser usado dentro de un DataManagerProvider');
  }
  return context;
}
