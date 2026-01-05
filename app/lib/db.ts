import { PrismaClient } from '@prisma/client'

// Esto crea una variable global para que no se dupliquen las conexiones
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db