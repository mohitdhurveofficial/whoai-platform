import React from 'react';
import { RiskLevel } from './types';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/app/components/ui/Badge';

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const variantMap: Record<RiskLevel, "success" | "warning" | "critical"> = {
    Low: "success",
    Medium: "warning",
    High: "critical",
  };
  
  const iconMap = {
    Low: ShieldCheck,
    Medium: Shield,
    High: ShieldAlert,
  };

  return (
    <Badge variant={variantMap[level]} icon={iconMap[level]}>
      {level}
    </Badge>
  );
}