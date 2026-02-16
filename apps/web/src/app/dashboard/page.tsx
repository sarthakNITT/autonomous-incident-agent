"use client";

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Github, Lock, Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProjectsGridSkeleton } from "@/components/skeletons/project-skeleton";

import { Project } from "@repo/types";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [incidentCount, setIncidentCount] = useState(0);

  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [resolutionMode, setResolutionMode] = useState("manual");
  const [branches, setBranches] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProjects(user.id);
      loadIncidents();
    }
  }, [user?.id]);

  const loadIncidents = async () => {
    try {
      const response = await axios.get("/api/incidents");
      setIncidentCount(response.data.incidents.length);
    } catch (error) {
      console.error("Failed to load incidents", error);
    }
  };

  const loadProjects = async (userId: string) => {
    try {
      const response = await axios.get(`/api/projects/user/${userId}`);
      const projectsData = Array.isArray(response.data)
        ? response.data
        : response.data.projects || [];
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects", error);
      if (error && (error as any).response?.status !== 404) {
        toast.error("Failed to load projects");
      }
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectRepo = async () => {
    if (!repoUrl) {
      toast.error("Please enter a repository URL");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await axios.post("/api/github/branches", {
        repoUrl,
        githubToken,
      });

      setBranches(response.data.branches);
      setIsConnected(true);
      if (response.data.branches.length > 0) {
        setBaseBranch(response.data.branches[0]);
      }
      toast.success("Repository connected successfully");
    } catch (error: any) {
      console.error("Failed to connect repository", error);
      toast.error(
        error.response?.data?.error || "Failed to connect to repository",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
      const response = await axios.post(`${apiUrl}/projects`, {
        userId: user.id,
        name,
        repoUrl,
        githubToken,
        baseBranch,
        resolutionMode,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Project created successfully");
        setShowForm(false);
        setName("");
        setRepoUrl("");
        setGithubToken("");
        setBaseBranch("main");
        setResolutionMode("manual");
        setBranches([]);
        setIsConnected(false);
        loadProjects(user.id);
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project", error);
      toast.error("Error creating project");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SignedIn>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your monitored repositories and incidents.
                </p>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? "Cancel" : "New Project"}
              </Button>
            </div>

            {showForm && (
              <Card className="mb-8 border-dashed border-2">
                <CardHeader>
                  <CardTitle>Add Repository</CardTitle>
                  <CardDescription>
                    Connect a GitHub repository to enable autonomous incident
                    resolution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    {/* Step 1: Repository Connection */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="repo">GitHub Repository URL</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="repo"
                            className="pl-9"
                            placeholder="https://github.com/username/repo"
                            value={repoUrl}
                            onChange={(e) => {
                              setRepoUrl(e.target.value);
                              setIsConnected(false);
                              setBranches([]);
                            }}
                            required
                            disabled={isConnected}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="token">GitHub Token (Optional)</Label>
                        <Input
                          id="token"
                          type="password"
                          placeholder="ghp_..."
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          disabled={isConnected}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended for private repos and creating PRs
                        </p>
                      </div>

                      {!isConnected && (
                        <Button
                          type="button"
                          onClick={handleConnectRepo}
                          disabled={isConnecting || !repoUrl}
                          className="w-full"
                        >
                          {isConnecting
                            ? "Connecting..."
                            : "Connect Repository"}
                        </Button>
                      )}
                    </div>

                    {/* Step 2: Expanded Form (after connection) */}
                    {isConnected && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                              id="name"
                              placeholder="e.g. My Website"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="branch">Base Branch</Label>
                            <select
                              id="branch"
                              value={baseBranch}
                              onChange={(e) => setBaseBranch(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {branches.map((branch) => (
                                <option key={branch} value={branch}>
                                  {branch}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resolution">Resolution Mode</Label>
                          <select
                            id="resolution"
                            value={resolutionMode}
                            onChange={(e) => setResolutionMode(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="manual">
                              Manual Fix (Provide instructions)
                            </option>
                            <option value="auto">
                              Auto PR (Automatically create pull requests)
                            </option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            Choose how incidents should be resolved
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowForm(false);
                              setIsConnected(false);
                              setBranches([]);
                              setRepoUrl("");
                              setGithubToken("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create Project"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {incidentCount > 0 && (
              <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3">
                      <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        {incidentCount} Active Incident
                        {incidentCount !== 1 ? "s" : ""}
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Detected issues requiring attention
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/incidents">
                    <Button
                      variant="outline"
                      className="border-orange-300 dark:border-orange-800"
                    >
                      View Incidents
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <ProjectsGridSkeleton count={3} />
            ) : projects.length === 0 ? (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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

function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(project.id);
    setCopied(true);
    toast.success("Project ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate">{project.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={copyId}
            title="Copy Project ID"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <CardDescription className="truncate font-mono text-xs">
          ID: {project.id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Github className="h-4 w-4" />
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:underline"
            >
              {project.repo_url.replace("https://github.com/", "")}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Auth configured</span>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-muted p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            OTel Listener Config
          </p>
          <code className="block overflow-x-auto whitespace-pre rounded bg-background p-2 text-xs font-mono text-foreground">
            OTEL_RESOURCE_ATTRIBUTES="project.id={project.id},service.name=
            {project.name}"
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
