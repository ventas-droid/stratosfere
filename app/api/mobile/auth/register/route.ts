import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Recibimos el paquete JSON desde la App Móvil
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // 2. Comprobamos si el soldado ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Este email ya está registrado." }, { status: 400 });
    }

    // 3. Encriptación militar de la contraseña
    const hashedPassword = await hash(password, 10);

    // 4. Asignación de Rol
    let assignedRole = 'PARTICULAR';
    if (role === 'AGENCIA') assignedRole = 'AGENCIA';
    else if (role === 'DIFUSOR') assignedRole = 'DIFUSOR';

    // 5. Creación en la Base de Datos Maestra
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: assignedRole as any,
      }
    });

    console.log(`📱🚀 REGISTRO MÓVIL COMPLETADO: ${email} como ${assignedRole}`);

    // 6. Respondemos a la App con un "ÉXITO" y su ID, sin redirecciones web
    return NextResponse.json({ 
        success: true, 
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        } 
    });

  } catch (error) {
    console.error("❌ ERROR AL REGISTRAR DESDE MÓVIL:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}