import { db } from "@/app/lib/db"; // 🔥 USAMOS SU DB ORIGINAL
import JoinClient from "./JoinClient";

export const dynamic = 'force-dynamic'; // 🔥 VITAL PARA QUE VERCEL LEA LA URL SIEMPRE

export default async function JoinPage({ searchParams }: { searchParams: { sponsor?: string } }) {
  const sponsorId = searchParams?.sponsor;
  let sponsor = null;

  if (sponsorId) {
    try {
        sponsor = await db.user.findUnique({
          where: { id: sponsorId },
          select: {
            id: true, name: true, companyName: true, companyLogo: true, avatar: true,
            phone: true, mobile: true, email: true, zone: true, licenseNumber: true, cif: true,
          }
        });
    } catch(e) {
        console.error("Error buscando al General:", e);
    }
  }

  return <JoinClient sponsorId={sponsorId} sponsor={sponsor} />;
}