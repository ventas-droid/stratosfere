import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        coverImage: true,
        companyName: true,
        companyLogo: true,
        tagline: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ Error en GET /api/mobile/user/[userId]:', error);
    return NextResponse.json({ error: 'Error en servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Falta ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1) Propiedades del usuario
      const ownedProperties = await tx.property.findMany({
        where: { userId },
        select: { id: true }
      });
      const propertyIds = ownedProperties.map((p) => p.id);

      // 2) Demandas B2B del usuario
      const ownedDemands = await tx.b2bDemand.findMany({
        where: { userId },
        select: { id: true }
      });
      const demandIds = ownedDemands.map((d) => d.id);

      // 3) Romper jerarquía de reclutamiento para no bloquear borrado
      await tx.user.updateMany({
        where: { recruitedById: userId },
        data: { recruitedById: null }
      });

      // 4) Borrar propuestas B2B ligadas al usuario
      if (demandIds.length > 0) {
        await tx.b2bProposal.deleteMany({
          where: { demandId: { in: demandIds } }
        });
      }

      await tx.b2bProposal.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      });

      // 5) Borrar rastros directos del usuario
      await tx.favorite.deleteMany({ where: { userId } });
      await tx.openHouseAttendee.deleteMany({ where: { userId } });
      await tx.affiliateClick.deleteMany({ where: { ambassadorId: userId } });
      await tx.commission.deleteMany({ where: { ambassadorId: userId } });
      await tx.lead.deleteMany({
        where: {
          OR: [
            { ambassadorId: userId },
            { managerId: userId }
          ]
        }
      });

      await tx.ambassadorProfile.deleteMany({ where: { userId } });
      await tx.ambassadorStats.deleteMany({ where: { userId } });
      await tx.b2bDemand.deleteMany({ where: { userId } });

      await tx.planUsage.deleteMany({ where: { userId } });
      await tx.agencyContact.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });

      await tx.stratosDocument.deleteMany({ where: { ownerId: userId } });
      await tx.tacticalInvoice.deleteMany({ where: { agencyId: userId } });

      // 6) Borrar datos de agencia ligados a su identidad
      await tx.zoneCampaign.deleteMany({ where: { agencyId: userId } });
      await tx.campaign.deleteMany({ where: { agencyId: userId } });
      await tx.task.deleteMany({ where: { agencyId: userId } });
      await tx.propertyAssignment.deleteMany({ where: { agencyId: userId } });

      // 7) Antes de borrar propiedades, limpiar tablas que NO van en cascade
      if (propertyIds.length > 0) {
        await tx.affiliateClick.deleteMany({
          where: { propertyId: { in: propertyIds } }
        });

        await tx.commission.deleteMany({
          where: { propertyId: { in: propertyIds } }
        });

        await tx.property.deleteMany({
          where: { id: { in: propertyIds } }
        });
      }

      // 8) Finalmente, borrar usuario
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error en DELETE /api/mobile/user/[userId]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error en servidor'
      },
      { status: 500 }
    );
  }
}