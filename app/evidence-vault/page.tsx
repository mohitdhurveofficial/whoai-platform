import React from "react";
import { PageContainer } from "@/app/components/ui/PageContainer";
import EvidenceVault from "@/app/components/evidence-vault/EvidenceVault";

export const metadata = {
  title: "Evidence Vault | WHOAI",
  description: "Centralized audit evidence management for compliance and governance.",
};

export default function EvidenceVaultPage() {
  return (
    <PageContainer>
      <EvidenceVault />
    </PageContainer>
  );
}
