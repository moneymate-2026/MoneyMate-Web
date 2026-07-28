import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DataTable({ columns, data, className, maxHeight = "520px", stickyHeader = true }) {
  return (
    <div 
      className={cn("w-full overflow-y-auto border border-admin-outline-variant rounded-xl bg-white shadow-sm relative custom-scrollbar", className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full text-sm text-left table-auto">
        <thead className={cn(
          "text-xs text-admin-on-surface-variant uppercase bg-admin-surface-container-low border-b border-admin-outline-variant",
          stickyHeader && "sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        )}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-3.5 py-3 font-semibold tracking-wider bg-admin-surface-container-low text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-outline-variant/60">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-admin-surface/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-3.5 py-3 text-admin-on-surface align-middle">
                  {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-admin-on-surface-variant font-medium">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
