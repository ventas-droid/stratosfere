'use server'

import { db } from "../lib/db"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  console.log("👉 1. INICIO: El botón ha sido pulsado.")
  
  const role = formData.get("role") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  
  console.log(`👉 2. DATOS RECIBIDOS: Email: ${email}, Rol: ${role}`)

  if (!email || !password || !name) {
    console.log("❌ ERROR: Faltan datos")
    return { error: "Faltan datos obligatorios" }
  }

  // Prueba de conexión
  try {
    console.log("👉 3. CONECTANDO: Intentando hablar con la Base de Datos...")
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    console.log("👉 4. CONEXIÓN ÉXITOSA. ¿Existe usuario?:", existingUser ? "SÍ" : "NO")

    if (existingUser) {
      return { error: "Este email ya está registrado." }
    }
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN BASE DE DATOS:", error)
    return { error: "Error de conexión con la base de datos." }
  }

  const hashedPassword = await hash(password, 10)
  console.log("👉 5. ENCRIPTADO: Contraseña segura creada.")

  try {
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'AGENCIA' ? 'AGENCIA' : 'PARTICULAR',
      }
    })
    console.log("👉 6. CREACIÓN: Usuario guardado en la base de datos ✅")
  } catch (e) {
    console.error("❌ ERROR AL GUARDAR:", e)
    return { error: "No se pudo guardar el usuario." }
  }

 console.log("👉 7. REDIRIGIENDO: Rumbo al mapa con salvoconducto...")
  
  // Si es Agencia le mandamos una señal, si es Particular otra
  if (role === 'AGENCIA') {
    redirect("/?access=agency")
  } else {
    redirect("/?access=granted")
  }
}