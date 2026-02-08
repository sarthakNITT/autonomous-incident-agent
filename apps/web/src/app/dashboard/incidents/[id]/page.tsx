"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/dashboard/timeline";
import { PatchViewer } from "@/components/dashboard/patch-viewer";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getIncident, updateIncident } from "@/lib/api";
import type { Incident } from "@repo/types";
import { IncidentStatus } from "@repo/types";
import { ArrowLeft } from "lucide-react";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getIncident(id)
      .then(setIncident)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!incident) return;
    setUpdating(true);
    try {
      const updated = await updateIncident(id, {
        status: IncidentStatus.RESOLVED,
      });
      setIncident(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!incident) return;
    setUpdating(true);
    try {
      const updated = await updateIncident(id, {
        status: IncidentStatus.FAILED,
      });
      setIncident(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Loading incident...</p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">
            Error: {error || "Incident not found"}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(incident.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {incident.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {incident.repo_name && `${incident.repo_name} • `}
              {formattedDate}
            </p>
          </div>
          <StatusBadge status={incident.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline currentStatus={incident.status} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {incident.root_cause && (
              <Card>
                <CardHeader>
                  <CardTitle>Root Cause</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">
                    {incident.root_cause}
                  </p>
                </CardContent>
              </Card>
            )}

            <PatchViewer patchUrl={incident.patch_diff_key} />

            {incident.pr_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Pull Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={incident.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {incident.pr_url}
                  </a>
                </CardContent>
              </Card>
            )}

            {incident.status === "validating" && (
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={updating}
                  className="flex-1"
                >
                  Approve Patch
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={updating}
                  variant="outline"
                  className="flex-1"
                >
                  Reject Patch
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
