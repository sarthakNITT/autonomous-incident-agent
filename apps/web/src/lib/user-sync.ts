import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function ensureUserInDatabase() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          lastSignInAt: new Date(),
        },
      });

      console.log(`✅ User created in database: ${user.id}`);
    } else {
      user = await prisma.user.update({
        where: { id: clerkUser.id },
        data: {
          lastSignInAt: new Date(),
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error ensuring user in database:", error);
    return null;
  }
}

export async function getUserFromDatabase(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error getting user from database:", error);
    return null;
  }
}

export async function getUserStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            incidents: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const totalProjects = user.projects.length;
    const totalIncidents = user.projects.reduce(
      (sum, project) => sum + project.incidents.length,
      0,
    );
    const activeIncidents = user.projects.reduce(
      (sum, project) =>
        sum + project.incidents.filter((i) => i.status !== "resolved").length,
      0,
    );

    return {
      totalProjects,
      totalIncidents,
      activeIncidents,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      },
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}
