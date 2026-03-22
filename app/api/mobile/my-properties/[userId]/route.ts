import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 1. Pedimos las propiedades con las relaciones REALES del schema
    const properties = await prisma.property.findMany({
      where: { userId: userId },
      include: {
        images: true,
        campaigns: {
          where: { status: 'ACCEPTED' }, // Traemos solo las campañas aceptadas
          include: {
            agency: true // Traemos los datos de la agencia de esa campaña
          }
        },
        assignment: {
          include: {
            agency: true // Por si está asignada de forma directa
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. LA MAGIA: Formateamos para que el móvil reciba exactamente lo que espera
  const formattedProperties = properties.map((prop: any) => {
  const activeCampaign =
    Array.isArray(prop.campaigns) && prop.campaigns.length > 0
      ? prop.campaigns[0]
      : null;

  const assignment = prop.assignment ?? null;
  const managingAgency = activeCampaign?.agency || assignment?.agency || null;
  const isManaged = !!assignment || !!activeCampaign;

  return {
    ...prop,

    // 🔥 CONTEXTO PRINCIPAL PARA MÓVIL
    activeCampaign,
    isManaged,
    isCaptured: isManaged,
    managerType: isManaged ? 'AGENCY' : 'OWNER',

    // 🔥 AGENCIA RESUMIDA
    agencyName:
      managingAgency?.companyName ||
      managingAgency?.name ||
      null,

    agency: managingAgency
      ? {
          id: managingAgency.id,
          name: managingAgency.name ?? null,
          companyName: managingAgency.companyName ?? null,
          avatar: managingAgency.avatar ?? null,
          companyLogo: managingAgency.companyLogo ?? null,
        }
      : null,

    // 🔥 TÉRMINOS DE GESTIÓN / EXPEDIENTE
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

    // 🔥 BLOQUE B2B RESUMIDO
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
      : null,

    // ✅ SOLO OCULTAMOS LOS ARRAYS CRUDOS EN LA RESPUESTA
    campaigns: undefined,
    assignment: undefined,
  };
});

    return NextResponse.json(formattedProperties);

  } catch (error) {
    console.error("Error extrayendo inventario del usuario:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}