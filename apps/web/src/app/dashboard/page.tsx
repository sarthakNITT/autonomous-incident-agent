"use client";

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
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
import { Plus, Github, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Project } from "@repo/types";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");

  useEffect(() => {
    if (user?.id) {
      loadProjects(user.id);
    }
  }, [user?.id]);

  const loadProjects = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:3003/projects/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to load projects", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const res = await fetch("http://localhost:3003/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          repoUrl,
          githubToken,
          openaiApiKey: openaiKey,
          baseBranch,
        }),
      });

      if (res.ok) {
        toast.success("Project created successfully");
        setShowForm(false);
        setName("");
        setRepoUrl("");
        setGithubToken("");
        setOpenaiKey("");
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
                        <Input
                          id="branch"
                          placeholder="main"
                          value={baseBranch}
                          onChange={(e) => setBaseBranch(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="repo">GitHub Repository URL</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="repo"
                            className="pl-9"
                            placeholder="https://github.com/username/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            required
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
                        />
                        <p className="text-xs text-muted-foreground">
                          Required for creating PRs. Can be set globally via
                          env.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai">
                          OpenAI Format Key (Optional)
                        </Label>
                        <Input
                          id="openai"
                          type="password"
                          placeholder="sk-..."
                          value={openaiKey}
                          onChange={(e) => setOpenaiKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Override default AI provider key.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
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
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
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
