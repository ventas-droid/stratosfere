import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> } 
) {
  try {
    const { userId } = await params; 

    if (!userId) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }

    console.log(`📡 [API MOBILE] Buscando propuestas para el usuario: ${userId}`);

    const proposals = await prisma.campaign.findMany({
      where: {
        property: {
          userId: userId 
        }
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            companyLogo: true,
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

    return NextResponse.json(proposals);

  } catch (error) {
    console.error('❌ [API MOBILE] Error al obtener propuestas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}