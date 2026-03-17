import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Motor de desencriptación (usamos bcryptjs que no da fallos en Next.js)

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Interceptamos los datos enviados por el móvil
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    // 2. Buscamos al soldado en la base de datos
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Si no existe o no tiene contraseña, abortamos
    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // 3. Comparamos la contraseña encriptada
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // 4. Misión cumplida. Preparamos la placa de identificación (sin la contraseña)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name || "Agente",
      role: user.role, // Aquí viaja la clave: PARTICULAR, AGENCIA o DIFUSOR
    };

    return NextResponse.json({ message: "Acceso concedido", user: userData });

  } catch (error) {
    console.error("Error en la Aduana:", error);
    return NextResponse.json({ error: "Interferencia en el servidor" }, { status: 500 });
  }
}