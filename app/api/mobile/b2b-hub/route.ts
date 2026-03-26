import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

        // ========================================================
        // 1. RECOGER CHIVATOS (INBOUND: Profesionales tocando MIS propiedades)
        // ========================================================
        const alliances = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId: userId } },
                propertyId: { not: null }
            },
            include: {
                participants: { include: { user: true } }
            }
        });

        const propertyIds = alliances.map((c: any) => c.propertyId).filter(Boolean);
        let properties: any[] = [];
        if (propertyIds.length > 0) {
            properties = await prisma.property.findMany({
                where: { id: { in: propertyIds } }
            });
        }

        const formattedAlliances = alliances
            .filter((conv: any) => {
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user;
                if (!other) return false;
                
                // 🔥 FILTRO 1: ¿Es un profesional (Agencia, Admin o Difusor)?
                const isProfessional = other.role === 'AGENCIA' || other.role === 'ADMIN' || other.role === 'DIFUSOR';
                
                // 🔥 FILTRO 2 (LA REGLA DE ORO): ¿La propiedad es MÍA?
                const p = properties.find((prop: any) => prop.id === conv.propertyId);
                const isMyProperty = p && p.userId === userId;

                // SOLO entra en el radar si es un profesional interesándose por SU producto
                return isProfessional && isMyProperty;
            })
            .map((conv: any) => {
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user || {};
                const p = properties.find((prop: any) => prop.id === conv.propertyId) || {};
                
                const sharePct = p.sharePct || p.commissionSharePct || 0;
                const priceNum = p.price ? Number(String(p.price).replace(/\D/g, "")) : 0;
                const commPct = p.commissionPct || 3;
                
                return {
                    id: `ali_${conv.id}`,
                    cardType: 'ALIANZA', 
                    date: conv.updatedAt,
                    chatId: conv.id,
                    agency: { 
                        id: other.id, 
                        name: other.companyName || other.name || "Agencia", 
                        avatar: other.companyLogo || other.avatar, 
                        phone: other.mobile || other.phone, 
                        email: other.email, 
                        role: other.role || 'AGENCIA' 
                    },
                    property: { 
                        id: p.id, 
                        title: p.title || "Propiedad", 
                        ref: p.refCode || "S/R", 
                        price: priceNum, 
                        image: p.mainImage || "https://via.placeholder.com/150", 
                        sharePercent: sharePct, 
                        earnings: priceNum * (commPct / 100) * (sharePct / 100) 
                    }
                };
            });

        // ========================================================
        // 2. RECOGER PROPUESTAS (INBOUND: Profesionales respondiendo a MIS demandas)
        // ========================================================
        const proposals = await prisma.b2bProposal.findMany({
            // 🔥 BLINDAJE: Solo las propuestas que usted RECIBE
            where: { receiverId: userId },
            include: { demand: true, sender: true }
        });

        const formattedProposals = proposals.map((p: any) => {
            const sender = p.sender || {};
            const isAgency = String(sender.role).toUpperCase() === 'AGENCIA';
            return {
                id: `prop_${p.id}`,
                cardType: 'PROPUESTA', 
                date: p.createdAt,
                status: p.status || "NUEVO",
                demandTitle: p.demand?.title || "Demanda",
                sender: { 
                    name: isAgency ? (sender.companyName || sender.name) : sender.name, 
                    avatar: isAgency ? (sender.companyLogo || sender.avatar) : sender.avatar, 
                    role: sender.role || 'PARTICULAR' 
                },
                mode: p.mode,
                phone: p.phone,
                reference: p.reference,
                message: p.notes
            };
        });

        // ========================================================
        // 3. FUSIÓN Y ORDEN CRONOLÓGICO
        // ========================================================
        const b2bFeed = [...formattedAlliances, ...formattedProposals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ success: true, data: b2bFeed });
    } catch (error) {
        console.error("Error B2B Hub:", error);
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}