import React from 'react';
import { WorkerStatus } from './types';
import { Badge } from '@/app/components/ui/Badge';

export default function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  const variantMap: Record<WorkerStatus, "success" | "warning" | "secondary"> = {
    Active: "success",
    Paused: "warning",
    Maintenance: "secondary",
  };

  return (
    <Badge variant={variantMap[status]} showDot>
      {status}
    </Badge>
  );
}