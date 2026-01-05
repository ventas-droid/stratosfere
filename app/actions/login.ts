'use server'

import { db } from "../lib/db"
import { compare } from "bcryptjs"
import { redirect } from "next/navigation"

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Faltan datos" }

  // 1. Buscar al soldado en la base de datos
  const user = await db.user.findUnique({
    where: { email }
  })

  // 2. Si no existe o no tiene contraseña
  if (!user || !user.password) {
    return { error: "Credenciales inválidas" }
  }

  // 3. Comparar la contraseña (Desencriptar)
  const isValid = await compare(password, user.password)

  if (!isValid) {
    return { error: "Contraseña incorrecta" }
  }

  // 4. PREPARAR LOS PAPELES DEL SALVOCONDUCTO
  // Si es Agencia, le damos pase de Agencia. Si no, de Particular.
  const roleParam = user.role === 'AGENCIA' ? 'AGENCIA' : 'PARTICULAR'
  
  // 5. REDIRIGIR AL MAPA
  console.log(`🔓 ACCESO CONCEDIDO: ${email} (${roleParam})`)
  redirect(`/?access=granted&role=${roleParam}`)
}