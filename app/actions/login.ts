'use server'

import { db } from "../lib/db"
import { compare } from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Faltan datos" }

  const user = await db.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return { error: "Credenciales inválidas" }
  }

  const isValid = await compare(password, user.password)

  if (!isValid) {
    return { error: "Contraseña incorrecta" }
  }

  // 🔥 CORRECCIÓN AQUÍ: Añadido (await cookies())
  const cookieStore = await cookies();
  
  cookieStore.set('stratos_session_email', email, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30 
  });

  const roleParam = user.role === 'AGENCIA' ? 'AGENCIA' : 'PARTICULAR'
  
  console.log(`🔓 ACCESO CONCEDIDO: ${email}`)
  redirect(`/?access=granted&role=${roleParam}`)
}