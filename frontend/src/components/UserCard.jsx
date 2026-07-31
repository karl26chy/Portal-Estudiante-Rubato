import React from 'react';
import { Mail, Edit, Trash2, Eye } from 'lucide-react';

export default function UserCard({
  name,
  email,
  subtitle,
  badge,
  icon: Icon,
  iconColorClass = 'text-[#6b0060]',
  iconBgClass = 'bg-purple-100',
  onEdit,
  onDelete,
  onViewCredentials,
  layout = 'vertical',
  highlighted = false
}) {
  const borderClass = highlighted ? 'border-[#6b0060] shadow-sm ring-1 ring-[#6b0060]/20' : 'border-slate-200';

  if (layout === 'horizontal') {
    return (
      <div className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between hover:shadow-md ${borderClass}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-bold text-slate-800 text-sm truncate">{name}</p>
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
            {email && <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 pl-3 shrink-0">
          {badge && (
            <div className="hidden sm:block">
              {badge}
            </div>
          )}
          
          {(onEdit || onDelete || onViewCredentials) && (
            <div className="flex items-center gap-1">
              {onViewCredentials && (
                <button
                  onClick={onViewCredentials}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Ver credenciales"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 text-slate-500 hover:text-[#6b0060] rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical Layout (Default)
  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${borderClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800 truncate max-w-[200px]">{name}</p>
            {badge && <div className="mt-0.5">{badge}</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {email && (
            <>
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[150px]">{email}</span>
            </>
          )}
        </div>
        
        {(onEdit || onDelete || onViewCredentials) && (
          <div className="flex items-center gap-1 shrink-0">
            {onViewCredentials && (
              <button
                onClick={onViewCredentials}
                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Ver credenciales"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-slate-500 hover:text-[#6b0060] rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
