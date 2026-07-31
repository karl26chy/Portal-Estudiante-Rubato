import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabButton from '../../components/TabButton';
import DataTable from '../../components/DataTable';
import StudentForm from '../../components/forms/StudentForm';
import TeacherForm from '../../components/forms/TeacherForm';
import AdminForm from '../../components/forms/AdminForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserCard from '../../components/UserCard';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../../components/Toast';
import { Shield, RefreshCw, UserCheck, Edit, Trash2, Mail, Key, Copy, Check, X, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null, type: null });
  
  // Estado para la tarjeta modal de credenciales generadas
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  const {
    students,
    teachers,
    admins,
    currentAdmin,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    setCurrentAdmin
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
    }
    setConfirmDialog({ isOpen: false, item: null, type: null });
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
          {val} años {row.birthdate ? `(${row.birthdate})` : ''}
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
    { key: 'email', label: 'Correo' },
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
                Gestión integral de la Fundación Rubato (Estudiantes, Docentes y SuperAdmins)
              </p>
            </div>

            {/* Simular Sesión / Estado Admin Activo (SuperAdmin) */}
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6b0060]">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">{currentAdmin?.name || 'Administrador'}</p>
                <p className="text-[#6b0060] font-semibold">SuperAdmin</p>
              </div>
              <button
                onClick={handleSimulateNextAdmin}
                className="ml-2 p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-[#6b0060] transition-colors cursor-pointer"
                title="Simular Cambio de Sesión de Administrador"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-2 flex-wrap">
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
              </div>
            </div>

            {/* Columna Derecha: Vista / Directorio */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'students' && 'Directorio de Estudiantes'}
                {activeTab === 'teachers' && 'Directorio de Docentes'}
                {activeTab === 'admins' && 'Administradores Registrados (SuperAdmin)'}
              </h2>

              {/* 1. Tabla de Estudiantes */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 overflow-x-auto">
                  <DataTable
                    columns={studentColumns}
                    data={students}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setActiveTab('students');
                    }}
                    onDelete={handleDeleteStudent}
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
                    />
                  ))}
                </div>
              )}

              {/* 3. Lista de Administradores (Rol Único SuperAdmin) */}
              {activeTab === 'admins' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">
                        Sesión Activa Simulada
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {currentAdmin?.name} — <span className="text-[#6b0060]">SuperAdmin</span>
                      </p>
                    </div>
                    <button
                      onClick={handleSimulateNextAdmin}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer"
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
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Modal / Tarjeta con Información de Acceso (Credenciales de Estudiante) */}
      {generatedCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#6b0060]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg font-['Playfair_Display',serif]">
                    Credenciales Generadas
                  </h3>
                  <p className="text-xs text-slate-500">Acceso automático de estudiante</p>
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
                Estudiante: <span className="font-bold text-slate-900">{generatedCredentialsModal.studentName}</span>
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
                <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-2.5 px-3">
                  <span className="text-sm font-bold text-slate-900 tracking-wider">
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
