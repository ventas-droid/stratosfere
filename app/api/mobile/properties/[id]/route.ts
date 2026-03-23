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

const moneyFromString = (value: any) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  const cleaned = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const buildFinancials = (campaign: any, propertyPrice: number) => {
  const commissionPct = safeNumber(campaign?.commissionPct, 0);

  const existingBase = campaign?.financials?.base;
  const existingIva = campaign?.financials?.ivaAmount;
  const existingTotal = campaign?.financials?.total;

  if (
    existingBase !== undefined &&
    existingIva !== undefined &&
    existingTotal !== undefined
  ) {
    return {
      base: typeof existingBase === 'string' ? moneyFromString(existingBase) : safeNumber(existingBase, 0),
      ivaAmount: typeof existingIva === 'string' ? moneyFromString(existingIva) : safeNumber(existingIva, 0),
      total: typeof existingTotal === 'string' ? moneyFromString(existingTotal) : safeNumber(existingTotal, 0),
    };
  }

  const base = (propertyPrice * commissionPct) / 100;
  const ivaAmount = base * 0.21;
  const total = base + ivaAmount;

  return { base, ivaAmount, total };
};

const normalizeCampaign = (campaign: any, propertyPrice: number) => {
  if (!campaign) return null;

  return {
    ...campaign,
    commissionPct: safeNumber(campaign.commissionPct, 0),
    commissionSharePct: safeNumber(campaign.commissionSharePct, 0),
    exclusiveMonths: safeNumber(campaign.exclusiveMonths, 6),
    financials: buildFinancials(campaign, propertyPrice),
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
      const priceNum = safeNumber(p.price, 0);

      const activeAssignment =
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const campaigns = Array.isArray(p.campaigns) ? p.campaigns : [];

      const acceptedCampaignRaw =
        campaigns.find((c: any) => String(c.status || '').toUpperCase() === 'ACCEPTED') || null;

      const sentCampaignRaw =
        campaigns.find((c: any) => String(c.status || '').toUpperCase() === 'SENT') || null;

      const acceptedCampaign = normalizeCampaign(acceptedCampaignRaw, priceNum);
      const sentCampaign = normalizeCampaign(sentCampaignRaw, priceNum);

      const activeCampaign = acceptedCampaign || sentCampaign || null;

      const managingAgency =
        activeAssignment?.agency ||
        acceptedCampaign?.agency ||
        null;

      const managingAgencyId = String(
        activeAssignment?.agencyId ||
          acceptedCampaign?.agencyId ||
          managingAgency?.id ||
          ''
      );

      const isOwnProperty = ownerId === targetId;

      const isCapturedForAgency =
        isAgencyViewer &&
        !isOwnProperty &&
        (
          String(activeAssignment?.agencyId || '') === targetId ||
          String(acceptedCampaign?.agencyId || '') === targetId
        );

      const isManagedForParticular =
        !isAgencyViewer &&
        !!managingAgencyId &&
        managingAgencyId !== ownerId &&
        (
          !!activeAssignment ||
          !!acceptedCampaign
        );

      const finalAgencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const fireState = computeFireState(p);

      const firstImage =
        p.mainImage ||
        (Array.isArray(p.images) && p.images.length > 0
          ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
          : null);

      return {
        ...p,
        image: firstImage || null,
        assignment: activeAssignment,
        campaigns,
        activeCampaign,
        agencyName: finalAgencyName,
        finalAgencyName,
        isOwnProperty,
        isCaptured: isCapturedForAgency,
        isManaged: isManagedForParticular,
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