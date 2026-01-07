'use server'

import { db } from "../lib/db"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"
import { sendWelcomeEmail } from './send-emails';
import { cookies } from "next/headers"

export async function registerUser(formData: FormData) {
  const role = formData.get("role") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  
  if (!email || !password || !name) {
    return { error: "Faltan datos obligatorios" }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return { error: "Este email ya está registrado." }
    }
  } catch (error) {
    return { error: "Error de conexión con la base de datos." }
  }

  const hashedPassword = await hash(password, 10)

  try {
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'AGENCIA' ? 'AGENCIA' : 'PARTICULAR',
      }
    })

    sendWelcomeEmail(email, name);

    // 🔥 CORRECCIÓN AQUÍ: Añadido (await cookies())
    const cookieStore = await cookies();

    cookieStore.set('stratos_session_email', email, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30
    });

  } catch (e) {
    console.error("❌ ERROR AL GUARDAR:", e)
    return { error: "No se pudo guardar el usuario." }
  }

  console.log("👉 REGISTRO COMPLETADO Y COOKIE FIJADA")
  
  if (role === 'AGENCIA') {
    redirect("/?access=agency")
  } else {
    redirect("/?access=granted")
  }
}