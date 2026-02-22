"use server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. ACCIÓN: NANO CARD PREMIUM
export async function togglePropertyPremiumAction(propertyId: string, newState: boolean) {
  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isPremium: newState,
        isPromoted: newState, 
        promotedTier: newState ? 'PREMIUM' : 'FREE' 
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 2. ACCIÓN: NANO CARD FUEGO
export async function togglePropertyFireAction(propertyId: string, newState: boolean) {
  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isFire: newState,
        promotedTier: newState ? 'FUEGO' : 'FREE' 
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 3. ACCIÓN: PUBLICAR INDECISOS (ALTA EN RADAR)
export async function togglePropertyStatusAction(propertyId: string, publish: boolean) {
  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: publish ? 'PUBLICADO' : 'PENDIENTE_PAGO' }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. ACCIÓN: MASTER SWITCH (BLOQUEAR / ACTIVAR USUARIO)
export async function toggleUserStatusAction(userId: string, activate: boolean) {
  try {
    const newStatus = activate ? "ACTIVE" : "BLOCKED";
    await prisma.subscription.upsert({
      where: { userId: userId },
      update: { status: newStatus },
      create: { userId: userId, status: newStatus, plan: "STARTER" }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
// 5. MISIL TOMAHAWK TÁCTICO (BORRAR PROPIEDAD DEFINITIVAMENTE)
export async function deletePropertyAction(propertyId: string) {
  try {
    await prisma.property.delete({
      where: { id: propertyId }
    });
    return { success: true };
  } catch (error) { 
    console.error("Error al borrar propiedad:", error);
    return { success: false }; 
  }
}

// 6. BOMBA ATÓMICA ESTRATÉGICA (BORRAR USUARIO Y TODO SU RASTRO)
export async function deleteUserAction(userId: string) {
  try {
    // Al borrar el usuario, la base de datos debería borrar en cascada 
    // todas sus propiedades, suscripciones, etc. ¡Limpieza total!
    await prisma.user.delete({
      where: { id: userId }
    });
    return { success: true };
  } catch (error) { 
    console.error("Error al borrar usuario:", error);
    return { success: false }; 
  }
}
