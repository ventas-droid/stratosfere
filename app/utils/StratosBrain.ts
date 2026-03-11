"use client";

// app/utils/StratosBrain.ts

// ============================================================================
// 🧠 STRATOS BRAIN — VERSIÓN DEFINITIVA
// Semántica + scoring + rescate + cero rigidez absurda
// Mantiene API:
//   - StratosBrain.getClarifications(query)
//   - StratosBrain.process(query, properties)
// ============================================================================

export type StratosTypeId =
  | "flat"
  | "penthouse"
  | "duplex"
  | "loft"
  | "villa"
  | "office"
  | "land"
  | "industrial";

export type TypeStrength = "exact" | "soft" | "none";

export const normalizeSearchText = (text: string) => {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const safeNum = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const parsePriceNumber = (v: any) => {
  if (typeof v === "number") return v;
  const raw = String(v || "")
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

const includesWholeWord = (text: string, word: string) => {
  const escaped = normalizeSearchText(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(normalizeSearchText(text));
};

const containsAny = (text: string, words: string[]) => {
  const t = normalizeSearchText(text);
  return words.some((w) => t.includes(normalizeSearchText(w)));
};

// ============================================================================
// 🏷️ DICCIONARIOS MAESTROS
// ============================================================================
export const STRATOS_TYPE_META: Record<
  StratosTypeId,
  {
    label: string;
    exact: string[];
    related: string[];
  }
> = {
  flat: {
    label: "Piso",
    exact: ["piso", "apartamento", "vivienda", "planta baja", "bajo"],
    related: ["duplex", "dúplex", "loft", "atico", "ático", "estudio"],
  },
  penthouse: {
    label: "Ático",
    exact: ["atico", "ático", "penthouse"],
    related: [
      "duplex",
      "dúplex",
      "piso",
      "apartamento",
      "ultima planta",
      "última planta",
      "loft",
    ],
  },
  duplex: {
    label: "Dúplex",
    exact: ["duplex", "dúplex"],
    related: ["atico", "ático", "penthouse", "piso", "loft"],
  },
  loft: {
    label: "Loft",
    exact: ["loft", "estudio"],
    related: ["apartamento", "piso", "duplex", "dúplex"],
  },
  villa: {
    label: "Villa",
    exact: [
      "villa",
      "chalet",
      "casa",
      "adosado",
      "pareado",
      "finca",
      "mansion",
      "mansión",
      "casa independiente",
    ],
    related: ["duplex", "dúplex", "cortijo"],
  },
  office: {
    label: "Oficina",
    exact: ["oficina", "despacho", "local"],
    related: ["industrial", "nave", "coworking"],
  },
  land: {
    label: "Suelo",
    exact: ["suelo", "terreno", "parcela", "solar"],
    related: ["ruina", "edificio", "finca"],
  },
  industrial: {
    label: "Nave",
    exact: ["nave", "industrial", "almacen", "almacén"],
    related: ["local", "oficina"],
  },
};

export const STRATOS_EXTRA_META: Record<
  string,
  { aliases: string[]; label: string }
> = {
  piscina: { aliases: ["piscina", "pool"], label: "✨ Tiene piscina" },
  terraza: { aliases: ["terraza", "terrace"], label: "✨ Tiene terraza" },
  garaje: { aliases: ["garaje", "garage", "parking"], label: "✨ Tiene garaje" },
  ascensor: { aliases: ["ascensor", "elevator"], label: "✨ Tiene ascensor" },
  jardin: { aliases: ["jardin", "jardín", "garden"], label: "✨ Tiene jardín" },
  trastero: { aliases: ["trastero", "storage"], label: "✨ Tiene trastero" },
  balcon: { aliases: ["balcon", "balcón", "balcony"], label: "✨ Tiene balcón" },
  aire: {
    aliases: ["aire", "aire acondicionado", "ac", "climatizacion", "climatización"],
    label: "❄️ Climatización",
  },
  calefaccion: {
    aliases: ["calefaccion", "calefacción", "heating"],
    label: "🔥 Calefacción",
  },
  amueblado: {
    aliases: ["amueblado", "amueblada", "furnished"],
    label: "🛋️ Amueblado",
  },
  seguridad: {
    aliases: ["seguridad", "security", "vigilancia"],
    label: "🛡️ Seguridad",
  },
};

const VIBE_META: Record<string, { words: string[]; tag: string }> = {
  inversor: {
    words: [
      "rentabilidad",
      "inversion",
      "inversión",
      "reformar",
      "oportunidad",
      "chollo",
      "turistico",
      "turístico",
    ],
    tag: "📈 Alta rentabilidad",
  },
  familia: {
    words: [
      "colegio",
      "tranquilo",
      "parque",
      "familia",
      "residencial",
      "verde",
      "ninos",
      "niños",
    ],
    tag: "🏡 Ideal para familias",
  },
  lujo: {
    words: ["lujo", "exclusivo", "premium", "standing", "alta gama", "espectacular"],
    tag: "💎 Categoría premium",
  },
  luminoso: {
    words: ["luz", "luminoso", "luminosidad", "sol", "despejadas", "ventanales"],
    tag: "☀️ Muy luminoso",
  },
  mar: {
    words: ["mar", "playa", "costa", "oceano", "océano", "primera linea", "primera línea"],
    tag: "🌊 Cerca del mar",
  },
  reformar: {
    words: ["reformar", "proyecto", "ruina", "rehabilitar"],
    tag: "🛠️ Ideal para reformar",
  },
  obranueva: {
    words: ["nuevo", "obra nueva", "estrenar", "promocion", "promoción"],
    tag: "✨ Obra nueva",
  },
  exterior: {
    words: ["exterior", "a calle", "a la calle"],
    tag: "🌳 Exterior",
  },
  orientacionSur: {
    words: ["sur", "mediodia", "mediodía"],
    tag: "🧭 Sol todo el día",
  },
};

const LOCATION_CONFLICTS: Record<string, string[]> = {
  salamanca: ["Barrio de Salamanca, Madrid", "Salamanca, Castilla y León"],
  elche: ["Elche, Alicante", "Elche de la Sierra, Albacete"],
  "san juan": ["San Juan de Alicante", "San Juan de Aznalfarache", "Sant Joan (Mallorca)"],
  santiago: ["Santiago de Compostela", "Santiago del Teide, Tenerife"],
  arona: ["Arona, Tenerife", "Arona, Italia"],
  toledo: ["Toledo (Ciudad)", "Puerta de Toledo, Madrid"],
  retiro: ["Barrio del Retiro, Madrid", "El Retiro, Antioquia"],
};

const GENERIC_STOPWORDS = new Set([
  "en",
  "con",
  "de",
  "del",
  "y",
  "o",
  "un",
  "una",
  "unos",
  "unas",
  "para",
  "comprar",
  "alquilar",
  "quiero",
  "busco",
  "necesito",
  "que",
  "tenga",
  "el",
  "la",
  "los",
  "las",
  "por",
  "menos",
  "mas",
  "más",
  "hasta",
  "maximo",
  "máximo",
  "tope",
  "desde",
  "minimo",
  "mínimo",
  "sobre",
  "cerca",
  "cercano",
  "cercana",
  "zona",
  "ciudad",
  "ideal",
  "tipo",
]);

// ============================================================================
// 🧩 EXTRACTORES
// ============================================================================
export const parseBudgetFromQuery = (query: string) => {
  const q = normalizeSearchText(query)
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const explicit = q.match(
    /(?:hasta|maximo|máximo|max|menos de|por menos de|tope|presupuesto|budget)\s*(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|euro|€)?/
  );

  if (explicit) {
    let value = parseFloat(explicit[1]);
    const mod = explicit[2] || "";

    if (mod.includes("k")) value *= 1000;
    else if (mod.includes("m") || mod.includes("millon")) value *= 1000000;
    else if (!mod && value < 10000) value *= 1000;

    return Number.isFinite(value) && value > 0 ? value : Infinity;
  }

  const moneyLike = q.match(
    /\b(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|euro|€)\b/
  );

  if (moneyLike) {
    let value = parseFloat(moneyLike[1]);
    const mod = moneyLike[2] || "";

    if (mod.includes("k")) value *= 1000;
    else if (mod.includes("m") || mod.includes("millon")) value *= 1000000;

    return Number.isFinite(value) && value > 0 ? value : Infinity;
  }

  const protectedQ = q.replace(
    /\b\d+\s*(hab|habitacion|habitaciones|dorm|dormitorio|dormitorios|ban|bano|banos|baños|aseo|aseos|m2|metros|mts)\b/g,
    " "
  );

  const bareLarge = protectedQ.match(/\b(\d{5,8})\b/);
  if (bareLarge) {
    const value = Number(bareLarge[1]);
    return Number.isFinite(value) && value >= 10000 ? value : Infinity;
  }

  return Infinity;
};

export const parseCountFromQuery = (
  rawQuery: string,
  kind: "beds" | "baths" | "m2"
) => {
  const q = normalizeSearchText(rawQuery);

  if (kind === "beds") {
    const m = q.match(/(\d+)\s*(hab|habitaciones|dorm|dormitorios|cama|cuarto)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  if (kind === "baths") {
    const m = q.match(/(\d+)\s*(ban|bano|baño|banos|baños|aseo|aseos)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  const m = q.match(/(?:mas de|más de|mas|más|>|minimo|mínimo|desde)?\s*(\d+)\s*(?:m2|metros|mts|metros cuadrados)/);
  return m ? parseInt(m[1], 10) : 0;
};

export const extractRequestedTypeIds = (rawQuery: string): StratosTypeId[] => {
  const q = normalizeSearchText(rawQuery);
  const types: StratosTypeId[] = [];

  (Object.entries(STRATOS_TYPE_META) as [StratosTypeId, (typeof STRATOS_TYPE_META)[StratosTypeId]][]).forEach(
    ([typeKey, meta]) => {
      if (meta.exact.some((w) => includesWholeWord(q, w))) {
        types.push(typeKey);
      }
    }
  );

  return uniq(types);
};

export const extractRequestedVibes = (rawQuery: string) => {
  const q = normalizeSearchText(rawQuery);
  const vibes: string[] = [];

  Object.entries(VIBE_META).forEach(([vibe, meta]) => {
    if (meta.words.some((w) => includesWholeWord(q, w))) vibes.push(vibe);
  });

  return uniq(vibes);
};

export const extractRequestedExtras = (rawQuery: string) => {
  const q = normalizeSearchText(rawQuery);
  const extras: string[] = [];

  Object.entries(STRATOS_EXTRA_META).forEach(([key, meta]) => {
    if (meta.aliases.some((w) => includesWholeWord(q, w))) extras.push(key);
  });

  return uniq(extras);
};

export const parseLocationTokens = (rawQuery: string) => {
  let q = normalizeSearchText(rawQuery);

  q = q
    .replace(/(\d+)\s*(hab|habitaciones|dorm|dormitorios|cama|cuarto)s?/g, " ")
    .replace(/(\d+)\s*(ban|bano|baño|banos|baños|aseo|aseos)s?/g, " ")
    .replace(/(?:mas de|más de|mas|más|>|minimo|mínimo|desde)?\s*(\d+)\s*(?:m2|metros|mts|metros cuadrados)/g, " ")
    .replace(/(?:hasta|maximo|max|<|por menos de|menos de|tope)?\s*(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|€)?/g, " ");

  const removableWords = [
    ...Object.values(STRATOS_TYPE_META).flatMap((x) => x.exact),
    ...Object.values(STRATOS_TYPE_META).flatMap((x) => x.related),
    ...Object.values(VIBE_META).flatMap((x) => x.words),
    ...Object.values(STRATOS_EXTRA_META).flatMap((x) => x.aliases),
    ...Array.from(GENERIC_STOPWORDS),
  ];

  removableWords.forEach((w) => {
    q = q.replace(new RegExp(`\\b${normalizeSearchText(w)}\\b`, "g"), " ");
  });

  return q
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => w.length > 2)
    .filter((w) => !/^\d+$/.test(w));
};

// ============================================================================
// 🏠 HELPERS DE PROPIEDAD
// ============================================================================
const getPropertyPrice = (p: any) =>
  parsePriceNumber(p?.priceValue ?? p?.rawPrice ?? p?.price ?? 0);

const getPropertyM2 = (p: any) => safeNum(p?.mBuilt ?? p?.m2 ?? 0);
const getPropertyBeds = (p: any) => safeNum(p?.rooms ?? 0);
const getPropertyBaths = (p: any) => safeNum(p?.baths ?? 0);

const getPropertyTypeText = (p: any) => normalizeSearchText(p?.type || "");

const getPropertyLocationText = (p: any) =>
  normalizeSearchText(`${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`);

const getPropertyFullText = (p: any) =>
  normalizeSearchText(
    `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""} ${p?.title || ""} ${p?.description || ""} ${p?.type || ""}`
  );

const getPropertyServiceSet = (p: any) =>
  new Set(
    Array.isArray(p?.selectedServices)
      ? p.selectedServices.map((s: any) => normalizeSearchText(String(s)))
      : []
  );

const detectPropertyTypeKeys = (p: any): StratosTypeId[] => {
  const typeText = getPropertyTypeText(p);
  const detected: StratosTypeId[] = [];

  (Object.entries(STRATOS_TYPE_META) as [StratosTypeId, (typeof STRATOS_TYPE_META)[StratosTypeId]][]).forEach(
    ([key, meta]) => {
      if (meta.exact.some((w) => typeText.includes(normalizeSearchText(w)))) {
        detected.push(key);
      }
    }
  );

  return uniq(detected);
};

export const getTypeStrength = (
  propertyType: string,
  requestedTypeIds: string[]
): TypeStrength => {
  if (!requestedTypeIds || requestedTypeIds.length === 0) return "exact";

  const typeText = normalizeSearchText(propertyType);
  let exact = false;
  let soft = false;

  requestedTypeIds.forEach((typeId) => {
    const meta = STRATOS_TYPE_META[typeId as StratosTypeId];
    if (!meta) return;

    if (meta.exact.some((w) => typeText.includes(normalizeSearchText(w)))) {
      exact = true;
      return;
    }

    if (meta.related.some((w) => typeText.includes(normalizeSearchText(w)))) {
      soft = true;
    }
  });

  if (exact) return "exact";
  if (soft) return "soft";
  return "none";
};

const propertyMatchesExtra = (p: any, extraKey: string) => {
  const fullText = getPropertyFullText(p);
  const services = getPropertyServiceSet(p);

  if (extraKey === "piscina") {
    return p?.pool === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("pool") || services.has("piscina");
  }
  if (extraKey === "garaje") {
    return p?.garage === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("garage") || services.has("garaje") || services.has("parking");
  }
  if (extraKey === "ascensor") {
    return p?.elevator === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("ascensor") || services.has("elevator");
  }
  if (extraKey === "terraza") {
    return p?.terrace === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("terrace") || services.has("terraza");
  }
  if (extraKey === "jardin") {
    return p?.garden === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("garden") || services.has("jardin");
  }
  if (extraKey === "trastero") {
    return p?.storage === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("storage") || services.has("trastero");
  }
  if (extraKey === "balcon") {
    return p?.balcony === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("balcon") || services.has("balcony");
  }
  if (extraKey === "aire") {
    return p?.ac === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("ac");
  }
  if (extraKey === "calefaccion") {
    return p?.heating === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("heating");
  }
  if (extraKey === "amueblado") {
    return p?.furnished === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("furnished");
  }
  if (extraKey === "seguridad") {
    return p?.security === true || STRATOS_EXTRA_META[extraKey].aliases.some((a) => fullText.includes(normalizeSearchText(a))) || services.has("security");
  }

  return false;
};

// ============================================================================
// 🎯 SCORING POR CAPAS
// ============================================================================
const scorePrice = (propPrice: number, reqMaxPrice: number) => {
  if (!(reqMaxPrice < Infinity) || propPrice <= 0) {
    return { score: 0, max: 0, exact: true, notes: [] as string[] };
  }

  const max = 260;
  const notes: string[] = [];

  if (propPrice <= reqMaxPrice) {
    const ahorro = reqMaxPrice - propPrice;
    let score = 260;

    if (ahorro >= 10000 && propPrice >= reqMaxPrice * 0.4) {
      notes.push(`💰 Ahorras ${ahorro.toLocaleString("es-ES")}€`);
      score += 20;
    }

    return { score, max, exact: true, notes };
  }

  const ratio = propPrice / reqMaxPrice;

  if (ratio <= 1.08) {
    notes.push("📈 Muy cerca del presupuesto");
    return { score: 170, max, exact: false, notes };
  }

  if (ratio <= 1.15) {
    notes.push("📈 Ligeramente superior");
    return { score: 110, max, exact: false, notes };
  }

  if (ratio <= 1.25) {
    return { score: 40, max, exact: false, notes };
  }

  return { score: -500, max, exact: false, notes };
};

const scoreType = (propertyTypeKeys: StratosTypeId[], reqTypes: StratosTypeId[]) => {
  if (reqTypes.length === 0) {
    return { score: 0, max: 0, exact: true, notes: [] as string[] };
  }

  const max = 260;
  const notes: string[] = [];

  if (reqTypes.some((t) => propertyTypeKeys.includes(t))) {
    return { score: 260, max, exact: true, notes: ["🎯 Tu tipología ideal"] };
  }

  let relatedHit = false;

  reqTypes.forEach((reqType) => {
    const relatedWords = STRATOS_TYPE_META[reqType]?.related || [];

    propertyTypeKeys.forEach((detectedType) => {
      const exactWords = STRATOS_TYPE_META[detectedType]?.exact || [];
      if (
        relatedWords.some((rw) =>
          exactWords.some(
            (ew) =>
              normalizeSearchText(ew).includes(normalizeSearchText(rw)) ||
              normalizeSearchText(rw).includes(normalizeSearchText(ew))
          )
        )
      ) {
        relatedHit = true;
      }
    });
  });

  if (relatedHit) {
    notes.push("🔄 Tipología similar");
    return { score: 140, max, exact: false, notes };
  }

  return { score: -240, max, exact: false, notes };
};

const scoreLocation = (propertyLocationText: string, locationTokens: string[]) => {
  if (locationTokens.length === 0) {
    return { score: 0, max: 0, exact: true, notes: [] as string[], hits: 0 };
  }

  const max = 260;
  const hits = locationTokens.filter((w) => propertyLocationText.includes(normalizeSearchText(w)));
  const hitCount = hits.length;

  if (hitCount === locationTokens.length) {
    return { score: 260, max, exact: true, notes: [] as string[], hits: hitCount };
  }

  if (hitCount >= Math.max(1, Math.ceil(locationTokens.length / 2))) {
    return { score: 120, max, exact: false, notes: ["📍 Zona próxima"], hits: hitCount };
  }

  if (hitCount > 0) {
    return { score: 60, max, exact: false, notes: ["📍 Coincidencia parcial"], hits: hitCount };
  }

  return { score: -220, max, exact: false, notes: [], hits: 0 };
};

const scoreBeds = (propBeds: number, reqBeds: number) => {
  if (reqBeds <= 0) return { score: 0, max: 0, exact: true, notes: [] as string[] };

  const max = 100;
  const notes: string[] = [];

  if (propBeds >= reqBeds) {
    if (propBeds > reqBeds) notes.push(`🛏️ +${propBeds - reqBeds} hab`);
    return { score: 100, max, exact: true, notes };
  }

  if (propBeds === reqBeds - 1) {
    notes.push("🛏️ 1 hab menos");
    return { score: 40, max, exact: false, notes };
  }

  return { score: -120, max, exact: false, notes };
};

const scoreBaths = (propBaths: number, reqBaths: number) => {
  if (reqBaths <= 0) return { score: 0, max: 0, exact: true, notes: [] as string[] };

  const max = 60;
  if (propBaths >= reqBaths) return { score: 60, max, exact: true, notes: [] as string[] };
  if (propBaths === reqBaths - 1) return { score: 20, max, exact: false, notes: [] as string[] };

  return { score: -80, max, exact: false, notes: [] as string[] };
};

const scoreM2 = (propM2: number, reqM2: number) => {
  if (reqM2 <= 0) return { score: 0, max: 0, exact: true, notes: [] as string[] };

  const max = 70;
  const notes: string[] = [];

  if (propM2 >= reqM2) {
    if (propM2 >= reqM2 + 20) notes.push("📐 Espacio de sobra");
    return { score: 70, max, exact: true, notes };
  }

  if (propM2 >= reqM2 * 0.85) {
    return { score: 28, max, exact: false, notes };
  }

  return { score: -60, max, exact: false, notes };
};

const scoreVibes = (fullText: string, p: any, reqVibes: string[]) => {
  let score = 0;
  let max = 0;
  let notes: string[] = [];

  const propState = normalizeSearchText(p?.state || "");
  const propOrientation = normalizeSearchText(p?.orientation || "");

  reqVibes.forEach((vibe) => {
    max += 45;
    const meta = VIBE_META[vibe];
    if (!meta) return;

    const textHit = meta.words.some((w) => includesWholeWord(fullText, w));
    let matched = textHit;

    if (vibe === "reformar" && propState.includes("reformar")) matched = true;
    if (vibe === "obranueva" && (propState.includes("nueva") || propState.includes("estrenar"))) matched = true;
    if (vibe === "exterior" && p?.exterior === true) matched = true;
    if (vibe === "orientacionSur" && propOrientation.includes("sur")) matched = true;

    if (matched) {
      score += 45;
      notes.push(meta.tag);
    }
  });

  return { score, max, notes };
};

const scoreExtras = (p: any, reqExtras: string[]) => {
  let score = 0;
  let max = 0;
  let notes: string[] = [];

  reqExtras.forEach((extraKey) => {
    max += 40;
    if (propertyMatchesExtra(p, extraKey)) {
      score += 40;
      notes.push(STRATOS_EXTRA_META[extraKey]?.label || `✨ Tiene ${extraKey}`);
    }
  });

  return { score, max, notes };
};

const scorePremiumSignals = (p: any) => {
  let score = 0;
  const notes: string[] = [];

  const energy = String(p?.energyConsumption || "").toUpperCase();
  if (energy === "A" || energy === "B") {
    score += 12;
    notes.push("🍃 Alta eficiencia");
  }

  const community = safeNum(p?.communityFees, 0);
  const price = getPropertyPrice(p);
  if (price > 300000 && community > 0 && community <= 60) {
    score += 10;
    notes.push("💸 Comunidad baja");
  }

  if (p?.isFire === true) {
    score += 8;
  }

  return { score, notes };
};

// ============================================================================
// 🚀 API PÚBLICA
// ============================================================================
export const StratosBrain = {
  getClarifications: (query: string): string[] => {
    const q = normalizeSearchText(query);
    const cleanQ = q
      .replace(/\b(en|quiero|busco|piso|chalet|villa|casa|atico|ático|duplex|dúplex|loft)\b/g, "")
      .trim();

    for (const [key, options] of Object.entries(LOCATION_CONFLICTS)) {
      if (cleanQ === key) return options;
    }

    return [];
  },

  process: (query: string, properties: any[]) => {
    if (!query || query.trim() === "") {
      return properties.map((p) => ({
        ...p,
        aiScore: 0,
        matchPercentage: null,
        dopamineTags: [],
        isPerfectMatch: false,
      }));
    }

    const q = normalizeSearchText(query);

    const reqBeds = parseCountFromQuery(q, "beds");
    const reqBaths = parseCountFromQuery(q, "baths");
    const reqM2 = parseCountFromQuery(q, "m2");
    const reqMaxPrice = parseBudgetFromQuery(q);
    const reqTypes = extractRequestedTypeIds(q);
    const reqVibes = extractRequestedVibes(q);
    const reqExtras = extractRequestedExtras(q);
    const locationTokens = parseLocationTokens(q);

    const processed = properties.map((p) => {
      const propPrice = getPropertyPrice(p);
      const propM2 = getPropertyM2(p);
      const propBeds = getPropertyBeds(p);
      const propBaths = getPropertyBaths(p);

      const propertyLocationText = getPropertyLocationText(p);
      const propertyFullText = getPropertyFullText(p);
      const propertyTypeKeys = detectPropertyTypeKeys(p);

      const priceLayer = scorePrice(propPrice, reqMaxPrice);
      const typeLayer = scoreType(propertyTypeKeys, reqTypes);
      const locLayer = scoreLocation(propertyLocationText, locationTokens);
      const bedsLayer = scoreBeds(propBeds, reqBeds);
      const bathsLayer = scoreBaths(propBaths, reqBaths);
      const m2Layer = scoreM2(propM2, reqM2);
      const vibesLayer = scoreVibes(propertyFullText, p, reqVibes);
      const extrasLayer = scoreExtras(p, reqExtras);
      const premiumLayer = scorePremiumSignals(p);

      const maxPossible =
        priceLayer.max +
        typeLayer.max +
        locLayer.max +
        bedsLayer.max +
        bathsLayer.max +
        m2Layer.max +
        vibesLayer.max +
        extrasLayer.max;

      const rawScore =
        priceLayer.score +
        typeLayer.score +
        locLayer.score +
        bedsLayer.score +
        bathsLayer.score +
        m2Layer.score +
        vibesLayer.score +
        extrasLayer.score +
        premiumLayer.score;

      const requiredExtrasOk =
        reqExtras.length === 0 || reqExtras.every((extra) => propertyMatchesExtra(p, extra));

      const isPerfectMatch =
        priceLayer.exact &&
        typeLayer.exact &&
        locLayer.exact &&
        bedsLayer.exact &&
        bathsLayer.exact &&
        m2Layer.exact &&
        requiredExtrasOk &&
        rawScore > 0;

      let matchPercentage = 0;

      if (maxPossible <= 0) {
        matchPercentage = 100;
      } else {
        const pct = Math.round((rawScore / maxPossible) * 100);
        matchPercentage = clamp(pct, 0, 100);
      }

      if (!isPerfectMatch && rawScore > 0 && matchPercentage < 18) {
        matchPercentage = 18;
      }

      const dopamineTags = uniq([
        ...priceLayer.notes,
        ...typeLayer.notes,
        ...locLayer.notes,
        ...bedsLayer.notes,
        ...m2Layer.notes,
        ...vibesLayer.notes,
        ...extrasLayer.notes,
        ...premiumLayer.notes,
      ]).slice(0, 3);

      return {
        ...p,
        aiScore: rawScore,
        matchPercentage,
        dopamineTags,
        isPerfectMatch,
        aiDebug: {
          reqTypes,
          locationTokens,
          reqMaxPrice: reqMaxPrice < Infinity ? reqMaxPrice : null,
          reqBeds,
          reqBaths,
          reqM2,
          propertyTypeKeys,
          layers: {
            price: priceLayer.score,
            type: typeLayer.score,
            location: locLayer.score,
            beds: bedsLayer.score,
            baths: bathsLayer.score,
            m2: m2Layer.score,
            vibes: vibesLayer.score,
            extras: extrasLayer.score,
            premium: premiumLayer.score,
          },
        },
      };
    });

    const hardFiltered = processed.filter((p) => p.aiScore > -900);

    const sorted = [...hardFiltered].sort((a, b) => {
      if (b.aiScore !== a.aiScore) return b.aiScore - a.aiScore;
      return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    });

    if (sorted.length === 0) {
      return [...processed]
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 24)
        .map((p) => ({
          ...p,
          matchPercentage: p.matchPercentage || 8,
        }));
    }

    return sorted;
  },
};