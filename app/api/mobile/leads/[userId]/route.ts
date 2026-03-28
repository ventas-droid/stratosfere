import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    // 1. RED DE ARRASTRE
    const rawLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { managerId: userId },
          { property: { userId: userId } },
          { property: { assignment: { agencyId: userId } } }
        ]
      },
      include: {
        property: {
          select: {
            id: true, // Vital para conectar el chat
            userId: true,
            refCode: true,
            title: true,
            // 🔥 AQUÍ ESTÁ EL ARREGLO: Extraemos los datos COMPLETOS del dueño y de la agencia
            user: { select: { id: true, name: true, surname: true, avatar: true, companyLogo: true, role: true } },
            assignment: { 
              select: { 
                agencyId: true, 
                status: true,
                agency: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } }
              } 
            },
            campaigns: {
              where: { status: 'ACCEPTED' },
              take: 1,
              select: {
                agencyId: true,
                conversationId: true,
                agency: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. EL BISTURÍ MÓVIL (Intacto, su lógica maestra no se toca)
    const myRealLeads = rawLeads.filter(l => {
        if (l.managerId) return l.managerId === userId;
        const isAgencyActive = l.property?.assignment?.status === 'ACTIVE';
        if (isAgencyActive) return userId === l.property?.assignment?.agencyId;
        const isCampaignActive = l.property?.campaigns && l.property.campaigns.length > 0;
        if (isCampaignActive) return userId === l.property?.campaigns[0].agencyId;
        return userId === l.property?.userId;
    });

    // 3. FORMATEO MÓVIL (Empaquetamos la info sin recortarla)
    const formattedLeads = myRealLeads.map((l: any) => ({
      id: l.id,
      status: l.status,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source || "ORGANIC",
      date: l.createdAt,
      propertyId: l.property?.id || null,
      property: {
        id: l.property?.id || null,
        refCode: l.property?.refCode || "Sin Ref",
        title: l.property?.title || "Sin título",
        // Pasamos los bloques enteros al móvil
        user: l.property?.user || null,
        assignment: l.property?.assignment || null,
        campaigns: l.property?.campaigns || []
      }
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}