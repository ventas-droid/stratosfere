import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Asegúrese de que la ruta a prisma es correcta

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta ID" });

    // 🧹 Pasamos TODOS los leads "NEW" a "READ", pero SOLO si nos pertenecen 100%
    await prisma.lead.updateMany({
      where: {
        status: 'NEW',
        OR: [
          { managerId: userId },
          { property: { assignment: { agencyId: userId, status: 'ACTIVE' } } },
          { property: { userId: userId, assignment: { is: null } } }
        ]
      },
      data: { status: 'READ' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando burbuja móvil:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}