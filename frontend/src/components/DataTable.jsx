import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

function ActionButtons({ row, onEdit, onDelete, onViewCredentials }) {
  return (
    <div className="flex items-center gap-1">
      {onViewCredentials && (
        <button
          onClick={() => onViewCredentials(row)}
          className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          title="Ver credenciales"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => onEdit(row)}
        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        title="Editar"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(row)}
        className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function DataTable({ columns, data, onEdit, onDelete, onViewCredentials }) {
  return (
    <>
      {/* Vista Tabla (md y superior) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">
                  No hay registros disponibles
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <ActionButtons row={row} onEdit={onEdit} onDelete={onDelete} onViewCredentials={onViewCredentials} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Tarjetas (móvil y tablet pequeña) */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No hay registros disponibles
          </div>
        ) : (
          data.map((row) => {
            const firstName = columns.find((col) => col.key === 'name')?.render
              ? columns.find((col) => col.key === 'name').render(row.name, row)
              : row.name;
            const detailFields = columns.filter((col) => col.key !== 'name' && !['phone', 'email'].includes(col.key));
            const contactFields = columns.filter((col) => ['email', 'phone'].includes(col.key));

            return (
              <div key={row.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {typeof firstName === 'string' ? firstName : row.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {contactFields.map((col) => (col.render ? col.render(row[col.key], row) : row[col.key])).filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ActionButtons row={row} onEdit={onEdit} onDelete={onDelete} onViewCredentials={onViewCredentials} />
                </div>

                {detailFields.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detailFields.map((col) => (
                      <div key={col.key} className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {col.label}
                        </p>
                        <p className="text-xs text-slate-800 font-medium truncate">
                          {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
