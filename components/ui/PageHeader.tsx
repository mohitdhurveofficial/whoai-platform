import type { ReactNode } from "react";
import { PageHeader as AppPageHeader } from "@/app/components/ui/PageHeader";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  action?: ReactNode;
};

export function PageHeader({ title, description, actions, action }: PageHeaderProps) {
  return <AppPageHeader title={title} description={description} actions={actions ?? action} />;
}
