'use server'

import { db } from "../lib/db"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!email || !password) {
    return { error: "Faltan datos requeridos." }
  }

  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  try {
    // 1. Encriptar la nueva clave
    const hashedPassword = await hash(password, 10)

    // 2. Actualizar en Base de Datos
    await db.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

  } catch (error) {
    return { error: "No se pudo actualizar la cuenta. Contacte con soporte." }
  }

  // 3. Redirigir al Login con mensaje de éxito
  redirect("/?reset=success")
}

