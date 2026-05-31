import React from "react";
import { tokens } from "./tokens";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, description, actions }: PageHeaderProps) {
  const supportingText = subtitle || description;

  return (
    <div className={tokens.layout.pageHeader}>
      <div>
        <h1 className={tokens.layout.pageTitle}>{title}</h1>
        {supportingText && <p className={tokens.layout.pageSubtitle}>{supportingText}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
