import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Asegúrese de que la ruta a prisma es correcta

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta ID" });

    // 🧹 Pasamos TODOS los leads "NEW" de este usuario a "READ"
    await prisma.lead.updateMany({
      where: {
        status: 'NEW',
        property: {
          OR: [
            { userId: userId },
            { assignment: { agencyId: userId, status: 'ACTIVE' } }
          ]
        }
      },
      data: { status: 'READ' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando burbuja:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}