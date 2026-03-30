import { db } from "@/app/lib/db";
import JoinClient from "./JoinClient";

export const dynamic = 'force-dynamic';

export default async function JoinPage(props: any) {
  // 🎯 EL ANTÍDOTO: Obligamos a Vercel a esperar y leer la URL completa
  const searchParams = await props.searchParams;
  const sponsorId = searchParams?.sponsor;
  
  let sponsorData = null;

  if (sponsorId) {
    try {
        // Ahora sí buscará su ID exacto (cmlpolh8800046bsf0i2x9yw9)
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
        console.error("Error leyendo datos del General:", error);
    }
  }

  return <JoinClient sponsorId={sponsorId} sponsor={sponsorData} />;
}