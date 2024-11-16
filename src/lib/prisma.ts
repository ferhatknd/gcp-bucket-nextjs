import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | null;
};

async function createPrismaClient() {
  try {
    // Attempt to connect with the first client
    const client = new PrismaClient({
      log: [],
    });
    await client.$connect();
    console.log("Connected to database");
    return client;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw new Error("Unable to connect to database");
  }
}

export async function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  return globalForPrisma.prisma;
}
