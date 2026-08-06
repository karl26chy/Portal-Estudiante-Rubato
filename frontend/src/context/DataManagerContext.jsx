import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeText } from '../utils/teacherUtils';

const DataManagerContext = createContext(null);

const getFullName = (item) => `${(item.nombre || '')} ${(item.apellidos || '')}`.trim();

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (!res.ok) throw new Error('Error de API');
  return res.json();
}

const toMinutes = (time) => {
  if (!time) return null;
  const parts = String(time).split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  return parts[0] * 60 + parts[1];
};

const mapUser = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellidos: u.apellido,
  email: u.email,
  username: u.username,
  role: u.role,
  especialidad: u.especialidad || '',
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
        apiFetch('/api/classes'),
        apiFetch('/api/auth/users?role=ESTUDIANTE'),
        apiFetch('/api/auth/users?role=DOCENTE'),
        apiFetch('/api/auth/users?role=ADMIN')
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

  const addStudent = (student) => {
    const newStudent = { ...student, id: Date.now() };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  const updateStudent = (id, updatedStudent) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, ...updatedStudent, id } : s));
  };

  const deleteStudent = (id) => {
    const numericId = Number(id);
    setStudents((prev) => prev.filter((s) => s.id !== numericId));
  };

  const addTeacher = (teacher) => {
    const newTeacher = { ...teacher, id: Date.now() };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  };

  const updateTeacher = (id, updatedTeacher) => {
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...updatedTeacher, id } : t));
  };

  const deleteTeacher = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addAdmin = (admin) => {
    const newAdmin = { ...admin, id: Date.now(), role: 'SuperAdmin' };
    setAdmins((prev) => [...prev, newAdmin]);
    return newAdmin;
  };

  const updateAdmin = (id, updatedAdmin) => {
    const newAdminObj = { ...updatedAdmin, id, role: 'SuperAdmin' };
    setAdmins((prev) => prev.map((a) => a.id === id ? newAdminObj : a));
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdminState(newAdminObj);
    }
  };

  const deleteAdmin = (id) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdminState(null);
    }
  };

  const setCurrentAdmin = (adminObj) => {
    setCurrentAdminState({ ...adminObj, role: 'SuperAdmin' });
  };

  const addClass = (classData) => {
    const conflictCheck = checkClassConflict(classData);
    if (conflictCheck) {
      return { ok: false, conflict: conflictCheck.conflict, message: conflictCheck.message };
    }

    const newClass = {
      ...classData,
      id: Date.now(),
    };
    setClasses((prev) => [...prev, newClass]);
    return { ok: true, newClass };
  };

  const updateClass = (id, updatedClass) => {
    const conflictCheck = checkClassConflict(updatedClass, id);
    if (conflictCheck) {
      return { ok: false, conflict: conflictCheck.conflict, message: conflictCheck.message };
    }
    setClasses((prev) => prev.map((c) => c.id === id ? { ...updatedClass, id } : c));
    return { ok: true, newClass: { ...updatedClass, id } };
  };

  const deleteClass = (id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const removeStudentFromClass = (classId, studentId, studentName = '') => {
    const numericId = Number(studentId);
    const studentRef = students.find((s) => s.id === numericId);
    const studentFullName = studentRef ? getFullName(studentRef) : studentName;

    setClasses((prev) => {
      const cls = prev.find((c) => c.id === classId);
      if (!cls) return prev;

      const ids = cls.studentIds || [];
      const names = cls.studentNames || [];

      const matches = (id, name) =>
        (ids.length > 0 && id === numericId) ||
        (studentFullName && normalizeText(name) === normalizeText(studentFullName));

      const newStudentNames = names.filter((name, i) => !matches(ids[i], name));
      const newStudentIds = ids.filter((id, i) => !matches(id, names[i] || ''));

      if (newStudentNames.length === 0) {
        return prev.map((c) => c.id === classId
          ? { ...c, studentNames: [], studentIds: [], studentName: '', studentId: undefined }
          : c);
      }

      return prev.map((c) => c.id === classId ? {
        ...c,
        studentNames: newStudentNames,
        studentIds: newStudentIds,
        studentName: newStudentNames[0] || c.studentName,
        studentId: c.studentId === numericId ? (newStudentIds[0] || c.studentId) : c.studentId,
      } : c);
    });

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
