import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    const requesterRole = String(requestingUser?.role || "PARTICULAR").toUpperCase();

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { userId: userId },
          { campaigns: { some: { agencyId: userId, status: 'ACCEPTED' } } },
          { assignment: { agencyId: userId, status: 'ACTIVE' } }
        ]
      },
      include: {
        images: true,
        user: {
          select: {
            id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true, 
            phone: true, mobile: true, email: true
          }
        },
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: {
            agency: {
              select: {
                id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true,
                phone: true, mobile: true, email: true
              }
            }
          }
        },
        assignment: { // 🔥 CORREGIDO: Sin 'where' porque es 1 a 1
          include: {
            agency: {
              select: {
                id: true, name: true, companyName: true, avatar: true, companyLogo: true, role: true,
                phone: true, mobile: true, email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

   const formattedProperties = properties.map((prop: any) => {
      const activeCampaign = Array.isArray(prop.campaigns) && prop.campaigns.length > 0 ? prop.campaigns[0] : null;
      // 🔥 CORREGIDO: Validamos en memoria el status de assignment
      const assignmentMatch = prop.assignment && String(prop.assignment.status || '').toUpperCase() === 'ACTIVE' ? prop.assignment : null;

      const isAgencyOwned = String(prop.userId || '') === String(userId);
      const isAgencyInherited = !!activeCampaign || !!assignmentMatch;
      const isManaged = isAgencyInherited;

      const managingAgency = activeCampaign?.agency || assignmentMatch?.agency || (isAgencyOwned ? prop.user : null);
      const agencyName = managingAgency?.companyName || managingAgency?.name || (isAgencyOwned ? 'Mi Agencia' : null);
      const managementMode = isAgencyOwned ? 'AGENCY_OWNED' : isAgencyInherited ? 'AGENCY_INHERITED' : 'PARTICULAR';

      let b2bData = null;
      if (activeCampaign) {
        const visibility = String(activeCampaign.commissionShareVisibility || 'PRIVATE').toUpperCase();
        const sharePct = Number(activeCampaign.commissionSharePct || 0);
        const isManagingAgency = String(managingAgency?.id) === String(userId);

        if (isManagingAgency) b2bData = { sharePct, visibility };
        else if (visibility === 'PUBLIC' || visibility === 'PÚBLICO') b2bData = { sharePct, visibility };
        else if ((visibility === 'AGENCIES' || visibility === 'AGENCIAS') && requesterRole === 'AGENCIA') b2bData = { sharePct, visibility };
        else {
          b2bData = null;
          activeCampaign.commissionSharePct = 0;
          activeCampaign.commissionShareEur = 0;
          activeCampaign.commissionShareVisibility = 'PRIVATE';
        }
      } else if (isAgencyOwned) {
        b2bData = { sharePct: prop.sharePct ?? 0, visibility: prop.shareVisibility ?? 'PRIVATE' };
        if (b2bData.visibility !== 'PUBLIC' && requesterRole !== 'AGENCIA') {
           b2bData = null;
           prop.sharePct = 0;
        }
      }

      let finalUser = prop.user;
      if (isManaged && managingAgency) {
        finalUser = {
            ...managingAgency,
            role: 'AGENCIA'
        };
      }

      return {
        ...prop,
        user: finalUser,
        activeCampaign,
        isAgencyOwned,
        isAgencyInherited,
        isManaged,
        isCaptured: isAgencyInherited,
        managementMode,
        managerType: isManaged ? 'AGENCY' : 'OWNER',
        agencyName,
        agency: managingAgency ? {
              id: managingAgency.id ?? null,
              name: managingAgency.name ?? null,
              companyName: managingAgency.companyName ?? null,
              avatar: managingAgency.avatar ?? null,
              companyLogo: managingAgency.companyLogo ?? null,
              role: managingAgency.role ?? null,
              phone: managingAgency.phone ?? null,
              mobile: managingAgency.mobile ?? null,
              email: managingAgency.email ?? null,
            } : null,
        mandateType: activeCampaign?.mandateType ?? prop.mandateType ?? null,
        exclusiveMandate: activeCampaign?.exclusiveMandate ?? null,
        exclusiveMonths: activeCampaign?.exclusiveMonths ?? null,
        commissionPct: activeCampaign?.commissionPct ?? prop.commissionPct ?? 0,
        sharePct: activeCampaign?.commissionSharePct ?? prop.sharePct ?? 0,
        shareVisibility: activeCampaign?.commissionShareVisibility ?? prop.shareVisibility ?? 'PRIVATE',
        commissionBaseEur: activeCampaign?.commissionBaseEur ?? 0,
        commissionIvaEur: activeCampaign?.commissionIvaEur ?? 0,
        commissionTotalEur: activeCampaign?.commissionTotalEur ?? 0,
        commissionShareEur: activeCampaign?.commissionShareEur ?? 0,
        b2b: b2bData,
        campaigns: undefined,
        assignment: undefined,
      };
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error extrayendo inventario:', error);
    return NextResponse.json({ error: 'Interferencia en el servidor' }, { status: 500 });
  }
}