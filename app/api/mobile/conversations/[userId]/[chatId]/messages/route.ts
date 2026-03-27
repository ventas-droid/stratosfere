import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/utils/pusher"; // 📡 Su satélite actual

// 📥 GET: Cargar historial de mensajes de la sala
export async function GET(
  request: Request,
  // 🔥 FIX 1: Next.js ahora envuelve los params en una Promesa
  { params }: { params: Promise<{ userId: string, chatId: string }> } 
) {
  try {
    // 🔥 FIX 2: ¡ABRIMOS LA CAJA FUERTE ANTES DE LEER!
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    const msgs = await prisma.message.findMany({
      where: { conversationId: chatId },
      orderBy: { createdAt: "asc" }, // Los más antiguos arriba, nuevos abajo
    });

    return NextResponse.json(msgs);
  } catch (error) {
    console.error("❌ Error cargando mensajes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string, chatId: string }> }
) {
  try {
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    const body = await request.json();
    const { text, senderId } = body;

    if (!text || !senderId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // 1. Guardar mensaje
    const newMsg = await prisma.message.create({
      data: {
        conversationId: chatId,
        senderId: senderId,
        text: text,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            name: true,
            surname: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
          },
        },
      },
    });

    // 2. Actualizar updatedAt de la conversación
    await prisma.conversation.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // 3. Payload normalizado
    const payload = {
      ...newMsg,
      content: newMsg?.text ?? text,
      text: newMsg?.text ?? text,
    };

    // 4. Disparo a la sala de chat
    try {
      await pusherServer.trigger(`chat-${chatId}`, "new-message", payload);
      console.log(`📡 [PUSHER MÓVIL] Mensaje disparado: chat-${chatId}`);
    } catch (pusherError) {
      console.error("⚠️ Error disparando Pusher a chat:", pusherError);
    }

    // 5. 🌍 Disparo al canal global de todos los receptores reales
try {
  const conversation = await prisma.conversation.findUnique({
    where: { id: chatId },
    include: { participants: true }
  });

  if (conversation?.participants?.length) {
    const receivers = conversation.participants.filter(
      (p: any) => String(p.userId) !== String(senderId)
    );

    for (const receiver of receivers) {
      await pusherServer.trigger(
        `user-${receiver.userId}`,
        "new-message",
        payload
      );
      console.log(`🌍 [PUSHER MÓVIL] new-message disparado a user-${receiver.userId}`);
    }
  }
} catch (pusherError) {
  console.error("⚠️ Error disparando Pusher a user channel:", pusherError);
}

return NextResponse.json(payload);

} catch (error) {
  console.error("❌ Error enviando mensaje:", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}