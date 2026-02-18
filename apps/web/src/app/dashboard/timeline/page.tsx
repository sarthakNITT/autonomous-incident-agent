"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
  Search,
  GitPullRequest,
  Bell,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  root_cause?: string;
  pr_url?: string;
  repo_name?: string;
}

const STATUS_STEPS = [
  {
    key: "detected",
    label: "Detected",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500",
  },
  {
    key: "analyzing",
    label: "Analyzing",
    icon: Search,
    color: "text-yellow-500",
    bg: "bg-yellow-500",
  },
  {
    key: "patching",
    label: "Patching",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500",
  },
  {
    key: "validating",
    label: "Validating",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500",
  },
];

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function TimelineItem({ incident }: { incident: Incident }) {
  const currentStep = getStepIndex(incident.status);
  const isFailed = incident.status === "failed";

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            {incident.title}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            ID: {incident.id}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{new Date(incident.created_at).toLocaleDateString()}</div>
          <div className="text-xs">
            {new Date(incident.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {isFailed ? (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Incident failed to resolve
          </span>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-700"
              style={{
                width:
                  currentStep >= 0
                    ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`
                    : "0%",
              }}
            />

            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center z-10 relative"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone
                        ? `${step.bg} border-transparent text-white`
                        : "bg-background border-border text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isDone ? step.color : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      ← Now
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-4 border-t border-border">
        {incident.repo_name && (
          <Badge variant="outline" className="text-xs">
            📦 {incident.repo_name}
          </Badge>
        )}
        {incident.pr_url && (
          <a href={incident.pr_url} target="_blank" rel="noopener noreferrer">
            <Badge
              variant="secondary"
              className="text-xs flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <GitPullRequest className="h-3 w-3" />
              View PR
            </Badge>
          </a>
        )}
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.round(
            (new Date(incident.updated_at).getTime() -
              new Date(incident.created_at).getTime()) /
              60000,
          )}{" "}
          min
        </Badge>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("/api/incidents");
        setIncidents(res.data.incidents || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered =
    filter === "all" ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SignedIn>
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Incident Timeline
                </h1>
                <p className="text-muted-foreground mt-2">
                  Real-time visual progress of all incidents. Auto-refreshes
                  every 10s.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                "all",
                "detected",
                "analyzing",
                "patching",
                "resolved",
                "failed",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === "all" && ` (${incidents.length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">
                  Loading timeline...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No incidents found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {filter === "all"
                    ? "No incidents detected yet."
                    : `No ${filter} incidents.`}
                </p>
              </div>
            ) : (
              filtered.map((incident) => (
                <TimelineItem key={incident.id} incident={incident} />
              ))
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
