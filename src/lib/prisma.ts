import { PrismaClient } from '@prisma/client';

declare global {
  var __portalPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__portalPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__portalPrisma = prisma;
}
