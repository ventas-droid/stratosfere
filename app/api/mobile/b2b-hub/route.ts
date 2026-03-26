import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

        // ========================================================
        // 1. RECOGER CHIVATOS (Maniobra de Flanqueo a Dos Pasos)
        // ========================================================
        
        // PASO 1: Buscamos las conversaciones (Sin pedir la propiedad aún)
        const alliances = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId: userId } },
                propertyId: { not: null }
            },
            include: {
                participants: { include: { user: true } }
            }
        });

        // PASO 2: Extraemos los IDs de las propiedades y las buscamos de golpe
        const propertyIds = alliances.map((c: any) => c.propertyId).filter(Boolean);
        let properties: any[] = [];
        
        if (propertyIds.length > 0) {
            properties = await prisma.property.findMany({
                where: { id: { in: propertyIds } }
            });
        }

        // PASO 3: Unimos la información y BLINDAMOS LA PRIVACIDAD (Filtro B2B estricto)
        const formattedAlliances = alliances
            .filter((conv: any) => {
                // 1. Buscamos quién es el OTRO participante en este chat
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user;
                if (!other) return false;
                
                // 2. 🔥 EL PORTERO DE DISCOTECA: ¿Es una Agencia o Admin?
                // Si es un Particular, lo bloqueamos y no entra en la pestaña B2B
                return other.role === 'AGENCIA' || other.role === 'ADMIN';
            })
            .map((conv: any) => {
                const other = conv.participants.find((p: any) => p.userId !== userId)?.user || {};
                // Buscamos la propiedad en el array que acabamos de descargar
                const p = properties.find((prop: any) => prop.id === conv.propertyId) || {};
                
                // Cálculos blindados
                const sharePct = p.sharePct || p.commissionSharePct || 0;
                const priceNum = p.price ? Number(String(p.price).replace(/\D/g, "")) : 0;
                const commPct = p.commissionPct || 3;
                const imageStr = p.mainImage || "https://via.placeholder.com/150";
                
                return {
                    id: `ali_${conv.id}`,
                    cardType: 'ALIANZA', // 👈 ETIQUETA CLAVE
                    date: conv.updatedAt,
                    chatId: conv.id,
                    agency: { 
                        id: other.id, // 🔥 El DNI de la Agencia para que abra el perfil al instante
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
                        image: imageStr, 
                        sharePercent: sharePct, 
                        earnings: priceNum * (commPct / 100) * (sharePct / 100) 
                    }
                };
            });

        // ========================================================
        // 2. RECOGER PROPUESTAS (Respuestas a Demandas)
        // ========================================================
        const proposals = await prisma.b2bProposal.findMany({
            where: { receiverId: userId },
            include: { demand: true, sender: true }
        });

        const formattedProposals = proposals.map((p: any) => {
            const sender = p.sender || {};
            const isAgency = String(sender.role).toUpperCase() === 'AGENCIA';
            return {
                id: `prop_${p.id}`,
                cardType: 'PROPUESTA', // 👈 ETIQUETA CLAVE
                date: p.createdAt,
                status: p.status || "NUEVO",
                demandTitle: p.demand?.title || "Demanda",
                sender: { name: isAgency ? (sender.companyName || sender.name) : sender.name, avatar: isAgency ? (sender.companyLogo || sender.avatar) : sender.avatar, role: sender.role || 'PARTICULAR' },
                mode: p.mode,
                phone: p.phone,
                reference: p.reference,
                message: p.notes
            };
        });

        // ========================================================
        // 3. FUSIÓN Y ORDEN CRONOLÓGICO (Más recientes arriba)
        // ========================================================
        const b2bFeed = [...formattedAlliances, ...formattedProposals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ success: true, data: b2bFeed });
    } catch (error) {
        console.error("Error B2B Hub:", error);
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}