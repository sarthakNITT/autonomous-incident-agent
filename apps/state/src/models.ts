import { getPrisma } from "./db";
import {
  IncidentStatus,
  type Incident,
  type CreateIncidentRequest,
  type UpdateIncidentRequest,
} from "@repo/types";

export class IncidentModel {
  static async create(req: CreateIncidentRequest): Promise<Incident> {
    const prisma = getPrisma();
    const id = req.id || crypto.randomUUID();
    const status = req.status || IncidentStatus.DETECTED;

    const incident = await prisma.incident.create({
      data: {
        id,
        title: req.title,
        status,
        repoName: req.repo_name,
        filePath: req.file_path,
        snapshotId: req.snapshot_id,
        repoUrl: req.repo_url,
      },
    });

    return this.mapToIncident(incident);
  }

  static async update(
    id: string,
    req: UpdateIncidentRequest,
  ): Promise<Incident> {
    const prisma = getPrisma();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (req.status) updateData.status = req.status;
    if (req.root_cause) updateData.rootCause = req.root_cause;
    if (req.patch_diff_key) updateData.patchDiffKey = req.patch_diff_key;
    if (req.pr_url) updateData.prUrl = req.pr_url;
    if (req.validation_status !== undefined)
      updateData.validationStatus = req.validation_status;
    if (req.snapshot_id) updateData.snapshotId = req.snapshot_id;
    if (req.file_path) updateData.filePath = req.file_path;
    if (req.repo_name) updateData.repoName = req.repo_name;
    if (req.repo_url) updateData.repoUrl = req.repo_url;

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return this.mapToIncident(incident);
  }

  static async get(id: string): Promise<Incident> {
    const prisma = getPrisma();
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) throw new Error(`Incident ${id} not found`);
    return this.mapToIncident(incident);
  }

  static async list(): Promise<Incident[]> {
    const prisma = getPrisma();
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
    });

    return incidents.map(this.mapToIncident);
  }

  private static mapToIncident(incident: any): Incident {
    return {
      id: incident.id,
      title: incident.title,
      status: incident.status,
      created_at: incident.createdAt.toISOString(),
      updated_at: incident.updatedAt.toISOString(),
      snapshot_id: incident.snapshotId,
      root_cause: incident.rootCause,
      patch_diff_key: incident.patchDiffKey,
      pr_url: incident.prUrl,
      validation_status: incident.validationStatus,
      repo_name: incident.repoName,
      file_path: incident.filePath,
      repo_url: incident.repoUrl,
    };
  }
}

export class ProjectModel {
  static async create(req: {
    userId: string;
    name: string;
    repoUrl: string;
    githubToken?: string;
    openaiApiKey?: string;
    baseBranch?: string;
    resolutionMode?: string;
  }): Promise<any> {
    const prisma = getPrisma();
    const project = await prisma.project.create({
      data: {
        userId: req.userId,
        name: req.name,
        repoUrl: req.repoUrl,
        githubToken: req.githubToken,
        openaiApiKey: req.openaiApiKey,
        baseBranch: req.baseBranch || "main",
        resolutionMode: req.resolutionMode || "manual",
      },
    });
    return this.mapToProject(project);
  }

  static async get(id: string): Promise<any> {
    const prisma = getPrisma();
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project) throw new Error(`Project ${id} not found`);
    return this.mapToProject(project);
  }

  static async listByUser(userId: string): Promise<any[]> {
    const prisma = getPrisma();
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return projects.map(this.mapToProject);
  }

  private static mapToProject(p: any) {
    return {
      id: p.id,
      user_id: p.userId,
      name: p.name,
      repo_url: p.repoUrl,
      github_token: p.githubToken,
      openai_api_key: p.openaiApiKey,
      base_branch: p.baseBranch,
      resolution_mode: p.resolutionMode,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    };
  }
}
