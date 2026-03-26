import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../lib/prisma'; // Asegúrese de que la ruta sea correcta

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // 🛡️ EL MISMO CORTAFUEGOS DE LA WEB APLICADO AL MÓVIL
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { managerId: userId }, // Táctica 1: Soy el jefe asignado
          { property: { assignment: { agencyId: userId, status: "ACTIVE" } } }, // Táctica 2: Soy la agencia gestora
          { property: { userId: userId, assignment: { is: null } } } // Táctica 3: Soy el dueño Y NO hay agencia
        ]
      },
      include: {
        property: {
          select: {
            refCode: true,
            title: true,
            user: {
              select: {
                avatar: true,
                companyLogo: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // ⚙️ Formateo para la app móvil
    const formattedLeads = leads.map((l: any) => ({
      id: l.id,
      status: l.status,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source || "ORGANIC",
      date: l.createdAt,
      property: {
        refCode: l.property?.refCode || "Sin Ref",
        title: l.property?.title || "Sin título",
        user: {
          avatar: l.property?.user?.avatar || l.property?.user?.companyLogo || null
        }
      }
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads Móvil:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}