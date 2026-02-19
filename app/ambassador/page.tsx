import AmbassadorDashboard from "../components/alive-map/ui-panels/AmbassadorDashboard";

// =========================================================================
// ☢️ OPCIÓN NUCLEAR ANTI-CACHÉ ☢️
// Obliga a Next.js a cargar la página en tiempo real SIEMPRE.
// Adiós a las fotos y diseños antiguos.
// =========================================================================
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
// =========================================================================

export default function Page() {
  return <AmbassadorDashboard />;
}