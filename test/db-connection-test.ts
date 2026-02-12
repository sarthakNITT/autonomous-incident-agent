import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testConnection() {
  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✓ Successfully connected to Neon PostgreSQL!");

    const result =
      await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log("Database info:", result);

    await prisma.$disconnect();
    console.log("✓ Connection test completed successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
