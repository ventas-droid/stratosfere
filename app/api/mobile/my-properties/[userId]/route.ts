import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
    }

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { userId: userId },
          { campaigns: { some: { agencyId: userId, status: 'ACCEPTED' } } },
          { assignment: { agencyId: userId, status: 'ACTIVE' } }
        ]
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            companyLogo: true,
            role: true,
          }
        },
        campaigns: {
          where: { agencyId: userId, status: 'ACCEPTED' },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyName: true,
                avatar: true,
                companyLogo: true,
                role: true,
              }
            }
          }
        },
        assignment: {
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyName: true,
                avatar: true,
                companyLogo: true,
                role: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProperties = properties.map((prop: any) => {
      const activeCampaign =
        Array.isArray(prop.campaigns) && prop.campaigns.length > 0
          ? prop.campaigns[0]
          : null;

      const assignmentMatch =
        prop.assignment &&
        String(prop.assignment.agencyId) === String(userId) &&
        String(prop.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? prop.assignment
          : null;

      const isAgencyOwned = String(prop.userId || '') === String(userId);
      const isAgencyInherited = !!activeCampaign || !!assignmentMatch;
      const isManaged = isAgencyInherited;

      const managingAgency =
        activeCampaign?.agency ||
        assignmentMatch?.agency ||
        (isAgencyOwned ? prop.user : null);

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        (isAgencyOwned ? 'Mi Agencia' : null);

      const managementMode = isAgencyOwned
        ? 'AGENCY_OWNED'
        : isAgencyInherited
          ? 'AGENCY_INHERITED'
          : 'PARTICULAR';

      return {
        ...prop,

        // contexto móvil
        activeCampaign,
        isAgencyOwned,
        isAgencyInherited,
        isManaged,
        isCaptured: isAgencyInherited,
        managementMode,
        managerType: isAgencyOwned || isAgencyInherited ? 'AGENCY' : 'OWNER',

        // agencia resumida
        agencyName,
        agency: managingAgency
          ? {
              id: managingAgency.id,
              name: managingAgency.name ?? null,
              companyName: managingAgency.companyName ?? null,
              avatar: managingAgency.avatar ?? null,
              companyLogo: managingAgency.companyLogo ?? null,
              role: managingAgency.role ?? null,
            }
          : null,

        // términos visibles para la card / expediente
        mandateType:
          activeCampaign?.mandateType ??
          prop.mandateType ??
          null,

        exclusiveMandate:
          activeCampaign?.exclusiveMandate ??
          null,

        exclusiveMonths:
          activeCampaign?.exclusiveMonths ??
          null,

        commissionPct:
          activeCampaign?.commissionPct ??
          prop.commissionPct ??
          0,

        sharePct:
          activeCampaign?.commissionSharePct ??
          prop.sharePct ??
          0,

        shareVisibility:
          activeCampaign?.commissionShareVisibility ??
          prop.shareVisibility ??
          'PRIVATE',

        commissionBaseEur:
          activeCampaign?.commissionBaseEur ??
          0,

        commissionIvaEur:
          activeCampaign?.commissionIvaEur ??
          0,

        commissionTotalEur:
          activeCampaign?.commissionTotalEur ??
          0,

        commissionShareEur:
          activeCampaign?.commissionShareEur ??
          0,

        // bloque b2b resumido
        b2b: activeCampaign
          ? {
              sharePct:
                activeCampaign?.commissionSharePct ??
                prop.sharePct ??
                0,
              visibility:
                activeCampaign?.commissionShareVisibility ??
                prop.shareVisibility ??
                'PRIVATE',
            }
          : isAgencyOwned
            ? {
                sharePct: prop.sharePct ?? 0,
                visibility: prop.shareVisibility ?? 'PRIVATE',
              }
            : null,

        // limpiamos relaciones crudas para que el móvil no se lie
        campaigns: undefined,
        assignment: undefined,
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error extrayendo inventario del usuario:', error);
    return NextResponse.json(
      { error: 'Interferencia en el servidor' },
      { status: 500 }
    );
  }
}