import React from "react";
import { IdentityClient } from "./IdentityClient";
import WorkspaceLayout from "@/app/components/layouts/WorkspaceLayout";

export const metadata = {
  title: "Identity Center | WHOAI",
  description: "AI Worker Identity and Access Management",
};

export default function IdentityPage() {
  return (
    <WorkspaceLayout>
      <div className="flex-1 w-full min-h-screen p-6 md:p-10"><IdentityClient /></div>
    </WorkspaceLayout>
  );
}