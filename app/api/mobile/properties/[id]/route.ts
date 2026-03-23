import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __mobileMyPropertiesPrisma?: PrismaClient;
};

const prisma =
  globalForPrisma.__mobileMyPropertiesPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__mobileMyPropertiesPrisma = prisma;
}

const normalizeRole = (role: any) => String(role || '').toUpperCase();

const isAgencyRole = (role: any) => {
  const r = normalizeRole(role);
  return r.includes('AGENCIA') || r.includes('AGENCY') || r === 'ADMIN';
};

const toNumber = (value: any) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '')
    .replace(/[^\d.,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

const buildFinancials = (priceValue: any, commissionPctValue: any) => {
  const price = toNumber(priceValue);
  const commissionPct = toNumber(commissionPctValue);
  const base = price * (commissionPct / 100);
  const ivaAmount = base * 0.21;
  const total = base + ivaAmount;

  return {
    base,
    ivaAmount,
    total,
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId?: string; id?: string }> }
) {
  try {
    const resolvedParams = await params;
    const targetId = String(
      resolvedParams.userId || resolvedParams.id || ''
    ).trim();

    if (!targetId) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const agencyView = isAgencyRole(currentUser.role);

    const properties = await prisma.property.findMany({
      where: agencyView
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
        assignment: {
          include: {
            agency: true,
          },
        },
        campaigns: {
          where: {
            status: 'ACCEPTED',
          },
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
      distinct: ['id'],
    });

    const formattedProperties = properties.map((p: any) => {
      const ownerId = String(p.userId || p.user?.id || '');
      const isOwnProperty = ownerId === targetId;

      const activeAssignment =
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const acceptedCampaigns = Array.isArray(p.campaigns) ? p.campaigns : [];

      const activeCampaign =
        (agencyView && !isOwnProperty
          ? acceptedCampaigns.find(
              (c: any) =>
                String(c.agencyId || c.agency?.id || '') === targetId
            )
          : null) ||
        acceptedCampaigns[0] ||
        null;

      const assignmentAgencyId = String(
        activeAssignment?.agencyId || activeAssignment?.agency?.id || ''
      );

      const campaignAgencyId = String(
        activeCampaign?.agencyId || activeCampaign?.agency?.id || ''
      );

      const assignmentMatchesAgency =
        !!activeAssignment && assignmentAgencyId === targetId;

      const campaignMatchesAgency =
        !!activeCampaign && campaignAgencyId === targetId;

      let managingAgency =
        activeAssignment?.agency ||
        activeCampaign?.agency ||
        null;

      if (String(managingAgency?.id || '') === ownerId) {
        managingAgency = null;
      }

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const isManaged =
        !!activeAssignment ||
        !!(
          activeCampaign &&
          String(activeCampaign.status || '').toUpperCase() === 'ACCEPTED'
        );

      const isCaptured =
        agencyView &&
        !isOwnProperty &&
        (assignmentMatchesAgency || campaignMatchesAgency);

      const financials =
        activeCampaign?.financials ||
        buildFinancials(
          p.rawPrice ?? p.price,
          activeCampaign?.commissionPct ?? p.commissionPct
        );

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign: activeCampaign
          ? {
              ...activeCampaign,
              financials,
            }
          : null,
        agencyName,
        isManaged,
        isCaptured,
        isOwnProperty,
        portfolioKind: agencyView
          ? isOwnProperty
            ? 'OWN'
            : 'INHERITED'
          : 'OWNER',
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}