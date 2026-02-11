import { prisma } from "@/app/lib/prisma"; // Ajuste la ruta si su prisma está en otro lado
import AdminDashboard from "@/app/components/admin/AdminDashboard"; // El componente nuevo
import { getUserMeAction } from "@/app/actions"; 

export default async function AdminPage() {
  // 1. OBTENER AL COMANDANTE (Opcional, para logs o seguridad extra)
  await getUserMeAction();

  // 2. OBTENER TODA LA INTELIGENCIA
  // Aquí está la clave: pedimos 'subscription' Y el conteo de 'properties'
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
        subscription: true, // Para saber si pagó
        _count: {           // 👈 MAGIA: Esto cuenta las propiedades automáticamente
            select: { properties: true } 
        }
    }, 
    take: 100 // Límite de seguridad
  });

  // 3. DESPLEGAR EL COMPONENTE
  return <AdminDashboard users={allUsers} />;
}