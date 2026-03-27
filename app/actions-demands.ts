"use server";

import { prisma } from "./lib/prisma";
import { getUserMeAction } from "./actions"; 
import { pusherServer } from '@/app/utils/pusher';

export async function createDemandAction(data: {
    title: string;
    location: string;
    budget: string;
   totalComm: string;
    split: string;
    urgent: boolean;
    mandate: boolean;
    description: string;
}) {
    try {
        // 1. Verificamos quién está disparando
        const userRes = await getUserMeAction();
        if (!userRes?.success || !userRes?.data?.id) {
            return { success: false, error: "No autorizado. Debes iniciar sesión." };
        }

        const userId = userRes.data.id;

        // 2. Guardamos la demanda en la Base de Datos
        const newDemand = await prisma.b2bDemand.create({
            data: {
                ...data,
                userId: userId,
                isActive: true
            }
        });

        return { success: true, data: newDemand };
    } catch (error) {
        console.error("Error al crear demanda:", error);
        return { success: false, error: "Fallo en los servidores al guardar la demanda." };
    }
}

// =========================================================
// 🎭 BISTURÍ DE IDENTIDAD CORPORATIVA (Helper)
// =========================================================
const getUnifiedCorporateProfile = (dbUser: any) => {
    if (!dbUser) return null;
    const isAgency = String(dbUser.role || '').toUpperCase() === 'AGENCIA';
    return {
        ...dbUser,
        id: dbUser.id,
        name: isAgency && dbUser.companyName ? dbUser.companyName : (dbUser.name || 'Usuario B2B'),
        avatar: isAgency && dbUser.companyLogo ? dbUser.companyLogo : (dbUser.avatar || null),
        role: dbUser.role || 'PARTICULAR'
    };
};

// 🚀 2. MISIL PARA LEER LAS DEMANDAS DEL MERCADO
export async function getActiveDemandsAction() {
    try {
        const demands = await prisma.b2bDemand.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }, // Las más nuevas primero
            include: {
                user: {
                    // 🔥 CORRECCIÓN: Traemos logo y rol para saber si es Agencia
                    select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } 
                }
            }
        });

        // 🔥 APLICAMOS EL FILTRO CORPORATIVO
        const formattedDemands = demands.map((d: any) => ({
            ...d,
            user: getUnifiedCorporateProfile(d.user)
        }));

        return { success: true, data: formattedDemands };
    } catch (error) {
        console.error("Error al obtener demandas:", error);
        return { success: false, error: "Error de lectura en Base de Datos." };
    }
}

// 🚀 3. MISIL PARA ENVIAR UNA PROPUESTA (EL CHIVATO B2B)
export async function sendProposalAction(data: {
    demandId: string;
    receiverId: string;
    mode: "REF" | "OFF_MARKET";
    reference?: string;
    phone?: string;
    notes?: string;
}) {
    try {
        const userRes = await getUserMeAction();
        if (!userRes?.success || !userRes?.data?.id) {
            return { success: false, error: "No autorizado. Debes iniciar sesión." };
        }

        const senderId = userRes.data.id;

        if (senderId === data.receiverId) {
            return { success: false, error: "No puedes enviar propuestas a tus propias demandas." };
        }

        const newProposal = await prisma.b2bProposal.create({
            data: {
                demandId: data.demandId,
                senderId: senderId,
                receiverId: data.receiverId,
                mode: data.mode,
                reference: data.mode === "REF" ? data.reference : null,
                phone: data.mode === "OFF_MARKET" ? data.phone : null,
                notes: data.mode === "OFF_MARKET" ? data.notes : null,
                status: "UNREAD"
            }
        });

        try {
            await pusherServer.trigger(`user-${data.receiverId}`, 'new-b2b-proposal', {
                id: newProposal.id,
                demandId: newProposal.demandId,
                senderId: newProposal.senderId,
                receiverId: newProposal.receiverId,
                mode: newProposal.mode,
                reference: newProposal.reference,
                phone: newProposal.phone,
                notes: newProposal.notes,
                status: newProposal.status,
                createdAt: newProposal.createdAt,
            });

            console.log(`📡 [PUSHER] Propuesta B2B disparada a user-${data.receiverId}`);
        } catch (pusherError) {
            console.error("⚠️ Error disparando Pusher B2B:", pusherError);
        }

        return { success: true, data: newProposal };
    } catch (error) {
        console.error("Error al enviar propuesta:", error);
        return { success: false, error: "Error de comunicaciones al enviar la propuesta." };
    }
}

// 🚀 4. MISIL PARA LEER EL BUZÓN DE PROPUESTAS RECIBIDAS
export async function getReceivedProposalsAction() {
    try {
        const userRes = await getUserMeAction();
        if (!userRes?.success || !userRes?.data?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = userRes.data.id;

        // Buscamos las propuestas donde el receptor soy yo
        const proposals = await prisma.b2bProposal.findMany({
            where: { receiverId: userId },
            orderBy: { createdAt: 'desc' }, // Las más recientes primero
            include: {
                // Traemos los datos de la demanda original para saber a qué contestan
                demand: {
                    select: { title: true, budget: true }
                },
                // Traemos los datos básicos del cazador que nos envía la propuesta
                sender: {
                    // 🔥 CORRECCIÓN: Traemos logo y rol para saber si es Agencia
                    select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true }
                }
            }
        });

        // 🔥 APLICAMOS EL FILTRO CORPORATIVO
        const formattedProposals = proposals.map((p: any) => ({
            ...p,
            sender: getUnifiedCorporateProfile(p.sender)
        }));

        return { success: true, data: formattedProposals };
    } catch (error) {
        console.error("Error al leer el buzón:", error);
        return { success: false, error: "Error al cargar el buzón de operaciones." };
    }
}

// 🚀 5. MISIL DE AUTODESTRUCCIÓN (BORRAR DEMANDA)
export async function deleteDemandAction(demandId: string) {
    try {
        const userRes = await getUserMeAction();
        if (!userRes?.success || !userRes?.data?.id) return { success: false, error: "No autorizado." };
        
        // Verificamos por seguridad que el que borra es el dueño real
        const demand = await prisma.b2bDemand.findUnique({ where: { id: demandId } });
        if (!demand || demand.userId !== userRes.data.id) {
            return { success: false, error: "Acceso denegado: Esta demanda no es tuya." };
        }

        await prisma.b2bDemand.delete({ where: { id: demandId } });
        return { success: true };
    } catch (error) {
        console.error("Error al borrar demanda:", error);
        return { success: false, error: "Error táctico al borrar la demanda." };
    }
}

// 🚀 6. MISIL DE REPROGRAMACIÓN (EDITAR DEMANDA)
export async function updateDemandAction(demandId: string, data: any) {
    try {
        const userRes = await getUserMeAction();
        if (!userRes?.success || !userRes?.data?.id) return { success: false, error: "No autorizado." };
        
        // Verificamos por seguridad que el que edita es el dueño
        const demand = await prisma.b2bDemand.findUnique({ where: { id: demandId } });
        if (!demand || demand.userId !== userRes.data.id) {
            return { success: false, error: "Acceso denegado: Esta demanda no es tuya." };
        }

        const updatedDemand = await prisma.b2bDemand.update({
            where: { id: demandId },
            data: {
                title: data.title,
                location: data.location,
                budget: data.budget,
                totalComm: data.totalComm,
                split: data.split,
                urgent: data.urgent,
                mandate: data.mandate,
                description: data.description,
            }
        });
        return { success: true, data: updatedDemand };
    } catch (error) {
        console.error("Error al editar demanda:", error);
        return { success: false, error: "Error táctico al actualizar la demanda." };
    }
}