"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { IncidentsListSkeleton } from "@/components/skeletons/incident-skeleton";
import { BackendStatusBanner } from "@/components/ui/backend-status-banner";

interface Incident {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  snapshot_id?: string;
  root_cause?: string;
  patch_diff_key?: string;
  patch_diff?: string;
  pr_url?: string;
  validation_status?: boolean;
  repo_name?: string;
  file_path?: string;
  autopsy?: AutopsyResult;
}

interface AutopsyResult {
  root_cause_text: string;
  commit_hash: string;
  file_path: string;
  line_range: string;
  suggested_patch: {
    file_path: string;
    language: string;
    patch_diff: string;
  };
  confidence: number;
  fix_prompt?: string;
  manual_steps?: string[];
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const response = await axios.get("/api/incidents");
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error("Failed to load incidents", error);
      toast.error("Failed to load incidents");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      detected: { variant: "outline", icon: AlertCircle },
      analyzing: { variant: "secondary", icon: Clock },
      patching: { variant: "secondary", icon: FileText },
      validating: { variant: "secondary", icon: Clock },
      resolved: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[status] || variants.detected;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SignedIn>
            <BackendStatusBanner checkInterval={30000} />

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Incidents
              </h1>
              <p className="text-muted-foreground mt-2">
                View and manage detected incidents across your projects.
              </p>
            </div>

            {isLoading ? (
              <IncidentsListSkeleton count={3} />
            ) : incidents.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No incidents detected</h3>
                  <p className="text-muted-foreground text-sm">
                    Your applications are running smoothly!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </SignedIn>

          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    if (incident.autopsy?.fix_prompt) {
      navigator.clipboard.writeText(incident.autopsy.fix_prompt);
      setCopied(true);
      toast.success("Fix prompt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      detected: { variant: "outline", icon: AlertCircle },
      analyzing: { variant: "secondary", icon: Clock },
      patching: { variant: "secondary", icon: FileText },
      validating: { variant: "secondary", icon: Clock },
      resolved: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[status] || variants.detected;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              {getStatusBadge(incident.status)}
            </div>
            <CardDescription className="font-mono text-xs">
              ID: {incident.id}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{new Date(incident.created_at).toLocaleDateString()}</div>
            <div className="text-xs">
              {new Date(incident.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
          <div>
            <span className="text-muted-foreground block mb-1">
              Repository:
            </span>
            <div className="font-medium flex items-center gap-2">
              {incident.repo_name ? (
                <>
                  <Github className="h-4 w-4" />
                  {incident.repo_name}
                </>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">File:</span>
            <div className="font-medium font-mono text-xs truncate">
              {incident.file_path || incident.autopsy?.file_path || (
                <span className="text-muted-foreground">Analyzing...</span>
              )}
            </div>
          </div>
        </div>

        {incident.autopsy && (
          <>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Root Cause Analysis</h4>
                <Badge variant="outline">
                  {(incident.autopsy.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {incident.autopsy.root_cause_text}
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                📍 Location: {incident.autopsy.file_path}:
                {incident.autopsy.line_range}
              </div>
            </div>

            {incident.autopsy.fix_prompt && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    🤖 AI Fix Prompt (Paste into Agent)
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPrompt}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">Copy</span>
                  </Button>
                </div>
                <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-x-auto whitespace-pre-wrap border border-blue-100 dark:border-blue-800">
                  {incident.autopsy.fix_prompt}
                </pre>
              </div>
            )}

            {incident.autopsy.manual_steps &&
              incident.autopsy.manual_steps.length > 0 && (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-4 border border-orange-200 dark:border-orange-900">
                  <h4 className="font-medium text-sm text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                    🔧 Manual Fix Steps
                  </h4>
                  <ul className="list-decimal list-inside space-y-2 text-sm text-orange-900 dark:text-orange-200">
                    {incident.autopsy.manual_steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {(incident.patch_diff || incident.autopsy.suggested_patch) && (
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm flex items-center gap-2 hover:text-primary p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-4 w-4" />
                  View Suggested Patch
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-x-auto border">
                  {incident.patch_diff ||
                    incident.autopsy.suggested_patch?.patch_diff}
                </pre>
              </details>
            )}
          </>
        )}

        {!incident.autopsy && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Analysis in progress...
              </span>
            </div>
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
              Root cause analysis and fix suggestions will appear here once
              complete.
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/export/${incident.id}`} target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </a>
          </Button>
          {incident.pr_url && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={incident.pr_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                View PR
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
