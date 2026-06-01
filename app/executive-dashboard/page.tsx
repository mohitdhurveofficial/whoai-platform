import React from "react";
import { PageContainer } from "@/app/components/ui/PageContainer";
import ExecutiveDashboard from "@/app/dashboard/ExecutiveDashboard";

export const metadata = {
  title: "Executive Dashboard | WHOAI",
  description: "Board-ready AI governance metrics and compliance reporting.",
};

export default function ExecutiveDashboardPage() {
  return (
    <PageContainer>
      <ExecutiveDashboard />
    </PageContainer>
  );
}
