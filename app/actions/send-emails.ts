'use server'

import { Resend } from 'resend';

// Asegúrese de que esta clave está en su archivo .env y en Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

const DOMAIN_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stratosfere.com';

// 🔥 CAMBIO CLAVE: Usamos su dominio verificado
// Puede cambiar 'security' por 'info', 'admin', o lo que prefiera.
const SENDER_EMAIL = 'Stratosfere Security <security@stratosfere.com>'; 

// 1. CORREO DE RECUPERACIÓN
export async function sendRecoveryEmail(email: string) {
  try {
    const recoveryLink = `${DOMAIN_URL}/reset-password?email=${email}`;

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: '🔐 Protocolo de Recuperación: Stratosfere ID',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h1 style="letter-spacing: -1px;">Solicitud de Acceso</h1>
          <p>Soldado, hemos recibido una petición para restablecer sus credenciales.</p>
          <a href="${recoveryLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px; font-weight: bold;">Restablecer Contraseña</a>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">Si no solicitó este cambio, ignore esta transmisión.</p>
        </div>
      `
    });

    if (error) {
        console.error("❌ Error Resend:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Fallo en la torre de comunicaciones." };
  }
}

// 2. CORREO DE BIENVENIDA
export async function sendWelcomeEmail(email: string, name: string) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [email],
        subject: '🚀 Acceso Concedido: Stratosfere OS',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h1 style="letter-spacing: -1px;">Bienvenido a bordo, ${name}.</h1>
            <p>Su acceso al sistema operativo inmobiliario ha sido aprobado.</p>
            <p>Estado: <strong>OPERATIVO</strong></p>
            <p style="color: #666; font-size: 14px;">Ya puede acceder a la plataforma y explorar el mapa en tiempo real.</p>
          </div>
        `
      });
    } catch (e) {
        console.log("⚠️ Alerta: El usuario entró pero el email falló.", e);
    }
}