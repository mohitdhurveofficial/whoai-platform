"use client";
import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}
