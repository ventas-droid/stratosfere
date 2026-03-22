import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: true, // ¡Las fotos intactas!
        // 🔥 AQUÍ CONECTAMOS EL CABLE DE LA AGENCIA (BERNABEU REALTY) 🔥
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: { agency: true }
        },
        assignment: {
          include: { agency: true }
        },
        user: true
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 });
    }

    // Empaquetamos la campaña aceptada en la variable que el móvil está esperando
    const formattedProperty = {
      ...property,
      activeCampaign: property.campaigns && property.campaigns.length > 0 ? property.campaigns[0] : null
    };

    return NextResponse.json(formattedProperty);

  } catch (error) {
    console.error("Error en el Radar de Fotos:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}