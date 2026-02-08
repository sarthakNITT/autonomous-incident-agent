import type { IncidentStatus } from "@repo/types";
import { getStatusColor } from "@/lib/api";

interface StatusBadgeProps {
  status: IncidentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorVariant = getStatusColor(status);
  const bgColor = colorVariant === "primary" ? "bg-primary" : "bg-muted";
  const textColor =
    colorVariant === "primary"
      ? "text-primary-foreground"
      : "text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
}
