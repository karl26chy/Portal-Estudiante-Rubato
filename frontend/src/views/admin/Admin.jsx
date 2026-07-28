import React, { useState } from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Footer from '../../components/Footer';
import { Shield, Users, Lock, Server, Plus, CheckCircle, Trash2 } from 'lucide-react';

export default function Admin() {
  const [usersList, setUsersList] = useState([
    { id: 1, nombre: 'Admin Fundación Rubato', usuario: 'admin@rubato.org', role: 'admin', activo: true },
    { id: 2, nombre: 'Maestro Carlos Silva', usuario: 'profesor@rubato.org', role: 'professor', activo: true },
    { id: 3, nombre: 'Dra. María Fernández', usuario: 'm.fernandez@rubato.org', role: 'professor', activo: true },
    { id: 4, nombre: 'Ana María Gómez', usuario: 'estudiante@rubato.org', role: 'student', activo: true },
    { id: 5, nombre: 'Mateo Morales', usuario: 'm.morales@rubato.org', role: 'student', activo: true }
  ]);

  const [newNombre, setNewNombre] = useState('');
  const [newUsuario, setNewUsuario] = useState('');
  const [newRole, setNewRole] = useState('student');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newNombre || !newUsuario) return;
    setUsersList([
      ...usersList,
      { id: Date.now(), nombre: newNombre, usuario: newUsuario, role: newRole, activo: true }
    ]);
    setNewNombre('');
    setNewUsuario('');
  };

  const handleRemoveUser = (id) => {
    setUsersList(usersList.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
        <Hero
          title="Panel de Administración Central 🛡️"
          subtitle="Gestión de accesos, asignación de roles y control de seguridad HttpOnly para el portal de la Fundación Rubato."
          roleTag="Vista Exclusiva de Administrador"
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Usuarios</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{usersList.length}</p>
            <span className="text-xs text-purple-400 mt-1 inline-block">Activos en plataforma</span>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Seguridad Cookie</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">HttpOnly</p>
            <span className="text-xs text-emerald-400 mt-1 inline-block">SameSite=Strict habilitado</span>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Servidores API</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">Express v4</p>
            <span className="text-xs text-indigo-400 mt-1 inline-block">Node.js + JWT</span>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">Nivel de Acceso</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">SuperAdmin</p>
            <span className="text-xs text-purple-400 mt-1 inline-block">Permisos totales</span>
          </div>
        </div>

        {/* Form and User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form to Register User */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" /> Registrar Nuevo Usuario
            </h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej: Maestro Juan Pérez"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Institucional</label>
                <input
                  type="email"
                  value={newUsuario}
                  onChange={(e) => setNewUsuario(e.target.value)}
                  placeholder="usuario@rubato.org"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="student">Estudiante</option>
                  <option value="professor">Profesor / Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-md shadow-purple-600/30 transition-all cursor-pointer text-sm"
              >
                Guardar Usuario
              </button>
            </form>
          </div>

          {/* User List Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Directorio de Usuarios Registraros</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-normal">
                {usersList.length} cuentas
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Usuario / Correo</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        {u.nombre}
                      </td>
                      <td className="p-3 text-slate-400">{u.usuario}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'professor'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
