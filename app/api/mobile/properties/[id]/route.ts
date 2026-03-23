import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isActiveStatus = (value: any) =>
  String(value || '').toUpperCase() === 'ACTIVE';

const isAcceptedStatus = (value: any) =>
  String(value || '').toUpperCase() === 'ACCEPTED';

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
          include: {
            agency: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProperties = properties.map((p: any) => {
      const assignments = Array.isArray(p.assignment)
        ? p.assignment
        : p.assignment
          ? [p.assignment]
          : [];

      const campaigns = Array.isArray(p.campaigns)
        ? p.campaigns
        : p.campaigns
          ? [p.campaigns]
          : [];

      const activeAssignment =
        assignments.find(
          (a: any) =>
            isActiveStatus(a?.status) && !!(a?.agencyId || a?.agency?.id)
        ) || null;

      const activeCampaign =
        campaigns.find(
          (c: any) =>
            isAcceptedStatus(c?.status) && !!(c?.agencyId || c?.agency?.id)
        ) || null;

      const managingAgency = activeAssignment?.agency || activeCampaign?.agency || null;

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const isManaged = Boolean(
        (activeAssignment && (activeAssignment?.agencyId || activeAssignment?.agency?.id)) ||
        (activeCampaign && (activeCampaign?.agencyId || activeCampaign?.agency?.id))
      );

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged,
        managementMode: isManaged ? 'AGENCY' : 'OWNER',
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}