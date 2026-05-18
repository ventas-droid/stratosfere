"use server";

import { prisma } from './lib/prisma';
import { cookies } from "next/headers"; // 🌬️ EL VENTILADOR TÉRMICO (Rompe la Caché)
import type { Prisma } from "@prisma/client";

// Búsqueda del destinatario (Dueño o Agencia Gestora)
export async function findOwnerByRefAction(reference: string) {
  try {
    // 🧹 LIMPIEZA TÁCTICA: Evita fallos por espacios invisibles o minúsculas
    const cleanRef = String(reference || "").trim().toUpperCase();

    const prop = await prisma.property.findUnique({
      where: { refCode: cleanRef },
      include: {
        // 🎯 INFILTRACIÓN: Traemos el contrato de gestión si existe
        assignment: true
      }
    });

    if (!prop) {
      console.log(`❌ RADAR FALLÓ: No se encontró la propiedad ${cleanRef}`);
      return { success: false, error: "Propiedad no encontrada" };
    }

    // ⚖️ LA REGLA DE ORO DE LA JERARQUÍA:
    // 1. Si hay una agencia asignada y activa, ELLA es la dueña del buzón.
    // 2. Si es una casa creada por la propia agencia, el userId ya es el de la agencia.
    // 3. Si es un particular sin agencia, va al particular.
    const targetOwnerId =
      prop.assignment && prop.assignment.status === "ACTIVE"
        ? prop.assignment.agencyId
        : prop.userId;

    return { success: true, ownerId: targetOwnerId };
  } catch (error) {
    console.error("Error buscando al propietario por referencia:", error);
    return { success: false };
  }
}

// =========================================================
// 🗂️ FUNCIONES DEL BÚNKER DE DOCUMENTOS (CON REMITENTE)
// =========================================================

export async function createStratosDocumentAction(data: {
  fileName: string;
  fileUrl: string;
  sizeKB: string;
  propertyRef: string;
  ownerId: string;
  senderName?: string;
  senderEmail?: string;
}) {
  try {
    const doc = await prisma.stratosDocument.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        sizeKB: data.sizeKB,
        propertyRef: data.propertyRef, // Debería llegar ya limpio desde route.ts
        ownerId: data.ownerId,
        senderName: data.senderName,
        // 🛡️ BLINDAJE ABSOLUTO: Guardamos el email siempre en minúsculas y sin espacios
        senderEmail: data.senderEmail
          ? String(data.senderEmail).trim().toLowerCase()
          : undefined,
      }
    });

    return { success: true, data: doc };
  } catch (error) {
    console.error("🚨 Error archivando documento:", error);
    return { success: false, error: "Fallo en la base de datos." };
  }
}

export async function getInboxDocumentsAction(userId: string, userEmail?: string) {
  await cookies(); // 💥 DISIPA LA NIEBLA DE GUERRA: Obliga a Next.js a mirar los datos reales...

  try {
    // 🛡️ BLINDAJE ABSOLUTO: Limpiamos el email antes de buscar para que coincida al 1000%
    const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : undefined;

    const whereClause: Prisma.StratosDocumentWhereInput = cleanEmail
      ? { OR: [{ ownerId: userId }, { senderEmail: cleanEmail }] }
      : { ownerId: userId };

    const docs = await prisma.stratosDocument.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // 🎯 MANIOBRA DE RASTREO: Buscamos quién es el dueño real de cada archivo
    // ✅ CORRECCIÓN: Evitamos una query por documento. Antes esto podía saturar el pool de Prisma.
    const ownerIds = Array.from(
      new Set(
        docs
          .map((doc) => doc.ownerId)
          .filter((ownerId): ownerId is string => Boolean(ownerId))
      )
    );

    const owners = ownerIds.length
      ? await prisma.user.findMany({
          where: {
            id: { in: ownerIds },
          },
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        })
      : [];

    const ownersById = new Map(owners.map((owner) => [owner.id, owner]));

    const enrichedDocs = docs.map((doc) => {
      const owner = ownersById.get(doc.ownerId);

      return {
        ...doc,
        receiverName: owner?.companyName || owner?.name || "Agente Stratosfere",
        receiverEmail: owner?.email || "Sin email",
      };
    });

    return { success: true, data: enrichedDocs };
  } catch (error) {
    console.error("Error obteniendo documentos de la bandeja:", error);
    return { success: false, error: "No se pudieron cargar los documentos." };
  }
}

// 3. Apaga el LED azul cuando el usuario abre la bandeja
export async function markDocumentsAsReadAction(userId: string) {
  try {
    await prisma.stratosDocument.updateMany({
      where: { ownerId: userId, isRead: false },
      data: { isRead: true }
    });

    return { success: true };
  } catch (error) {
    console.error("Error actualizando estado de lectura:", error);
    return { success: false };
  }
}