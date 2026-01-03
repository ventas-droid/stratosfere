// @ts-nocheck
export const SERVICE_CATALOG: Record<string, { label: string }> = {
  // --- MULTIMEDIA TÁCTICA ---
  PHOTO_PRO: { label: "Fotografía Pro (HDR)" },
  VIDEO_CINEMA: { label: "Video Cinemático 4K" },
  DRONE_AERIAL: { label: "Drone Aéreo" },
  TOUR_MATTERPORT: { label: "Tour Virtual 3D" },
  FLOORPLAN_2D: { label: "Plano Acotado 2D" },
  FLOORPLAN_3D: { label: "Plano Volumétrico 3D" },
  
  // --- MARKETING DE GUERRA ---
  PORTAL_PREMIUM: { label: "Destacado Premium" },
  SOCIAL_ADS: { label: "Campaña Social Ads" },
  EMAIL_BLAST: { label: "Email Marketing VIP" },
  COPYWRITING: { label: "Storytelling Venta" },
  OPEN_HOUSE: { label: "Evento Open House" },
  BROCHURE: { label: "Dossier Impreso" },
  
  // --- LEGAL & TÉCNICO ---
  LEGAL_CHECK: { label: "Nota Simple / Cargas" },
  ENERGY_CERT: { label: "Cert. Energético" },
  CEDULA: { label: "Cédula Habitabilidad" },
  APPRAISAL: { label: "Tasación Oficial" },
  NOTARY_PREP: { label: "Gestión Notaría" },
  ARCHITECT_CONSULT: { label: "Consulta Arquitecto" },
  
  // --- OPERACIONES DE CAMPO ---
  HOME_STAGING: { label: "Home Staging Físico" },
  VIRTUAL_STAGING: { label: "Home Staging Virtual" },
  DEEP_CLEANING: { label: "Limpieza Integral" },
  MAINTENANCE: { label: "Reparaciones Express" },
  KEY_CUSTODY: { label: "Custodia de Llaves" },
  MOVING: { label: "Servicio Mudanza" },
  INSURANCE: { label: "Seguro Impago" }
};

export const SERVICE_ALIAS: Record<string, string> = {
  // ALIAS PARA MAPEO INTELIGENTE (Detecta variaciones)
  "FOTO": "PHOTO_PRO", "FOTOGRAFIA": "PHOTO_PRO", "PHOTO": "PHOTO_PRO",
  "VIDEO": "VIDEO_CINEMA", "CINE": "VIDEO_CINEMA",
  "DRON": "DRONE_AERIAL", "DRONE": "DRONE_AERIAL",
  "TOUR": "TOUR_MATTERPORT", "MATTERPORT": "TOUR_MATTERPORT", "3D": "TOUR_MATTERPORT",
  "PLANO": "FLOORPLAN_2D", "PLANO 2D": "FLOORPLAN_2D",
  "RENDER": "FLOORPLAN_3D", "PLANO 3D": "FLOORPLAN_3D",
  
  "DESTACADO": "PORTAL_PREMIUM", "PORTALES": "PORTAL_PREMIUM",
  "ADS": "SOCIAL_ADS", "FACEBOOK": "SOCIAL_ADS", "INSTAGRAM": "SOCIAL_ADS",
  "EMAIL": "EMAIL_BLAST", "NEWSLETTER": "EMAIL_BLAST",
  "OPEN HOUSE": "OPEN_HOUSE", "VISITA": "OPEN_HOUSE",
  
  "NOTA SIMPLE": "LEGAL_CHECK", "LEGAL": "LEGAL_CHECK", "REGISTRO": "LEGAL_CHECK",
  "CEE": "ENERGY_CERT", "ENERGETICO": "ENERGY_CERT",
  "CEDULA": "CEDULA",
  "TASACION": "APPRAISAL", "VALORACION": "APPRAISAL",
  "NOTARIA": "NOTARY_PREP",
  
  "STAGING": "HOME_STAGING", "DECORACION": "HOME_STAGING",
  "STAGING VIRTUAL": "VIRTUAL_STAGING",
  "LIMPIEZA": "DEEP_CLEANING",
  "LLAVES": "KEY_CUSTODY",
  "MUDANZA": "MOVING"
};

export function normalizeServiceId(raw: any): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Ignorar packs genéricos si llegan
  if (s.toLowerCase().startsWith("pack_")) return null;

  const key = s.replace(/\s+/g, "_").toUpperCase();
  // 1. Intentar alias directo
  let mapped = SERVICE_ALIAS[key];
  // 2. Si no, intentar key directa
  if (!mapped && SERVICE_CATALOG[key]) mapped = key;
  // 3. Fallback inteligente (Búsqueda parcial)
  if (!mapped) {
     const found = Object.keys(SERVICE_ALIAS).find(k => key.includes(k));
     if (found) mapped = SERVICE_ALIAS[found];
  }

  return mapped || null;
}

export function labelForService(serviceId: string): string {
  // Si tenemos el ID oficial, devolvemos etiqueta bonita
  if (SERVICE_CATALOG[serviceId]) return SERVICE_CATALOG[serviceId].label;
  
  // Si nos llega algo raro, intentamos normalizarlo primero
  const norm = normalizeServiceId(serviceId);
  if (norm && SERVICE_CATALOG[norm]) return SERVICE_CATALOG[norm].label;

  // Si todo falla, devolvemos el texto original limpio
  return serviceId.replace(/_/g, " ");
}