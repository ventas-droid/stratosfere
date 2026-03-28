import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const propertyData = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        images: true,

        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            companyName: true,
            companyLogo: true,
            avatar: true,
            role: true,
            phone: true,
            mobile: true,
            email: true,
            licenseType: true,
            website: true,
            coverImage: true,
          },
        },

        assignment: {
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                surname: true,
                companyName: true,
                companyLogo: true,
                avatar: true,
                role: true,
                phone: true,
                mobile: true,
                email: true,
                licenseType: true,
                website: true,
                coverImage: true,
              },
            },
          },
        },

        campaigns: {
          where: { status: "ACCEPTED" },
          take: 1,
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                surname: true,
                companyName: true,
                companyLogo: true,
                avatar: true,
                role: true,
                phone: true,
                mobile: true,
                email: true,
                licenseType: true,
                website: true,
                coverImage: true,
              },
            },
          },
        },
      },
    });

    if (!propertyData) {
      return NextResponse.json(
        { success: false, error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const activeCampaign =
      propertyData.campaigns && propertyData.campaigns.length > 0
        ? propertyData.campaigns[0]
        : null;

    const activeAssignment =
      propertyData.assignment && propertyData.assignment.status === "ACTIVE"
        ? propertyData.assignment
        : null;

    const activeAgency = activeAssignment?.agency || activeCampaign?.agency || null;

    let finalUser = propertyData.user;
    if (activeAgency) {
      finalUser = { ...activeAgency, role: 'AGENCIA' };
    }

    const b2bData = activeCampaign
      ? {
          sharePct: Number(activeCampaign.commissionSharePct || 0),
          visibility: activeCampaign.commissionShareVisibility || "PRIVATE",
        }
      : {
          sharePct: Number(propertyData.sharePct || 0),
          visibility: propertyData.shareVisibility || "PRIVATE",
        };

    const numericPrice = Number(propertyData.price || 0);

    let cleanImages: string[] = [];
    if (Array.isArray(propertyData.images)) {
      cleanImages = propertyData.images.map((img: any) => img?.url || img).filter(Boolean);
    }

    const payload = {
      ...propertyData,
      activeCampaign,
      user: finalUser,
      ownerSnapshot: finalUser,
      b2b: b2bData,

      rawPrice: numericPrice,
      priceValue: numericPrice,
      price: numericPrice > 0 ? `${numericPrice.toLocaleString('es-ES')} €` : 'Consultar',

      images: cleanImages,
      img: cleanImages.length > 0 ? cleanImages[0] : propertyData.mainImage || null,
      mainImage: cleanImages.length > 0 ? cleanImages[0] : propertyData.mainImage || null,

      location: [propertyData.address, propertyData.city, propertyData.region].filter(Boolean).join(', '),
      beds: propertyData.rooms || 0,
      baths: propertyData.baths || 0,
      sqm: propertyData.mBuilt || 0,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error(`💥 Error táctico pidiendo expediente B2B ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Fallo en el servidor central" },
      { status: 500 }
    );
  }
}