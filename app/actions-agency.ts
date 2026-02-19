"use server";

import { prisma } from './lib/prisma';
import { getCurrentUser } from './actions';

// =========================================================
// 1. INFORME DE TROPAS (MIS EMBAJADORES)
// =========================================================
// Misión: Devuelve la lista de usuarios que han sido reclutados por esta agencia
// o que le han generado ventas/leads.
export async function getAgencyAmbassadorsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // Buscamos usuarios que tengan a esta agencia como 'recruitedBy'
    const recruits = await prisma.user.findMany({
      where: {
        recruitedById: user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true, // Fecha de alistamiento
        ambassadorStats: true, // Sus estadísticas (Rango, Ventas, etc.)
        ambassadorProfile: true // Su DNI y datos fiscales (Para pagarle)
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: recruits };
  } catch (e) {
    console.error("Error fetching ambassadors:", e);
    return { success: false, error: "Error al cargar tropas" };
  }
}

// =========================================================
// 📡 OBTENER LEADS (TRANSMISIONES) - VERSIÓN ANTI-PARPADEO
// =========================================================
export async function getAgencyLeadsAction() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "No autorizado" };

        const leads = await prisma.lead.findMany({
            where: {
                property: {
                    OR: [
                        { userId: user.id },
                        { assignment: { agencyId: user.id, status: 'ACTIVE' } }
                    ]
                }
            },
            include: {
                ambassador: { select: { id: true, name: true, email: true, avatar: true } },
                property: {
                    include: {
                        images: true,
                        // 1. Datos del dueño original
                        user: { select: { id: true, name: true, email: true, avatar: true, companyName: true, companyLogo: true, coverImage: true, phone: true, role: true } },
                        
                        // 🔥 2. CLAVE: Traemos la Agencia Gestora para evitar la "lucha de poder"
                        assignment: { 
                            where: { status: 'ACTIVE' },
                            include: { 
                                agency: { select: { id: true, name: true, email: true, avatar: true, companyName: true, companyLogo: true, coverImage: true, phone: true, mobile: true, role: true, tagline: true, zone: true } } 
                            } 
                        },
                        campaigns: { where: { status: 'ACCEPTED' }, take: 1 }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const cleanLeads = leads.map((l: any) => {
            const p = l.property || {};
            
            // Coordenadas
            const lng = Number(p.longitude);
            const lat = Number(p.latitude);
            const hasCoords = (lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat));

            // 🦅 TRANSMUTACIÓN INMEDIATA: Si hay agencia, toma el control absoluto antes de enviarlo
            let displayUser = p.user || {};
            if (p.assignment && p.assignment.length > 0 && p.assignment[0].agency) {
                const ag = p.assignment[0].agency;
                displayUser = {
                    ...ag,
                    role: 'AGENCIA', // Activa los colores corporativos
                    avatar: ag.companyLogo || ag.avatar, // Fuerza el logo
                    name: ag.companyName || ag.name
                };
            }

            return {
                id: l.id,
                name: l.name,
                email: l.email,
                phone: l.phone,
                message: l.message,
                createdAt: l.createdAt,
                status: l.status,
                ambassador: l.ambassador,
                
                // 📦 PAQUETE BLINDADO
                property: {
                    ...p,
                    id: p.id,
                    title: p.title || "Propiedad",
                    refCode: p.refCode,
                    price: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(p.price || 0)),
                    rawPrice: Number(p.price || 0),
                    mBuilt: Number(p.mBuilt || p.m2 || 0),
                    rooms: Number(p.rooms || 0),
                    baths: Number(p.baths || 0),
                    coordinates: hasCoords ? [lng, lat] : null,
                    longitude: lng,
                    latitude: lat,
                    img: (p.images && p.images.length > 0) ? p.images[0].url : p.mainImage,
                    
                    // 🔥 Enviamos la Identidad ya resuelta (Cero parpadeos)
                    user: displayUser,
                    ownerSnapshot: displayUser,
                    
                    b2b: p.campaigns?.[0] ? {
                        sharePct: Number(p.campaigns[0].commissionSharePct || 0),
                        visibility: p.campaigns[0].commissionShareVisibility || 'PRIVATE'
                    } : null
                }
            };
        });

        return { success: true, data: cleanLeads };
    } catch (e) {
        console.error("Error getAgencyLeadsAction:", e);
        return { success: false, data: [] };
    }
}
// =========================================================
// 3. VINCULAR SOLDADO (RECLUTAMIENTO MANUAL) - OPCIONAL
// =========================================================
// Misión: Si un usuario mete tu código, se vincula a ti.
export async function linkAmbassadorToAgencyAction(agencyCode: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "No autorizado" };

        // 1. Buscar a la agencia por su código (usaremos el ID o un campo especial)
        // Por simplificar, asumimos que el agencyCode ES el ID de la agencia por ahora
        // O podríamos buscar por email.
        const agency = await prisma.user.findUnique({
            where: { id: agencyCode } // OJO: Aquí habría que mejorar la búsqueda por "CÓDIGO AMIGABLE"
        });

        if (!agency) return { success: false, error: "Agencia no encontrada" };

        // 2. Vincular
        await prisma.user.update({
            where: { id: user.id },
            data: { recruitedById: agency.id }
        });

        return { success: true };
    } catch (e) {
        return { success: false, error: "Error al vincular" };
    }
}

// =========================================================
// 🗑️ ELIMINAR LEAD O EMBAJADOR
// =========================================================
export async function deleteAgencyLeadAction(leadId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "No autorizado" };

        await prisma.lead.delete({
            where: { id: leadId }
        });

        return { success: true };
    } catch (e) {
        return { success: false, error: "Error al eliminar" };
    }
}