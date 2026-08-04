import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabButton from '../../components/TabButton';
import ClassForm from '../../components/forms/ClassForm';
import ClassCard from '../../components/ClassCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserCard from '../../components/UserCard';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../../components/Toast';
import { Calendar, User, RefreshCw, UserCheck } from 'lucide-react';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null });
  const [simulatedTeacher, setSimulatedTeacher] = useState(null);

  const { classes, students, teachers, deleteClass } = useDataManager();
  const { addToast } = useToast();

  const activeTeacher = simulatedTeacher || (teachers.length > 0 ? teachers[0] : null);

  const handleDeleteClass = (classItem) => {
    setConfirmDialog({ isOpen: true, item: classItem });
  };

  const confirmDelete = () => {
    if (confirmDialog.item) {
      deleteClass(confirmDialog.item.id);
      addToast(`Clase "${confirmDialog.item.subject}" eliminada`, 'warning');
    }
    setConfirmDialog({ isOpen: false, item: null });
  };

  const handleSimulateSession = () => {
    if (!teachers || teachers.length === 0) {
      addToast('No hay docentes registrados en el sistema', 'warning');
      return;
    }
    const currentIndex = teachers.findIndex(t => t.id === activeTeacher?.id);
    const nextIndex = (currentIndex + 1) % teachers.length;
    const nextTeacher = teachers[nextIndex];
    setSimulatedTeacher(nextTeacher);
    addToast(`Sesión simulada como: ${nextTeacher.name} (${nextTeacher.specialty || nextTeacher.especialidad})`, 'success');
  };

  const getClassesByDay = (day) => {
    return classes.filter(c => c.day === day);
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado con Simulación de Sesión de Docente */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 font-['Playfair_Display',serif]">
                Panel del Docente
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Consulta de clases asignadas, horarios de ensayo y lista de alumnos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTeacher ? (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{activeTeacher.name}</p>
                    <p className="text-xs text-slate-500">{activeTeacher.specialty || activeTeacher.especialidad}</p>
                  </div>
                  <button
                    onClick={handleSimulateSession}
                    className="ml-2 p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Simular cambio de docente activo"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSimulateSession}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Simular Sesión</span>
                </button>
              )}
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-2">
              <TabButton
                label="Mi Horario y Clases"
                isActive={activeTab === 'schedule'}
                onClick={() => setActiveTab('schedule')}
              />
              <TabButton
                label="Gestión de Clases (Info)"
                isActive={activeTab === 'notice'}
                onClick={() => setActiveTab('notice')}
              />
            </div>
          </div>

          {/* Grid de Horarios y Consulta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'notice' ? 'Gestión Exclusiva de Administrador' : 'Resumen por Día'}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                {activeTab === 'notice' ? (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-[#6b0060] space-y-2">
                    <p className="font-bold text-sm">🔒 Permiso Restringido</p>
                    <p>
                      La creación y modificación de clases es una función <strong>exclusiva del Administrador</strong>.
                    </p>
                    <p className="text-slate-600">
                      Como docente, puedes consultar tus horarios y la lista de estudiantes inscritos en el panel de la derecha.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {daysOfWeek.map((day) => {
                      const dayClasses = getClassesByDay(day);
                      return (
                        <div
                          key={day}
                          className={`p-3.5 rounded-xl border transition-all ${
                            dayClasses.length > 0
                              ? 'border-[#6b0060] bg-purple-50/50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800 text-sm">{day}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              dayClasses.length > 0 ? 'bg-[#6b0060] text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {dayClasses.length} clase(s)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                {activeTab === 'create' ? 'Clases Programadas' : 'Detalle del Horario'}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                {classes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No hay clases programadas.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#6b0060] rounded-xl hover:bg-[#52004a] transition-colors"
                    >
                      Crear Primera Clase
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((classItem) => (
                      <ClassCard
                        key={classItem.id}
                        classData={classItem}
                        onDelete={handleDeleteClass}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Directorio de Estudiantes Inscritos */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
              Directorio de Estudiantes Registrados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <UserCard
                  key={student.id}
                  name={student.name}
                  email={student.email}
                  icon={User}
                  layout="horizontal"
                  subtitle={
                    <span>
                      {student.age} años — <span className="font-semibold text-[#6b0060]">{student.instrument}</span>
                    </span>
                  }
                />
              ))}
            </div>
          </div>

        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
        message={`¿Está seguro de eliminar la clase "${confirmDialog.item?.subject}"?`}
      />

      <Footer />
    </div>
  );
}
