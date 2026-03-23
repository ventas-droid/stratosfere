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

    // 🔥 EL CEREBRO B2B: BÚSQUEDA INTELIGENTE 🔥
    // Ahora busca propiedades que son TUYAS (Owner) o que has CAPTADO (Agencia)
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { userId: targetId },
          { campaigns: { some: { agencyId: targetId, status: 'ACCEPTED' } } }
        ]
      },
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
        user: true, // El dueño original
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

      const managingAgency =
        activeAssignment?.agency ||
        activeCampaign?.agency ||
        null;

      const agencyName =
        managingAgency?.companyName ||
        managingAgency?.name ||
        null;

      const isManaged = !!managingAgency;
      
      // 🔥 INDICADORES CLAVE PARA EL MÓVIL 🔥
      const isOwner = p.userId === targetId; // ¿Soy yo el dueño real?
      const isCaptured = !isOwner && isManaged; // Si no soy el dueño, pero está gestionada por mí -> ¡Capturada!

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign,
        agencyName,
        isManaged,
        isCaptured, // Mandamos la señal al radar del móvil
        isOwner
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}