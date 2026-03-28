import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    // 1. RED DE ARRASTRE (Su código exacto, solo blindamos la relación 1 a 1 con "is:")
    const rawLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { managerId: userId },
          { property: { userId: userId } },
          { property: { assignment: { is: { agencyId: userId } } } },
          // Respaldo B2B (Por si la agencia viene de una campaña compartida)
          { property: { campaigns: { some: { agencyId: userId, status: 'ACCEPTED' } } } }
        ]
      },
      include: {
        property: {
          select: {
            id: true, // Vital para el chat del móvil
            userId: true,
            refCode: true,
            title: true,
            // 🔥 AQUÍ ESTÁ LA CURA: Pedimos los datos completos del Dueño Y de la Agencia
            user: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } },
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
                agency: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. EL BISTURÍ MÓVIL (SU LÓGICA MAESTRA INTACTA)
    const myRealLeads = rawLeads.filter(l => {
        if (l.managerId) return l.managerId === userId;
        
        const isAgencyActive = l.property?.assignment?.status === 'ACTIVE';
        if (isAgencyActive) return userId === l.property?.assignment?.agencyId;

        // Capa de seguridad B2B para que el bisturí no corte leads de campañas aceptadas
        const isB2BActive = l.property?.campaigns && l.property.campaigns.length > 0;
        if (isB2BActive) return userId === l.property?.campaigns[0].agencyId;

        return userId === l.property?.userId;
    });

    // 3. FORMATEO MÓVIL (Ahora mandamos la maleta completa sin recortar a la Agencia)
    const formattedLeads = myRealLeads.map((l: any) => ({
      id: l.id,
      status: l.status,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source || "ORGANIC",
      date: l.createdAt,
      propertyId: l.property?.id || l.propertyId, // El móvil lo necesita para abrir el chat
      property: {
        id: l.property?.id,
        refCode: l.property?.refCode || "Sin Ref",
        title: l.property?.title || "Sin título",
        // 🔥 Mandamos los bloques enteros. El móvil ya sabe cómo leerlos gracias a nuestro código anterior.
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