import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  prismaInstance = new PrismaClient();

  return prismaInstance;
}
