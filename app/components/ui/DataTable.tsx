import type { ReactNode } from "react";
import { ArrowUpDown, Inbox } from "lucide-react";

type TableColumn<T> = {
  header: string;
  accessor?: keyof T;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found.",
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="whoai-card overflow-hidden">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50/90 dark:bg-slate-950/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`px-4 py-3 text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300 ${column.className ?? ""}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {column.header}
                  {column.header.trim() && <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-500" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="px-4 py-12 text-center text-slate-600 dark:text-slate-300"
                colSpan={columns.length}
              >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <Inbox className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor?.(item) ?? item.id ?? index}
                className="border-t border-slate-100 transition-colors hover:bg-orange-50/40 dark:border-slate-800 dark:hover:bg-orange-500/5"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-4 py-3.5 align-middle text-slate-700 dark:text-slate-200 ${column.className ?? ""}`}
                  >
                    {column.cell
                      ? column.cell(item)
                      : (column.accessor ?? column.accessorKey)
                        ? String(item[(column.accessor ?? column.accessorKey) as keyof T] ?? "")
                        : ""}
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

export default DataTable;
