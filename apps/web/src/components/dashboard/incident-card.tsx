import Link from "next/link";
import type { Incident } from "@repo/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "./status-badge";

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const formattedDate = new Date(incident.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Link href={`/dashboard/incidents/${incident.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{incident.title}</CardTitle>
            <StatusBadge status={incident.status} />
          </div>
          <CardDescription>
            {incident.repo_name && `${incident.repo_name} • `}
            {formattedDate}
          </CardDescription>
        </CardHeader>
        {incident.root_cause && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {incident.root_cause}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
