import React from "react";
import { PageContainer } from "@/app/components/ui/PageContainer";
import PolicySimulator from "@/app/components/policy-simulator/PolicySimulator";

export const metadata = {
  title: "Policy Simulator | WHOAI",
  description: "Test policy changes against historical decisions before deployment.",
};

export default function PolicySimulatorPage() {
  return (
    <PageContainer>
      <PolicySimulator />
    </PageContainer>
  );
}
