import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  address: true,
  postalCode: true,
};

const safeNumber = (value: any, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const buildFinancials = (campaign: any, propertyPrice: number) => {
  const commissionPct = safeNumber(campaign?.commissionPct, 0);
  const base = (propertyPrice * commissionPct) / 100;
  const ivaAmount = base * 0.21;
  const total = base + ivaAmount;

  return {
    base,
    ivaAmount,
    total,
  };
};

const computeFireState = (property: any) => {
  const now = Date.now();
  const promotedUntilMs = property?.promotedUntil
    ? new Date(property.promotedUntil).getTime()
    : 0;

  const rawTier = String(property?.promotedTier || 'FREE').toUpperCase();

  if (promotedUntilMs) {
    const active = promotedUntilMs > now;
    return {
      isFire: active,
      isPromoted: active,
      isPremium: active,
      promotedTier: active ? (rawTier === 'FREE' ? 'PREMIUM' : rawTier) : 'FREE',
      promotedUntil: active ? property.promotedUntil : null,
    };
  }

  const fallbackFire =
    property?.isFire === true ||
    property?.isPromoted === true ||
    property?.isPremium === true ||
    rawTier === 'PREMIUM';

  return {
    isFire: fallbackFire,
    isPromoted: fallbackFire,
    isPremium: fallbackFire,
    promotedTier: fallbackFire ? (rawTier === 'FREE' ? 'PREMIUM' : rawTier) : 'FREE',
    promotedUntil: property?.promotedUntil || null,
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId?: string; id?: string }> }
) {
  try {
    const resolvedParams = await params;
    const targetId = String(resolvedParams.userId || resolvedParams.id || '').trim();

    if (!targetId) {
      return NextResponse.json(
        { error: 'Falta ID' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        role: true,
        name: true,
        companyName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
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
          where: {
            status: { in: ['SENT', 'ACCEPTED'] },
          },
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
      const propertyPrice = safeNumber(p.price, 0);

      const activeAssignment =
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const externalAssignment =
        activeAssignment && String(activeAssignment.agencyId || '') !== ownerId
          ? activeAssignment
          : null;

      const campaigns = Array.isArray(p.campaigns) ? p.campaigns : [];

      const acceptedCampaignRaw =
        campaigns.find(
          (c: any) =>
            String(c.status || '').toUpperCase() === 'ACCEPTED' &&
            String(c.agencyId || '') !== ownerId
        ) || null;

      const sentCampaignRaw =
        campaigns.find(
          (c: any) =>
            String(c.status || '').toUpperCase() === 'SENT' &&
            String(c.agencyId || '') !== ownerId
        ) || null;

      const acceptedCampaign = acceptedCampaignRaw
        ? {
            ...acceptedCampaignRaw,
            commissionPct: safeNumber(acceptedCampaignRaw.commissionPct, 0),
            commissionSharePct: safeNumber(acceptedCampaignRaw.commissionSharePct, 0),
            exclusiveMonths: safeNumber(acceptedCampaignRaw.exclusiveMonths, 6),
            financials: buildFinancials(acceptedCampaignRaw, propertyPrice),
          }
        : null;

      const sentCampaign = sentCampaignRaw
        ? {
            ...sentCampaignRaw,
            commissionPct: safeNumber(sentCampaignRaw.commissionPct, 0),
            commissionSharePct: safeNumber(sentCampaignRaw.commissionSharePct, 0),
            exclusiveMonths: safeNumber(sentCampaignRaw.exclusiveMonths, 6),
            financials: buildFinancials(sentCampaignRaw, propertyPrice),
          }
        : null;

      const activeCampaign = acceptedCampaign || sentCampaign || null;

      const managingAgency =
        externalAssignment?.agency ||
        acceptedCampaign?.agency ||
        null;

      const finalAgencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const isManagedForParticular =
        !isAgencyViewer &&
        !!managingAgency &&
        (!!externalAssignment || !!acceptedCampaign);

      const isCapturedForAgency =
        isAgencyViewer &&
        !isOwnProperty &&
        (
          String(externalAssignment?.agencyId || '') === targetId ||
          String(acceptedCampaign?.agencyId || '') === targetId
        );

      const fireState = computeFireState(p);

      const cardKind = isAgencyViewer
        ? (isCapturedForAgency ? 'AGENCY_INHERITED' : 'AGENCY_OWN')
        : (isManagedForParticular
            ? 'OWNER_MANAGED'
            : (fireState.isPromoted ? 'OWNER_FIRE' : 'OWNER_NORMAL'));

      const firstImage =
        p.mainImage ||
        (Array.isArray(p.images) && p.images.length > 0
          ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
          : null);

      return {
        ...p,
        image: firstImage || null,

        assignment: externalAssignment,
        activeCampaign,

        agencyName: finalAgencyName,
        finalAgencyName,

        isOwnProperty,
        isManaged: isManagedForParticular,
        isCaptured: isCapturedForAgency,

        cardKind,
        portfolioKind: isAgencyViewer
          ? (isCapturedForAgency ? 'INHERITED' : 'OWN')
          : (isManagedForParticular ? 'MANAGED' : 'OWNER'),

        isAgencyViewer,

        ...fireState,
      };
    });

    return NextResponse.json(formattedProperties, {
      headers: {
        'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}