import React from "react";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout>{children}</WorkspaceLayout>
  );
}