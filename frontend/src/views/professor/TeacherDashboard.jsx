import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabButton from '../../components/TabButton';
import AgendaTab from './AgendaTab';
import StudentHistoryTab from './StudentHistoryTab';
import { useAuth } from '../../context/AuthContext';
import { UserCheck } from 'lucide-react';
import { getFullName } from '../../utils/teacherUtils';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('agenda');

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 font-['Playfair_Display',serif]">
                Panel del Docente
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Resumen y agenda diaria, registro de asistencia, notas y seguimiento individual de estudiantes
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{getFullName(user)}</p>
                  <p className="text-xs text-slate-500">{user.role === 'professor' ? 'Docente' : user.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 border-b border-slate-200 pb-px">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <TabButton
                label="Resumen y Agenda Diaria"
                isActive={activeTab === 'agenda'}
                onClick={() => setActiveTab('agenda')}
              />
              <TabButton
                label="Dashboard de Estudiantes e Historial"
                isActive={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
              />
            </div>
          </div>

          {activeTab === 'agenda' ? (
            <AgendaTab />
          ) : (
            <StudentHistoryTab />
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
