import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, propertyId } = body;

    if (!userId || !propertyId) {
      return NextResponse.json({ error: "Faltan coordenadas (userId o propertyId)" }, { status: 400 });
    }

    // 1. Buscamos si este soldado ya tenía esta casa en favoritos
    const existingFav = await prisma.favorite.findFirst({
      where: { userId, propertyId }
    });

    if (existingFav) {
      // 2A. Si ya era favorito, disparamos para BORRARLO (Quitar favorito)
      await prisma.favorite.deleteMany({
        where: { userId, propertyId }
      });
      return NextResponse.json({ message: "🤍 Favorito eliminado", isFav: false });
    } else {
      // 2B. Si no era favorito, disparamos para CREARLO (Añadir favorito)
      await prisma.favorite.create({
        data: { userId, propertyId }
      });
      return NextResponse.json({ message: "❤️ Favorito guardado a fuego", isFav: true });
    }

  } catch (error) {
    console.error("Error en Operación Corazón de Hierro:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}