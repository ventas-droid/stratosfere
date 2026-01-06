'use server'

import { Resend } from 'resend';

// Configuración inicial
const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stratosfere.com';

// Remitente oficial corporativo
const SENDER_EMAIL = 'Stratosfere Accounts <security@stratosfere.com>'; 

// ESTILOS BASE (Apple System Font)
const fontStyle = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;";
const bgStyle = "background-color: #F5F5F7; padding: 40px 20px;";
const cardStyle = "max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);";
const buttonStyle = "display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 99px; font-size: 15px; font-weight: 500; margin-top: 24px;";
const footerStyle = "font-size: 11px; color: #86868b; text-align: center; margin-top: 30px;";

// 1. CORREO DE RECUPERACIÓN DE CONTRASEÑA
export async function sendRecoveryEmail(email: string) {
  try {
    const recoveryLink = `${DOMAIN_URL}/reset-password?email=${email}`;

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Restablecer contraseña de Stratosfere OS ID',
      html: `
        <div style="${fontStyle} ${bgStyle} color: #1d1d1f;">
          <div style="${cardStyle}">
            
            <div style="margin-bottom: 24px;">
               <span style="font-weight: 600; font-size: 18px; letter-spacing: -0.5px;">Stratosfere ID.</span>
            </div>

            <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.8px; margin-bottom: 16px; color: #000;">
              Solicitud de cambio de contraseña
            </h1>
            
            <p style="font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 20px;">
              Hemos recibido una solicitud para restablecer la contraseña asociada a su cuenta <strong>${email}</strong>.
            </p>

            <div style="text-align: center;">
                <a href="${recoveryLink}" style="${buttonStyle}">Restablecer Contraseña</a>
            </div>

            <p style="font-size: 13px; color: #86868b; margin-top: 30px; line-height: 1.5;">
              Si no ha solicitado este cambio, puede ignorar este mensaje. Su cuenta permanece segura.
            </p>
          </div>
          
          <div style="${footerStyle}">
            Stratosfere OS • Seguridad y Privacidad
          </div>
        </div>
      `
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };

  } catch (error) {
    return { success: false, error: "Error de conexión en el servicio de correo." };
  }
}

// 2. CORREO DE BIENVENIDA
export async function sendWelcomeEmail(email: string, name: string) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [email],
        subject: 'Bienvenido a Stratosfere',
        html: `
          <div style="${fontStyle} ${bgStyle} color: #1d1d1f;">
            <div style="${cardStyle} text-align: center;">
              
              <div style="font-size: 32px; margin-bottom: 20px;">🚀</div>

              <h1 style="font-size: 26px; font-weight: 700; letter-spacing: -1px; margin-bottom: 12px; color: #000;">
                Bienvenido, ${name}.
              </h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #6e6e73; margin-bottom: 30px;">
                Su cuenta ha sido creada exitosamente. Ya tiene acceso completo a las herramientas de análisis y visualización de Stratosfere OS.
              </p>
              
              <a href="${DOMAIN_URL}" style="${buttonStyle}">
                Iniciar Exploración
              </a>

            </div>
             <div style="${footerStyle}">
                Copyright © 2026 Stratosfere. Todos los derechos reservados.
            </div>
          </div>
        `
      });
    } catch (e) {
        console.error("Error al enviar bienvenida:", e);
    }
}