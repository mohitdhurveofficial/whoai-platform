import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-700 shadow-sm shadow-slate-200/30">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Nothing to review</p>
      <h3 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
