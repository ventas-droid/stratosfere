import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // 📡 Buscamos Leads en propiedades mías o que gestiono
    const leads = await prisma.lead.findMany({
      where: {
        property: {
          OR: [
            { userId: userId },
            { assignment: { agencyId: userId, status: "ACTIVE" } }
          ]
        }
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

    // ✅ IMPORTANTE: devolvemos ARRAY plano porque inbox.tsx espera un array
    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}