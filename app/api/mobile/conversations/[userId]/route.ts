import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function GET(
  request: Request,
  // 🔥 FIX 1: Next.js exige que params sea tratado como Promesa
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 🔥 FIX 2: ¡ABRIMOS LA CAJA FUERTE ANTES DE LEER!
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    if (!userId) {
      return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
    }

    // 📡 Buscamos conversaciones sin intentar cruzar puentes inexistentes
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId }
        }
      },
      include: {
        participants: {
          include: {
            user: { 
              select: { 
                id: true, name: true, avatar: true, role: true, 
                companyName: true, companyLogo: true 
              } 
            }
          }
        },
        // 🔥 MODIFICACIÓN 1: Ampliamos el radar a 50 mensajes para poder contarlos
        messages: {
          orderBy: { createdAt: "desc" },
          take: 50,
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // ⚙️ Formateamos los datos
    const formattedThreads = conversations.map((conv: any) => {
      const myParticipant = conv.participants.find((p: any) => p.userId === userId);
      const otherParticipant = conv.participants.find((p: any) => p.userId !== userId);
      const otherUser = otherParticipant?.user;
      const lastMessage = conv.messages[0] || null;

      // 🔥 MODIFICACIÓN 2: La calculadora matemática
      // Miramos cuándo fue la última vez que el usuario abrió este chat
      const lastRead = myParticipant?.lastReadAt ? new Date(myParticipant.lastReadAt).getTime() : 0;
      let unreadCount = 0;
      
      // Contamos cuántos mensajes enemigos han llegado después de nuestra última lectura
      for (const msg of conv.messages) {
        if (msg.senderId !== userId) { 
          const msgTime = new Date(msg.createdAt).getTime();
          if (msgTime > lastRead) { 
            unreadCount++;
          }
        }
      }

      return {
        id: conv.id,
        // 🔥 FIX: Usamos el propertyRef que ya viene guardado en el propio chat
        title: conv.propertyRef ? `Ref: ${conv.propertyRef}` : "Conversación General",
        
        // 🔥 MANTENEMOS SU MAGIA ANTIGUA: Así no rompemos nada de lo que ya tenía
        unread: lastMessage && lastMessage.senderId !== userId && (new Date(lastMessage.createdAt).getTime() > lastRead) ? true : false,
        
        // 🔥 AÑADIMOS LA MUNICIÓN NUEVA: El número exacto de mensajes
        unreadCount: unreadCount,       
         
        otherUser: {
          id: otherUser?.id,
          name: otherUser?.companyName || otherUser?.name || "Usuario Desconocido",
          role: otherUser?.role,
          avatar: otherUser?.companyLogo || otherUser?.avatar || null,
        },
        lastMessage: lastMessage ? {
          text: lastMessage.text || lastMessage.content || "Mensaje enviado",
          createdAt: lastMessage.createdAt
        } : null
      };
    });

    return NextResponse.json(formattedThreads);

  } catch (error) {
    console.error("❌ Error en API Móvil /conversations:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}