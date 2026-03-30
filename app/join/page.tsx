import { db } from "@/app/lib/db";
import JoinClient from "./JoinClient";

export const metadata = {
  title: "Alianza B2B | Stratosfere Vanguard",
  description: "Únase a la red de agencias y comparta stock de forma bidireccional.",
};

export default async function JoinPage({ searchParams }: { searchParams: { sponsor?: string } }) {
  const sponsorId = searchParams?.sponsor;
  let sponsor = null;

  // Si hay un ID de General en la URL, buscamos todos sus galones
  if (sponsorId) {
    sponsor = await db.user.findUnique({
      where: { id: sponsorId },
      select: {
        name: true,
        companyName: true,
        avatar: true,
        companyLogo: true,
        phone: true,
        mobile: true,
        email: true,
        zone: true,
        address: true,
      }
    });
  }

  // Le pasamos sus datos al diseño visual
  return <JoinClient sponsorId={sponsorId} sponsor={sponsor} />;
}