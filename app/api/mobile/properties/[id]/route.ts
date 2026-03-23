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
      const assignmentList = Array.isArray(p.assignment)
        ? p.assignment
        : p.assignment
          ? [p.assignment]
          : [];

      const activeAssignment =
        assignmentList.find(
          (a: any) =>
            String(a?.status || '').toUpperCase() === 'ACTIVE'
        ) || null;

      const campaignList = Array.isArray(p.campaigns) ? p.campaigns : [];

      const activeCampaign =
        campaignList.find(
          (c: any) =>
            String(c?.status || '').toUpperCase() === 'ACCEPTED'
        ) || null;

      const managingAgency =
        activeCampaign?.agency ||
        activeAssignment?.agency ||
        null;

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      // ✅ IMPORTANTE: azul si hay campaign aceptada o assignment activo
      const isManaged = !!(activeCampaign || activeAssignment);

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