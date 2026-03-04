import { PrismaClient } from '@prisma/client';

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({
  // Disable Prisma logging in production for security and performance
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : [],
});

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;