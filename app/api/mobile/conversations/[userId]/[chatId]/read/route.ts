import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    const { userId, chatId } = await params;

    if (!userId || !chatId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: chatId,
        userId: userId,
      },
      select: { id: true },
    });

    if (!participant) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: chatId,
        userId: userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error marcando conversación como leída:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


