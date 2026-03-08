import { PrismaClient } from '@prisma/client';
import AdminDashboard from "@/app/components/admin/AdminDashboard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: { select: { properties: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const properties = await prisma.property.findMany({
      include: {
        user: true,
        assignment: {
            where: { status: "ACTIVE" },
            include: { agency: true }
        },
        campaigns: {
            where: { status: "ACCEPTED" },
            include: { agency: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 🔥 NUEVO: CARGAMOS LA LISTA DEL CRM DE CAPTACIÓN
    const prospects = await prisma.agencyProspect.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // ⏱️ NUEVO RADAR: CARGAMOS LAS ZONAS ACTIVAS (Totalmente independiente, no rompe nada)
    const activeZones = await prisma.zoneCampaign.findMany({
        where: { isActive: true }
    });

    // Se lo pasamos todo al panel añadiendo 'activeZones' al final
    return <AdminDashboard users={users} properties={properties} prospects={prospects} activeZones={activeZones} />;
    
  } catch (error) {
    console.error("❌ ERROR CARGANDO DATOS EN ADMIN:", error);
    return <div className="p-10 text-red-500 font-bold">Error cargando el radar del God Mode. Revise la consola.</div>;
  }
}