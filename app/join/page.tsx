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
        // Buscamos al General y su mejor arma (la propiedad más cara que tenga compartida)
        const sponsorRecord = await db.user.findUnique({
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
            // 🔥 LA INYECCIÓN TÁCTICA: Buscamos la propiedad gancho para el modal negro
            properties: {
                where: { shareVisibility: { in: ['PUBLIC', 'PÚBLICO', 'AGENCIES', 'AGENCIAS'] } },
                take: 1, // Cogemos solo una
                orderBy: { price: 'desc' }, // La más cara, para impactar con la comisión
                select: {
                    id: true, title: true, price: true, refCode: true, type: true,
                    mainImage: true, city: true, sharePct: true, commissionPct: true
                }
            }
          }
        });

        if (sponsorRecord) {
            // Separamos la propiedad del resto de datos para no saturar al cliente
            const { properties, ...rest } = sponsorRecord;
            sponsorData = {
                ...rest,
                featuredProperty: properties?.length > 0 ? properties[0] : null
            };
        }
    } catch(error) {
        console.error("Error buscando al General:", error);
    }
  }

  return <JoinClient sponsorId={sponsorId} sponsor={sponsorData} />;
}