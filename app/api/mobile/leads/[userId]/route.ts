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
            userId: true,
            refCode: true,
            title: true,
            assignment: { select: { agencyId: true, status: true } },
            user: { select: { avatar: true, companyLogo: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. EL BISTURÍ MÓVIL
    const myRealLeads = rawLeads.filter(l => {
        if (l.managerId) return l.managerId === userId;
        const isAgencyActive = l.property?.assignment?.status === 'ACTIVE';
        if (isAgencyActive) return userId === l.property?.assignment?.agencyId;
        return userId === l.property?.userId;
    });

    // 3. FORMATEO MÓVIL
    const formattedLeads = myRealLeads.map((l: any) => ({
      id: l.id,
      status: l.status,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source || "ORGANIC",
      date: l.createdAt,
      property: {
        refCode: l.property?.refCode || "Sin Ref",
        title: l.property?.title || "Sin título",
        user: { avatar: l.property?.user?.avatar || l.property?.user?.companyLogo || null }
      }
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}