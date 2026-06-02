import React from "react";
import { PoliciesClient } from "./PoliciesClient";

export const metadata = {
  title: "Policies Center | WHOAI",
  description: "Define risk controls and compliance requirements for AI Workers.",
};

export default function PoliciesPage() {
  return <PoliciesClient />;
}