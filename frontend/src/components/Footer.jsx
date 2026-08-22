import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <img src="/images/rubato-logo.png" alt="Logo Fundación Rubato" className="max-h-10 w-auto" />
        <span className="font-semibold text-slate-600">Conservatorio Rubato</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
