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

    // 🛡️ ESCÁNER DE IDENTIDAD (CRÍTICO): 
    // Averiguamos si el usuario de la App Móvil es PARTICULAR o AGENCIA
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
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            companyLogo: true,
            role: true,
          }
        },
        // 🔥 CORRECCIÓN 1: Quitamos el 'agencyId: userId' para que el dueño reciba la agencia
        campaigns: {
          where: { status: 'ACCEPTED' },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyName: true,
                avatar: true,
                companyLogo: true,
                role: true,
              }
            }
          }
        },
        // 🔥 CORRECCIÓN 2: Aseguramos que solo traiga la asignación activa sin bloquear por userId
        assignment: {
          where: { status: 'ACTIVE' },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyName: true,
                avatar: true,
                companyLogo: true,
                role: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

   const formattedProperties = properties.map((prop: any) => {
  const activeCampaign =
    Array.isArray(prop.campaigns) && prop.campaigns.length > 0
      ? prop.campaigns[0]
      : null;

  // 🔥 CORRECCIÓN 3: Quitamos la restricción de que la agencia tenga que ser el userId
  const assignmentMatch =
    prop.assignment &&
    String(prop.assignment.status || '').toUpperCase() === 'ACTIVE'
      ? prop.assignment
      : null;

  const isAgencyOwned =
    String(prop.userId || '') === String(userId);

  const isAgencyInherited =
    !!activeCampaign || !!assignmentMatch;

  // 🔥 CORRECCIÓN 4: Si hay un contrato/asignación, está GESTIONADA (enciende la tarjeta azul)
  const isManaged = isAgencyInherited;

  const managingAgency =
    activeCampaign?.agency ||
    assignmentMatch?.agency ||
    (isAgencyOwned ? prop.user : null);

  const agencyName =
    managingAgency?.companyName ||
    managingAgency?.name ||
    (isAgencyOwned ? 'Mi Agencia' : null);

  const managementMode = isAgencyOwned
    ? 'AGENCY_OWNED'
    : isAgencyInherited
      ? 'AGENCY_INHERITED'
      : 'PARTICULAR';

  // 🛡️ EL ESCUDO DE SEGURIDAD B2B (REPARADO Y BLINDADO)
  let b2bData = null;
  
  if (activeCampaign) {
    const visibility = String(activeCampaign.commissionShareVisibility || 'PRIVATE').toUpperCase();
    const sharePct = Number(activeCampaign.commissionSharePct || 0);
    
    // ¿Soy la propia agencia que captó la casa?
    const isManagingAgency = String(managingAgency?.id) === String(userId);

    if (isManagingAgency) {
      // A. CREADOR: Soy la agencia gestora, LO VEO TODO
      b2bData = { sharePct, visibility };
    } else if (visibility === 'PUBLIC' || visibility === 'PÚBLICO') {
      // B. PÚBLICO: Lo ven todos (Particular, Otras Agencias, etc.)
      b2bData = { sharePct, visibility };
    } else if ((visibility === 'AGENCIES' || visibility === 'AGENCIAS') && requesterRole === 'AGENCIA') {
      // C. AGENCIAS: Lo veo SOLO si mi rol en la App es AGENCIA
      b2bData = { sharePct, visibility };
    } else {
      // D. BLOQUEO TOTAL: El dueño particular cae aquí si está en PRIVADO o SOLO AGENCIAS
      b2bData = null;
      
      // 🔥 DESTRUCCIÓN DE DATOS CRUDOS EN VUELO: 
      // Borramos las huellas de la campaña para que la App no pueda hackear los datos.
      activeCampaign.commissionSharePct = 0;
      activeCampaign.commissionShareEur = 0;
      activeCampaign.commissionShareVisibility = 'PRIVATE';
    }
  } else if (isAgencyOwned) {
    b2bData = { sharePct: prop.sharePct ?? 0, visibility: prop.shareVisibility ?? 'PRIVATE' };
    
    // Si soy mi propia agencia pero lo puse privado o es de particular a particular
    if (b2bData.visibility !== 'PUBLIC' && requesterRole !== 'AGENCIA') {
       b2bData = null;
       prop.sharePct = 0;
    }
  }

  return {
    ...prop,

    // contexto móvil
    activeCampaign,
    isAgencyOwned,
    isAgencyInherited,
    isManaged,
    isCaptured: isAgencyInherited,
    managementMode,
    managerType: isManaged ? 'AGENCY' : 'OWNER',

    // agencia resumida
    agencyName,
    agency: managingAgency
      ? {
          id: managingAgency.id ?? null,
          name: managingAgency.name ?? null,
          companyName: managingAgency.companyName ?? null,
          avatar: managingAgency.avatar ?? null,
          companyLogo: managingAgency.companyLogo ?? null,
          role: managingAgency.role ?? null,
        }
      : null,

    // términos visibles para la card / expediente
    mandateType:
      activeCampaign?.mandateType ??
      prop.mandateType ??
      null,

    exclusiveMandate:
      activeCampaign?.exclusiveMandate ??
      null,

    exclusiveMonths:
      activeCampaign?.exclusiveMonths ??
      null,

    commissionPct:
      activeCampaign?.commissionPct ??
      prop.commissionPct ??
      0,

    sharePct:
      activeCampaign?.commissionSharePct ??
      prop.sharePct ??
      0,

    shareVisibility:
      activeCampaign?.commissionShareVisibility ??
      prop.shareVisibility ??
      'PRIVATE',

    commissionBaseEur:
      activeCampaign?.commissionBaseEur ??
      0,

    commissionIvaEur:
      activeCampaign?.commissionIvaEur ??
      0,

    commissionTotalEur:
      activeCampaign?.commissionTotalEur ??
      0,

    commissionShareEur:
      activeCampaign?.commissionShareEur ??
      0,

    // 🔥 bloque b2b blindado por el escudo superior
    b2b: b2bData,

    // limpiamos relaciones crudas para que el móvil no se lie
    campaigns: undefined,
    assignment: undefined,
  };
});

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error extrayendo inventario del usuario:', error);
    return NextResponse.json(
      { error: 'Interferencia en el servidor' },
      { status: 500 }
    );
  }
}