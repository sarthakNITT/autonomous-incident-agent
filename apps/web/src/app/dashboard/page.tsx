"use client";

import { useEffect, useState } from "react";
import { IncidentCard } from "@/components/dashboard/incident-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIncidents } from "@/lib/api";
import type { Incident, IncidentStatus } from "@repo/types";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    getIncidents()
      .then(setIncidents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor and manage detected incidents
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="detected">Detected</SelectItem>
              <SelectItem value="analyzing">Analyzing</SelectItem>
              <SelectItem value="patching">Patching</SelectItem>
              <SelectItem value="validating">Validating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading incidents...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Error: {error}</p>
          </div>
        )}

        {!loading && !error && filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-foreground">
              No incidents found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Incidents will appear here when detected"}
            </p>
          </div>
        )}

        {!loading && !error && filteredIncidents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
