import React from 'react';

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColorClass = 'text-[#6b0060]',
  progressValue = '100%',
  progressColorClass = 'bg-[#6b0060]'
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">{title}</span>
        {Icon && <Icon className={`w-5 h-5 ${iconColorClass}`} />}
      </div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{description}</p>
      <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
        <div className={`${progressColorClass} h-full transition-all duration-1000`} style={{ width: progressValue }} />
      </div>
    </div>
  );
}
