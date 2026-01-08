// @ts-nocheck

// =============================================================================
// 1. CATÁLOGO MAESTRO DE SERVICIOS (ECOSISTEMA STRATOS)
// =============================================================================
export const SERVICE_CATALOG: Record<string, any> = {
  
  // --- PRODUCCIÓN AUDIOVISUAL (IMAGEN DE MARCA) ---
  PHOTO_PRO: { 
      id: "PHOTO_PRO", 
      label: "Fotografía Editorial HDR", 
      desc: "Estándar de revista. 20 tomas tratadas.",
      priceEUR: 89,    
      costCredits: 2,  
      category: "VISUAL", 
      icon: "Camera"
  },
  VIDEO_CINEMA: { 
      id: "VIDEO_CINEMA", 
      label: "Producción Cinema 4K", 
      desc: "Storytelling emocional y edición pro.",
      priceEUR: 199, 
      costCredits: 5, 
      category: "VISUAL", 
      icon: "Video"
  },
  DRONE_AERIAL: { 
      id: "DRONE_AERIAL", 
      label: "Perspectiva Aérea", 
      desc: "Contexto y entorno vía Drone.",
      priceEUR: 120, 
      costCredits: 3, 
      category: "VISUAL", 
      icon: "Globe"
  },
  TOUR_MATTERPORT: { 
      id: "TOUR_MATTERPORT", 
      label: "Gemelo Digital 3D", 
      desc: "Experiencia inmersiva Matterport.",
      priceEUR: 150, 
      costCredits: 4, 
      category: "VISUAL", 
      icon: "Box"
  },

  // --- CONSULTORÍA TÉCNICA & LEGAL (GARANTÍAS) ---
  LEGAL_CHECK: { 
      id: "LEGAL_CHECK", 
      label: "Verificación Registral", 
      desc: "Auditoría jurídica de la propiedad.",
      priceEUR: 20, 
      costCredits: 1, 
      category: "LEGAL", 
      icon: "FileCheck"
  },
  ENERGY_CERT: { 
      id: "ENERGY_CERT", 
      label: "Certificación Energética", 
      desc: "Cumplimiento normativo EU.",
      priceEUR: 90, 
      costCredits: 2, 
      category: "LEGAL", 
      icon: "Zap"
  },
  APPRAISAL: { 
      id: "APPRAISAL", 
      label: "Valoración de Mercado", 
      desc: "Informe de tasación certificado.",
      priceEUR: 250, 
      costCredits: 6, 
      category: "LEGAL", 
      icon: "Activity"
  },

  // --- ESTRATEGIA DE DIFUSIÓN (ALCANCE) ---
  PORTAL_PREMIUM: { 
      id: "PORTAL_PREMIUM", 
      label: "Posicionamiento Prime", 
      desc: "Visibilidad prioritaria en listados.",
      priceEUR: 49, 
      costCredits: 1, 
      category: "ADS", 
      icon: "ArrowUp"
  },
  SOCIAL_ADS: { 
      id: "SOCIAL_ADS", 
      label: "Social Media Ads", 
      desc: "Segmentación algorítmica en Meta/IG.",
      priceEUR: 79, 
      costCredits: 2, 
      category: "ADS", 
      icon: "Megaphone"
  },
  OPEN_HOUSE: { 
      id: "OPEN_HOUSE", 
      label: "Evento Open House", 
      desc: "Jornada de puertas abiertas gestionada.",
      priceEUR: 299, 
      costCredits: 8, 
      category: "EVENT", 
      icon: "Star"
  },
  HOME_STAGING: { 
      id: "HOME_STAGING", 
      label: "Home Staging", 
      desc: "Valorización estética del activo.",
      priceEUR: 350, 
      costCredits: 10, 
      category: "EVENT", 
      icon: "Paintbrush"
  }
};

// =============================================================================
// 2. LICENCIAS CORPORATIVAS (PLANES DE AGENCIA)
// =============================================================================
// Aquí definimos los niveles de acceso. Todo muy limpio y jerárquico.
export const AGENCY_SUBSCRIPTIONS = [
  {
    id: "sub_starter",
    name: "LICENSE: ESSENTIAL",
    price: 29.90, // Mensual
    credits: 10,  // Capacidad operativa
    perks: ["Acceso Mapa Base", "5 Activos en Cartera"],
    badge: "🔹", 
    desc: "Para agencias en fase de inicio."
  },
  {
    id: "sub_professional", // Antes "Tactical"
    name: "LICENSE: PROFESSIONAL",
    price: 89.90,
    credits: 35, 
    perks: ["Radar 3D Tiempo Real", "Cartera Ilimitada"],
    badge: "💠", 
    desc: "El estándar para alto rendimiento."
  },
  {
    id: "sub_authority", // Antes "Dominator"
    name: "LICENSE: AUTHORITY",
    price: 199.90,
    credits: 100, 
    perks: ["Market Intelligence", "Exclusividad de Zona", "Prioridad Algorítmica"],
    badge: "💎", // Diamante (Premium, no Corona)
    desc: "Infraestructura total para líderes de zona."
  }
];

// Función Helper para obtener etiqueta de forma segura
export function labelForService(serviceId: string): string {
  if (SERVICE_CATALOG[serviceId]) return SERVICE_CATALOG[serviceId].label;
  return serviceId.replace(/_/g, " ");
}