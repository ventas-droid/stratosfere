import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/utils/pusher";
import { sendExpoPushToUserId } from "@/app/utils/expo-push"; // 🚀 Importamos el Cañón

// 📥 GET: Cargar historial de mensajes de la sala (AHORA BLINDADO)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string, chatId: string }> } 
) {
  try {
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;
    const routeUserId = resolvedParams.userId;

    // =========================================================
    // 🛡️ BLINDAJE LECTURA (Evita espionaje de chats ajenos)
    // =========================================================
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: chatId, userId: routeUserId },
      select: { id: true },
    });

    if (!participant) {
      console.warn(`🚨 Espionaje bloqueado en chat ${chatId} por usuario ${routeUserId}`);
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    // =========================================================

    const msgs = await prisma.message.findMany({
      where: { conversationId: chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(msgs);
  } catch (error) {
    console.error("❌ Error cargando mensajes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 📤 POST: Enviar nuevo mensaje (AHORA BLINDADO Y SANEADO)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string, chatId: string }> }
) {
  try {
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;
    const routeUserId = resolvedParams.userId; // 🎯 Identidad real (inviolable)

    const body = await request.json();
    const { text } = body; // Ignoramos cualquier senderId falso que mande el móvil

    // 🧹 Saneamiento de datos
    const senderId = String(routeUserId || "");
    const cleanText = String(text || "").trim();

    if (!cleanText || !senderId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // =========================================================
    // 🛡️ BLINDAJE ESCRITURA (Evita escritura en chats ajenos)
    // =========================================================
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: chatId, userId: senderId },
      select: { id: true },
    });

    if (!participant) {
      console.warn(`🚨 Intento de escritura fantasma en chat ${chatId} por usuario ${senderId}`);
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    // =========================================================

    // 1. Guardar mensaje con texto limpio
    const newMsg = await prisma.message.create({
      data: {
        conversationId: chatId,
        senderId: senderId,
        text: cleanText,
      },
      include: {
        sender: {
          select: { id: true, role: true, name: true, surname: true, avatar: true, companyName: true, companyLogo: true },
        },
      },
    });

    // 2. Actualizar fecha del chat
    await prisma.conversation.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // 3. Payload
    const payload = { ...newMsg, content: cleanText, text: cleanText };

    // 4. Disparo Pusher a la sala abierta
    try {
      await pusherServer.trigger(`chat-${chatId}`, "new-message", payload);
    } catch (e) { console.error(e); }

    // 5. 🌍 Disparo Global (Pusher) + 🚀 EXPO PUSH (Background)
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: chatId },
        include: { participants: true }
      });

      if (conversation?.participants?.length) {
        const receivers = conversation.participants.filter((p: any) => String(p.userId) !== String(senderId));
        const senderName = newMsg.sender?.companyName || newMsg.sender?.name || 'Stratosfere';

        for (const receiver of receivers) {
          // A) Pusher
          await pusherServer.trigger(`user-${receiver.userId}`, "new-message", payload);
          
          // B) Expo Push con Tipo y Texto Limpio
          await sendExpoPushToUserId(receiver.userId, {
            title: senderName,
            body: cleanText,
            data: { 
              type: "new_message", 
              conversationId: chatId 
            }
          });
        }
      }
    } catch (e) { console.error("⚠️ Error disparando notificaciones:", e); }

    return NextResponse.json(payload);

  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}