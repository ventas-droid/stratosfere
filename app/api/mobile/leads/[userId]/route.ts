import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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
            { userId: userId }, // Soy el dueño
            { assignment: { agencyId: userId, status: "ACTIVE" } } // O soy la agencia que la lleva
          ]
        }
      },
      include: {
        property: { select: { refCode: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // ⚙️ Formateo para la app móvil
    const formattedLeads = leads.map((l: any) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      source: l.source || "ORGANIC",
      property: {
        refCode: l.property?.refCode || "Sin Ref",
        title: l.property?.title || "Sin título"
      }
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("❌ Error API Leads:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}