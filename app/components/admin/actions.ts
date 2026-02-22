"use server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. NANO CARD PREMIUM (+15 DÍAS EXACTOS)
export async function togglePropertyPremiumAction(propertyId: string, newState: boolean) {
  try {
    const expires = newState ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isPremium: newState, 
        isPromoted: newState, 
        promotedTier: newState ? 'PREMIUM' : 'FREE',
        promotedUntil: expires // 🎯 CORREGIDO: Usamos el nombre oficial de su BD
      }
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// 2. NANO CARD FUEGO (+15 DÍAS EXACTOS)
export async function togglePropertyFireAction(propertyId: string, newState: boolean) {
  try {
    const expires = newState ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;
    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        isFire: newState, 
        promotedTier: newState ? 'FUEGO' : 'FREE',
        promotedUntil: expires // 🎯 CORREGIDO: Usamos el nombre oficial de su BD
      }
    });
    return { success: true };
  } catch (error) { return { success: false }; }
}

// 3. ACCIÓN: PUBLICAR INDECISOS (ALTA EN RADAR)
export async function togglePropertyStatusAction(propertyId: string, publish: boolean) {
  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: publish ? 'PUBLICADO' : 'PENDIENTE_PAGO' }
    });
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

// 2. DISPARAR CAMPAÑA DE EMAIL (PLANTILLA PROFESIONAL)
export async function sendProspectEmailAction(prospectId: string) {
  try {
    const prospect = await prisma.agencyProspect.findUnique({ where: { id: prospectId } });
    if (!prospect || !prospect.email) return { success: false };

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return { success: false, error: "No hay llave de Resend" };

    const { Resend } = require('resend');
    const resend = new Resend(resendApiKey);

    // 📩 EL CORREO QUE RECIBIRÁN LAS AGENCIAS (Diseñado para alta conversión)
    await resend.emails.send({
        from: 'Stratosfere <info@stratosfere.com>',
        to: prospect.email,
        subject: 'Invitación Privada: Únete a la red inmobiliaria Stratosfere (15 días gratis)',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #111;">Hola, equipo de ${prospect.companyName} 👋</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hemos analizado el mercado inmobiliario en <strong>${prospect.city || 'su zona'}</strong> y nos encantaría invitarles personalmente a formar parte de <strong>Stratosfere</strong>.</p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Somos la nueva red B2B donde las agencias premium gestionan sus carteras, comparten comisiones de forma segura y captan clientes cualificados.</p>
                
                <div style="margin: 25px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;">
                    <p style="margin:0; color: #166534; font-size: 15px;"><strong>🎁 Regalo de Bienvenida:</strong> Hemos activado 15 días de acceso total gratuito (Free Trial) para su agencia. Sin compromisos ni tarjetas de crédito.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://stratosfere.com" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Acceder a mi Invitación Exclusiva</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">Si tiene alguna duda sobre cómo podemos ayudar a escalar su agencia, responda a este correo y nuestro equipo le atenderá personalmente.</p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">El equipo de Stratosfere</p>
            </div>
        `
    });

    // Actualizamos el estado en la base de datos para saber que ya les hemos disparado
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

