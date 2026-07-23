import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TrendingUp, TrendingDown } from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function KpiCard({ title, value, trend, trendValue, icon: Icon, className }) {
  const isPositive = trend === "up";
  
  return (
    <div className={cn("bg-white border border-admin-outline-variant rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)]", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-admin-on-surface-variant tracking-wider uppercase">{title}</h3>
        {Icon && (
          <div className="p-2 bg-admin-surface-container-low rounded-lg text-admin-primary">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-[32px] leading-tight font-bold text-admin-on-surface tracking-tight">
          {value}
        </div>
        {trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
