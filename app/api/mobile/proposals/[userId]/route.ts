import { NextResponse } from 'next/server';
// Asegúrese de que esta es su ruta real de prisma en el proyecto web.
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }

    console.log(`📡 [API MOBILE] Buscando propuestas para el usuario: ${userId}`);

    const proposals = await prisma.campaign.findMany({
      where: {
        property: {
          userId: userId // Solo buscamos las campañas de las casas que le pertenecen a este usuario
        }
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            email: true,
            phone: true,
            mobile: true,
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            refCode: true,
            address: true,
            city: true,
            price: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ [API MOBILE] Se encontraron ${proposals.length} propuestas.`);

    return NextResponse.json(proposals);

  } catch (error) {
    console.error('❌ [API MOBILE] Error al obtener propuestas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}