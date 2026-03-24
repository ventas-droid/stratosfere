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

    const properties = await prisma.property.findMany({
      where: { userId: targetId },
      include: {
        images: true,
        assignment: {
          where: { status: 'ACTIVE' },
          include: { agency: true },
        },
        // 🔥 LA CLAVE: Buscamos SENT y ACCEPTED igual que en la Web
        campaigns: {
          where: { OR: [{ status: 'ACCEPTED' }, { status: 'SENT' }] },
          include: { agency: true },
          orderBy: { updatedAt: 'desc' },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProperties = properties.map((p: any) => {
      // 1. Filtramos estrictamente la campaña aceptada
      const activeCampaign = p.campaigns?.find((c: any) => String(c.status).toUpperCase() === 'ACCEPTED') || null;
      const activeAssignment = Array.isArray(p.assignment) ? p.assignment[0] : (p.assignment?.status === 'ACTIVE' ? p.assignment : null);

      // 2. Extraer nombre de agencia real
      const agencyObj = activeCampaign?.agency || activeAssignment?.agency || null;
      const agencyName = agencyObj?.companyName || agencyObj?.name || p.agencyName || null;

      // 3. Verdad absoluta: Está gestionada si logramos cazar el contrato de la agencia
      const isReallyManaged = !!agencyObj || !!activeCampaign;

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign: activeCampaign,
        agencyName: agencyName,
        isManaged: isReallyManaged, 
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}