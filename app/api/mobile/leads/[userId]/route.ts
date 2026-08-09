import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // =========================================================
    // 1. BÚSQUEDA SEGURA
    // - El propietario ve TODOS los leads de sus propiedades
    // - La agencia ve los leads dirigidos a ella (managerId)
    // - La agencia con assignment activo ve solo leads orgánicos (managerId null)
    // =========================================================
    const rawLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { property: { userId: userId } },
          { managerId: userId },
          {
            managerId: null,
            property: {
              assignment: {
                is: {
                  agencyId: userId,
                  status: "ACTIVE",
                },
              },
            },
          },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            userId: true,
            refCode: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                avatar: true,
                companyLogo: true,
                role: true,
              },
            },
            assignment: {
              select: {
                agencyId: true,
                status: true,
                agency: {
                  select: {
                    id: true,
                    name: true,
                    companyName: true,
                    avatar: true,
                    companyLogo: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // =========================================================
    // 2. BISTURÍ DE DEFENSA
    // Revalidación extra para impedir cruces
    // =========================================================
    const myRealLeads = rawLeads.filter((l: any) => {
      if (String(l.property?.userId || "") === String(userId)) return true;
      if (String(l.managerId || "") === String(userId)) return true;

      if (
        !l.managerId &&
        l.property?.assignment?.status === "ACTIVE" &&
        String(l.property?.assignment?.agencyId || "") === String(userId)
      ) {
        return true;
      }

      return false;
    });

    // =========================================================
    // 3. CARGA DE AGENCIAS REALES DEL LEAD
    // managerId = fuente de verdad de la asesoría
    // =========================================================
    const managerIds = Array.from(
      new Set(
        myRealLeads
          .map((l: any) => String(l.managerId || ""))
          .filter(Boolean)
      )
    );

    const propertyIds = Array.from(
      new Set(
        myRealLeads
          .map((l: any) => String(l.property?.id || l.propertyId || ""))
          .filter(Boolean)
      )
    );

    const managers = managerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: managerIds } },
          select: {
            id: true,
            name: true,
            surname: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
            role: true,
            email: true,
            phone: true,
            mobile: true,
          },
        })
      : [];

    const managerById = new Map(
      (managers || []).map((u: any) => [String(u.id), u])
    );

    // =========================================================
    // 3.1 PERFIL REAL DEL REMITENTE DEL LEAD
    // Si el email del lead pertenece a una agencia/usuario registrado,
    // usamos su companyLogo/avatar para que en la app salga quién envió el lead.
    // =========================================================
    const leadEmails = Array.from(
      new Set(
        myRealLeads
          .map((l: any) => String(l.email || "").toLowerCase().trim())
          .filter(Boolean)
      )
    );

    const senderUsers = leadEmails.length
      ? await prisma.user.findMany({
          where: {
            email: { in: leadEmails },
          },
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            avatar: true,
            companyName: true,
            companyLogo: true,
            role: true,
            phone: true,
            mobile: true,
          },
        })
      : [];

    const senderByEmail = new Map(
      (senderUsers || []).map((u: any) => [
        String(u.email || "").toLowerCase().trim(),
        u,
      ])
    );

    // =========================================================
    // 4. CAMPAÑA EXACTA POR PAREJA propertyId + agencyId
    // Esto evita que el móvil use la campaña equivocada
    // =========================================================
    const exactCampaigns =
      managerIds.length && propertyIds.length
        ? await prisma.campaign.findMany({
            where: {
              propertyId: { in: propertyIds },
              agencyId: { in: managerIds },
            },
            select: {
              propertyId: true,
              agencyId: true,
              conversationId: true,
              status: true,
              agency: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  avatar: true,
                  companyLogo: true,
                  role: true,
                },
              },
            },
          })
        : [];

    const campaignByPair = new Map(
      (exactCampaigns || []).map((c: any) => [
        `${String(c.propertyId)}:${String(c.agencyId)}`,
        c,
      ])
    );

    // =========================================================
    // 5. FORMATEO FINAL COMPATIBLE CON TU APP ACTUAL
    // - seguimos devolviendo property.campaigns[]
    // - añadimos avatar/senderProfile del usuario o agencia que envía el lead
    // =========================================================
    const formattedLeads = myRealLeads.map((l: any) => {
      const propertyId = String(l.property?.id || "");
      const managerId = String(l.managerId || "");

      // Perfil real de quien ha enviado/contactado.
      // Se resuelve por email, no por nombre fijo.
      const senderProfile =
        senderByEmail.get(String(l.email || "").toLowerCase().trim()) || null;

      const senderAvatar =
        senderProfile?.companyLogo ||
        senderProfile?.avatar ||
        null;

      const senderDisplayName =
        senderProfile?.companyName ||
        senderProfile?.name ||
        l.name;

      const exactAgency =
        managerId && managerById.has(managerId)
          ? managerById.get(managerId)
          : null;

      const exactCampaign =
        propertyId && managerId
          ? campaignByPair.get(`${propertyId}:${managerId}`)
          : null;

      const fallbackAgency =
        l.property?.assignment?.agency || null;

      const safeAgency =
        exactAgency ||
        exactCampaign?.agency ||
        fallbackAgency ||
        null;

      const safeCampaigns = safeAgency
        ? [
            {
              agencyId: safeAgency.id,
              conversationId: exactCampaign?.conversationId || null,
              status: exactCampaign?.status || "SENT",
              agency: safeAgency,
            },
          ]
        : [];

      return {
        id: l.id,
        status: l.status,
        name: senderDisplayName,
        email: l.email,
        phone: l.phone,
        message: l.message,
        source: l.source || "ORGANIC",
        date: l.createdAt,
        propertyId: l.property?.id || null,
        managerId: l.managerId || null,

        // NUEVO: estos campos los usará la app móvil para pintar la foto/logo correcto
        avatar: senderAvatar,
        senderProfile: senderProfile,

        leadAgency: safeAgency || null,
        property: {
  id: l.property?.id || null,
  refCode: l.property?.refCode || "Sin Ref",
  title: l.property?.title || "Sin título",

  // COMPATIBILIDAD CON LA APP ACTUAL:
  // La app instalada todavía lee lead.property.user.avatar.
  // Por eso inyectamos aquí el avatar/logo real de quien contacta.
  user: l.property?.user
    ? {
        ...l.property.user,
        avatar: senderAvatar || l.property.user.avatar || null,
        companyLogo:
          senderProfile?.companyLogo ||
          l.property.user.companyLogo ||
          null,
      }
    : null,

  assignment: l.property?.assignment || null,
  campaigns: safeCampaigns,
},
      };
    });

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}