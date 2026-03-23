import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_SELECT = {
  id: true,
  name: true,
  surname: true,
  email: true,
  role: true,
  avatar: true,
  companyName: true,
  companyLogo: true,
  coverImage: true,
  phone: true,
  mobile: true,
  website: true,
  licenseNumber: true,
  tagline: true,
  zone: true,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId?: string; id?: string }> }
) {
  try {
    const resolvedParams = await params;
    const targetId = String(resolvedParams.userId || resolvedParams.id || '').trim();

    if (!targetId) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, name: true, companyName: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isAgencyViewer =
      String(targetUser.role || '').toUpperCase() === 'AGENCIA' ||
      String(targetUser.role || '').toUpperCase() === 'ADMIN';

    const properties = await prisma.property.findMany({
      where: isAgencyViewer
        ? {
            OR: [
              { userId: targetId },
              {
                assignment: {
                  is: {
                    agencyId: targetId,
                    status: 'ACTIVE',
                  },
                },
              },
              {
                campaigns: {
                  some: {
                    agencyId: targetId,
                    status: 'ACCEPTED',
                  },
                },
              },
            ],
          }
        : {
            userId: targetId,
          },
      include: {
        images: true,
        user: { select: USER_SELECT },
        assignment: {
          include: {
            agency: { select: USER_SELECT },
          },
        },
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: {
            agency: { select: USER_SELECT },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProperties = properties.map((p: any) => {
      const ownerId = String(p.userId || '');
      const isOwnProperty = ownerId === targetId;

      const activeAssignment =
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const acceptedCampaigns = Array.isArray(p.campaigns) ? p.campaigns : [];

      const activeCampaign =
        isAgencyViewer
          ? acceptedCampaigns.find((c: any) => String(c.agencyId || '') === targetId) ||
            acceptedCampaigns[0] ||
            null
          : acceptedCampaigns[0] || null;

      const managingAgency =
        activeAssignment?.agency ||
        activeCampaign?.agency ||
        null;

      const managingAgencyId = String(
        activeAssignment?.agencyId ||
          activeCampaign?.agencyId ||
          managingAgency?.id ||
          ''
      );

      const isManagedByExternalAgency =
        !!managingAgency &&
        !!managingAgencyId &&
        managingAgencyId !== ownerId;

      const isInheritedForAgency =
        isAgencyViewer &&
        !isOwnProperty &&
        (
          (activeAssignment && String(activeAssignment.agencyId || '') === targetId) ||
          (activeCampaign && String(activeCampaign.agencyId || '') === targetId)
        );

      const agencyName = isManagedByExternalAgency
        ? managingAgency?.companyName || managingAgency?.name || null
        : null;

      const portfolioKind = isAgencyViewer
        ? (isInheritedForAgency ? 'INHERITED' : 'OWN')
        : (isManagedByExternalAgency ? 'MANAGED' : 'OWNER');

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged: !isAgencyViewer && isManagedByExternalAgency,
        isOwnProperty,
        isCaptured: isInheritedForAgency,
        portfolioKind,
        isAgencyViewer,
        isPromoted: !!p.isPromoted,
        isFire: !!p.isFire,
        isPremium: !!p.isPremium,
        promotedTier: p.promotedTier || 'FREE',
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}