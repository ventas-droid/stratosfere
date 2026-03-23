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
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: { agency: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProperties = properties.map((p: any) => {
      // 1. Extraemos los contratos vigentes de los arrays que manda Prisma
      const activeAssignment = Array.isArray(p.assignment) && p.assignment.length > 0 
        ? p.assignment[0] 
        : (!Array.isArray(p.assignment) ? p.assignment : null);
        
      const activeCampaign = Array.isArray(p.campaigns) && p.campaigns.length > 0 
        ? p.campaigns[0] 
        : null;

      // 2. Extraer nombre de agencia estrictamente del contrato
      const agencyObj = activeCampaign?.agency || activeAssignment?.agency || null;
      const agencyName = agencyObj?.companyName || agencyObj?.name || p.agencyName || null;

      // 3. Verdad absoluta para el backend
      const isReallyManaged = !!agencyObj;

      return {
        ...p,
        assignment: activeAssignment,
        activeCampaign: activeCampaign,
        agencyName: isReallyManaged ? agencyName : null,
        isManaged: isReallyManaged, 
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error cargando mis propiedades:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}