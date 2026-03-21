import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { pusherServer } from '../../../../../utils/pusher';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // En esta ruta, el segmento [userId] realmente lleva el campaignId
    const resolvedParams = await params;
    const campaignId = resolvedParams.userId;

    const body = await request.json();
    const { meetingForm, userId: actualUserId } = body ?? {};

    if (
      !campaignId ||
      !actualUserId ||
      !meetingForm?.date1 ||
      !meetingForm?.phone ||
      !meetingForm?.email
    ) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    console.log(`📡 [API MOBILE] Petición de Asesoramiento para campaña: ${campaignId}`);

    // 1. Buscamos la campaña
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        property: true,
        agency: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const agencyName =
      campaign.agency?.companyName || campaign.agency?.name || 'la Agencia';

    // 2. Creamos el lead B2B para que la web y móvil puedan leerlo
    const newLead = await prisma.lead.create({
      data: {
        propertyId: campaign.propertyId,
        name: `Propietario (${campaign.property?.refCode || 'Sin Ref'})`,
        email: meetingForm.email,
        phone: meetingForm.phone,
        message: `Cita solicitada desde App Móvil. Opciones: ${meetingForm.date1} / ${meetingForm.date2 || 'No especificada'}`,
        source: 'B2B_MEETING',
        managerId: campaign.agencyId,
      },
    });

    // 2.1 Aviso en tiempo real al canal global del receptor del lead
    try {
      if (campaign.agencyId) {
        await pusherServer.trigger(`user-${campaign.agencyId}`, 'new-lead', {
          id: newLead.id,
          propertyId: newLead.propertyId,
          source: newLead.source,
          status: newLead.status,
          createdAt: newLead.createdAt,
        });
        console.log(`📡 [PUSHER MOBILE] new-lead -> user-${campaign.agencyId}`);
      }
    } catch (pusherError) {
      console.error('⚠️ Error disparando Pusher new-lead:', pusherError);
    }

    // 3. Enviamos el mensaje al chat
    if (campaign.conversationId) {
      const meetingText = `🤝 **SOLICITUD DE ASESORAMIENTO (Vía App)** 🤝

Hola, ${agencyName}. He revisado vuestra propuesta de gestión para la propiedad REF: ${campaign.property?.refCode || 'SF-N/A'}.

Me gustaría solicitar una reunión o llamada para aclarar detalles antes de formalizar el traspaso.

📅 **Disponibilidad propuesta:**
Opción 1: ${meetingForm.date1}
Opción 2: ${meetingForm.date2 || 'No especificada'}

📞 **Mis datos directos:**
Teléfono: ${meetingForm.phone}
Email: ${meetingForm.email}

Quedo a la espera de confirmación.`;

      const newMessage = await prisma.message.create({
        data: {
          conversationId: campaign.conversationId,
          senderId: actualUserId,
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

      // Si el que envía es la agencia, notificamos al owner.
      // Si el que envía es el owner, notificamos a la agencia.
      const targetUserId =
        String(actualUserId) === String(campaign.agencyId)
          ? campaign.property?.userId
          : campaign.agencyId;

      // 3.1 Aviso a la sala abierta del chat
      try {
        await pusherServer.trigger(
          `chat-${campaign.conversationId}`,
          'new-message',
          payload
        );
        console.log(`📡 [PUSHER MOBILE] new-message -> chat-${campaign.conversationId}`);
      } catch (pusherError) {
        console.error('⚠️ Error disparando Pusher a chat:', pusherError);
      }

      // 3.2 Aviso al canal global del receptor
      try {
        if (targetUserId) {
          await pusherServer.trigger(
            `user-${targetUserId}`,
            'new-message',
            payload
          );
          console.log(`🌍 [PUSHER MOBILE] new-message -> user-${targetUserId}`);
        }
      } catch (pusherError) {
        console.error('⚠️ Error disparando Pusher a user channel:', pusherError);
      }
    }

    console.log('✅ [API MOBILE] Asesoramiento registrado y sincronizado con la Web.');

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('❌ [API MOBILE] Error al agendar cita desde móvil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}