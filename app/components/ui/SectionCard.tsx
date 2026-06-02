import React from "react";
import { Card } from "./Card";

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div>{children}</div>
    </Card>
  );
}

export default SectionCard;
