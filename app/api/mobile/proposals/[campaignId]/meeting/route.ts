import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'; 

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { meetingForm, userId } = body;

    if (!campaignId || !userId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    console.log(`📡 [API MOBILE] Petición de Asesoramiento para campaña: ${campaignId}`);

    // 1. Buscamos la campaña para sacar los datos del piso y la agencia
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        property: true,
        agency: true
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const agencyName = campaign.agency?.companyName || campaign.agency?.name || "la Agencia";

    // 2. 🔥 CREAMOS EL LEAD B2B PARA QUE LA WEB SE ENTERE (Sincronización)
    const newLead = await prisma.lead.create({
      data: {
        propertyId: campaign.propertyId,
        name: "Propietario (" + (campaign.property.refCode || "Sin Ref") + ")",
        email: meetingForm.email,
        phone: meetingForm.phone,
        message: `Cita solicitada desde App Móvil. Opciones: ${meetingForm.date1} / ${meetingForm.date2}`,
        source: "B2B_MEETING", // 👈 ESTA ETIQUETA ES LA QUE ACTIVA EL CALENDARIO EN LA WEB
        managerId: campaign.agencyId
      }
    });

    // 3. 💬 ENVIAMOS EL MENSAJE AL CHAT
    if (campaign.conversationId) {
      const meetingText = `🤝 **SOLICITUD DE ASESORAMIENTO (Vía App)** 🤝\n\nHola, ${agencyName}. He revisado vuestra propuesta de gestión para la propiedad REF: ${campaign.property.refCode || "SF-N/A"}.\n\nMe gustaría solicitar una reunión o llamada para aclarar detalles antes de formalizar el traspaso.\n\n📅 **Disponibilidad propuesta:**\nOpción 1: ${meetingForm.date1}\nOpción 2: ${meetingForm.date2 || "No especificada"}\n\n📞 **Mis datos directos:**\nTeléfono: ${meetingForm.phone}\nEmail: ${meetingForm.email}\n\nQuedo a la espera de confirmación.`;

      await prisma.message.create({
        data: {
          conversationId: campaign.conversationId,
          senderId: userId,
          text: meetingText
        }
      });

      await prisma.conversation.update({
        where: { id: campaign.conversationId },
        data: { updatedAt: new Date() }
      });
    }

    console.log(`✅ [API MOBILE] Asesoramiento registrado y sincronizado con la Web.`);

    return NextResponse.json({ success: true, lead: newLead });

  } catch (error) {
    console.error('❌ [API MOBILE] Error al agendar cita desde móvil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}