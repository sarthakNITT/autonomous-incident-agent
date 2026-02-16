"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderGit2, AlertCircle, Activity } from "lucide-react";

interface UserStats {
  totalProjects: number;
  totalIncidents: number;
  activeIncidents: number;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    createdAt: string;
    lastSignInAt: string | null;
  };
}

export function UserProfileCard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      const response = await axios.get("/api/user/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load user stats", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!isLoaded || isLoadingStats) {
    return <UserProfileCardSkeleton />;
  }

  if (!user || !stats) {
    return null;
  }

  const getInitials = () => {
    const firstName = user.firstName || stats.user.firstName || "";
    const lastName = user.lastName || stats.user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.imageUrl || stats.user.imageUrl || ""}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {user.firstName || stats.user.firstName}{" "}
              {user.lastName || stats.user.lastName}
            </CardTitle>
            <CardDescription className="text-sm">
              {user.primaryEmailAddress?.emailAddress || stats.user.email}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Last sign in: {formatDate(stats.user.lastSignInAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold">{stats.totalProjects}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.totalProjects === 1 ? "Project" : "Projects"}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold">
                {stats.activeIncidents}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold">{stats.totalIncidents}</span>
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserProfileCardSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
