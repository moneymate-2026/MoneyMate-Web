import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DataTable({ columns, data, className }) {
  return (
    <div className={cn("w-full overflow-x-auto border border-admin-outline-variant rounded-xl bg-white shadow-sm", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-admin-on-surface-variant uppercase bg-admin-surface-container-low border-b border-admin-outline-variant">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 font-semibold tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-admin-outline-variant last:border-0 hover:bg-admin-surface/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-admin-on-surface">
                  {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-admin-on-surface-variant">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
