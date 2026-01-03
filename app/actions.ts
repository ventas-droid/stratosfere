'use server'

import { PrismaClient } from '@prisma/client'

// Esto evita que creemos demasiadas conexiones cuando recargamos (Best Practice)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function createLead(formData: FormData) {
  const email = formData.get('email')

  if (!email || typeof email !== 'string') {
    return { success: false, message: 'Email inválido' }
  }

  try {
    await prisma.lead.create({
      data: {
        email: email,
        source: 'waitlist_home',
      },
    })
    return { success: true, message: '¡Te has unido!' }
  } catch (error) {
    // Si el error es P2002 significa que el email ya existe (Unique constraint)
    return { success: false, message: 'Este correo ya está registrado.' }
  }
}

