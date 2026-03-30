import { db } from "../lib/db"; // 🔥 RUTA RELATIVA EXACTA (Sin la arroba que reventó el servidor)
import JoinClient from "./JoinClient";

export const dynamic = 'force-dynamic';

export default async function JoinPage({ searchParams }: any) {
  // 🎯 BLINDAJE DE URL: Funciona en todas las versiones de Vercel sin colgarse
  const params = await Promise.resolve(searchParams);
  const rawSponsor = params?.sponsor;
  
  // Nos aseguramos de que sea un texto limpio y no un código raro
  const sponsorId = rawSponsor ? String(rawSponsor) : undefined;
  
  let sponsorData = null;

  if (sponsorId) {
    try {
        sponsorData = await db.user.findUnique({
          where: { id: sponsorId },
          select: {
            id: true,
            name: true,
            companyName: true,
            companyLogo: true,
            avatar: true,
            phone: true,
            mobile: true,
            email: true,
            zone: true,
            licenseNumber: true,
          }
        });
    } catch(error) {
        console.error("Error buscando al General:", error);
    }
  }

  return <JoinClient sponsorId={sponsorId} sponsor={sponsorData} />;
}