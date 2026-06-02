import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function ChartCard({ title, description, children, footer }: ChartCardProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
          {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        </div>
        {footer ? <div>{footer}</div> : null}
      </div>
      <div className="min-h-[250px]">{children}</div>
    </div>
  );
}
