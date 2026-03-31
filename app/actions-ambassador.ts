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

    // 1️⃣ ESCÁNER DE RANGO TÁCTICO: Detectamos quién es quién en el campo de batalla
    const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            subscription: true, // Miramos la cuota
            zoneCampaigns: { where: { isActive: true } }, // 🔥 LO MÁS IMPORTANTE: Zonas dominadas
            properties: { where: { isFire: true } } // Miramos NanoCards de fuego
        }
    });

    let detectedRank = "FREE TRIAL"; // Rango por defecto

    // 🔥 REGLA DE ORO: Si tiene Zonas dominadas o NanoCards de Fuego, ES VANGUARD VIP ABSOLUTO.
    const hasVanguardPower = (userData?.zoneCampaigns && userData.zoneCampaigns.length > 0) || 
                             (userData?.properties && userData.properties.length > 0);

    if (hasVanguardPower) {
        detectedRank = "VANGUARD VIP"; // Sube a la élite directamente
    } 
    // Si no tiene zonas, pero paga la suscripción normal
    else if (userData?.subscription?.status === "ACTIVE") {
        detectedRank = "PRO CERTIFICADO";
    } 
    // Usted y sus comandantes de sistema
    else if (userData?.role === "ADMIN") {
        detectedRank = "VANGUARD VIP"; 
    }
    // 2️⃣ OBTENEMOS O ACTUALIZAMOS SUS ESTADÍSTICAS CON EL RANGO REAL
    let stats = await prisma.ambassadorStats.findUnique({ where: { userId: user.id } });
    
    if (!stats) {
      stats = await prisma.ambassadorStats.create({
        data: { 
            userId: user.id, 
            score: 5.0, 
            rank: detectedRank,
            totalClicks: 0, totalLeads: 0, totalSales: 0,
            availablePayout: 0, pendingPayout: 0
        }
      });
    } else if (stats.rank !== detectedRank) {
       // Si su estatus ha cambiado (ej. acaba de contratar la zona o se le ha caducado la suscripción)
       stats = await prisma.ambassadorStats.update({
           where: { id: stats.id },
           data: { rank: detectedRank }
       });
    }

   // 🔥 INYECCIÓN TÁCTICA: EL NUEVO MOTOR MATEMÁTICO B2B 🔥

    // 1. Buscamos TODAS las propiedades del sistema de un solo plumazo
    const allProperties = await prisma.property.findMany({
        where: {
            status: { in: ["PUBLICADO", "MANAGED", "ACCEPTED"] }
        },
        select: {
            id: true,
            userId: true,
            price: true,
            commissionPct: true,
            sharePct: true,
            shareVisibility: true,
            campaigns: {
                where: { status: "ACCEPTED" }, // Miramos si hay contratos firmados
                select: {
                    agencyId: true,
                    commissionPct: true,
                    commissionSharePct: true,
                    commissionShareVisibility: true
                }
            }
        }
    });

    let volumenEnRed = 0;
    let totalMisHonorarios = 0;
    let bolsaCompartida = 0;

    allProperties.forEach(p => {
        const price = Number(p.price || 0);
        let commPct = Number(p.commissionPct) > 0 ? Number(p.commissionPct) : 3; // 3% por defecto
        let sharePct = Number(p.sharePct || 0);
        let vis = String(p.shareVisibility || 'PRIVATE').toUpperCase();
        let isMine = false;

        // ¿Está gestionada por agencia?
        if (p.campaigns && p.campaigns.length > 0) {
            const activeContract = p.campaigns[0];
            commPct = Number(activeContract.commissionPct) > 0 ? Number(activeContract.commissionPct) : commPct;
            sharePct = Number(activeContract.commissionSharePct || 0);
            vis = String(activeContract.commissionShareVisibility || 'PRIVATE').toUpperCase();

            // Si la agencia gestora soy yo, es MÍA.
            if (activeContract.agencyId === user.id) {
                isMine = true;
            }
        } else {
            // Si no está gestionada, es del dueño original. Si el dueño soy yo, es MÍA.
            if (p.userId === user.id) {
                isMine = true;
            }
        }

        // 1️⃣ VOLUMEN EN RED: La suma de TODAS las comisiones de TODAS las casas del sistema (El pastel global)
        const totalComisionPropiedad = (price * commPct) / 100;
        volumenEnRed += totalComisionPropiedad;

        // 2️⃣ MIS HONORARIOS: La suma de comisiones SOLO de MIS casas o gestiones
        if (isMine) {
            totalMisHonorarios += totalComisionPropiedad;

            // 3️⃣ BOLSA COMPARTIDA: De MIS honorarios, lo que he decidido repartir en la red
            if (sharePct > 0 && ['PUBLIC', 'PÚBLICO', 'AGENCIES', 'AGENCIAS'].includes(vis)) {
                bolsaCompartida += (totalComisionPropiedad * sharePct) / 100;
            }
        }
    });
// ================================================================
    // 👁️ MODO RECONOCIMIENTO: RADAR DE LECTURA (100% INOFENSIVO)
    // No guarda, no edita, no rompe filtros. SOLO MIRA Y CUENTA.
    // ================================================================
    try {
        // 1. Contamos el tráfico real de sus casas y gestiones
        const trafficData = await prisma.property.aggregate({
            where: { 
                OR: [
                    { userId: user.id },
                    { campaigns: { some: { agencyId: user.id, status: "ACCEPTED" } } }
                ]
            },
            _sum: { views: true, photoViews: true }
        });
        
        const traficoReal = (trafficData._sum.views || 0) + (trafficData._sum.photoViews || 0) + (stats.totalClicks || 0);

        // 2. Contamos TODOS los leads usando sus reglas ya existentes
        const leadsPropiedades = await prisma.lead.count({
            where: {
                OR: [
                    { managerId: user.id },
                    { property: { userId: user.id } },
                    { property: { assignment: { is: { agencyId: user.id } } } },
                    { property: { campaigns: { some: { agencyId: user.id } } } },
                    { ambassadorId: user.id }
                ]
            }
        });
        
        const leadsFichaAgencia = await prisma.agencyContact.count({
            where: { userId: user.id }
        });
        
        const leadsReales = leadsPropiedades + leadsFichaAgencia;

        // 3. Inyectamos los números EN MEMORIA (para la pantalla)
        stats.totalClicks = traficoReal;
        stats.totalLeads = leadsReales;
        
    } catch (radarError) {
        console.error("Fallo silencioso en el radar de reconocimiento:", radarError);
        // Si algo falla, no hace nada y muestra los números viejos. Cero riesgos.
    }
    
    // ================================================================
    // 🔥 Limpieza extra por si acaso
    revalidatePath('/ambassador'); 

    // 🚀 RETORNO BLINDADO: Empaquetamos las stats clásicas + el nuevo motor B2B
    return { 
        success: true, 
        data: { 
            ...stats, 
            volumenEnRed, 
            totalMisHonorarios, 
            bolsaCompartida 
        } 
    };
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
        
       // 🔥 LAS VARIABLES DE VISIBILIDAD Y PORCENTAJES
        let b2bVisibility = "PRIVATE";
        let b2bSharePct = 0;
        let totalCommissionPct = 0; // <--- NUEVO CHIVATO DEL PORCENTAJE ORIGINAL

        const contract = (p.campaigns && p.campaigns.length > 0) ? p.campaigns[0] : null;

        if (contract) {
            const feePct = Number(contract.commissionPct || 0);
            totalCommissionPct = feePct; // Guardamos el % del contrato

            if (contract.commissionShareEur && Number(contract.commissionShareEur) > 0) {
                finalCommission = Number(contract.commissionShareEur);
            } else {
                const sharePct = Number(contract.commissionSharePct || 0);
                finalCommission = (price * (feePct / 100)) * (sharePct / 100);
            }
            const ag = contract.agency;
            agencyName = ag?.companyName || ag?.name || "Agencia Partner";
            agencyLogo = ag?.companyLogo || ag?.avatar || null;
            
            b2bVisibility = contract.commissionShareVisibility || "PRIVATE";
            b2bSharePct = contract.commissionSharePct || 0;
        } else {
            const propFeePct = Number(p.commissionPct || 0);
            totalCommissionPct = propFeePct; // Guardamos el % de la propiedad

            const propSharePct = Number(p.sharePct || 0);
            const totalFee = price * (propFeePct / 100);
            finalCommission = totalFee * (propSharePct / 100);

            agencyName = p.user?.companyName || p.user?.name || "Propietario";
            agencyLogo = p.user?.companyLogo || p.user?.avatar || null;
            
            b2bVisibility = p.shareVisibility || "PRIVATE";
            b2bSharePct = propSharePct;
        }

        if (isNaN(finalCommission) || finalCommission < 0) finalCommission = 0;
        let img = p.mainImage;
        if (!img && p.images && p.images.length > 0) img = p.images[0].url || p.images[0];
        if (!img) img = "/placeholder.jpg";

        // 🔥 EL PAQUETE COMPLETO PARA EL HOLINSPECTOR Y LA TARJETA
        return {
            id: p.id,
            title: p.title || "Oportunidad",
            price: price,
            commission: Math.round(finalCommission),
            image: img,
            refCode: p.refCode || "S/R",
            city: p.city || "Ubicación General",
            agencyName: agencyName,
            agencyLogo: agencyLogo,
            
            totalCommissionPct: totalCommissionPct, // <--- ENVIAMOS EL DATO AL FRONTEND
            
            // Datos inyectados para el Holinspector
            images: p.images ? p.images.map((i: any) => i.url) : [],
            description: p.description || null,
            rooms: p.rooms || 0,
            baths: p.baths || 0,
            mBuilt: p.mBuilt || 0,
            state: p.state || "Buen estado",
            tourUrl: p.tourUrl || null,
            
            // 🛰️ COORDENADAS GPS AÑADIDAS PARA EL SATÉLITE MAPBOX 🛰️
            longitude: p.longitude || null,
            latitude: p.latitude || null,
            
            // Amenities (Convertimos a booleanos)
            pool: !!p.pool,
            garage: !!p.garage,
            garden: !!p.garden,
            terrace: !!p.terrace,
            ac: !!p.ac,
            heating: !!p.heating,

            // Etiqueta de Exclusiva
            mandateType: contract?.mandateType || p.mandateType || "ABIERTO", 
            
            // Paquete de Visibilidad B2B
            b2b: {
                visibility: b2bVisibility,
                sharePct: b2bSharePct
            }
        };
    }); // <--- ESTE CIERRE ERA EL QUE FALTABA

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