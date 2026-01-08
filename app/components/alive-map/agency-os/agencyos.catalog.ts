// @ts-nocheck

// =============================================================================
// 1. CATÁLOGO DE SERVICIOS PROFESIONALES
// =============================================================================

export const SERVICE_CATALOG: Record<string, any> = {
  // --- MARKETING VISUAL ---
  PHOTO_PRO: { 
      id: "PHOTO_PRO", label: "Fotografía Profesional", 
      priceEUR: 150, 
      costCredits: 2 
  },
  TOUR_MATTERPORT: { 
      id: "TOUR_MATTERPORT", label: "Tour Virtual 3D", 
      priceEUR: 200, 
      costCredits: 4 
  },
  DRONE_AERIAL: { 
      id: "DRONE_AERIAL", label: "Video Drone 4K", 
      priceEUR: 180, 
      costCredits: 3 
  },

  // --- DOCUMENTACIÓN TÉCNICA ---
  LEGAL_CHECK: { 
      id: "LEGAL_CHECK", label: "Verificación Registral", 
      priceEUR: 50, 
      costCredits: 1 
  },
  ENERGY_CERT: { 
      id: "ENERGY_CERT", label: "Certificado Energético", 
      priceEUR: 120, 
      costCredits: 2 
  },
  PLANO_TEC: { 
      id: "PLANO_TEC", label: "Plano Acotado", 
      priceEUR: 80, 
      costCredits: 1 
  }
};

// =============================================================================
// 2. LICENCIAS DE AGENCIA (MODELO SAAS)
// =============================================================================
export const AGENCY_SUBSCRIPTIONS = [
  {
    id: "sub_starter",
    name: "LICENCIA ESSENTIAL",
    price: 29.90, // €/mes
    credits: 10,  // Créditos mensuales
    perks: ["Acceso Radar", "5 Leads/mes"]
  },
  {
    id: "sub_pro",
    name: "LICENCIA PROFESSIONAL",
    price: 89.90,
    credits: 50,
    perks: ["Radar Avanzado", "Leads Ilimitados"]
  },
  {
    id: "sub_corp",
    name: "LICENCIA CORPORATE",
    price: 199.90,
    credits: 200,
    perks: ["Prioridad Alta", "API Access"]
  }
];

export function getServiceLabel(id: string) {
    return SERVICE_CATALOG[id]?.label || id;
}