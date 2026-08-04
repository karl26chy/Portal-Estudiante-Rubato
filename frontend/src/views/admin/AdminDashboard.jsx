import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabButton from '../../components/TabButton';
import DataTable from '../../components/DataTable';
import StudentForm from '../../components/forms/StudentForm';
import TeacherForm from '../../components/forms/TeacherForm';
import AdminForm from '../../components/forms/AdminForm';
import ClassForm, { formatTime12h } from '../../components/forms/ClassForm';
import ClassCard from '../../components/ClassCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserCard from '../../components/UserCard';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../../components/Toast';
import { Shield, RefreshCw, UserCheck, Copy, Check, X, Sparkles, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, type: null });
  
  // Estado para la tarjeta modal de credenciales generadas
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Estado para visibilidad de contraseñas individuales en la tabla (icono de ojo 👁️)
  const [visiblePasswords, setVisiblePasswords] = useState({});

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
    deleteClass
  } = useDataManager();

  const { addToast } = useToast();

  // --- Handlers de Envío ---
  const handleStudentSubmit = (data) => {
    if (editingItem) {
      updateStudent(editingItem.id, data);
      addToast(`Estudiante "${data.name}" actualizado correctamente`, 'success');
    } else {
      const createdStudent = addStudent(data);
      addToast(`Estudiante "${data.name}" registrado correctamente`, 'success');

      // Si se generaron credenciales, mostrar la tarjeta de información de acceso
      if (data.credentials) {
        setGeneratedCredentialsModal({
          studentName: data.name,
          usuario: data.credentials.usuario,
          password: data.credentials.password,
        });
      }
    }
    setEditingItem(null);
  };

  const handleTeacherSubmit = (data) => {
    if (editingItem) {
      updateTeacher(editingItem.id, data);
      addToast(`Docente "${data.name}" actualizado correctamente`, 'success');
    } else {
      addTeacher(data);
      addToast(`Docente "${data.name}" registrado correctamente`, 'success');
    }
    setEditingItem(null);
  };

  const handleAdminSubmit = (data) => {
    if (editingItem) {
      updateAdmin(editingItem.id, data);
      addToast(`Administrador "${data.name}" actualizado correctamente`, 'success');
    } else {
      addAdmin(data);
      addToast(`Administrador (SuperAdmin) "${data.name}" registrado correctamente`, 'success');
    }
    setEditingItem(null);
  };

  const handleClassSubmit = (classData) => {
    addClass(classData);
    addToast(`Clase de "${classData.subject}" creada y programada correctamente`, 'success');
  };

  const handleDeleteClass = (classItem) => {
    setConfirmDialog({ isOpen: true, item: classItem, type: 'class' });
  };

  // --- Handlers de Eliminación ---
  const handleDeleteStudent = (student) => {
    setConfirmDialog({ isOpen: true, item: student, type: 'student' });
  };

  const handleDeleteTeacher = (teacher) => {
    setConfirmDialog({ isOpen: true, item: teacher, type: 'teacher' });
  };

  const handleDeleteAdmin = (admin) => {
    setConfirmDialog({ isOpen: true, item: admin, type: 'admin' });
  };

  const confirmDelete = () => {
    const { item, type } = confirmDialog;
    if (!item) return;

    if (type === 'student') {
      deleteStudent(item.id);
      addToast(`Estudiante "${item.name}" eliminado`, 'warning');
    } else if (type === 'teacher') {
      deleteTeacher(item.id);
      addToast(`Docente "${item.name}" eliminado`, 'warning');
    } else if (type === 'admin') {
      deleteAdmin(item.id);
      addToast(`Administrador "${item.name}" eliminado`, 'warning');
    } else if (type === 'class') {
      deleteClass(item.id);
      addToast(`Clase de "${item.subject}" eliminada`, 'warning');
    }
    setConfirmDialog({ isOpen: false, item: null, type: null });
  };

  const handleViewCredentials = async (item) => {
    let pass = item.password || item.credentials?.password;
    let user = item.username || item.credentials?.usuario;

    if (!pass) {
      try {
        const response = await fetch(`/api/auth/credentials/${item.id}`);
        if (response.ok) {
          const data = await response.json();
          pass = data.password;
        }
      } catch {
        pass = 'Rubato.2026*';
      }
    }
    if (!pass) pass = 'Rubato.2026*';
    if (!user) user = item.name ? item.name.toLowerCase().split(' ')[0] + '.rubato48' : 'usuario';

    setGeneratedCredentialsModal({
      studentName: item.name,
      usuario: user,
      password: pass,
      title: 'Credenciales del Usuario',
      subtitle: `Acceso para ${item.role || 'usuario'}`
    });
  };

  // --- Función para Simular Sesión (Cambiar Admin Activo) ---
  const handleSimulateNextAdmin = () => {
    if (!admins || admins.length === 0) {
      addToast('No hay administradores disponibles para alternar', 'warning');
      return;
    }
    const currentIndex = admins.findIndex(a => a.id === currentAdmin?.id);
    const nextIndex = (currentIndex + 1) % admins.length;
    const nextAdmin = admins[nextIndex];
    setCurrentAdmin(nextAdmin);
    addToast(`Sesión activa simulada como: ${nextAdmin.name} (SuperAdmin)`, 'success');
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

  // Columnas para DataTable de Estudiantes
  const studentColumns = [
    { key: 'name', label: 'Nombre' },
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
          {val || row.celular || '3001234567'}
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

          {/* Encabezado del Módulo */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 font-['Playfair_Display',serif]">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Gestión integral de la Fundación Rubato (Estudiantes, Docentes, Administradores y Clases)
              </p>
            </div>

            {/* Simular Sesión / Estado Admin Activo (SuperAdmin) */}
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6b0060] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs min-w-0">
                <p className="font-bold text-slate-800 truncate">{currentAdmin?.name || 'Administrador'}</p>
                <p className="text-[#6b0060] font-semibold">SuperAdmin</p>
              </div>
              <button
                onClick={handleSimulateNextAdmin}
                className="ml-2 p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-[#6b0060] transition-colors cursor-pointer shrink-0"
                title="Simular Cambio de Sesión de Administrador"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas */}
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
            </div>
          </div>

          {/* Grid de Formulario (Izquierda) y Lista / Directorio (Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Columna Izquierda: Formulario en Tarjeta */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'students' && (editingItem ? 'Editar Estudiante' : 'Registrar Estudiante')}
                {activeTab === 'teachers' && (editingItem ? 'Editar Docente' : 'Registrar Docente')}
                {activeTab === 'admins' && (editingItem ? 'Editar Administrador' : 'Registrar Administrador (SuperAdmin)')}
                {activeTab === 'classes' && 'Crear Nueva Clase (Exclusivo Administrador)'}
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
                    onSubmit={handleClassSubmit}
                  />
                )}
              </div>
            </div>

            {/* Columna Derecha: Vista / Directorio */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'students' && 'Directorio de Estudiantes'}
                {activeTab === 'teachers' && 'Directorio de Docentes'}
                {activeTab === 'admins' && 'Administradores Registrados (SuperAdmin)'}
                {activeTab === 'classes' && 'Clases Creadas y Programadas'}
              </h2>

              {/* 1. Tabla de Estudiantes */}
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
                  />
                </div>
              )}

              {/* 2. Grid Responsivo de Tarjetas de Docentes */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachers.map((t) => (
                    <UserCard
                      key={t.id}
                      name={t.name}
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

              {/* 3. Lista de Administradores (Rol Único SuperAdmin) */}
              {activeTab === 'admins' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">
                      Sesión Activa Simulada
                    </p>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {currentAdmin?.name} — <span className="text-[#6b0060]">SuperAdmin</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSimulateNextAdmin}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer shrink-0 w-full sm:w-auto justify-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Simular Siguiente</span>
                  </button>
                </div>

                  <div className="space-y-3">
                    {admins.map((a) => (
                      <UserCard
                        key={a.id}
                        name={a.name}
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

              {/* 4. Lista de Clases Creadas */}
              {activeTab === 'classes' && (
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
                  {classes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No hay clases creadas aún.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classes.map((cls) => (
                        <div key={cls.id} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all bg-white shadow-xs">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div className="min-w-0">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-[#6b0060] mb-1">
                                {cls.module || 'Módulo Pénsum'} {cls.semester ? `• ${cls.semester}` : ''}
                              </span>
                              <h3 className="font-bold text-slate-900 text-base break-words">{cls.subject}</h3>
                            </div>
                            <button
                              onClick={() => handleDeleteClass(cls)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Eliminar Clase"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                            <p><strong>Docente:</strong> {cls.teacherName || cls.profesor || 'Por asignar'}</p>
                            <p><strong>Horario:</strong> {cls.horario && (cls.horario.includes('AM') || cls.horario.includes('PM')) ? cls.horario : `${cls.day || 'Lunes'} ${formatTime12h(cls.startTime || '08:00')} - ${formatTime12h(cls.endTime || '10:00')}`}</p>
                          </div>

                          {cls.studentNames && cls.studentNames.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100">
                              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Estudiantes Inscritos ({cls.studentNames.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {cls.studentNames.map((name, i) => (
                                  <span key={i} className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Modal / Tarjeta con Información de Acceso (Credenciales de Estudiante) */}
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

              {/* Usuario */}
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

              {/* Contraseña */}
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

      {/* Dialogo de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null, type: null })}
        message={
          confirmDialog.type === 'student'
            ? `¿Está seguro de eliminar al estudiante "${confirmDialog.item?.name}"?`
            : confirmDialog.type === 'teacher'
            ? `¿Está seguro de eliminar al docente "${confirmDialog.item?.name}"?`
            : `¿Está seguro de eliminar al administrador (SuperAdmin) "${confirmDialog.item?.name}"?`
        }
      />

      <Footer />
    </div>
  );
}
