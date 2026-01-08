// @ts-nocheck

// =============================================================================
// 1. CATÁLOGO HÍBRIDO (EL ALGORITMO DEL ÉXITO)
// =============================================================================
// Define qué pide la "Doncella" (Propietario) y qué gasta el "Caballero" (Agencia)

export const SERVICE_CATALOG: Record<string, any> = {
  // --- VISUALES (ARMAS DE SEDUCCIÓN) ---
  PHOTO_PRO: { 
      id: "PHOTO_PRO", label: "Fotografía Premium", 
      priceEUR: 150, // Lo que valora el propietario
      costCredits: 2 // Lo que le cuesta al agente (Munición)
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

  // --- TÉCNICOS (ESCUDOS) ---
  LEGAL_CHECK: { 
      id: "LEGAL_CHECK", label: "Nota Simple / Legal", 
      priceEUR: 50, 
      costCredits: 1 
  },
  ENERGY_CERT: { 
      id: "ENERGY_CERT", label: "Cert. Energético", 
      priceEUR: 120, 
      costCredits: 2 
  },
  PLANO_TEC: { 
      id: "PLANO_TEC", label: "Plano Técnico", 
      priceEUR: 80, 
      costCredits: 1 
  }
};

// =============================================================================
// 2. NIVELES DE AGENCIA (LA ARMERÍA)
// =============================================================================
export const AGENCY_SUBSCRIPTIONS = [
  {
    id: "sub_starter",
    name: "AGENTE NOVATO",
    price: 29.90, // €/mes
    credits: 10,  // Munición mensual
    perks: ["Radar Básico", "5 Leads/mes"]
  },
  {
    id: "sub_tactical",
    name: "OPERADOR TÁCTICO",
    price: 89.90,
    credits: 50, // Munición estándar
    perks: ["Radar 3D", "Leads Ilimitados"]
  },
  {
    id: "sub_dominator",
    name: "STRATOS DOMINATOR",
    price: 199.90,
    credits: 200, // Munición pesada
    perks: ["God Mode", "Exclusividad", "Prioridad Algorítmica"]
  }
];

export function getServiceLabel(id: string) {
    return SERVICE_CATALOG[id]?.label || id;
}