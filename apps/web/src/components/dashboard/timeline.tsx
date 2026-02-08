import { IncidentStatus } from "@repo/types";
import { getStatusColor } from "@/lib/api";

interface TimelineProps {
  currentStatus: IncidentStatus;
}

const TIMELINE_STEPS: IncidentStatus[] = [
  IncidentStatus.DETECTED,
  IncidentStatus.ANALYZING,
  IncidentStatus.PATCHING,
  IncidentStatus.VALIDATING,
  IncidentStatus.RESOLVED,
];

export function Timeline({ currentStatus }: TimelineProps) {
  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      {TIMELINE_STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const colorVariant = getStatusColor(step);
        const dotColor =
          isActive || isCompleted
            ? colorVariant === "primary"
              ? "bg-primary"
              : "bg-muted"
            : "bg-background border-2 border-muted";
        const lineColor = isCompleted ? "bg-primary" : "bg-muted";

        return (
          <div key={step} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${dotColor}`} />
              {index < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-12 ${lineColor}`} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p
                className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
