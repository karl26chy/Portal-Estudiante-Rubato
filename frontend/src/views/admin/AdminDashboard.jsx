import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabButton from '../../components/TabButton';
import DataTable from '../../components/DataTable';
import StudentForm from '../../components/forms/StudentForm';
import TeacherForm from '../../components/forms/TeacherForm';
import AdminForm from '../../components/forms/AdminForm';
import ClassForm, { formatTime12h } from '../../components/forms/ClassForm';
import CycleForm from '../../components/forms/CycleForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserCard from '../../components/UserCard';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../../components/Toast';
import { getLastName, getFullName } from '../../utils/teacherUtils';
import * as authApi from '../../api/authApi';
import { Shield, UserCheck, Copy, Check, X, Pencil, Sparkles, Eye, EyeOff, BookOpen, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, type: null });
  
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [studentClassesModal, setStudentClassesModal] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [removeStudentDialog, setRemoveStudentDialog] = useState(null);

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [classFilterCycle, setClassFilterCycle] = useState('');

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const {
    students,
    teachers,
    admins,
    currentAdmin,
    classes,
    cycles,
    loading,
    refresh,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    addCycle,
    updateCycle,
    closeCycle,
    deleteCycle,
    setCurrentAdmin,
    addClass,
    updateClass,
    deleteClass,
    checkClassConflict,
    removeStudentFromClass,
  } = useDataManager();

  const { addToast } = useToast();

  useEffect(() => {
    refresh();
  }, []);

  const handleStudentSubmit = async (data) => {
    if (editingItem) {
      try {
        await updateStudent(editingItem.id, data);
        addToast(`Estudiante "${getFullName(data)}" actualizado correctamente`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
        return;
      }
    } else {
      try {
        const result = await addStudent(data);
        addToast(`Estudiante "${getFullName(data)}" registrado correctamente`, 'success');
        if (result && result.data && result.data.credentials) {
          setGeneratedCredentialsModal({
            studentName: getFullName(data),
            usuario: result.data.credentials.username,
            password: result.data.credentials.password,
          });
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
    setEditingItem(null);
  };

  const handleTeacherSubmit = async (data) => {
    if (editingItem) {
      try {
        await updateTeacher(editingItem.id, data);
        addToast(`Docente "${getFullName(data)}" actualizado correctamente`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
        return;
      }
    } else {
      try {
        const result = await addTeacher(data);
        addToast(`Docente "${getFullName(data)}" registrado correctamente`, 'success');
        if (result && result.data && result.data.credentials) {
          setGeneratedCredentialsModal({
            studentName: getFullName(data),
            usuario: result.data.credentials.username,
            password: result.data.credentials.password,
            title: 'Credenciales Generadas',
            subtitle: 'Acceso para DOCENTE'
          });
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
    setEditingItem(null);
  };

  const handleAdminSubmit = async (data) => {
    if (editingItem) {
      try {
        await updateAdmin(editingItem.id, data);
        addToast(`Administrador "${getFullName(data)}" actualizado correctamente`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
        return;
      }
    } else {
      try {
        const result = await addAdmin(data);
        addToast(`Administrador (SuperAdmin) "${getFullName(data)}" registrado correctamente`, 'success');
        if (result && result.data && result.data.credentials) {
          setGeneratedCredentialsModal({
            studentName: getFullName(data),
            usuario: result.data.credentials.username,
            password: result.data.credentials.password,
            title: 'Credenciales Generadas',
            subtitle: 'Acceso para ADMIN'
          });
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
    setEditingItem(null);
  };

  const handleClassSubmit = async (classData) => {
    const conflictCheck = checkClassConflict(classData, editingItem ? editingItem.id : null);
    if (conflictCheck) {
      addToast(conflictCheck.message, 'error');
      return;
    }

    if (editingItem) {
      try {
        await updateClass(editingItem.id, classData);
        addToast(`Clase de "${classData.subject}" actualizada correctamente`, 'success');
      } catch (err) {
        console.error('Error al actualizar clase en backend:', err);
        addToast(`Error al actualizar: ${err.message}`, 'error');
      }
    } else {
      try {
        await addClass(classData);
        addToast(`Clase de "${classData.subject}" creada y programada correctamente`, 'success');
      } catch (err) {
        console.error('Error al crear clase en backend:', err);
        addToast(`Error al crear: ${err.message}`, 'error');
      }
    }
    setEditingItem(null);
  };

  const handleCycleSubmit = async (data) => {
    if (editingItem) {
      try {
        await updateCycle(editingItem.id, data);
        addToast(`Ciclo "${data.nombre}" actualizado correctamente`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
        return;
      }
    } else {
      try {
        await addCycle(data);
        addToast(`Ciclo "${data.nombre}" creado correctamente`, 'success');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
    setEditingItem(null);
  };

  const handleDeleteClass = (classItem) => {
    setConfirmDialog({ isOpen: true, item: classItem, type: 'class' });
  };

  const handleCloseCyclePrompt = (cycleItem) => {
    setConfirmDialog({ isOpen: true, item: cycleItem, type: 'cycle' });
  };

  const handleDeleteCyclePrompt = (cycleItem) => {
    setConfirmDialog({ isOpen: true, item: cycleItem, type: 'deleteCycle' });
  };

  const handleDeleteStudent = (student) => {
    setConfirmDialog({ isOpen: true, item: student, type: 'student' });
  };

  const handleDeleteTeacher = (teacher) => {
    setConfirmDialog({ isOpen: true, item: teacher, type: 'teacher' });
  };

  const handleDeleteAdmin = (admin) => {
    setConfirmDialog({ isOpen: true, item: admin, type: 'admin' });
  };

  const confirmDelete = async () => {
    const { item, type } = confirmDialog;
    if (!item) return;

    const itemName = getFullName(item);
    try {
      if (type === 'student') {
        await deleteStudent(item.id);
        addToast(`Estudiante "${itemName}" eliminado`, 'warning');
      } else if (type === 'teacher') {
        await deleteTeacher(item.id);
        addToast(`Docente "${itemName}" eliminado`, 'warning');
      } else if (type === 'admin') {
        await deleteAdmin(item.id);
        addToast(`Administrador "${itemName}" eliminado`, 'warning');
      } else if (type === 'class') {
        await deleteClass(item.id);
        addToast(`Clase de "${item.subject}" eliminada`, 'warning');
      } else if (type === 'cycle') {
        await closeCycle(item.id);
        addToast(`Ciclo "${item.nombre}" cerrado exitosamente`, 'warning');
      } else if (type === 'deleteCycle') {
        await deleteCycle(item.id);
        addToast(`Ciclo "${item.nombre}" y todos sus datos fueron eliminados definitivamente`, 'warning');
      }
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
    setConfirmDialog({ isOpen: false, item: null, type: null });
  };

  const handleViewStudentClasses = (student) => {
    const studentName = getFullName(student);
    const studentClasses = classes.filter(c =>
      (c.studentIds || []).some(id => Number(id) === Number(student.id)) ||
      (c.studentNames || []).includes(studentName)
    );
    setStudentClassesModal({ student, studentName, classes: studentClasses });
  };

  const handleRemoveStudentFromClass = async (classId, student, e) => {
    e.stopPropagation();
    const studentName = getFullName(student);
    try {
      await removeStudentFromClass(classId, student.id, studentName);
      addToast(`"${studentName}" desvinculado de la clase`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openRemoveStudentDialog = (classId, student) => {
    setRemoveStudentDialog({ classId, student });
  };

  const cancelRemoveStudentDialog = () => {
    setRemoveStudentDialog(null);
  };

  const confirmRemoveStudentFromClass = async () => {
    if (!removeStudentDialog) return;
    const { classId, student } = removeStudentDialog;
    const studentName = getFullName(student);

    try {
      await removeStudentFromClass(classId, student.id, studentName);
      addToast(`"${studentName}" desvinculado de la clase`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
    setRemoveStudentDialog(null);
  };

  const handleViewCredentials = async (item) => {
    const user = item.username || item.credentials?.username;
    let pass = item.password || item.credentials?.password;

    if (!pass) {
      try {
        const data = await authApi.getCredentials(item.dbId || item.id);
        pass = data.password;
      } catch (err) {
        addToast('No se pudieron obtener las credenciales del servidor', 'error');
        return;
      }
    }

    if (!user || !pass) {
      addToast('No se encontraron credenciales para este usuario', 'error');
      return;
    }

    setGeneratedCredentialsModal({
      studentName: getFullName(item),
      usuario: user,
      password: pass,
      title: 'Credenciales del Usuario',
      subtitle: `Acceso para ${item.role || 'usuario'}`
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast(`Copiado al portapapeles: ${text}`, 'info');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const studentColumns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (val, row) => (
        <span className="text-slate-800 font-medium text-xs">
          {getFullName(row)}
        </span>
      )
    },
    {
      key: 'age',
      label: 'Edad / F. Nacimiento',
      render: (val, row) => (
        <span className="text-slate-800 font-medium text-xs">
          {val ? `${val} años` : ''} {row.birthdate ? `(${row.birthdate})` : ''}
        </span>
      )
    },
    { key: 'email', label: 'Correo' },
    {
      key: 'phone',
      label: 'Celular',
      render: (val, row) => (
        <span className="text-slate-700 text-xs font-medium">
          {val || row.celular || '—'}
        </span>
      )
    },
    { 
      key: 'instrument', 
      label: 'Instrumento',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#6b0060]">
          {val}
        </span>
      )
    },
    {
      key: 'module',
      label: 'Módulo / Semestre',
      render: (val, row) => (
        <span className="text-xs text-slate-700 font-medium">
          {val || 'Módulo 1'} {row.semester ? `(${row.semester})` : ''}
        </span>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 font-['Playfair_Display',serif]">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Gestión integral de la Fundación Rubato (Estudiantes, Docentes, Administradores y Clases)
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6b0060] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-bold text-slate-800 truncate">{getFullName(currentAdmin) || 'Administrador'}</p>
                <p className="text-[#6b0060] font-semibold">SuperAdmin</p>
              </div>
            </div>
          </div>

          <div className="mb-6 border-b border-slate-200 pb-px">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <TabButton
                label="1. Estudiantes"
                isActive={activeTab === 'students'}
                onClick={() => {
                  setActiveTab('students');
                  setEditingItem(null);
                }}
              />
              <TabButton
                label="2. Docentes"
                isActive={activeTab === 'teachers'}
                onClick={() => {
                  setActiveTab('teachers');
                  setEditingItem(null);
                }}
              />
              <TabButton
                label="3. Administradores (SuperAdmin)"
                isActive={activeTab === 'admins'}
                onClick={() => {
                  setActiveTab('admins');
                  setEditingItem(null);
                }}
              />
              <TabButton
                label="4. Creación y Gestión de Clases (Exclusivo Admin)"
                isActive={activeTab === 'classes'}
                onClick={() => {
                  setActiveTab('classes');
                  setEditingItem(null);
                }}
              />
              <TabButton
                label="5. Ciclos Académicos"
                isActive={activeTab === 'cycles'}
                onClick={() => {
                  setActiveTab('cycles');
                  setEditingItem(null);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'students' && (editingItem ? 'Editar Estudiante' : 'Registrar Estudiante')}
                {activeTab === 'teachers' && (editingItem ? 'Editar Docente' : 'Registrar Docente')}
                {activeTab === 'admins' && (editingItem ? 'Editar Administrador' : 'Registrar Administrador (SuperAdmin)')}
                {activeTab === 'classes' && (editingItem ? 'Editar Clase' : 'Crear Nueva Clase (Exclusivo Administrador)')}
                {activeTab === 'cycles' && (editingItem ? 'Editar Ciclo Académico' : 'Crear Nuevo Ciclo Académico')}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                {activeTab === 'students' && (
                  <StudentForm
                    initialData={editingItem}
                    onSubmit={handleStudentSubmit}
                    onCancel={editingItem ? cancelEdit : undefined}
                  />
                )}
                {activeTab === 'teachers' && (
                  <TeacherForm
                    initialData={editingItem}
                    onSubmit={handleTeacherSubmit}
                    onCancel={editingItem ? cancelEdit : undefined}
                  />
                )}
                {activeTab === 'admins' && (
                  <AdminForm
                    initialData={editingItem}
                    onSubmit={handleAdminSubmit}
                    onCancel={editingItem ? cancelEdit : undefined}
                  />
                )}
                {activeTab === 'classes' && (
                  <ClassForm
                    initialData={editingItem}
                    onSubmit={handleClassSubmit}
                    onCancel={editingItem ? cancelEdit : undefined}
                    onNavigateToCycles={() => setActiveTab('cycles')}
                  />
                )}
                {activeTab === 'cycles' && (
                  <CycleForm
                    initialData={editingItem}
                    onSubmit={handleCycleSubmit}
                    onCancel={editingItem ? cancelEdit : undefined}
                  />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'students' && 'Directorio de Estudiantes'}
                {activeTab === 'teachers' && 'Directorio de Docentes'}
                {activeTab === 'admins' && 'Administradores Registrados (SuperAdmin)'}
                {activeTab === 'classes' && 'Clases Creadas y Programadas'}
                {activeTab === 'cycles' && 'Ciclos Académicos Registrados'}
              </h2>

              {activeTab === 'students' && (
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
                  <DataTable
                    columns={studentColumns}
                    data={students}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setActiveTab('students');
                    }}
                    onDelete={handleDeleteStudent}
                    onViewCredentials={handleViewCredentials}
                    onStudentClasses={handleViewStudentClasses}
                  />
                </div>
              )}

              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachers.map((t) => (
                    <UserCard
                      key={t.id}
                      name={getFullName(t)}
                      email={t.email}
                      subtitle={
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          {t.specialty || t.especialidad}
                        </span>
                      }
                      icon={UserCheck}
                      iconColorClass="text-emerald-700"
                      iconBgClass="bg-emerald-100"
                      layout="vertical"
                      onEdit={() => setEditingItem(t)}
                      onDelete={() => handleDeleteTeacher(t)}
                      onViewCredentials={() => handleViewCredentials(t)}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'admins' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {admins.map((a) => (
                      <UserCard
                        key={a.id}
                        name={getFullName(a)}
                        email={a.email}
                        icon={Shield}
                        layout="horizontal"
                        highlighted={currentAdmin?.id === a.id}
                        badge={
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-[#6b0060] border border-purple-200">
                            SuperAdmin
                          </span>
                        }
                        onEdit={() => setEditingItem(a)}
                        onDelete={() => handleDeleteAdmin(a)}
                        onViewCredentials={() => handleViewCredentials(a)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'classes' && (
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
                  {classes.length > 0 && cycles.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Filtrar por ciclo
                      </label>
                      <select
                        value={classFilterCycle}
                        onChange={(e) => setClassFilterCycle(e.target.value)}
                        className="w-full max-w-xs px-3.5 py-2 rounded-xl bg-white text-slate-700 font-medium text-sm border border-slate-300 focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 cursor-pointer"
                      >
                        <option value="">Todos los ciclos</option>
                        {cycles.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false) ? 'ABIERTO' : 'CERRADO'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {classes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No hay clases creadas aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classes
                        .filter(cls => !classFilterCycle || Number(cls.ciclo_id) === Number(classFilterCycle) || Number(cls.cicloId) === Number(classFilterCycle))
                        .map((cls) => {
                        const isExpanded = expandedClassId === cls.id;
                        const enrolledStudents = (cls.studentNames || [])
                          .map(name => {
                            const found = students.find(s => getFullName(s) === name);
                            return found || { nombre: name, apellido: '' };
                          })
                          .sort((a, b) => {
                            const aLast = getLastName(getFullName(a)).toLowerCase();
                            const bLast = getLastName(getFullName(b)).toLowerCase();
                            return aLast.localeCompare(bLast);
                          });
                        return (
                          <div
                            key={cls.id}
                            className={`rounded-xl border transition-all bg-white ${
                              isExpanded ? 'border-[#6b0060] shadow-md' : 'border-slate-200 hover:border-purple-300'
                            }`}
                          >
                            {/* Cabecera clickeable */}
                            <div className="p-4 flex justify-between items-start gap-3">
                              <button
                                onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                                className="flex-1 min-w-0 text-left cursor-pointer group"
                                title={isExpanded ? 'Cerrar detalle' : 'Ver estudiantes de la clase'}
                              >
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-[#6b0060]">
                                    {cls.module || 'Módulo Pénsum'} {cls.semester ? `• ${cls.semester}` : ''}
                                  </span>
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    {cls.cicloNombre || cls.ciclo_nombre || 'Ciclo'}
                                  </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base break-words">{cls.subject}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-500 mt-1.5">
                                  <p><strong className="text-slate-600">Docente:</strong> {cls.teacherName || cls.profesor || 'Por asignar'}</p>
                                  <p><strong className="text-slate-600">Horario:</strong> {cls.horario && (cls.horario.includes('AM') || cls.horario.includes('PM')) ? cls.horario : `${cls.day || 'Lunes'} ${formatTime12h(cls.startTime || '08:00')} - ${formatTime12h(cls.endTime || '10:00')}`}</p>
                                </div>
                                <p className="text-[11px] text-[#6b0060] font-semibold mt-1.5 flex items-center gap-1">
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  {isExpanded ? 'Ocultar estudiantes' : `Ver estudiantes (${(cls.studentNames || []).length})`}
                                </p>
                              </button>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setEditingItem(cls)}
                                  className="p-1.5 text-slate-500 hover:text-[#6b0060] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Clase"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar Clase"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Panel desplegable con estudiantes */}
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Estudiantes Matriculados ({enrolledStudents.length})
                                </p>
                                {enrolledStudents.length === 0 ? (
                                  <p className="text-sm text-slate-500 py-6 text-center">
                                    Esta clase no tiene estudiantes inscritos.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full bg-white">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Nombre</th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Instrumento</th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Módulo / Semestre</th>
                                          <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Correo</th>
                                          <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Acción</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {enrolledStudents.map((s, i) => (
                                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 text-sm font-semibold text-slate-800 whitespace-nowrap">{getFullName(s)}</td>
                                            <td className="px-3 py-2 text-xs text-slate-600">{s.instrument || '—'}</td>
                                            <td className="px-3 py-2 text-xs text-slate-600">
                                              {s.module || cls.module || 'Módulo 1'} {s.semester ? `(${s.semester})` : ''}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-600">{s.email || '—'}</td>
                                            <td className="px-3 py-2 text-center">
                                              <button
                                                onClick={() => openRemoveStudentDialog(cls.id, s)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                                                title="Desvincular estudiante de la clase"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Eliminar
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cycles' && (
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
                  {cycles.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <Layers className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No hay ciclos académicos registrados aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cycles.map((c) => {
                        const isOpen = c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false);
                        return (
                          <div
                            key={c.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-200 transition-colors shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-base">{c.nombre}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isOpen ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {isOpen ? 'ABIERTO' : 'CERRADO'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                <strong>Vigencia:</strong> {String(c.fecha_inicio).substring(0, 10)} al {String(c.fecha_fin).substring(0, 10)}
                              </p>
                              {c.cerrado_en && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Cerrado el {String(c.cerrado_en).substring(0, 10)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isOpen && (
                                <button
                                  onClick={() => setEditingItem(c)}
                                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Editar
                                </button>
                              )}
                              {isOpen && (
                                <button
                                  onClick={() => handleCloseCyclePrompt(c)}
                                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cerrar Ciclo
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCyclePrompt(c)}
                                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="Eliminar definitivamente todos los datos del ciclo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar datos del ciclo
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {generatedCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6b0060] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg font-['Playfair_Display',serif] truncate">
                    {generatedCredentialsModal.title || 'Credenciales Generadas'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {generatedCredentialsModal.subtitle || 'Acceso automático'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeneratedCredentialsModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-xs font-semibold text-slate-700">
                Usuario/Nombre: <span className="font-bold text-slate-900">{generatedCredentialsModal.studentName}</span>
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Usuario generado
                </label>
                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-2.5 px-3">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {generatedCredentialsModal.usuario}
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedCredentialsModal.usuario, 'user')}
                    className="p-1 text-[#6b0060] hover:bg-purple-100 rounded transition-colors ml-2 shrink-0 cursor-pointer"
                    title="Copiar usuario"
                  >
                    {copiedField === 'user' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Contraseña inicial
                </label>
                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-2.5 px-3 gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-wider break-all min-w-0">
                    {generatedCredentialsModal.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedCredentialsModal.password, 'pass')}
                    className="p-1 text-[#6b0060] hover:bg-purple-100 rounded transition-colors ml-2 shrink-0 cursor-pointer"
                    title="Copiar contraseña"
                  >
                    {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setGeneratedCredentialsModal(null)}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Entendido / Cerrar Tarjeta
            </button>
          </div>
        </div>
      )}

      {/* Modal: Clases del Estudiante */}
      {studentClassesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg font-['Playfair_Display',serif] truncate">
                    Clases de {studentClassesModal.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {studentClassesModal.classes.length} clase(s) inscrita(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStudentClassesModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentClassesModal.classes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Este estudiante no está inscrito en ninguna clase.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {studentClassesModal.classes.map((cls) => (
                  <div key={cls.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{cls.subject}</p>
                        <p className="text-xs text-slate-500">
                          {cls.day || '—'} · {cls.horario || `${formatTime12h(cls.startTime || '08:00')} - ${formatTime12h(cls.endTime || '10:00')}`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          handleRemoveStudentFromClass(cls.id, studentClassesModal.student, e);
                          const updated = studentClassesModal.classes.filter(c => c.id !== cls.id);
                          if (updated.length === 0) {
                            setStudentClassesModal(null);
                          } else {
                            setStudentClassesModal(prev => ({ ...prev, classes: updated }));
                          }
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remover de esta clase"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <p><strong>Docente:</strong> {cls.teacherName || cls.profesor || 'Por asignar'}</p>
                      <p><strong>Compañeros:</strong> {(cls.studentNames || []).filter(n => n !== studentClassesModal.studentName).join(', ') || 'Ninguno'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStudentClassesModal(null)}
              className="w-full mt-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null, type: null })}
        message={
          confirmDialog.type === 'student'
            ? `¿Está seguro de eliminar al estudiante "${getFullName(confirmDialog.item)}"?`
            : confirmDialog.type === 'teacher'
            ? `¿Está seguro de eliminar al docente "${getFullName(confirmDialog.item)}"?`
            : confirmDialog.type === 'class'
            ? `¿Está seguro de eliminar la clase "${confirmDialog.item?.subject || confirmDialog.item?.asignatura}"?`
            : confirmDialog.type === 'cycle'
            ? `¿Está seguro de cerrar el ciclo "${confirmDialog.item?.nombre}"? Sus datos se conservarán como registro histórico.`
            : confirmDialog.type === 'deleteCycle'
            ? `Estás a punto de eliminar todos los datos asociados a este ciclo ("${confirmDialog.item?.nombre}"). Esta acción eliminará las clases, horarios, registros y demás información relacionada con este ciclo y no podrá recuperarse. ¿Estás seguro de que deseas continuar?`
            : `¿Está seguro de eliminar al administrador "${getFullName(confirmDialog.item)}"?`
        }
      />

      {/* Modal de Confirmación: Desvincular Estudiante de la Clase */}
      <ConfirmDialog
        isOpen={!!removeStudentDialog}
        onConfirm={confirmRemoveStudentFromClass}
        onCancel={cancelRemoveStudentDialog}
        message={
          removeStudentDialog
            ? `¿Estás seguro de que deseas desvincular a "${getFullName(removeStudentDialog.student)}" de esta clase?`
            : ''
        }
      />

      <Footer />
    </div>
  );
}
