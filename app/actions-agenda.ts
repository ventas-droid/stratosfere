"use server";

import { prisma } from '@/app/lib/prisma';
import { getUserMeAction, sendMessageAction } from '@/app/actions';

// 🔥 BÚSQUEDA DE CITAS
export async function getAgencyLeadsAction() {
  try {
    const session = await getUserMeAction();
    if (!session?.success || !session?.data?.id) {
      return { success: false, error: "No autorizado" };
    }
    const myId = session.data.id;

    const leads = await prisma.lead.findMany({
      where: {
        source: "B2B_MEETING", 
        property: {
            OR: [
                { userId: myId }, 
                { campaigns: { some: { agencyId: myId } } }, 
                { assignment: { agencyId: myId } } 
            ]
        }
      },
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: leads };
  } catch (error: any) {
    console.error("Error crítico en getAgencyLeadsAction:", error);
    return { success: false, error: error.message };
  }
}

// 🚀 CONFIRMAR CITA, GUARDAR HISTÓRICO, ENVIAR EMAILS CORPORATIVOS Y SELLAR CHAT
export async function confirmLeadMeetingAction(payload: {
    leadId: string;
    agentName: string;
    date: string;
    time: string;
    address: string;
    clientEmail: string;
    clientName: string;
    propertyRef: string;
}) {
    try {
        const session = await getUserMeAction();
        if (!session?.success || !session?.data) return { success: false, error: "No autorizado" };

        const agencyName = session.data.companyName || session.data.name || "La Agencia";
        const agencyPhone = session.data.mobile || session.data.phone || "No especificado";

        // 1. GENERADOR DE ENLACE INTELIGENTE DE GOOGLE CALENDAR
        const eventTitle = encodeURIComponent(`Asesoramiento Stratosfere: Ref ${payload.propertyRef}`);
        const eventDetails = encodeURIComponent(`Cita con el propietario: ${payload.clientName}.\nAgente asignado: ${payload.agentName}\nAgencia: ${agencyName}\nPropiedad: ${payload.propertyRef}\nTeléfono de contacto: ${agencyPhone}`);
        const eventLocation = encodeURIComponent(payload.address);

        const d = new Date(`${payload.date}T${payload.time}:00`);
        const endD = new Date(d.getTime() + 60 * 60 * 1000); 
        
        const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${formatGCalDate(d)}/${formatGCalDate(endD)}&add=${payload.clientEmail}`;

        // 2. GUARDAR HISTÓRICO EN BASE DE DATOS
        const lead = await prisma.lead.findUnique({ 
            where: { id: payload.leadId },
            include: { property: true } 
        });

        if (lead) {
            const historicalData = `\n\n✅ CITA CONFIRMADA:\nAgente: ${payload.agentName}\nFecha: ${payload.date} a las ${payload.time}\nLugar: ${payload.address}`;
            await prisma.lead.update({
                where: { id: payload.leadId },
                data: {
                    status: "MANAGED",
                    message: lead.message + historicalData
                }
            });

            // 🎯 3. SELLAR LA REUNIÓN EN EL CHAT DE STRATOSFERE
            // Buscamos la conversación exacta entre la agencia y el propietario para esta casa
            const conversation = await prisma.conversation.findFirst({
                where: {
                    propertyId: lead.propertyId,
                    AND: [
                        { participants: { some: { userId: session.data.id } } }, // La Agencia
                        { participants: { some: { userId: lead.property.userId } } } // El Propietario
                    ]
                }
            });

            if (conversation) {
                const chatMsg = `📅 **CITA OFICIAL CONFIRMADA**\n\nQueda agendada la sesión de asesoramiento técnico y legal.\n\n👤 **Asesor asignado:** ${payload.agentName}\n🏢 **Agencia:** ${agencyName}\n📍 **Lugar:** ${payload.address}\n📆 **Fecha:** ${payload.date} a las ${payload.time}\n📞 **Contacto para modificaciones:** ${agencyPhone}\n\n⚠️ **REQUISITOS PARA LA REUNIÓN:**\nPara realizar el estudio completo del estado físico y legal de la propiedad, es imprescindible:\n- La asistencia de **todos los propietarios** con poder de decisión.\n- Escritura de compraventa.\n- Nota simple actualizada (si dispone de ella).\n- DNIs de los titulares.\n\n*Nota: Este asesoramiento es totalmente gratuito y supone el paso previo esencial para la organización y gestión estructurada de la venta.*`;

                await sendMessageAction({
                    conversationId: conversation.id,
                    text: chatMsg
                });
            }
        }

        // 4. ENVÍO DE CORREOS CORPORATIVOS (RESEND)
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey && payload.clientEmail) {
            try {
                const { Resend } = require('resend');
                const resend = new Resend(resendApiKey);

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
                        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
                            <h2 style="margin: 0; color: #000; text-transform: uppercase; letter-spacing: 1px;">Confirmación de Asesoramiento</h2>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">REF: ${payload.propertyRef}</p>
                        </div>

                        <p>Estimado/a <strong>${payload.clientName}</strong>,</p>
                        <p>Le confirmamos que su sesión de asesoramiento informativo gratuito ha sido agendada correctamente.</p>

                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="margin-top: 0; color: #334155; font-size: 14px; text-transform: uppercase;">Detalles de la Convocatoria</h3>
                            <table style="width: 100%; font-size: 14px; line-height: 1.6;">
                                <tr><td style="width: 120px; color: #64748b;"><strong>Agencia:</strong></td><td>${agencyName}</td></tr>
                                <tr><td style="color: #64748b;"><strong>Asesor a cargo:</strong></td><td>${payload.agentName}</td></tr>
                                <tr><td style="color: #64748b;"><strong>Fecha:</strong></td><td>${payload.date}</td></tr>
                                <tr><td style="color: #64748b;"><strong>Hora:</strong></td><td>${payload.time}</td></tr>
                                <tr><td style="color: #64748b;"><strong>Lugar:</strong></td><td>${payload.address}</td></tr>
                                <tr><td style="color: #64748b;"><strong>Contacto:</strong></td><td>${agencyPhone} <span style="font-size:11px; color:#94a3b8;">(Para modificaciones o cancelaciones)</span></td></tr>
                            </table>
                        </div>

                        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
                            <h3 style="margin-top: 0; color: #92400e; font-size: 14px; text-transform: uppercase;">Requisitos Imprescindibles</h3>
                            <p style="margin-bottom: 10px; font-size: 14px; color: #78350f;">Para poder realizar un estudio completo del estado físico y legal de la propiedad en venta, rogamos dispongan de lo siguiente durante la reunión:</p>
                            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f; line-height: 1.6;">
                                <li><strong>Asistencia obligatoria</strong> de todos los propietarios de la vivienda con capacidad de decisión.</li>
                                <li>Escritura de compraventa original o copia.</li>
                                <li>Nota Simple actualizada (si disponen de ella).</li>
                                <li>DNI de los titulares y cualquier documento relevante asociado a la vivienda.</li>
                            </ul>
                        </div>

                        <p style="font-size: 13px; color: #64748b; font-style: italic;">Nota: Este asesoramiento es de carácter informativo y gratuito, suponiendo el paso previo fundamental para la organización, valoración y gestión estructurada de la venta de su propiedad.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Mensaje generado automáticamente por la infraestructura de Stratosfere OS.</p>
                        </div>
                    </div>
                `;

                // Enviamos a ambos (Cliente y Agencia)
                await resend.emails.send({
                    from: 'Stratosfere <info@stratosfere.com>',
                    to: [payload.clientEmail, session.data.email!], 
                    subject: `Cita de Asesoramiento Confirmada - REF: ${payload.propertyRef}`,
                    html: emailHtml
                });
            } catch (mailError) {
                console.error("Aviso: Email no enviado, pero datos guardados en base de datos y chat.", mailError);
            }
        }

        return { success: true, gcalLink };

    } catch (error: any) {
        console.error("Error confirmando cita:", error);
        return { success: false, error: error.message };
    }
}