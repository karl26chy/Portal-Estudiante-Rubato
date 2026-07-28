import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🎵</span>
          <span className="font-semibold text-slate-600">Fundación de Música Rubato</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <p className="text-slate-500">
          Autenticación JWT Segura con Cookies HttpOnly y Control de Acceso por Roles (RBAC)
        </p>
      </div>
    </footer>
  );
}
