"use client";

import { useEffect, useState } from "react";
import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface BackendStatusBannerProps {
  checkInterval?: number;
}

export function BackendStatusBanner({
  checkInterval = 30000,
}: BackendStatusBannerProps) {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkBackendHealth = async () => {
    setIsChecking(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_ROUTER_URL || "";
      const healthUrl = apiUrl ? `${apiUrl}/health` : "/api/health-check";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(healthUrl, {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsBackendDown(false);
        setErrorMessage("");
      } else {
        setIsBackendDown(true);
        setErrorMessage(`Backend returned status: ${response.status}`);
      }
    } catch (error) {
      setIsBackendDown(true);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setErrorMessage("Backend health check timed out (10s)");
        } else {
          setErrorMessage(
            error.message.includes("fetch")
              ? "Cannot connect to backend service"
              : error.message,
          );
        }
      } else {
        setErrorMessage("Unknown error connecting to backend");
      }
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();

    const interval = setInterval(checkBackendHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  const handleRetry = () => {
    checkBackendHealth();
  };

  if (!isBackendDown) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className="mb-6 border-red-600 bg-red-50 dark:bg-red-950/30 dark:border-red-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="text-base font-semibold mb-1">
              Backend Service Unavailable
            </AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>
                The backend service is currently unreachable. This could be due
                to:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                <li>Scheduled maintenance</li>
                <li>Deployment in progress</li>
                <li>Network connectivity issues</li>
                <li>Service downtime</li>
              </ul>
              {errorMessage && (
                <p className="text-xs font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded mt-2">
                  Error: {errorMessage}
                </p>
              )}
              {lastChecked && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isChecking}
          className="ml-4 border-red-300 dark:border-red-800"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </>
          )}
        </Button>
      </div>
    </Alert>
  );
}
