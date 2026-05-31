import React from "react";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";

export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout>{children}</WorkspaceLayout>
  );
}