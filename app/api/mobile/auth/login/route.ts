import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

   const userData = {
  id: user.id,
  email: user.email,
  name: user.name || "Agente",
  role: user.role,
  avatar: user.avatar ?? null,
  companyLogo: user.companyLogo ?? null,
  coverImage: user.coverImage ?? null,
};

    return NextResponse.json({ message: "Acceso concedido", user: userData });

  } catch (error) {
    console.error("Error en la Aduana:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}