'use server'

import { db } from "../lib/db"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"
import { sendWelcomeEmail } from './send-emails';
import { cookies } from "next/headers"

export async function registerUser(formData: FormData) {
  // Capturamos el rol que viene del formulario
  const roleRaw = formData.get("role") as string
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  
  if (!email || !password || !name) {
    return { error: "Faltan datos obligatorios" }
  }

  // 1. ASIGNACIÓN DE ROL SEGURA (3 VÍAS)
  let assignedRole = 'PARTICULAR'; // Por defecto
  
  if (roleRaw === 'AGENCIA') assignedRole = 'AGENCIA';
  else if (roleRaw === 'DIFUSOR') assignedRole = 'DIFUSOR'; // <--- ¡NUEVA VÍA HABILITADA!

  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Este email ya está registrado." }
    }
  } catch (error) {
    return { error: "Error de conexión con la base de datos." }
  }

  const hashedPassword = await hash(password, 10)

  try {
    // 2. CREACIÓN DEL USUARIO (Su código intacto)
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: assignedRole as any, // Guardamos AGENCIA, DIFUSOR o PARTICULAR
      }
    })

    // --- 🎯 INICIO DE LA INYECCIÓN VIP (RASTREO BLINDADO) ---
    // Lo hacemos seguro: si esto falla por cualquier motivo, no rompe el registro.
    const cookieStore = await cookies();
    const vipInviteCode = cookieStore.get('stratos_vip_invite')?.value;
    
    if (assignedRole === 'AGENCIA' && vipInviteCode) {
        try {
            // Marcamos a la agencia como CAPTURADA en el CRM de su God Mode
            await db.agencyProspect.updateMany({ 
                where: { id: vipInviteCode },
                data: { status: 'REGISTERED' } 
            });
            console.log(`🎯 MISIL IMPACTADO: Agencia VIP capturada (${vipInviteCode})`);
            
            // Borramos la baliza del navegador del cliente para limpiar el rastro
            cookieStore.delete('stratos_vip_invite');
        } catch (e) {
            console.warn("⚠️ Aviso: La baliza VIP no se pudo procesar, pero el usuario se registró.", e);
        }
    }
    // --- FIN DE LA INYECCIÓN VIP ---

    // 3. PROCESOS FINALES (Su código intacto)
    sendWelcomeEmail(email, name);

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

  console.log(`👉 REGISTRO COMPLETADO: ${email} como ${assignedRole}`)
  
  // 4. REDIRECCIÓN INTELIGENTE SEGÚN ROL (Su código intacto)
  if (assignedRole === 'AGENCIA') {
    redirect("/?access=agency")
  } else if (assignedRole === 'DIFUSOR') {
    redirect("/?access=diffuser") // <--- NUEVA REDIRECCIÓN
  } else {
    redirect("/?access=granted")
  }
}