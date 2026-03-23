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

    const properties = await prisma.property.findMany({
      where: { userId: targetId },
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
        p.assignment &&
        String(p.assignment.status || '').toUpperCase() === 'ACTIVE' &&
        p.assignment.agency
          ? p.assignment
          : null;

      const activeCampaign =
        Array.isArray(p.campaigns) && p.campaigns.length > 0
          ? p.campaigns[0]
          : null;

      // ✅ La campaña aceptada manda sobre assignment
      const managingAgency =
        activeCampaign?.agency ||
        activeAssignment?.agency ||
        null;

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const isManaged = !!managingAgency;

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged,
        managedSource: activeCampaign ? 'CAMPAIGN' : activeAssignment ? 'ASSIGNMENT' : null,
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}