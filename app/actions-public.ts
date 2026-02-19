"use server";

import { prisma } from './lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

// =========================================================
// 🕵️‍♂️ EXTRACTOR DE DATOS PÚBLICO (Modo "Escaparate")
// =========================================================
export async function getPublicPropertyDetailsAction(propertyId: string) {
    noStore(); // Siempre datos frescos
    try {
        const property = await prisma.property.findFirst({
            where: { 
                id: propertyId, 
                status: "PUBLICADO" 
            },
            include: {
                images: true, 
                user: { 
                    select: { name: true, companyName: true, avatar: true, companyLogo: true } 
                },
                assignment: { 
                    where: { status: 'ACTIVE' },
                    include: { 
                        agency: { select: { name: true, companyName: true, avatar: true, companyLogo: true, tagline: true } } 
                    }
                }
            }
        });

        if (!property) return { success: false, error: "Propiedad no encontrada o no disponible." };

        // Lógica para determinar quién es la "Cara visible"
        let responsibleInfo = {
            name: property.user?.companyName || property.user?.name || "Anunciante",
            avatar: property.user?.companyLogo || property.user?.avatar || "/placeholder-user.jpg",
            tagline: null as string | null,
            isAgency: false
        };

        // 🔥 CORRECCIÓN APLICADA AQUÍ: Tratamos assignment sea objeto o lista
        const assignmentObj = Array.isArray(property.assignment) ? property.assignment[0] : property.assignment;

        if (assignmentObj?.agency) {
            const ag = assignmentObj.agency;
            responsibleInfo = {
                name: ag.companyName || ag.name,
                avatar: ag.companyLogo || ag.avatar || "/placeholder-agency.jpg",
                tagline: ag.tagline,
                isAgency: true
            };
        }

        // Preparamos el paquete final de imágenes de forma segura
        let finalImages = property.mainImage ? [property.mainImage] : [];
        if (property.images && property.images.length > 0) {
            finalImages = [...finalImages, ...property.images.map((i: any) => i.url)];
        }
        
        // Eliminar duplicados y vacíos
        finalImages = Array.from(new Set(finalImages)).filter(Boolean);
        if (finalImages.length === 0) finalImages = ["/placeholder-house.jpg"];

        return { 
            success: true, 
            data: {
                ...property,
                images: finalImages,
                formattedPrice: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(property.price || 0)),
                responsible: responsibleInfo
            } 
        };

    } catch (e) {
        console.error("Error public property fetch:", e);
        return { success: false, error: "Error del sistema." };
    }
}

// =========================================================
// 🎯 CAPTURAR LEAD PÚBLICO (Fricción Cero)
// =========================================================
import { cookies } from 'next/headers';

export async function submitPublicLeadAction(propertyId: string, formData: any) {
    try {
        // 1. Buscamos al espía (La cookie del embajador)
        const cookieStore = await cookies();
        const ambassadorId = cookieStore.get('stratos_ref')?.value || null;

        // 2. Disparamos el Lead directo a la base de datos de la agencia
        await prisma.lead.create({
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                propertyId: propertyId,
                ambassadorId: ambassadorId, // 🎖️ Atribución automática
                status: 'NUEVO'
            }
        });

        // 3. Si hay un embajador, le sumamos un Lead a su contador de méritos
        if (ambassadorId) {
            await prisma.ambassadorStats.upsert({
                where: { userId: ambassadorId },
                update: { totalLeads: { increment: 1 } },
                create: { userId: ambassadorId, totalLeads: 1 }
            });
        }

        return { success: true };
    } catch (e) {
        console.error("Error guardando lead público:", e);
        return { success: false, error: "Error al enviar la solicitud" };
    }
}