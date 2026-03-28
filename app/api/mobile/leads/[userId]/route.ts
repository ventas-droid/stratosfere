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
          { property: { assignment: { is: { agencyId: userId } } } },
          { property: { campaigns: { some: { agencyId: userId } } } } // 🛡️ ELIMINAMOS 'ACCEPTED' AQUÍ PARA VER SIEMPRE EL LOGO
        ]
      },
      include: {
        property: {
          select: {
            id: true, // Vital para conectar el chat
            userId: true,
            refCode: true,
            title: true,
            user: { select: { id: true, name: true, surname: true, avatar: true, companyLogo: true, role: true } },
            assignment: { 
              select: { 
                agencyId: true, 
                status: true,
                agency: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } }
              } 
            },
            campaigns: {
              // 🔥 BORRE ESTA LÍNEA DE AQUÍ ABAJO: where: { status: 'ACCEPTED' }
              // 🔥 BORRE ESTA LÍNEA DE AQUÍ ABAJO: orderBy: { createdAt: "desc" }
              take: 1, // Nos quedamos con la más reciente
              select: {
                agencyId: true,
                conversationId: true, // ✅ AHORA SÍ VIAJARÁ EL ID DEL CHAT
                status: true,
                agency: { select: { id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
   // 2. EL BISTURÍ MÓVIL (CORREGIDO PARA ACCIÓN BIDIRECCIONAL)
    const myRealLeads = rawLeads.filter(l => {
        if (l.managerId === userId) return true;
        if (l.property?.assignment?.status === 'ACTIVE' && l.property?.assignment?.agencyId === userId) return true;
        if (l.property?.campaigns?.length > 0 && l.property?.campaigns[0].agencyId === userId) return true;
        if (l.property?.userId === userId) return true;
        return false;
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