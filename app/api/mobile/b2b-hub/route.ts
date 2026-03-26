import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

        // ========================================================
        // 1. CHATS B2B (Casas + Contactos Directos de Perfil)
        // ========================================================
        const alliances = await prisma.conversation.findMany({
            where: { participants: { some: { userId: userId } } },
            include: { participants: { include: { user: true } } }
        });

        const propertyIds = alliances.map((c: any) => c.propertyId).filter(Boolean);
        let properties: any[] = [];
        if (propertyIds.length > 0) {
            properties = await prisma.property.findMany({ 
                where: { id: { in: propertyIds } },
                include: { assignment: true } // 🔥 LA CLAVE: Traemos el contrato de la Agencia
            });
        }

        const formattedAlliances = alliances
            .filter((conv: any) => {
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user;
                if (!other) return false;
                return other.role === 'AGENCIA' || other.role === 'ADMIN' || other.role === 'DIFUSOR';
            })
            .map((conv: any) => {
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user || {};
                const p = conv.propertyId ? properties.find((prop: any) => prop.id === conv.propertyId) : null;
                
                // 🔥 BRÚJULA TÁCTICA BASADA EN SU SCHEMA EXACTO 🔥
                let direction = 'INBOUND'; // Por defecto si es un chat directo de perfil
                if (p) { 
                    // ¿Es mi casa (soy el usuario directo) o soy la Agencia asignada en el PropertyAssignment?
                    const isMyProperty = p.userId === userId || p.assignment?.agencyId === userId;
                    
                    // Si es mía/gestionada por mí, vienen a buscarme = RECIBIDO (INBOUND)
                    // Si es de otro, yo fui a buscarle = ENVIADO (OUTBOUND)
                    direction = isMyProperty ? 'INBOUND' : 'OUTBOUND'; 
                }

                const sharePct = p?.sharePct || p?.commissionSharePct || 0;
                const priceNum = p?.price ? Number(String(p.price).replace(/\D/g, "")) : 0;
                
                return {
                    id: `ali_${conv.id}`,
                    cardType: 'ALIANZA', 
                    date: conv.updatedAt,
                    chatId: conv.id,
                    direction: direction, // 👈 Se envía la dirección correcta al móvil
                    agency: { 
                        id: other.id, name: other.companyName || other.name || "Agencia", avatar: other.companyLogo || other.avatar, phone: other.mobile || other.phone, email: other.email, role: other.role || 'AGENCIA' 
                    },
                    property: p ? { 
                        id: p.id, title: p.title || "Propiedad", ref: p.refCode || "S/R", price: priceNum, image: p.mainImage || "https://via.placeholder.com/150", sharePercent: sharePct, earnings: priceNum * ((p.commissionPct||3) / 100) * (sharePct / 100) 
                    } : null
                };
            });

        // ========================================================
        // 2. PROPUESTAS DEMANDAS (BIDIRECCIONAL - YA COMPROBADO)
        // ========================================================
        const proposals = await prisma.b2bProposal.findMany({
            where: { OR: [{ receiverId: userId }, { senderId: userId }] }, 
            include: { demand: true, sender: true, receiver: true }
        });

        const formattedProposals = proposals.map((p: any) => {
            const isMeSender = p.senderId === userId;
            const other = isMeSender ? p.receiver : p.sender;
            
            return {
                id: `prop_${p.id}`,
                cardType: 'PROPUESTA', 
                date: p.createdAt,
                direction: isMeSender ? 'OUTBOUND' : 'INBOUND', 
                status: p.status || "NUEVO",
                demandTitle: p.demand?.title || "Demanda",
                sender: { name: other?.companyName || other?.name, avatar: other?.companyLogo || other?.avatar, role: other?.role || 'AGENCIA' },
                mode: p.mode, phone: p.phone, reference: p.reference, message: p.notes
            };
        });

        const b2bFeed = [...formattedAlliances, ...formattedProposals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return NextResponse.json({ success: true, data: b2bFeed });
    } catch (error) {
        console.error("Error B2B Hub:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}