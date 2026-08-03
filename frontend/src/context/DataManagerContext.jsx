import React, { createContext, useContext, useState, useEffect } from 'react';

const DataManagerContext = createContext(null);

const initialStudents = [
  { id: 1, name: "Ana López", birthdate: "2010-05-14", age: 16, instrument: "Piano", email: "ana.lopez@rubato.org" },
  { id: 2, name: "Carlos Ruiz", birthdate: "2012-08-20", age: 14, instrument: "Violín", email: "carlos.ruiz@rubato.org" },
  { id: 3, name: "María Fernández", birthdate: "2014-03-11", age: 12, instrument: "Guitarra", email: "maria.fernandez@rubato.org" },
  { id: 4, name: "Jorge Castillo", birthdate: "2016-11-05", age: 10, instrument: "Arpa", email: "jorge.castillo@rubato.org" },
  { id: 5, name: "Sofía Morales", birthdate: "2018-01-29", age: 8, instrument: "Piano", email: "sofia.morales@rubato.org" },
];

const initialProfessors = [
  { id: 1, name: "Maestro Carlos Silva", specialty: "Piano Principal", email: "c.silva@rubato.org" },
  { id: 2, name: "Dra. María González", specialty: "Violín y Cuerdas", email: "m.gonzalez@rubato.org" },
  { id: 3, name: "Prof. Laura Sánchez", specialty: "Guitarra Clásica", email: "l.sanchez@rubato.org" },
];

const initialAdmins = [
  { id: 1, name: "Director Fundación Rubato", email: "admin@rubato.org", role: "SuperAdmin" },
  { id: 2, name: "Gloria Ramírez", email: "g.ramirez@rubato.org", role: "SuperAdmin" },
  { id: 3, name: "Andrés Castro", email: "a.castro@rubato.org", role: "SuperAdmin" },
];

const initialClasses = [
  { id: 1, studentId: 1, studentName: "Ana López", subject: "Piano Avanzado", day: "Lunes", time: "16:00" },
  { id: 2, studentId: 2, studentName: "Carlos Ruiz", subject: "Violín Intermedio", day: "Martes", time: "17:30" },
  { id: 3, studentId: 3, studentName: "María Fernández", subject: "Guitarra Básica", day: "Miércoles", time: "15:00" },
];

export function DataManagerProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdminState] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // 1. Estudiantes
    const savedStudents = localStorage.getItem('rubato_students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(initialStudents);
      localStorage.setItem('rubato_students', JSON.stringify(initialStudents));
    }

    // 2. Docentes / Profesores
    const savedProfessors = localStorage.getItem('rubato_professors') || localStorage.getItem('rubato_teachers');
    if (savedProfessors) {
      const parsedProfessors = JSON.parse(savedProfessors);
      setTeachers(parsedProfessors);
      localStorage.setItem('rubato_professors', JSON.stringify(parsedProfessors));
    } else {
      setTeachers(initialProfessors);
      localStorage.setItem('rubato_professors', JSON.stringify(initialProfessors));
    }

    // 3. Administradores (Rol Único SuperAdmin)
    const savedAdmins = localStorage.getItem('rubato_admins');
    if (savedAdmins) {
      const parsedAdmins = JSON.parse(savedAdmins).map(a => ({ ...a, role: 'SuperAdmin' }));
      setAdmins(parsedAdmins);
      localStorage.setItem('rubato_admins', JSON.stringify(parsedAdmins));
    } else {
      setAdmins(initialAdmins);
      localStorage.setItem('rubato_admins', JSON.stringify(initialAdmins));
    }

    // 4. Admin Actual Simulado
    const savedCurrentAdmin = localStorage.getItem('rubato_current_admin');
    if (savedCurrentAdmin) {
      const parsedCurrentAdmin = { ...JSON.parse(savedCurrentAdmin), role: 'SuperAdmin' };
      setCurrentAdminState(parsedCurrentAdmin);
    } else {
      const defaultAdmin = initialAdmins[0];
      setCurrentAdminState(defaultAdmin);
      localStorage.setItem('rubato_current_admin', JSON.stringify(defaultAdmin));
    }

    // 5. Clases
    const savedClasses = localStorage.getItem('rubato_classes');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      setClasses(initialClasses);
      localStorage.setItem('rubato_classes', JSON.stringify(initialClasses));
    }
  }, []);

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- CRUD Estudiantes ---
  const addStudent = (student) => {
    const newStudent = { ...student, id: Date.now() };
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    saveToLocalStorage('rubato_students', newStudents);
    return newStudent;
  };

  const updateStudent = (id, updatedStudent) => {
    // Merge con el registro existente para conservar campos no enviados (p. ej. credentials)
    const newStudents = students.map(s => s.id === id ? { ...s, ...updatedStudent, id } : s);
    setStudents(newStudents);
    saveToLocalStorage('rubato_students', newStudents);
  };

  const deleteStudent = (id) => {
    const newStudents = students.filter(s => s.id !== id);
    setStudents(newStudents);
    saveToLocalStorage('rubato_students', newStudents);
    const newClasses = classes.filter(c => c.studentId !== id);
    setClasses(newClasses);
    saveToLocalStorage('rubato_classes', newClasses);
  };

  // --- CRUD Docentes / Profesores ---
  const addTeacher = (teacher) => {
    const newTeacher = { ...teacher, id: Date.now() };
    const newTeachers = [...teachers, newTeacher];
    setTeachers(newTeachers);
    saveToLocalStorage('rubato_professors', newTeachers);
    return newTeacher;
  };

  const updateTeacher = (id, updatedTeacher) => {
    const newTeachers = teachers.map(t => t.id === id ? { ...updatedTeacher, id } : t);
    setTeachers(newTeachers);
    saveToLocalStorage('rubato_professors', newTeachers);
  };

  const deleteTeacher = (id) => {
    const newTeachers = teachers.filter(t => t.id !== id);
    setTeachers(newTeachers);
    saveToLocalStorage('rubato_professors', newTeachers);
  };

  // --- CRUD Administradores (SuperAdmin) ---
  const addAdmin = (admin) => {
    const newAdmin = { ...admin, id: Date.now(), role: 'SuperAdmin' };
    const newAdmins = [...admins, newAdmin];
    setAdmins(newAdmins);
    saveToLocalStorage('rubato_admins', newAdmins);
    return newAdmin;
  };

  const updateAdmin = (id, updatedAdmin) => {
    const newAdminObj = { ...updatedAdmin, id, role: 'SuperAdmin' };
    const newAdmins = admins.map(a => a.id === id ? newAdminObj : a);
    setAdmins(newAdmins);
    saveToLocalStorage('rubato_admins', newAdmins);
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdmin(newAdminObj);
    }
  };

  const deleteAdmin = (id) => {
    const newAdmins = admins.filter(a => a.id !== id);
    setAdmins(newAdmins);
    saveToLocalStorage('rubato_admins', newAdmins);
    if (currentAdmin && currentAdmin.id === id && newAdmins.length > 0) {
      setCurrentAdmin(newAdmins[0]);
    }
  };

  const setCurrentAdmin = (adminObj) => {
    const superAdminObj = { ...adminObj, role: 'SuperAdmin' };
    setCurrentAdminState(superAdminObj);
    saveToLocalStorage('rubato_current_admin', superAdminObj);
  };

  // --- Clases ---
  const addClass = (classData) => {
    const student = students.find(s => s.id === Number(classData.studentId) || s.id === classData.studentId);
    const newClass = {
      ...classData,
      id: Date.now(),
      studentName: student ? student.name : classData.studentName || 'Estudiante',
    };
    const newClasses = [...classes, newClass];
    setClasses(newClasses);
    saveToLocalStorage('rubato_classes', newClasses);
    return newClass;
  };

  const deleteClass = (id) => {
    const newClasses = classes.filter(c => c.id !== id);
    setClasses(newClasses);
    saveToLocalStorage('rubato_classes', newClasses);
  };

  return (
    <DataManagerContext.Provider
      value={{
        students,
        teachers,
        admins,
        currentAdmin,
        classes,
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
        deleteClass,
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
