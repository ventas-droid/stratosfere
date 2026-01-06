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

// 2. CORREO DE BIENVENIDA (DISEÑO STRATOSFERE / APPLE STYLE)
export async function sendWelcomeEmail(email: string, name: string) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [email],
        subject: 'Bienvenido a Stratosfere OS.',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #f5f5f7; color: #1d1d1f;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); text-align: center;">
              
              <div style="font-size: 42px; margin-bottom: 24px; animation: float 3s ease-in-out infinite;">🚀</div>
              
              <h1 style="font-size: 26px; font-weight: 700; letter-spacing: -0.8px; margin-bottom: 12px; color: #000000;">Bienvenido, ${name}.</h1>
              
              <p style="font-size: 16px; color: #86868b; line-height: 1.6; margin-bottom: 32px; font-weight: 400;">
                Su <strong>Stratosfere ID</strong> se ha activado correctamente.<br>
                El sistema está listo para iniciar la exploración del mercado en tiempo real.
              </p>
              
              <a href="${DOMAIN_URL}" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 15px 32px; border-radius: 99px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(0,113,227,0.2);">
                Acceder a la Plataforma
              </a>

            </div>
            
            <p style="font-size: 11px; color: #a1a1a6; margin-top: 40px; text-align: center; letter-spacing: 0.5px;">
              Stratosfere OS • Designed by Alpha Corp
            </p>
          </div>
        `
      });
    } catch (e) {
        console.log("⚠️ Error silenciado: Fallo al enviar bienvenida.", e);
    }
}