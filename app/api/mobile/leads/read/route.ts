import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ success: false, error: "Falta ID" });

    // En lugar de hacer una consulta gigante que Prisma rompe, 
    // buscamos los IDs exactos de MIS leads y los marcamos como leídos.
    const rawLeads = await prisma.lead.findMany({
      where: {
        status: 'NEW',
        OR: [
          { managerId: userId },
          { property: { userId: userId } },
          { property: { assignment: { agencyId: userId } } }
        ]
      },
      select: { id: true, managerId: true, property: { select: { userId: true, assignment: { select: { agencyId: true, status: true } } } } }
    });

    const myLeadIds = rawLeads.filter(l => {
        if (l.managerId) return l.managerId === userId;
        const isAgencyActive = l.property?.assignment?.status === 'ACTIVE';
        if (isAgencyActive) return userId === l.property?.assignment?.agencyId;
        return userId === l.property?.userId;
    }).map(l => l.id);

    if (myLeadIds.length > 0) {
        await prisma.lead.updateMany({
            where: { id: { in: myLeadIds } },
            data: { status: 'READ' }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando burbuja:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}