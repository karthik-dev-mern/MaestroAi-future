import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.

// Test database connection
async function testConnection() {
  try {
    await db.$connect();
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Database connection error:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    // Don't throw the error, just log it
  } finally {
    await db.$disconnect();
  }
}

// Test connection on startup
testConnection();

export default db;
