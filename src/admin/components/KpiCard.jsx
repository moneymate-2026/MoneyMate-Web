import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TrendingUp, TrendingDown } from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function KpiCard({ title, value, trend, trendValue, icon: Icon, className }) {
  const isPositive = trend === "up";
  
  return (
    <div className={cn("bg-admin-surface-container border border-admin-outline-variant rounded-xl p-5 shadow-lg", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-admin-on-surface-variant tracking-wider uppercase">{title}</h3>
        {Icon && (
          <div className="p-2 bg-admin-surface-container-high rounded-lg text-admin-primary shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-[32px] leading-tight font-bold text-admin-on-surface tracking-tight drop-shadow-sm">
          {value}
        </div>
        {trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border",
            isPositive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
