import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;
    const safeUserId = String(userId || "");

    if (!safeUserId) {
      return NextResponse.json(
        { error: "Falta el ID del usuario" },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: safeUserId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                companyName: true,
                companyLogo: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedThreads = conversations.map((conv: any) => {
      const myParticipant = conv.participants.find(
        (p: any) => String(p.userId) === safeUserId
      );

      const otherParticipant = conv.participants.find(
        (p: any) => String(p.userId) !== safeUserId
      );

      const otherUser = otherParticipant?.user;
      const lastMessage = conv.messages?.[0] || null;

      const lastRead = myParticipant?.lastReadAt
        ? new Date(myParticipant.lastReadAt).getTime()
        : 0;

      let unreadCount = 0;

      for (const msg of conv.messages || []) {
        if (String(msg.senderId) !== safeUserId) {
          const msgTime = new Date(msg.createdAt).getTime();
          if (msgTime > lastRead) {
            unreadCount++;
          }
        }
      }

      return {
        id: conv.id,
        title: conv.propertyRef
          ? `Ref: ${conv.propertyRef}`
          : "Conversación General",

        unread:
          !!lastMessage &&
          String(lastMessage.senderId) !== safeUserId &&
          new Date(lastMessage.createdAt).getTime() > lastRead,

        unreadCount,

        otherUser: {
          id: otherUser?.id || null,
          name:
            otherUser?.companyName ||
            otherUser?.name ||
            "Usuario Desconocido",
          role: otherUser?.role || null,
          avatar: otherUser?.companyLogo || otherUser?.avatar || null,
        },

        lastMessage: lastMessage
          ? {
              text: lastMessage.text || "Mensaje enviado",
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error("❌ Error en API Móvil /conversations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}