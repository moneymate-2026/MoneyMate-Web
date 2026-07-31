import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DataTable({ columns, data, className, maxHeight = "520px", stickyHeader = true }) {
  return (
    <div 
      className={cn("w-full overflow-y-auto border border-admin-outline-variant rounded-xl bg-admin-surface-container shadow-lg relative custom-scrollbar", className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full text-sm text-left table-auto">
        <thead className={cn(
          "text-[11px] font-bold text-admin-on-surface-variant uppercase bg-admin-surface-container-low border-b border-admin-outline-variant tracking-wider",
          stickyHeader && "sticky top-0 z-10 shadow-md"
        )}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 bg-admin-surface-container-low text-left whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-outline-variant/60">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-admin-surface-container-high/40 transition-colors">
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
