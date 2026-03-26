import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendRecoveryEmail } from '@/app/actions/send-emails';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Falta el correo electrónico." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Táctica de Seguridad: Si el usuario existe, disparamos. 
    // Si no existe, no decimos nada para que los hackers no puedan adivinar emails.
    if (user) {
      await sendRecoveryEmail(email);
      console.log(`✉️ Correo de recuperación enviado a: ${email}`);
    }

    return NextResponse.json({ success: true, message: "Enlace enviado." });

  } catch (error) {
    console.error("❌ ERROR EN RECUPERACIÓN MÓVIL:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}