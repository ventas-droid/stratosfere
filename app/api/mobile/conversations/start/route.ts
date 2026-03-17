import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, otherUserId, propertyId } = await request.json();

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: "Faltan IDs de los combatientes" }, { status: 400 });
    }

    // 1. Radar: Buscamos si ya existe un chat abierto entre ellos
    let chat = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId } } },
          { participants: { some: { userId: otherUserId } } }
        ]
      }
    });

    // 2. Si no existe, creamos la sala nueva
    if (!chat) {
      chat = await prisma.conversation.create({
        data: {
          propertyId: propertyId || null,
          participants: {
            create: [
              { userId: userId },
              { userId: otherUserId }
            ]
          }
        }
      });
    }

    // 3. Devolvemos la ID de la sala al móvil
    return NextResponse.json({ chatId: chat.id });
  } catch (error) {
    console.error("❌ Error creando chat desde móvil:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}