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

    // 🔥 EL BLINDAJE: Metemos en la maleta TODO lo que la app móvil necesita saber
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || "Usuario",
      role: user.role,
      avatar: user.avatar ?? null,
      coverImage: user.coverImage ?? null,
      
      // DATOS DE AGENCIA DESBLOQUEADOS
      companyName: user.companyName ?? null, 
      companyLogo: user.companyLogo ?? null,
      tagline: user.tagline ?? null,
      
      // DATOS DE CONTACTO (Por si los necesita en el futuro)
      phone: user.phone ?? null,
      mobile: user.mobile ?? null,
      website: user.website ?? null,
      licenseNumber: user.licenseNumber ?? null,
    };

    return NextResponse.json({ message: "Acceso concedido", user: userData });

  } catch (error) {
    console.error("Error en la Aduana:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}