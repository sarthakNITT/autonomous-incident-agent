"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchArtifact } from "@/lib/api";

interface PatchViewerProps {
  patchUrl?: string;
}

export function PatchViewer({ patchUrl }: PatchViewerProps) {
  const [patchContent, setPatchContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patchUrl) return;

    setLoading(true);
    setError(null);

    fetchArtifact(patchUrl)
      .then(setPatchContent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [patchUrl]);

  if (!patchUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patch Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No patch available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patch Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading patch...</p>
        )}
        {error && (
          <p className="text-sm text-muted-foreground">Error: {error}</p>
        )}
        {patchContent && (
          <ScrollArea className="h-96 w-full rounded-md border bg-muted/30 p-4">
            <code className="text-xs font-mono whitespace-pre">
              {patchContent}
            </code>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
