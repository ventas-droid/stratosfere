import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, pushToken } = body;

    // Si faltan coordenadas, abortamos
    if (!userId || !pushToken) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    // 🎯 GOLPE DIRECTO: Guardamos el token en la mochila del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: pushToken }
    });

    console.log(`✅ [RADAR PUSH] Token actualizado para el usuario: ${userId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ [RADAR PUSH] Error guardando token:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}