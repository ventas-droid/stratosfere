'use server';

import { Resend } from 'resend';
import { buildStratosfereEmailHtml } from '../utils/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

const DOMAIN_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stratosfere.com';

// Como ya has creado info@, úsalo como remitente (y queda más pro).
// OJO: en Resend el dominio/remitente debe estar verificado para poder enviar.
const SENDER_EMAIL = 'Stratosfere <info@stratosfere.com>';

export async function sendRecoveryEmail(email: string) {
  try {
    const recoveryLink = `${DOMAIN_URL}/reset-password?email=${encodeURIComponent(email)}`;

    const html = buildStratosfereEmailHtml({
      title: 'Restablecer contraseña — Stratosfere',
      preheader: 'Enlace para restablecer tu contraseña de Stratosfere OS.',
      headline: 'Solicitud de cambio de contraseña',
      bodyHtml: `
        <p style="margin:0 0 12px 0;">
          Hemos recibido una solicitud para restablecer la contraseña asociada a <strong>${email}</strong>.
        </p>
        <p style="margin:0;">
          Si has sido tú, usa el botón de abajo. Si no, puedes ignorar este mensaje.
        </p>
      `,
      ctaText: 'Restablecer contraseña',
      ctaUrl: recoveryLink,
      footerText: '© 2026 Stratosfere — SF Urban S.L. (CIF B-75965723)',
    });

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Restablecer contraseña — Stratosfere OS ID',
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch {
    return { success: false, error: 'Error de conexión en el servicio de correo.' };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const html = buildStratosfereEmailHtml({
  title: "Bienvenido a Stratosfere",
  preheader: "Tu cuenta ya está lista.",
  headline: `Bienvenido, ${name}.`,
  bodyHtml: `
    <p style="margin:0 0 12px 0;">
      Su cuenta ha sido creada exitosamente. Ya tiene acceso completo a Stratosfere OS.
    </p>
    <p style="margin:0;">
      Si necesita ayuda, responda a este correo.
    </p>
  `,
  ctaText: "Iniciar Exploración",
  ctaUrl: DOMAIN_URL,
});

await resend.emails.send({
  from: SENDER_EMAIL,
  to: [email],
  subject: "Bienvenido a Stratosfere",
  html,
});


    return { success: true };
  } catch (e) {
    console.error('Error al enviar bienvenida:', e);
    return { success: false };
  }
}
