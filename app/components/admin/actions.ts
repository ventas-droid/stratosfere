"use server";
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
const prisma = new PrismaClient();

// 1. NANO CARD PREMIUM (Mantenida por seguridad de código, aunque ya no se use en el panel)
export async function togglePropertyPremiumAction(propertyId: string, newState: boolean) {
  try {
    const expires = newState ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isPremium: newState, 
        isPromoted: newState, 
        promotedTier: newState ? 'PREMIUM' : 'FREE',
        promotedUntil: expires
      }
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// Asegúrese de que esta línea está arriba del todo del archivo actions.ts (junto a los otros imports):
// import { revalidatePath } from 'next/cache';

// 2. NANO CARD FUEGO (+15 DÍAS EXACTOS Y PURGA DE FANTASMAS)
export async function togglePropertyFireAction(propertyId: string, newState: boolean) {
  try {
    const expires = newState ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isFire: newState, 
        isPremium: false, // 💥 ACETONA
        isPromoted: newState, 
        promotedTier: newState ? 'FUEGO' : 'FREE',
        promotedUntil: expires 
      }
    });
    
    revalidatePath("/"); // 💣 BOMBA DE CACHÉ: Obliga al mapa a redibujarse con la nueva info
    
    return { success: true };
  } catch (error) { return { success: false }; }
}

// 3. ACCIÓN: PUBLICAR INDECISOS (ALTA EN MAPA CON PURGA TOTAL)
export async function togglePropertyStatusAction(propertyId: string, publish: boolean) {
  try {
    const extraData = publish ? {} : { isFire: false, isPremium: false, isPromoted: false, promotedTier: 'FREE' };
    
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        status: publish ? 'PUBLICADO' : 'PENDIENTE_PAGO',
        ...extraData
      }
    });
    
    revalidatePath("/"); // 💣 BOMBA DE CACHÉ: Obliga al mapa a redibujarse
    
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 4. ACCIÓN: MASTER SWITCH (BLOQUEAR / ACTIVAR USUARIO)
export async function toggleUserStatusAction(userId: string, activate: boolean) {
  try {
    const newStatus = activate ? "ACTIVE" : "BLOCKED";
    await prisma.subscription.upsert({
      where: { userId: userId },
      update: { status: newStatus },
      create: { userId: userId, status: newStatus, plan: "STARTER" }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
// 5. MISIL TOMAHAWK TÁCTICO (BORRAR PROPIEDAD DEFINITIVAMENTE)
export async function deletePropertyAction(propertyId: string) {
  try {
    await prisma.property.delete({
      where: { id: propertyId }
    });
    return { success: true };
  } catch (error) { 
    console.error("Error al borrar propiedad:", error);
    return { success: false }; 
  }
}

// 6. BOMBA ATÓMICA ESTRATÉGICA (BORRAR USUARIO Y TODO SU RASTRO)
export async function deleteUserAction(userId: string) {
  try {
    // Al borrar el usuario, la base de datos debería borrar en cascada 
    // todas sus propiedades, suscripciones, etc. ¡Limpieza total!
    await prisma.user.delete({
      where: { id: userId }
    });
    return { success: true };
  } catch (error) { 
    console.error("Error al borrar usuario:", error);
    return { success: false }; 
  }
}
// =========================================================
// 🎯 CRM TÁCTICO: MARKETING Y CAPTACIÓN (OUTBOUND)
// =========================================================

// 1. AÑADIR AGENCIA AL RADAR DE CAPTACIÓN
export async function createProspectAction(data: { companyName: string, email: string, phone: string, city: string }) {
  try {
    await prisma.agencyProspect.create({
      data: {
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        status: "NEW"
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear prospecto:", error);
    return { success: false, error: "No se pudo añadir. (¿Quizás el email ya existe?)" };
  }
}

// 2. DISPARAR CAMPAÑA DE EMAIL (ROTACIÓN ANTI-SPAM + OFERTA 100% + ALERTA DESKTOP)
export async function sendProspectEmailAction(prospectId: string) {
  try {
    const prospect = await prisma.agencyProspect.findUnique({ where: { id: prospectId } });
    if (!prospect || !prospect.email) return { success: false };

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return { success: false, error: "No hay llave de Resend" };

    const { Resend } = require('resend');
    const resend = new Resend(resendApiKey);

    // 🎯 LA BALIZA CHIVATO (El enlace secreto que marca la captura)
const invLink = `https://stratosfere.com/vip?inv=${prospect.id}&src=em`;
   
// 🎯 3 PLANTILLAS TÁCTICAS (Textos variables para engañar al filtro de SPAM)
    const templates = [
        {
            subject: `Invitación Privada: Acceso al nuevo SO Inmobiliario en ${prospect.city || 'tu zona'}`,
            headline: `Hola, equipo de ${prospect.companyName},`,
            intro: `Soy Alex, del Growth & Partnerships Team de Stratosfere. Estamos seleccionando a agencias con un sólido bagaje y producto en gestión en ${prospect.city || 'su zona'} para que sean nuestros primeros colaboradores desde el 'Día 0'.`,
            body: `Conocemos que ya usan portales tradicionales. Por eso hemos lanzado algo completamente distinto: un Sistema Operativo B2B (SaaS) conectado a un mapa vía satélite en 3D que rompe las barreras tecnológicas. La tecnología está diseñada para multiplicar sus cierres mediante venta cruzada, captación de exclusivas y una bolsa segura de comisiones.`
        },
        {
            subject: `Alianza estratégica y tecnología B2B para ${prospect.companyName}`,
            headline: `Un saludo al equipo de ${prospect.companyName},`,
            intro: `Me pongo en contacto desde el Growth & Partnerships Team de Stratosfere. Hemos seguido su trayectoria y queremos proponerles una alianza exclusiva en esta fase de lanzamiento en ${prospect.city || 'el mercado local'}.`,
            body: `Hemos desarrollado un portal inmobiliario impulsado por un Sistema Operativo B2B en tiempo real. La exposición de producto en nuestro mapa satelital inmersivo genera un atractivo visual innegable, facilitando la venta cruzada y la captación sin levantar el teléfono.`
        },
        {
            subject: `El futuro del sector inmobiliario en ${prospect.city || 'tu zona'}: Acceso VIP`,
            headline: `Estimados compañeros de ${prospect.companyName},`,
            intro: `Soy Alex, del equipo de Growth & Partnerships de Stratosfere. Estamos invitando a un grupo muy reducido de agencias profesionales a probar la tecnología que está cambiando las reglas del sector desde nuestro 'Día 0'.`,
            body: `Frente a los portales tradicionales con los que ya trabajan, presentamos un Sistema Operativo B2B (SaaS) con geolocalización en 3D. Accederán a herramientas de alto rendimiento para compartir comisiones de forma segura, gestionar exclusivas y organizar eventos online.`
        }
    ];

    // El servidor elige la munición al azar
    const t = templates[Math.floor(Math.random() * templates.length)];

    // 📩 EL CORREO BLINDADO QUE RECIBIRÁN (Diseño ultra-premium con TODO el texto legal y estratégico)
    await resend.emails.send({
        from: 'Stratosfere Growth <info@stratosfere.com>', 
        to: prospect.email,
        subject: t.subject,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #111827;">${t.headline}</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${t.intro}</p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${t.body}</p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                    Les dejo un breve vídeo operando el radar por dentro:<br/>
                    🎥 <a href="[ENLACE-AL-VIDEO-AQUI]" style="color: #2563eb; text-decoration: none; font-weight: 600;">Ver Demostración de 1 minuto</a>
                </p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 6px;">
                    <p style="margin:0; color: #334155; font-size: 15px; line-height: 1.6;">
                        Lo mejor es que lo comprueben ustedes mismos. Les hemos habilitado una invitación de <strong>15 días de acceso total gratuito</strong>. Si tras la prueba (Free Trial) deciden quedarse en esta fase de lanzamiento, disfrutarán del <strong>100% de operatividad, incluyendo el control desde nuestra App (Android / Apple Store)</strong>, por una suscripción de mantenimiento de <strong>solamente 49,90 € al mes y sin ninguna obligación de permanencia</strong>.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${invLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Activar mi Acceso VIP</a>
                </div>
                
                <div style="margin: 30px 0; padding: 18px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px;">
                    <p style="margin:0; color: #9f1239; font-size: 14px; line-height: 1.6;">
                        ⚠️ <strong>IMPORTANTE (Alto Rendimiento):</strong><br/>
                        Stratosfere es una plataforma robusta. Para desplegar todo el potencial inmersivo del radar 3D, es imprescindible abrir el enlace y <strong>registrarse desde un ORDENADOR</strong>. Una vez dentro, les facilitaremos la App móvil.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="font-size: 13px; color: #9ca3af; margin: 0; line-height: 1.5;">Para cualquier duda, respondan a este correo y nuestro equipo les atenderá a la mayor brevedad.</p>
                <p style="font-size: 13px; color: #9ca3af; margin-top: 5px;"><strong>Stratosfere Growth & Partnerships</strong></p>
            </div>
        `
    });

    // Actualizamos el radar
    await prisma.agencyProspect.update({
        where: { id: prospectId },
        data: { 
            status: 'CONTACTED', 
            emailsSent: { increment: 1 },
            lastContact: new Date()
        }
    });

    return { success: true };
  } catch (error) {
    console.error("Error enviando email CRM:", error);
    return { success: false };
  }
}