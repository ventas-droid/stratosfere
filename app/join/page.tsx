import { db } from "@/app/lib/db";
import JoinClient from "./JoinClient";

// 🔥 ESTO ES VITAL PARA QUE VERCEL LEA LA URL SIEMPRE Y NO SE CONGELE
export const dynamic = 'force-dynamic'; 

export default async function JoinPage({ searchParams }: { searchParams: { sponsor?: string } }) {
  const sponsorId = searchParams?.sponsor;
  let sponsorData = null;

  if (sponsorId) {
    try {
        // Buscamos toda la artillería pesada del General
        sponsorData = await db.user.findUnique({
          where: { id: sponsorId },
          select: {
            id: true,
            name: true,
            companyName: true,
            companyLogo: true, // 🔥 LOGO
            avatar: true,
            phone: true,       // 🔥 TELÉFONO
            mobile: true,
            email: true,
            zone: true,        // 🔥 ZONA
            licenseNumber: true, // 🔥 LICENCIA
          }
        });
    } catch(error) {
        console.error("Error leyendo datos del General:", error);
    }
  }

  // Le pasamos los datos reales al diseño visual
  return <JoinClient sponsorId={sponsorId} sponsor={sponsorData} />;
}