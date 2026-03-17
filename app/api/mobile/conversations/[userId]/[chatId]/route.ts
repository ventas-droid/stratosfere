import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function GET(
  request: Request,
  // 🔥 FIX: Next.js exige abrir los params con await también aquí
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 🔥 ABRIMOS LA CAJA FUERTE ANTES DE LEER
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    if (!userId) {
      return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
    }

    // 📡 Buscamos las conversaciones
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Solo cogemos el último mensaje para la previsualización
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // ⚙️ Formateamos los datos para el móvil
    const formattedThreads = conversations.map((conv: any) => {
      const otherParticipant = conv.participants.find((p: any) => p.userId !== userId);
      const otherUser = otherParticipant?.user;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        title: conv.propertyRef ? `Ref: ${conv.propertyRef}` : "Conversación General",
        unread: false, 
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