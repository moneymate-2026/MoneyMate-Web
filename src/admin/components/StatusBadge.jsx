import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  error: "bg-admin-error-container text-admin-on-error-container border-red-200",
  info: "bg-admin-secondary-container text-admin-on-secondary-container border-admin-outline-variant",
  default: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function StatusBadge({ status, variant = "default", className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      variants[variant] || variants.default,
      className
    )}>
      {status}
    </span>
  );
}
