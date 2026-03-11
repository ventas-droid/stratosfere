"use server";

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

// 👑 1. CREAR TOP 10
export async function createTop10CampaignAction(data: { propertyRef: string; targetCity: string; durationDays: number; customLogo?: string | null; customImage?: string | null; }) {
  try {
    const cleanRef = data.propertyRef.replace("REF:", "").replace("ref:", "").trim().toUpperCase();
    const property = await prisma.property.findFirst({ where: { refCode: cleanRef } });

    if (!property) return { success: false, error: `No existe ninguna propiedad con la referencia '${cleanRef}'` };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        isTop10: true,
        top10City: data.targetCity.toLowerCase().trim(),
        top10ExpiresAt: expiresAt,
        top10CustomLogo: data.customLogo,
        top10CustomImage: data.customImage
      }
    });

    revalidatePath('/'); 
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: "Fallo en el servidor." };
  }
}

// ✏️ 2. EDITAR Y RENOVAR TOP 10 (MACHACA LA FECHA)
export async function updateTop10CampaignAction(propertyId: string, data: { targetCity: string; expiresAt: Date; customLogo?: string | null; customImage?: string | null; }) {
  try {
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        top10City: data.targetCity.toLowerCase().trim(),
        top10ExpiresAt: data.expiresAt,
        top10CustomLogo: data.customLogo,
        top10CustomImage: data.customImage
      }
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: "Fallo al actualizar la campaña." };
  }
}

// 📋 3. LISTAR EL TOP 10
export async function getTop10CampaignsAction() {
  try {
    const properties = await prisma.property.findMany({
      where: { isTop10: true },
      select: {
        id: true,
        refCode: true,
        title: true,
        price: true,
        isTop10: true,
        top10City: true,
        top10ExpiresAt: true,
        top10CustomLogo: true,
        top10CustomImage: true
      },
      orderBy: { top10ExpiresAt: 'asc' }
    });

    const campaigns = properties.map(p => ({
        id: p.id,
        property: { refCode: p.refCode, title: p.title, price: p.price },
        targetCity: p.top10City,
        expiresAt: p.top10ExpiresAt,
        customLogo: p.top10CustomLogo,
        customImage: p.top10CustomImage
    }));

    return { success: true, data: campaigns };
  } catch (error) {
    return { success: false, error: "Error al cargar el Top 10" };
  }
}

// 🗑️ 4. DESTITUIR
export async function deleteTop10CampaignAction(propertyId: string) {
  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isTop10: false,
        top10City: null,
        top10ExpiresAt: null,
        top10CustomLogo: null,
        top10CustomImage: null
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al destituir." };
  }
}