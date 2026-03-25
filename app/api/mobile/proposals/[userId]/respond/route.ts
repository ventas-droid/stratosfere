import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    // Como su carpeta se llama [userId], Next.js mete el ID de la propuesta ahí
    const campaignId = resolvedParams.userId; 
    
    // Leemos los datos que envía la App Móvil (decision y el userId real del dueño)
    const body = await request.json();
    const { decision, userId: ownerId } = body;

    if (!campaignId || !ownerId || !decision) {
      return NextResponse.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    // 1. Buscamos el contrato (Campaña)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { property: { select: { userId: true } } }
    });

    if (!campaign) {
        return NextResponse.json({ success: false, error: 'Contrato no encontrado' }, { status: 404 });
    }

    // 2. Seguridad: Verificamos que el que acepta es el dueño real de la casa
    if (campaign.property.userId !== ownerId) {
      return NextResponse.json({ success: false, error: 'No tienes permiso sobre esta propiedad' }, { status: 403 });
    }

    // 3. Actualizamos el estado del contrato (Caja Negra Notarial)
    const nextStatus = decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";
    const auditData: any = { status: nextStatus };
    
    if (decision === "ACCEPT") {
      auditData.ownerDecisionAt = new Date();
    } else {
      auditData.revokedAt = new Date();
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: auditData
    });

    // 4. SI ACEPTA -> EJECUTAMOS EL TRASPASO DE PODERES (Asignación)
    if (decision === "ACCEPT") {
      await prisma.propertyAssignment.upsert({
        where: { propertyId: campaign.propertyId },
        update: {
          status: "ACTIVE",
          agencyId: String(campaign.agencyId || (campaign as any).agencyUserId),
          campaignId: campaign.id,
        },
        create: {
          propertyId: campaign.propertyId,
          agencyId: String(campaign.agencyId || (campaign as any).agencyUserId),
          campaignId: campaign.id,
          status: "ACTIVE",
        }
      });
    }

    // 5. SI RECHAZA -> DESTRUIMOS CUALQUIER ASIGNACIÓN PREVIA
    if (decision === "REJECT") {
      await prisma.propertyAssignment.deleteMany({
        where: { propertyId: campaign.propertyId }
      });
      // Devolvemos la casa al estado público
      await prisma.property.update({
          where: { id: campaign.propertyId },
          data: { status: "PUBLICADO" } 
      });
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("Error en mobile API respond proposal:", error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}