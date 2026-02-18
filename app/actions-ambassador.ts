"use server";

import { prisma } from './lib/prisma'; 
import { getCurrentUser } from './actions'; 
import { cookies } from 'next/headers'; // <--- 🔥 IMPORTANTE: NUEVO IMPORT

// ... (Las funciones getAmbassadorDashboardAction y getPromotablePropertiesAction déjelas igual, no cambian) ...
// Si prefiere borrar todo y pegar esto limpio para asegurar, aquí va todo el archivo:

// 1. DASHBOARD
export async function getAmbassadorDashboardAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    let stats = await prisma.ambassadorStats.findUnique({ where: { userId: user.id } });
    if (!stats) {
      stats = await prisma.ambassadorStats.create({
        data: { userId: user.id, score: 5.0, rank: "PARTNER" }
      });
    }
    return { success: true, data: stats };
  } catch (e) {
    return { success: false, error: "Error del servidor" };
  }
}

// 2. CATÁLOGO (Sin currency)
export async function getPromotablePropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const props = await prisma.property.findMany({
      where: { status: "PUBLICADO", sharePct: { gt: 0 } },
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        city: true,
        mainImage: true,
        images: true,
        sharePct: true,
        refCode: true
      }
    });

    const mapped = props.map((p: any) => {
        const price = p.price || 0;
        const agencyFeesEstimados = price * 0.05; 
        const potentialComm = agencyFeesEstimados * (p.sharePct / 100);
        const img = p.mainImage || (p.images && p.images[0]?.url) || "/placeholder.jpg";

        return {
            id: p.id,
            title: p.title || "Propiedad sin título",
            city: p.city || "Ubicación reservada",
            image: img,
            stats: { visits: 0, leads: 0 },
            commissionDisplay: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(potentialComm)
        };
    });

    return { success: true, data: mapped };
  } catch (e) {
    return { success: false, data: [] };
  }
}

// 3. GENERAR LINK
// app/actions-ambassador.ts

export async function generateAffiliateLinkAction(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión" };

    // 1. Definimos la base (Local o Producción según el entorno)
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    
    // 2. 🔥 ESTRATEGIA SPA: Usamos parámetros en la URL raíz
    // En lugar de ir a /p/ID (que da 404), vamos a la home / con instrucciones.
    const link = `${baseUrl}/?selectedProp=${propertyId}&ref=${user.id}`;
    
    return { success: true, link };
  } catch (e) {
    return { success: false, error: "No se pudo generar" };
  }
}

// 4. TRACKING + COOKIE (EL ESPÍA) 🔥 VERSIÓN CORREGIDA PARA NEXT.JS RECIENTE
export async function trackAffiliateClickAction(propertyId: string, ambassadorId: string) {
  try {
    if (!ambassadorId || !propertyId) return { success: false };

    // A) Grabamos en DB (Estadística pura)
    await prisma.affiliateClick.create({
      data: { ambassadorId, propertyId }
    });

    await prisma.ambassadorStats.update({
      where: { userId: ambassadorId },
      data: { totalClicks: { increment: 1 } }
    });

    // B) Ponemos la COOKIE (Persistencia de 30 días)
    // ⚠️ CORRECCIÓN AQUÍ: Añadimos 'await' antes de cookies()
    const cookieStore = await cookies(); 
    
    cookieStore.set('stratos_ref', ambassadorId, { 
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
    });
    
    cookieStore.set('stratos_ref_prop', propertyId, { 
        maxAge: 60 * 60 * 24 * 30, 
        path: '/',
    });

    return { success: true };
  } catch (e) {
    console.error("Error tracking click:", e);
    return { success: false };
  }
}