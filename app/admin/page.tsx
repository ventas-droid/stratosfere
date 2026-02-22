import { PrismaClient } from '@prisma/client';
import AdminDashboard from "@/app/components/admin/AdminDashboard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    // 1. Extraemos Usuarios con TODOS sus datos (incluyendo Subscripciones)
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: { select: { properties: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Extraemos Propiedades con TODOS los contratos y dueños
    const properties = await prisma.property.findMany({
      include: {
        user: true, // Trae email, phone, mobile del creador
        assignment: {
            where: { status: "ACTIVE" },
            include: { agency: true } // Trae email, phone, mobile de la Agencia Gestora
        },
        campaigns: {
            where: { status: "ACCEPTED" },
            include: { agency: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return <AdminDashboard users={users} properties={properties} />;
  } catch (error) {
    console.error("❌ ERROR CARGANDO DATOS EN ADMIN:", error);
    return <div className="p-10 text-red-500 font-bold">Error cargando el radar.</div>;
  }
}