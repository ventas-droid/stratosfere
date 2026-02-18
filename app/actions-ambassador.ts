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
// En app/actions-ambassador.ts

export async function getPromotablePropertiesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 1. Buscamos propiedades PUBLICADAS
    const props = await prisma.property.findMany({
      where: { status: "PUBLICADO" },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        // 🔥 CLAVE: Traemos la campaña ACEPTADA (El contrato activo)
        // Aquí es donde vive el dato "comisiónShareEur" que usted ve en la DB
        campaigns: {
            where: { status: "ACCEPTED" },
            take: 1
        }
      }
    });

    console.log(`📊 DASHBOARD: Procesando ${props.length} propiedades...`);

    const mapped = props.map((p: any) => {
        // A. Precio Base
        const price = p.price ? Number(p.price) : 0;
        
        // B. Buscamos el contrato activo (Campaign)
        const activeContract = (p.campaigns && p.campaigns.length > 0) ? p.campaigns[0] : null;

        let finalCommission = 0;

        // C. LÓGICA DE PRIORIDAD (El Cerebro)
        if (activeContract) {
            // OPCIÓN 1: Si hay contrato, usamos sus datos (Esto es lo que usted tiene en la DB)
            const contractSharePct = Number(activeContract.commissionSharePct || 0);
            
            // Si el contrato ya tiene el cálculo en Euros guardado, lo usamos directo
            if (activeContract.commissionShareEur && Number(activeContract.commissionShareEur) > 0) {
                finalCommission = Number(activeContract.commissionShareEur);
            } else {
                // Si no, lo calculamos: (Precio * %Agencia * %Share)
                const contractFeePct = Number(activeContract.commissionPct || 3);
                const totalFee = price * (contractFeePct / 100);
                finalCommission = totalFee * (contractSharePct / 100);
            }
            
            console.log(`> [CONTRATO] ${p.refCode}: Comisión detectada ${finalCommission}€`);

        } else {
            // OPCIÓN 2: Si no hay contrato, miramos la ficha (Fallback)
            const propFeePct = Number(p.commissionPct || 3);
            const propSharePct = Number(p.sharePct || 0); // Si es 0, saldrá 0 (correcto)
            
            const totalFee = price * (propFeePct / 100);
            finalCommission = totalFee * (propSharePct / 100);
            
            console.log(`> [FICHA] ${p.refCode}: Comisión detectada ${finalCommission}€`);
        }

        // D. LIMPIEZA FINAL
        if (isNaN(finalCommission) || finalCommission < 0) finalCommission = 0;

        // Selección de imagen
        let img = p.mainImage;
        if (!img && p.images && p.images.length > 0) {
             // Priorizamos url si es objeto, o string directo
             img = p.images[0].url || p.images[0];
        }
        if (!img) img = "/placeholder.jpg";

        return {
            id: p.id,
            title: p.title || "Propiedad sin título",
            price: price,
            commission: Math.round(finalCommission), // Redondeo limpio
            image: img,
            refCode: p.refCode
        };
    });

    return { success: true, data: mapped };
  } catch (e) {
    console.error("❌ ERROR CRÍTICO DASHBOARD:", e);
    return { success: false, error: "Error de sistema" };
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