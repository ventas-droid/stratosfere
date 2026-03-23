import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId?: string; id?: string }> }
) {
  try {
    const resolvedParams = await params;
    const targetId = resolvedParams.userId || resolvedParams.id;

    if (!targetId) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    // 🔥 EL GRAN ARREGLO: Buscar tanto lo que es mío (dueño) como lo que gestiono (agencia)
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { userId: targetId }, // Propiedades mías (Particular)
          { assignment: { agencyId: targetId, status: 'ACTIVE' } }, // Propiedades asignadas (Agencia)
          { campaigns: { some: { agencyId: targetId, status: 'ACCEPTED' } } } // Campañas ganadas (Agencia)
        ]
      },
      include: {
        images: true,
        assignment: {
          include: {
            agency: true,
          },
        },
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: {
            agency: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 1,
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProperties = properties.map((p: any) => {
      const activeAssignment =
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const activeCampaign =
        Array.isArray(p.campaigns) && p.campaigns.length > 0
          ? p.campaigns[0]
          : null;

      const managingAgency =
        activeAssignment?.agency ||
        activeCampaign?.agency ||
        null;

      let agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      // Filtro de seguridad
      if (agencyName && (agencyName === p.user?.name || agencyName === p.user?.companyName || agencyName === "Agencia Gestora")) {
        agencyName = null;
      }

      const isManaged = !!managingAgency;

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged,
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}