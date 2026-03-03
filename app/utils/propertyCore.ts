// Ubicación: utils/propertyCore.ts

// --- UTILIDADES ---
export const LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=100"
];

// HERRAMIENTA DE REPARACIÓN DE DATOS E INYECCIÓN DE NANO CARDS (CORREGIDA Y BLINDADA)
export const sanitizePropertyData = (p: any) => {
  if (!p) return null;

  // 1. APLANADO INTELIGENTE
  // Usamos { ...p } en el else para crear una copia y poder modificarla sin afectar al original
  const base = p?.property
    ? { ...p.property, propertyId: p.propertyId, favoriteId: p.id }
    : { ...p };

  // 🔥 FIX CRÍTICO: RESCATE DEL DUEÑO
  // Si el objeto padre 'p' tiene 'user' (el creador) pero 'base' lo perdió al aplanar, lo recuperamos.
  if (!base.user && p.user) {
      base.user = p.user;
  }

  // 2. GESTIÓN DE IMÁGENES (FIX robusto: soporta secure_url/src/etc. sin romper nada)
const collectUrls = (val: any): string[] => {
  const out: string[] = [];

  const push = (u: any) => {
    if (!u) return;

    if (typeof u === "string") {
      const s = u.trim();
      if (!s) return;

      // soporta "url1,url2,url3" si algún backend lo manda así
      if (s.includes(",") && /^https?:\/\//i.test(s.split(",")[0].trim())) {
        s.split(",").forEach((p) => push(p));
        return;
      }

      out.push(s);
      return;
    }

    if (typeof u === "object") {
      const cand =
        u.url ||
        u.secure_url ||
        u.secureUrl ||
        u.src ||
        u.href ||
        u.path ||
        u.image ||
        u.imageUrl ||
        u.publicUrl;

      if (cand) push(cand);
    }
  };

  if (Array.isArray(val)) val.forEach(push);
  else push(val);

  return Array.from(new Set(out.filter(Boolean)));
};

let safeImages: string[] = [];

// prioridad: galerías/listas típicas
safeImages = collectUrls(base.images);
if (safeImages.length === 0) safeImages = collectUrls(base.imageUrls);
if (safeImages.length === 0) safeImages = collectUrls(base.photos);
if (safeImages.length === 0) safeImages = collectUrls(base.gallery);
if (safeImages.length === 0) safeImages = collectUrls(base.media);
if (safeImages.length === 0) safeImages = collectUrls(base.assets);

// fallback: single
if (safeImages.length === 0) safeImages = collectUrls(base.img);
if (safeImages.length === 0) safeImages = collectUrls(base.mainImage);
if (safeImages.length === 0) safeImages = collectUrls(base.image);
if (safeImages.length === 0) safeImages = collectUrls(base.coverImage);


  // 3. GESTIÓN DE PRECIOS (Lógica original conservada)
  const safePrice = Number(
    base.priceValue || base.rawPrice || String(base.price).replace(/\D/g, "") || 0
  );

const safeIdRaw = base.propertyId ?? base.id ?? base._id ?? base.uuid;
if (!safeIdRaw) return null; // ✅ sin id real, no inventamos
const safeId = String(safeIdRaw);

  // 4. GESTIÓN DE COORDENADAS (Lógica original conservada al 100%)
  const lngRaw =
    base.lng ??
    base.longitude ??
    (Array.isArray(base.coordinates) ? base.coordinates[0] : undefined) ??
    base.geometry?.coordinates?.[0] ??
    (Array.isArray(base.location) ? base.location[0] : undefined);

  const latRaw =
    base.lat ??
    base.latitude ??
    (Array.isArray(base.coordinates) ? base.coordinates[1] : undefined) ??
    base.geometry?.coordinates?.[1] ??
    (Array.isArray(base.location) ? base.location[1] : undefined);

  const lng = lngRaw !== undefined && lngRaw !== null ? Number(lngRaw) : undefined;
  const lat = latRaw !== undefined && latRaw !== null ? Number(latRaw) : undefined;

  const hasCoords = Number.isFinite(lng) && Number.isFinite(lat);
  const coordinates = hasCoords ? [lng as number, lat as number] : undefined;

  // 5. REQUISITOS (Lógica original conservada)
  let nanoRequirements = base.requirements || [];
  if (!Array.isArray(nanoRequirements)) nanoRequirements = [];

  if (nanoRequirements.length === 0) {
    if (safePrice > 1000000) {
      nanoRequirements = ["Acuerdo de Confidencialidad (NDA)", "Video Drone 4K", "Filtrado Financiero"];
    } else if (base.type === "land" || base.type === "suelo") {
      nanoRequirements = ["Levantamiento Topográfico", "Informe Urbanístico", "Cédula"];
    } else if (base.type === "commercial" || base.type === "local") {
      nanoRequirements = ["Licencia de Apertura", "Plano de Instalaciones", "Estudio de Mercado"];
    } else {
      nanoRequirements = ["Reportaje Fotográfico", "Certificado Energético", "Nota Simple"];
    }
  }

 // 6. RETORNO FINAL
  return {
    ...base,
    id: safeId,
    
    // 🔥 PASAPORTE DIPLOMÁTICO PARA LA DIRECCIÓN (Los 4 datos puros pasan sin ser tocados)
    address: base.address || null,
    city: base.city || null,
    postcode: base.postcode || null,
    region: base.region || null,
    
    price: safePrice,
    priceValue: safePrice,
    rawPrice: safePrice,
    formattedPrice: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(safePrice),
    images: safeImages,
    img: safeImages[0] || null,
    longitude: hasCoords ? (lng as number) : base.longitude,
    latitude: hasCoords ? (lat as number) : base.latitude,
    lng: hasCoords ? (lng as number) : base.lng,
    lat: hasCoords ? (lat as number) : base.lat,
    coordinates,
    communityFees: base.communityFees || 0,
    mBuilt: Number(base.mBuilt || base.m2 || 0),
    requirements: nanoRequirements,
    
    // 🔥 ASEGURAMOS QUE EL DUEÑO VIAJE SIEMPRE AL FRONTEND (blindado)
    user: (base.user || p.user)
      ? {
          ...(base.user || p.user),
          role: (base.user || p.user)?.role || base?.role || null,
          companyName: (base.user || p.user)?.companyName || base?.companyName || null,
          companyLogo: (base.user || p.user)?.companyLogo || base?.companyLogo || null,
          cif: (base.user || p.user)?.cif || base?.cif || null,
          licenseNumber: (base.user || p.user)?.licenseNumber || base?.licenseNumber || null,
        }
      : null,
  };
};

// 🔥 AÑADIDO EXPORT A LAS 3 FUNCIONES FINALES PARA QUE INDEX PUEDA IMPORTARLAS
export const extractFirstUrl = (s: string) => {
  const m = String(s || "").match(/(https?|blob):\/\/[^\s]+/i);
  if (!m?.[0]) return "";
  return m[0].replace(/[)\],.]+$/g, "");
};

export const isPdfUrl = (u: string) =>
  /\/raw\/upload\//i.test(u) || /\.pdf(\?|#|$)/i.test(u);

export const isImageUrl = (u: string) =>
  /^blob:/i.test(u) ||
  /^data:image\//i.test(u) ||
  /\/image\/upload\//i.test(u) ||
  (/res\.cloudinary\.com\/.+\/upload\//i.test(u) && !/\.pdf(\?|#|$)/i.test(u)) ||
  /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(u);