"use client";
import React from "react";

type Column<T = any> =
  | string
  | {
      header: string;
      accessorKey?: keyof T | string;
      accessor?: keyof T | string | ((row: T) => React.ReactNode);
      cell?: (row: T) => React.ReactNode;
    };

type Props<T = any> = {
  columns?: Column<T>[];
  data?: T[];
  keyExtractor?: (row: T) => string | number;
};

export function DataTable<T>({
  columns = [],
  data = [],
  keyExtractor = (r: any) => (r.id as any) ?? Math.random(),
}: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="p-2 text-sm text-slate-500">
                {typeof c === "string" ? c : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(keyExtractor(row))} className="border-t">
              {columns.map((c, i) => {
                if (typeof c === "string") {
                  return (
                    <td key={i} className="p-2 text-sm">
                      {(row as any)[c]}
                    </td>
                  );
                }

                const content = c.cell
                  ? c.cell(row)
                  : typeof c.accessor === "function"
                  ? c.accessor(row)
                  : c.accessor
                  ? (row as any)[c.accessor]
                  : c.accessorKey
                  ? (row as any)[c.accessorKey]
                  : null;

                return (
                  <td key={i} className="p-2 text-sm">
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
