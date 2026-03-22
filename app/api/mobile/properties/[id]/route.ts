import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  // ⚠️ ATENCIÓN AL CAMBIO AQUÍ: Params ahora se declara como una Promesa
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⚠️ Y EL CAMBIO CLAVE AQUÍ: Ponemos el 'await' para esperar a que cargue el ID
    const { id: propertyId } = await params;

    // Buscamos la casa exacta en la base de datos (y obligamos a que nos traiga también las fotos de la tabla Images)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: true // ¡Traemos el paquete de fotos adjunto!
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Casa no encontrada" }, { status: 404 });
    }

    // Devolvemos el expediente completo con las fotos
    return NextResponse.json(property);

  } catch (error) {
    console.error("Error en el Radar de Fotos:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}