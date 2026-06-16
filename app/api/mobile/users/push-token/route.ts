import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, pushToken } = body;

    if (!userId || !pushToken) {
      console.log('⚠️ [MOBILE PUSH TOKEN] Datos incompletos:', body);

      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: pushToken },
    });

    console.log('✅ [MOBILE PUSH TOKEN] Token actualizado:', {
      userId,
      pushToken,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ [MOBILE PUSH TOKEN] Error guardando token:', error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}