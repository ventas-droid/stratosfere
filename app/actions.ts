'use server'

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function createLead(formData: FormData) {
  const email = formData.get('email')
  
  // 1. CHIVATO: Avisar que empieza el intento
  console.log("➡️ INTENTO DE REGISTRO:", email)

  if (!email || typeof email !== 'string') {
    return { success: false, message: 'Email inválido' }
  }

  try {
    // 2. INTENTO: Guardar en base de datos
    const newLead = await prisma.lead.create({
      data: {
        email: email,
        source: 'waitlist_home',
      },
    })
    
    // 3. ÉXITO: Si llega aquí, funcionó
    console.log("✅ GUARDADO EN BASE DE DATOS:", newLead)
    return { success: true, message: '¡Te has unido!' }

  } catch (error) {
    // 4. ERROR: Si falla, nos dirá por qué en la terminal
    console.log("❌ ERROR FATAL:", error)
    return { success: false, message: 'Error al guardar. Mira la terminal.' }
  }
}

// Forzando actualización v2