import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { pusherServer } from '../../../../../utils/pusher';
import { sendExpoPushToUserId } from '@/app/utils/expo-push'; // 🚀 TRAEMOS EL CAÑÓN

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.userId;

    const body = await request.json();
    const { meetingForm, userId: actualUserId } = body ?? {};

    // =========================================================
    // 🧹 1. SANEAMIENTO DE DATOS (Órdenes del Analista)
    // =========================================================
    const safeSenderId = String(actualUserId || "").trim();
    const cleanDate1 = String(meetingForm?.date1 || "").trim();
    const cleanDate2 = String(meetingForm?.date2 || "").trim();
    const cleanPhone = String(meetingForm?.phone || "").trim();
    const cleanEmail = String(meetingForm?.email || "").trim();

    if (!campaignId || !safeSenderId || !cleanDate1 || !cleanPhone || !cleanEmail) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    console.log(`📡 [API MOBILE] Petición de Asesoramiento para campaña: ${campaignId}`);

    // Buscamos la campaña
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { property: true, agency: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    // =========================================================
    // 🛡️ 2. BLINDAJE DE SEGURIDAD (Órdenes del Analista)
    // =========================================================
    if (
      safeSenderId !== String(campaign.property?.userId || "") &&
      safeSenderId !== String(campaign.agencyId || "")
    ) {
      console.warn(`🚨 Intento de cita no autorizado por usuario: ${safeSenderId}`);
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const agencyName = campaign.agency?.companyName || campaign.agency?.name || 'la Agencia';

    // 3. Creamos el lead B2B con datos limpios
    const newLead = await prisma.lead.create({
      data: {
        propertyId: campaign.propertyId,
        name: `Propietario (${campaign.property?.refCode || 'Sin Ref'})`,
        email: cleanEmail,
        phone: cleanPhone,
        message: `Cita solicitada desde App Móvil. Opciones: ${cleanDate1} / ${cleanDate2 || 'No especificada'}`,
        source: 'B2B_MEETING',
        managerId: campaign.agencyId,
      },
    });

    // 3.1 Aviso Lead (Pusher + 🚀 EXPO PUSH DOBLE COBERTURA)
    try {
      if (campaign.agencyId) {
        // A) Pusher (App abierta)
        await pusherServer.trigger(`user-${campaign.agencyId}`, 'new-lead', {
          id: newLead.id,
          propertyId: newLead.propertyId,
          source: newLead.source,
          status: newLead.status,
          createdAt: newLead.createdAt,
        });

        // B) Expo Push (Garantiza el aviso de Lead)
        await sendExpoPushToUserId(String(campaign.agencyId), {
          title: "📩 Nueva solicitud de asesoramiento",
          body: `Han solicitado una cita para ${campaign.property?.refCode || "la propiedad"}.`,
          data: {
            type: "new_lead",
            leadId: newLead.id,
            propertyId: newLead.propertyId,
            conversationId: campaign.conversationId || null,
          },
        });
      }
    } catch (pusherError) {
      console.error('⚠️ Error disparando notificaciones new-lead:', pusherError);
    }

    // 4. Enviamos el mensaje al chat (si existe conversación)
    if (campaign.conversationId) {
      
      // 👇 AQUÍ ESTABAN LAS LÍNEAS QUE FALTABAN (Lo he vuelto a expandir) 👇
      const meetingText = `🤝 **SOLICITUD DE ASESORAMIENTO (Vía App)** 🤝

Hola, ${agencyName}. He revisado vuestra propuesta de gestión para la propiedad REF: ${campaign.property?.refCode || 'SF-N/A'}.

Me gustaría solicitar una reunión o llamada para aclarar detalles antes de formalizar el traspaso.

📅 **Disponibilidad propuesta:**
Opción 1: ${cleanDate1}
Opción 2: ${cleanDate2 || 'No especificada'}

📞 **Mis datos directos:**
Teléfono: ${cleanPhone}
Email: ${cleanEmail}

Quedo a la espera de confirmación.`;

      const newMessage = await prisma.message.create({
        data: {
          conversationId: campaign.conversationId,
          senderId: safeSenderId, // Usamos la ID segura
          text: meetingText,
        },
      });

      await prisma.conversation.update({
        where: { id: campaign.conversationId },
        data: { updatedAt: new Date() },
      });

      const payload = {
        ...newMessage,
        content: newMessage.text ?? meetingText,
        text: newMessage.text ?? meetingText,
      };

      const targetUserId =
        safeSenderId === String(campaign.agencyId)
          ? campaign.property?.userId
          : campaign.agencyId;

      // 4.1 Aviso a la sala abierta del chat
      try {
        await pusherServer.trigger(`chat-${campaign.conversationId}`, 'new-message', payload);
      } catch (pusherError) {
        console.error('⚠️ Error disparando Pusher a chat:', pusherError);
      }

      // 4.2 Aviso al canal global del receptor
      try {
        if (targetUserId) {
          await pusherServer.trigger(`user-${targetUserId}`, 'new-message', payload);
          
          // 🚀 EXPO PUSH DEL MENSAJE
          await sendExpoPushToUserId(String(targetUserId), {
            title: "🤝 Nuevo Mensaje de Asesoramiento",
            body: "Tienes un nuevo mensaje sobre la cita en el chat.",
            data: {
              type: "new_message",
              conversationId: campaign.conversationId,
            },
          });
        }
      } catch (pusherError) {
        console.error('⚠️ Error disparando Pusher/Expo a user channel:', pusherError);
      }
    }

    console.log('✅ [API MOBILE] Asesoramiento registrado y sincronizado con la Web.');
    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('❌ [API MOBILE] Error al agendar cita desde móvil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}