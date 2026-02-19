"use server";

import { prisma } from './lib/prisma';
import { getCurrentUser } from './actions';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';




// =========================================================
// 1. EL CUARTEL GENERAL (ESTADÍSTICAS DASHBOARD)
// =========================================================
export async function getAmbassadorDashboardAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    let stats = await prisma.ambassadorStats.findUnique({ where: { userId: user.id } });
    
    if (!stats) {
      stats = await prisma.ambassadorStats.create({
        data: { 
            userId: user.id, 
            score: 5.0, 
            rank: "PARTNER",
            totalClicks: 0, totalLeads: 0, totalSales: 0,
            availablePayout: 0, pendingPayout: 0
        }
      });
    }
    
    // 🔥 Limpieza extra por si acaso
    revalidatePath('/ambassador'); 
    return { success: true, data: stats };
  } catch (e) {
    return { success: false, error: "Error del servidor" };
  }
}

// =========================================================
// 2. EL ARSENAL (CATÁLOGO DE PROPIEDADES)
// =========================================================
export async function getPromotablePropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const props = await prisma.property.findMany({
      where: {
          status: "PUBLICADO",
          OR: [
              { campaigns: { some: { status: "ACCEPTED" } } },
              { sharePct: { gt: 0 } }
          ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        user: { select: { name: true, companyName: true, avatar: true, companyLogo: true } },
        campaigns: { 
            where: { status: "ACCEPTED" }, 
            take: 1,
            include: { 
                agency: { select: { name: true, companyName: true, avatar: true, companyLogo: true } }
            }
        }
      }
    });

    const mapped = props.map((p: any) => {
        const price = p.price ? Number(p.price) : 0;
        let finalCommission = 0;
        let agencyName = "Particular";
        let agencyLogo = null;

        const contract = (p.campaigns && p.campaigns.length > 0) ? p.campaigns[0] : null;

        if (contract) {
            if (contract.commissionShareEur && Number(contract.commissionShareEur) > 0) {
                finalCommission = Number(contract.commissionShareEur);
            } else {
                const feePct = Number(contract.commissionPct || 0);
                const sharePct = Number(contract.commissionSharePct || 0);
                finalCommission = (price * (feePct / 100)) * (sharePct / 100);
            }
            const ag = contract.agency;
            agencyName = ag?.companyName || ag?.name || "Agencia Partner";
            agencyLogo = ag?.companyLogo || ag?.avatar || null;
        } else {
            const propFeePct = Number(p.commissionPct || 0);
            const propSharePct = Number(p.sharePct || 0);
            const totalFee = price * (propFeePct / 100);
            finalCommission = totalFee * (propSharePct / 100);

            agencyName = p.user?.companyName || p.user?.name || "Propietario";
            agencyLogo = p.user?.companyLogo || p.user?.avatar || null;
        }

        if (isNaN(finalCommission) || finalCommission < 0) finalCommission = 0;
        let img = p.mainImage;
        if (!img && p.images && p.images.length > 0) img = p.images[0].url || p.images[0];
        if (!img) img = "/placeholder.jpg";

        return {
            id: p.id,
            title: p.title || "Oportunidad",
            price: price,
            commission: Math.round(finalCommission),
            image: img,
            refCode: p.refCode || "S/R",
            city: p.city || "Ubicación General",
            agencyName: agencyName,
            agencyLogo: agencyLogo
        };
    });

    // 🔥 LA LIMPIEZA DEFINITIVA
    revalidatePath('/ambassador', 'page');
    revalidatePath('/', 'layout');

    return { success: true, data: mapped };
  } catch (e) {
    console.error("ERROR ACCIONES:", e);
    return { success: false, error: "Error de sistema" };
  }
}

// =========================================================
// 3. LA MUNICIÓN (GENERAR LINK) - VERSIÓN ESCAPARATE PÚBLICO
// =========================================================
export async function generateAffiliateLinkAction(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Debes iniciar sesión" };

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    
    // 🔥 CAMBIO VITAL: Ahora la URL apunta a /p/ (la nueva revista pública)
    const link = `${baseUrl}/p/${propertyId}?ref=${user.id}`;
    
    return { success: true, link };
  } catch (e) {
    return { success: false, error: "No se pudo generar" };
  }
}

// =========================================================
// 4. EL RADAR (TRACKING DE CLICKS)
// =========================================================
export async function trackAffiliateClickAction(propertyId: string, ambassadorId: string) {
  try {
    if (!ambassadorId || !propertyId) return { success: false };

    try {
        await prisma.affiliateClick.create({
            data: { ambassadorId, propertyId }
        });
        await prisma.ambassadorStats.upsert({
            where: { userId: ambassadorId },
            update: { totalClicks: { increment: 1 } },
            create: { userId: ambassadorId, totalClicks: 1 }
        });
    } catch(dbError) {
        console.error("Error DB click:", dbError);
    }

    const cookieStore = await cookies(); 
    cookieStore.set('stratos_ref', ambassadorId, { 
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    revalidatePath('/ambassador'); // Actualizar contadores
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// =========================================================
// 5. PERFIL (GUARDAR)
// =========================================================
export async function updateAmbassadorProfileAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    if (!data.fullName || !data.dni) {
      return { success: false, error: "Faltan datos obligatorios." };
    }

    await prisma.ambassadorProfile.upsert({
      where: { userId: user.id },
      update: { ...data },
      create: { userId: user.id, ...data }
    });

    revalidatePath('/ambassador');
    return { success: true };
  } catch (e) {
    return { success: false, error: "Error de base de datos" };
  }
}

// =========================================================
// 6. PERFIL (LEER)
// =========================================================
export async function getAmbassadorProfileAction() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false };

        const profile = await prisma.ambassadorProfile.findUnique({
            where: { userId: user.id }
        });
        
        return { success: true, data: profile };
    } catch (e) {
        return { success: false };
    }
}