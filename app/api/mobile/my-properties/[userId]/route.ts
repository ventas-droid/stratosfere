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
    const formattedProperties = properties.map(prop => {
      
      // Fabricamos el "activeCampaign" que la app está buscando
      const activeCampaign = prop.campaigns && prop.campaigns.length > 0 
        ? prop.campaigns[0] 
        : null;

      // Determinamos si está gestionada
      const isManaged = !!prop.assignment || !!activeCampaign;
      
      // Rescatamos el nombre de la agencia si existe
      const agencyName = activeCampaign?.agency?.companyName 
        || prop.assignment?.agency?.companyName 
        || null;

      return {
        ...prop,
        activeCampaign, // Inyectamos la campaña activa
        isManaged,      // Inyectamos el booleano
        agencyName,     // Inyectamos el nombre
        // Limpiamos los arrays crudos para no mandar datos innecesarios al móvil
        campaigns: undefined, 
        assignment: undefined 
      };
    });

    return NextResponse.json(formattedProperties);

  } catch (error) {
    console.error("Error extrayendo inventario del usuario:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}