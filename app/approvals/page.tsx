import React from "react";
import { ApprovalsClient } from "./ApprovalsClient";

export const metadata = {
  title: "Approvals Center | WHOAI",
  description: "Review, approve, or escalate AI workforce decisions requiring human oversight.",
};

export default function ApprovalsPage() {
  return <ApprovalsClient />;
}