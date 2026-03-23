import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        p.assignment && String(p.assignment.status || '').toUpperCase() === 'ACTIVE'
          ? p.assignment
          : null;

      const activeCampaign =
        Array.isArray(p.campaigns) && p.campaigns.length > 0
          ? p.campaigns[0]
          : null;

      let managingAgency =
        activeAssignment?.agency ||
        activeCampaign?.agency ||
        null;

      // 🛡️ EL ESCUDO ANTI-ISIDRO (AUTOASIGNACIÓN):
      // Si la agencia que gestiona tiene tu mismo ID, la anulamos. Es un dato de prueba.
      if (managingAgency && (managingAgency.id === targetId || managingAgency.id === p.userId)) {
          managingAgency = null;
      }

      let agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      // Doble comprobación por nombre
      if (agencyName && (agencyName === p.user?.name || agencyName === p.user?.companyName || agencyName === "Agencia Gestora")) {
          agencyName = null;
          managingAgency = null;
      }

      // La verdad absoluta:
      const isManaged = !!managingAgency;

      // 🔥 CÁLCULO DEL FUEGO DESDE EL SERVIDOR
      const promotedUntilMs = p.promotedUntil ? new Date(p.promotedUntil).getTime() : 0;
      const isPremiumFlag = p.isFire === true || p.isPromoted === true || String(p.promotedTier || '').toUpperCase() === 'PREMIUM';
      const hasFire = !!promotedUntilMs && promotedUntilMs > Date.now() && isPremiumFlag;

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged, // Se envía limpio al móvil
        hasFire,   // Se envía limpio al móvil
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}