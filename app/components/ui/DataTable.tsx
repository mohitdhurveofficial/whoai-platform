import type { ReactNode } from "react";

type TableColumn<T> = {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No records found.",
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`px-4 py-4 font-semibold text-slate-600 ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor?.(item) ?? (item as any).id ?? index}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-4 align-top ${column.className ?? ""}`}>
                    {column.cell ? column.cell(item) : String(item[column.accessor as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
