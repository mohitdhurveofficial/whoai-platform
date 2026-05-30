"use client";
import React from "react";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function SectionCard({ title, description, children }: Props) {
  return (
    <section className="bg-white rounded-xl p-6 border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
