import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId?: string, id?: string }> }
) {
  try {
    // 1. Resolvemos el ID (sirve tanto si su carpeta es [id] como [userId])
    const resolvedParams = await params;
    const targetId = resolvedParams.userId || resolvedParams.id;

    if (!targetId) {
        return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // 2. Buscamos las propiedades del usuario
    const properties = await prisma.property.findMany({
      where: { userId: targetId },
      include: {
        images: true, // Las fotos
        // 🔥 LOS CABLES DE COMUNICACIÓN PARA LA TARJETA AZUL DEL MÓVIL 🔥
        assignment: {
          where: { status: "ACTIVE" },
          include: { agency: true }
        },
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: { agency: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Preparamos el paquete para que el móvil no ponga "Agencia Asociada"
    const formattedProperties = properties.map((p: any) => {
      // Extraemos la campaña aceptada
      const activeCampaign = p.campaigns && p.campaigns.length > 0 ? p.campaigns[0] : null;
      // Extraemos el nombre real de la agencia ("Bernabeu Realty")
      const agencyName = activeCampaign?.agency?.companyName || p.assignment?.agency?.companyName || p.agencyName || null;

      return {
        ...p,
        activeCampaign: activeCampaign,
        agencyName: agencyName
      };
    });

    // 4. Enviamos el paquete al móvil
    return NextResponse.json(formattedProperties);

  } catch (error) {
    console.error("Error cargando mis propiedades:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}