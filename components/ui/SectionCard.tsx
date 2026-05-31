import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}
