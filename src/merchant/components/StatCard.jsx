import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconColorClass = 'text-primary bg-primary/10', 
  borderClass = 'border-l-primary', 
  trend 
}) {
  return (
    <div className={`bg-surface-container backdrop-blur-md rounded-xl p-4 flex flex-col justify-between border border-outline-variant/30 border-l-4 ${borderClass} shadow-[0_4px_20px_rgba(108,56,248,0.05)]`}>
      <div className="flex justify-between items-start">
        <p className="font-label-md text-label-md text-on-surface-variant">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-headline-md text-headline-md text-on-background font-semibold text-2xl">{value}</h3>
        {trend && (
          <p className={`font-body-sm text-body-sm mt-1 flex items-center gap-1 ${
            trend.type === 'up' ? 'text-tertiary' : 'text-on-surface-variant'
          }`}>
            {trend.type === 'up' && (
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            )}
            {trend.text}
          </p>
        )}
      </div>
    </div>
  );
}
