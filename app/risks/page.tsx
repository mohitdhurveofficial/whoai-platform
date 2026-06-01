import React from "react";
import { RiskClient } from "./RiskClient";

export const metadata = {
  title: "Risk Center | WHOAI",
  description: "Enterprise control room for monitoring systemic AI risk and policy violations.",
};

export default function RiskPage() {
  return <RiskClient />;
}