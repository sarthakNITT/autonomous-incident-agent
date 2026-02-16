import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function IncidentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-64 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-3 w-96 bg-muted/70 animate-pulse rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" />
            <div className="h-3 w-20 bg-muted/70 animate-pulse rounded ml-auto" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-muted-foreground/30 animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted-foreground/20 animate-pulse rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted-foreground/20 animate-pulse rounded" />
            <div className="h-4 w-4/6 bg-muted-foreground/20 animate-pulse rounded" />
          </div>
          <div className="h-3 w-64 bg-muted-foreground/15 animate-pulse rounded" />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function IncidentsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <IncidentSkeleton key={i} />
      ))}
    </div>
  );
}
