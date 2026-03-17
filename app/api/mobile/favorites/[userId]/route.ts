import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Buscamos todos los favoritos de este usuario y le pedimos a Prisma 
    // que nos adjunte (include) la información de la casa real
    const userFavorites = await prisma.favorite.findMany({
      where: { userId: userId },
      include: {
        property: {
          include: {
            images: true // Traemos las fotos de la casa también
          }
        }
      }
    });

    // Extraemos solo las casas (limpiamos el envoltorio de "favorito")
    const properties = userFavorites.map(fav => fav.property);

    return NextResponse.json(properties);

  } catch (error) {
    console.error("Error extrayendo favoritos del usuario:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}