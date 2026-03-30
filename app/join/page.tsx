import { db } from "@/app/lib/db";
import JoinClient from "./JoinClient";

export default async function JoinPage({ searchParams }: { searchParams: { sponsor?: string } }) {
  // 1. Atrapamos el ID exacto que viene en el enlace
  const sponsorId = searchParams?.sponsor;
  
  let sponsor = null;

  // 2. Si hay ID, rastreamos la Base de Datos de Producción
  if (sponsorId) {
    sponsor = await db.user.findUnique({
      where: { id: sponsorId },
      select: {
        name: true,
        companyName: true,
        companyLogo: true,  // 🔥 Vital para su escudo
        avatar: true,       // 🔥 Por si no hay logo de empresa
        phone: true,
        mobile: true,
        email: true,
        zone: true,
        licenseNumber: true,
      }
    });
  }

  // 3. Enviamos los datos reales a la pantalla oscura
  return <JoinClient sponsorId={sponsorId} sponsor={sponsor} />;
}