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

type CountMode = "beds" | "baths" | "m2";

type TypeMeta = {
  label: string;
  exact: string[];
  soft: string[];
};

export const STRATOS_TYPE_META: Record<StratosTypeId, TypeMeta> = {
  flat: {
    label: "Piso",
    exact: ["piso", "apartamento", "apartamento turistico", "vivienda", "planta baja", "bajo"],
    soft: ["duplex", "dúplex", "loft", "atico", "ático", "penthouse", "estudio"],
  },
  penthouse: {
    label: "Ático",
    exact: ["atico", "ático", "penthouse"],
    soft: ["duplex", "dúplex", "piso", "apartamento", "loft"],
  },
  duplex: {
    label: "Dúplex",
    exact: ["duplex", "dúplex"],
    soft: ["atico", "ático", "penthouse", "piso", "apartamento", "villa", "casa"],
  },
  loft: {
    label: "Loft",
    exact: ["loft", "estudio"],
    soft: ["piso", "apartamento", "atico", "ático"],
  },
  villa: {
    label: "Villa",
    exact: ["villa", "chalet", "casa", "adosado", "pareado", "finca", "cortijo", "mansion", "mansión"],
    soft: ["duplex", "dúplex", "penthouse", "atico", "ático"],
  },
  office: {
    label: "Oficina",
    exact: ["oficina", "despacho", "local", "consultorio"],
    soft: ["edificio", "coworking"],
  },
  land: {
    label: "Suelo",
    exact: ["suelo", "terreno", "parcela", "solar"],
    soft: ["finca", "ruina", "edificio"],
  },
  industrial: {
    label: "Nave",
    exact: ["nave", "industrial", "almacen", "almacén", "logistica", "logística"],
    soft: ["local", "oficina", "suelo"],
  },
};

const TYPE_IDS = Object.keys(STRATOS_TYPE_META) as StratosTypeId[];

const STOP_WORDS = new Set([
  "quiero",
  "buscar",
  "busco",
  "necesito",
  "comprar",
  "alquilar",
  "ver",
  "encontrar",
  "zona",
  "cerca",
  "cercano",
  "cercana",
  "con",
  "sin",
  "para",
  "por",
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "un",
  "una",
  "y",
  "o",
  "que",
  "me",
  "sea",
  "sea",
  "sea",
  "hasta",
  "maximo",
  "máximo",
  "menos",
  "mas",
  "más",
  "desde",
  "minimo",
  "mínimo",
]);

const GEO_KEEP_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "el",
  "san",
  "santa",
  "santo",
  "real",
  "puerto",
  "marina",
]);

const EXTRA_SYNONYMS: Record<string, string[]> = {
  pool: ["piscina", "pool"],
  terrace: ["terraza", "terraza grande"],
  garage: ["garaje", "parking", "aparcamiento"],
  elevator: ["ascensor"],
  garden: ["jardin", "jardín", "garden"],
  storage: ["trastero", "storage"],
  balcony: ["balcon", "balcón"],
  ac: ["aire", "aire acondicionado", "ac"],
  heating: ["calefaccion", "calefacción", "heating"],
  furnished: ["amueblado", "amueblada", "furnished"],
  security: ["seguridad", "vigilancia", "security"],
  sea: ["mar", "playa", "costa", "primera linea", "primera línea", "oceano", "océano"],
  luxury: ["lujo", "premium", "exclusivo", "alta gama", "standing"],
  investor: ["inversion", "inversión", "rentabilidad", "chollo", "oportunidad", "turistico", "turístico"],
  family: ["familia", "familiar", "colegio", "parque", "verde", "tranquilo", "residencial"],
  reform: ["reformar", "ruina", "rehabilitar", "proyecto"],
  newbuild: ["obra nueva", "nuevo", "estrenar", "promocion", "promoción"],
  exterior: ["exterior"],
  south: ["sur", "mediodia", "mediodía"],
};

const CONFLICTS: Record<string, string[]> = {
  salamanca: ["Barrio de Salamanca, Madrid", "Salamanca, Castilla y León"],
  elche: ["Elche, Alicante", "Elche de la Sierra, Albacete"],
  "san juan": ["San Juan de Alicante", "San Juan de Aznalfarache", "Sant Joan (Mallorca)"],
  santiago: ["Santiago de Compostela", "Santiago del Teide, Tenerife"],
  arona: ["Arona, Tenerife", "Arona, Italia"],
  toledo: ["Toledo (Ciudad)", "Puerta de Toledo, Madrid"],
  retiro: ["Barrio del Retiro, Madrid", "El Retiro, Antioquia"],
};

const GEO_OVERRIDES: Record<string, string> = {
  "palma de mallorca": "Palma, Illes Balears",
  palma: "Palma, Illes Balears",
  mallorca: "Mallorca, Illes Balears",
  ibiza: "Eivissa, Illes Balears",
  eivissa: "Eivissa, Illes Balears",
  menorca: "Menorca, Illes Balears",
  formentera: "Formentera, Illes Balears",
  tenerife: "Isla de Tenerife, Canarias",
  "gran canaria": "Las Palmas de Gran Canaria",
  lanzarote: "Isla de Lanzarote, Canarias",

  cordoba: "Córdoba, Andalucía, España",
  toledo: "Toledo, Castilla-La Mancha, España",
  merida: "Mérida, Extremadura, España",
  cartagena: "Cartagena, Región de Murcia, España",
  santiago: "Santiago de Compostela, Galicia, España",
  "santiago de compostela": "Santiago de Compostela, Galicia, España",
  "san sebastian": "Donostia-San Sebastián, País Vasco",
  donostia: "Donostia-San Sebastián, País Vasco",
  vitoria: "Vitoria-Gasteiz, País Vasco",
  alicante: "Alicante, Comunitat Valenciana, España",
  valencia: "Valencia, Comunitat Valenciana, España",

  "la zagaleta": "La Zagaleta, Benahavís, Málaga",
  sotogrande: "Sotogrande, San Roque, Cádiz",
  "puerto banus": "Puerto Banús, Marbella, Málaga",
  "puerto banús": "Puerto Banús, Marbella, Málaga",
  "la moraleja": "La Moraleja, Alcobendas, Madrid",
  "la finca": "La Finca, Pozuelo de Alarcón, Madrid",
  "barrio de salamanca": "Barrio de Salamanca, Madrid",
  baqueira: "Baqueira Beret, Lleida",
  valderrama: "Club de Golf Valderrama, San Roque, Cádiz",
  "altea hills": "Altea Hills, Altea, Alicante",

  "santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
  bernabeu: "Estadio Santiago Bernabéu, Madrid",
  "estadio santiago bernabeu": "Estadio Santiago Bernabéu, Madrid",
  "camp nou": "Spotify Camp Nou, Barcelona",
  "spotify camp nou": "Spotify Camp Nou, Barcelona",
  metropolitano: "Estadio Cívitas Metropolitano, Madrid",
  "wanda metropolitano": "Estadio Cívitas Metropolitano, Madrid",
  mestalla: "Estadio de Mestalla, Valencia",
  "san mames": "Estadio San Mamés, Bilbao",
  "rico perez": "Estadio José Rico Pérez, Alicante",
  "estadio rico perez": "Estadio José Rico Pérez, Alicante",
  "sagrada familia": "La Sagrada Familia, Barcelona",
  alhambra: "La Alhambra, Granada",
  barajas: "Aeropuerto Adolfo Suárez Madrid-Barajas",
  "el prat": "Aeropuerto Josep Tarradellas Barcelona-El Prat",

  bcn: "Barcelona, España",
  mad: "Madrid, España",
  vlc: "Valencia, España",
};

const GLOBAL_INTL_TERMS = new Set([
  "qatar",
  "doha",
  "dubai",
  "abu dhabi",
  "miami",
  "new york",
  "paris",
  "london",
  "berlin",
  "rome",
  "tokyo",
  "mexico",
  "méxico",
  "argentina",
  "colombia",
  "venezuela",
  "peru",
  "perú",
  "chile",
  "brazil",
  "brasil",
  "morocco",
  "marruecos",
]);

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const safeNumber = (value: any) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? "")
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(cleaned) || 0;
};

const includesWhole = (text: string, token: string) =>
  new RegExp(`\\b${escapeRegExp(token)}\\b`, "i").test(text);

const escapeRegExp = (text: string) =>
  String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const removeAccents = (text: string) =>
  String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeSearchText = (text: string) =>
  removeAccents(String(text || ""))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const normalizeWords = (text: string) =>
  normalizeSearchText(text)
    .split(" ")
    .map((x) => x.trim())
    .filter(Boolean);

const normalizePropertyText = (p: any) =>
  normalizeSearchText(
    [
      p?.type,
      p?.title,
      p?.description,
      p?.city,
      p?.region,
      p?.address,
      p?.postcode,
      p?.state,
      p?.orientation,
    ]
      .filter(Boolean)
      .join(" ")
  );

const extractRequestedExtras = (query: string) => {
  const q = normalizeSearchText(query);
  return Object.entries(EXTRA_SYNONYMS)
    .filter(([, words]) => words.some((w) => includesWhole(q, normalizeSearchText(w))))
    .map(([key]) => key);
};

const inferInternalTypeIdsFromProperty = (rawType: string): StratosTypeId[] => {
  const t = normalizeSearchText(rawType);
  if (!t) return [];

  return TYPE_IDS.filter((id) =>
    STRATOS_TYPE_META[id].exact.some((word) => includesWhole(t, normalizeSearchText(word)))
  );
};

export const extractRequestedTypeIds = (query: string): StratosTypeId[] => {
  const q = normalizeSearchText(query);
  const found = TYPE_IDS.filter((id) =>
    STRATOS_TYPE_META[id].exact.some((word) => includesWhole(q, normalizeSearchText(word)))
  );
  return uniq(found);
};

export const getTypeStrength = (
  rawType: string,
  requestedTypeIds: string[]
): TypeStrength => {
  const requested = uniq(
    (requestedTypeIds || []).filter((id): id is StratosTypeId =>
      TYPE_IDS.includes(id as StratosTypeId)
    )
  );

  if (requested.length === 0) return "exact";

  const propType = normalizeSearchText(rawType);
  if (!propType) return "none";

  for (const reqId of requested) {
    const meta = STRATOS_TYPE_META[reqId];

    if (meta.exact.some((word) => includesWhole(propType, normalizeSearchText(word)))) {
      return "exact";
    }
  }

  for (const reqId of requested) {
    const meta = STRATOS_TYPE_META[reqId];

    if (meta.soft.some((word) => includesWhole(propType, normalizeSearchText(word)))) {
      return "soft";
    }
  }

  const inferred = inferInternalTypeIdsFromProperty(rawType);
  if (inferred.some((id) => requested.includes(id))) return "exact";

  return "none";
};

export const parseBudgetFromQuery = (query: string) => {
  const q = normalizeSearchText(query).replace(/\./g, "").replace(/,/g, ".");

  const explicit =
    q.match(
      /(?:hasta|maximo|max|menos de|por menos de|tope|presupuesto|budget)\s*(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|euro|€)?/
    ) ||
    q.match(/(\d+(?:\.\d+)?)\s*(k|m|millon|millones|euros|euro|€)/);

  if (!explicit) return Infinity;

  let value = parseFloat(explicit[1]);
  const mod = explicit[2] || "";

  if (mod.includes("k")) value *= 1000;
  else if (mod.includes("m")) value *= 1000000;
  else if (mod.includes("millon")) value *= 1000000;
  else if (!mod && value < 10000) value *= 1000;

  return Number.isFinite(value) && value > 0 ? value : Infinity;
};

export const parseCountFromQuery = (query: string, mode: CountMode) => {
  const q = normalizeSearchText(query);

  if (mode === "beds") {
    const match = q.match(
      /\b(\d+)\s*(hab|habitacion|habitaciones|dorm|dormitorio|dormitorios|cama|cuarto|cuartos)\b/
    );
    return match ? parseInt(match[1], 10) : 0;
  }

  if (mode === "baths") {
    const match = q.match(/\b(\d+)\s*(ban|bano|banos|baños|aseo|aseos)\b/);
    return match ? parseInt(match[1], 10) : 0;
  }

  const match = q.match(
    /\b(?:mas de|más de|desde|minimo|mínimo|>\s*)?\s*(\d+)\s*(m2|metros|mts)\b/
  );
  return match ? parseInt(match[1], 10) : 0;
};

export const parseLocationTokens = (query: string): string[] => {
  let q = normalizeSearchText(query);

  q = q
    .replace(/[0-9.,]+\s*(€|euros|euro|k|m|millon|millones)?/gi, " ")
    .replace(
      /\b\d+\s*(hab|habitacion|habitaciones|dorm|dormitorio|dormitorios|ban|bano|banos|baños|aseo|aseos|m2|metros|mts)\b/gi,
      " "
    );

  TYPE_IDS.forEach((id) => {
    const words = [
      ...STRATOS_TYPE_META[id].exact,
      ...STRATOS_TYPE_META[id].soft,
    ];
    words.forEach((w) => {
      q = q.replace(new RegExp(`\\b${escapeRegExp(normalizeSearchText(w))}\\b`, "gi"), " ");
    });
  });

  Object.values(EXTRA_SYNONYMS)
    .flat()
    .forEach((w) => {
      q = q.replace(new RegExp(`\\b${escapeRegExp(normalizeSearchText(w))}\\b`, "gi"), " ");
    });

  const tokens = normalizeWords(q).filter((word) => !STOP_WORDS.has(word));

  return uniq(tokens).filter((word) => word.length >= 2);
};

export const getClarifications = (query: string): string[] => {
  const q = normalizeSearchText(query);
  const cleaned = q
    .replace(/\b(en|quiero|busco|piso|chalet|villa|casa|atico|ático|duplex|dúplex|loft)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const [key, options] of Object.entries(CONFLICTS)) {
    if (cleaned === key) return options;
  }

  return [];
};

const getPriceNumber = (p: any) =>
  safeNumber(p?.priceValue ?? p?.rawPrice ?? p?.price ?? 0);

const getBedsNumber = (p: any) => safeNumber(p?.rooms || 0);
const getBathsNumber = (p: any) => safeNumber(p?.baths || 0);
const getM2Number = (p: any) => safeNumber(p?.mBuilt ?? p?.m2 ?? 0);

const propertyHasExtra = (p: any, key: string, fullText: string) => {
  const safeServices = Array.isArray(p?.selectedServices) ? p.selectedServices : [];

  if (key === "pool") return p?.pool === true || safeServices.includes("pool") || includesWhole(fullText, "piscina");
  if (key === "terrace") return p?.terrace === true || safeServices.includes("terrace") || includesWhole(fullText, "terraza");
  if (key === "garage") return p?.garage === true || safeServices.includes("garage") || includesWhole(fullText, "garaje") || includesWhole(fullText, "parking");
  if (key === "elevator") return p?.elevator === true || includesWhole(fullText, "ascensor");
  if (key === "garden") return p?.garden === true || safeServices.includes("garden") || includesWhole(fullText, "jardin");
  if (key === "storage") return p?.storage === true || safeServices.includes("storage") || includesWhole(fullText, "trastero");
  if (key === "balcony") return p?.balcony === true || safeServices.includes("balcony") || includesWhole(fullText, "balcon");
  if (key === "ac") return p?.ac === true || safeServices.includes("ac") || includesWhole(fullText, "aire acondicionado");
  if (key === "heating") return p?.heating === true || safeServices.includes("heating") || includesWhole(fullText, "calefaccion");
  if (key === "furnished") return p?.furnished === true || safeServices.includes("furnished") || includesWhole(fullText, "amueblado");
  if (key === "security") return p?.security === true || safeServices.includes("security") || includesWhole(fullText, "seguridad") || includesWhole(fullText, "vigilancia");
  if (key === "sea") return includesWhole(fullText, "mar") || includesWhole(fullText, "playa") || includesWhole(fullText, "costa");
  if (key === "luxury") return includesWhole(fullText, "lujo") || includesWhole(fullText, "premium") || includesWhole(fullText, "exclusivo");
  if (key === "investor") return includesWhole(fullText, "rentabilidad") || includesWhole(fullText, "inversion") || includesWhole(fullText, "oportunidad");
  if (key === "family") return includesWhole(fullText, "familia") || includesWhole(fullText, "residencial") || includesWhole(fullText, "colegio");
  if (key === "reform") {
    const state = normalizeSearchText(p?.state || "");
    return includesWhole(fullText, "reformar") || state.includes("reform");
  }
  if (key === "newbuild") {
    const state = normalizeSearchText(p?.state || "");
    return includesWhole(fullText, "obra nueva") || state.includes("nuevo") || state.includes("estrenar");
  }
  if (key === "exterior") return p?.exterior === true || includesWhole(fullText, "exterior");
  if (key === "south") {
    const orientation = normalizeSearchText(p?.orientation || "");
    return orientation.includes("sur") || includesWhole(fullText, "sur");
  }

  return false;
};

const buildBudgetScore = (propPrice: number, budget: number) => {
  if (!(budget < Infinity) || propPrice <= 0) {
    return { score: 0, exact: true, tag: null as string | null };
  }

  const ratio = propPrice / budget;

  if (ratio <= 1) {
    if (ratio >= 0.9) return { score: 220, exact: true, tag: "Presupuesto ideal" };
    if (ratio >= 0.75) return { score: 165, exact: true, tag: "Buena relación precio" };
    if (ratio >= 0.55) return { score: 95, exact: true, tag: null };
    if (ratio >= 0.35) return { score: 25, exact: true, tag: null };
    return { score: -35, exact: true, tag: null };
  }

  if (ratio <= 1.1) return { score: 95, exact: false, tag: "Ligeramente superior" };
  if (ratio <= 1.2) return { score: 20, exact: false, tag: null };
  return { score: -120, exact: false, tag: null };
};

const buildLocationScore = (locationText: string, locationTokens: string[]) => {
  if (!locationTokens.length) {
    return { score: 0, exact: true, ratio: 1, tag: null as string | null };
  }

  const hits = locationTokens.filter((token) => includesWhole(locationText, token));
  const ratio = hits.length / locationTokens.length;

  if (ratio === 1) return { score: 260, exact: true, ratio, tag: "Zona exacta" };
  if (ratio >= 0.66) return { score: 155, exact: false, ratio, tag: "Zona próxima" };
  if (ratio > 0) return { score: 65, exact: false, ratio, tag: "Área relacionada" };
  return { score: -120, exact: false, ratio, tag: null };
};

const buildTypeScore = (typeStrength: TypeStrength) => {
  if (typeStrength === "exact") return { score: 260, exact: true, tag: "Tipología exacta" };
  if (typeStrength === "soft") return { score: 145, exact: false, tag: "Alternativa cercana" };
  return { score: -180, exact: false, tag: null };
};

const buildCountScore = (propValue: number, reqValue: number, unit: "hab" | "bath" | "m2") => {
  if (reqValue <= 0) return { score: 0, exact: true, tag: null as string | null };

  if (propValue >= reqValue) {
    if (unit === "hab") return { score: 95, exact: true, tag: `${propValue} hab` };
    if (unit === "bath") return { score: 55, exact: true, tag: `${propValue} baños` };
    return { score: 55, exact: true, tag: `${propValue}m²` };
  }

  if (unit === "hab" && propValue === reqValue - 1) return { score: 35, exact: false, tag: "1 hab menos" };
  if (unit === "bath" && propValue === reqValue - 1) return { score: 18, exact: false, tag: null };
  if (unit === "m2" && propValue >= reqValue * 0.85) return { score: 18, exact: false, tag: null };

  return { score: unit === "hab" ? -60 : -35, exact: false, tag: null };
};

const buildExtrasScore = (p: any, requestedExtras: string[], fullText: string) => {
  let score = 0;
  const tags: string[] = [];

  requestedExtras.forEach((key) => {
    if (propertyHasExtra(p, key, fullText)) {
      score += 40;

      if (key === "pool") tags.push("Tiene piscina");
      else if (key === "terrace") tags.push("Tiene terraza");
      else if (key === "garage") tags.push("Tiene garaje");
      else if (key === "elevator") tags.push("Tiene ascensor");
      else if (key === "sea") tags.push("Cerca del mar");
      else if (key === "luxury") tags.push("Perfil premium");
      else if (key === "family") tags.push("Ideal familias");
      else if (key === "investor") tags.push("Perfil inversor");
      else if (key === "newbuild") tags.push("Obra nueva");
      else if (key === "reform") tags.push("Para reformar");
      else if (key === "exterior") tags.push("Exterior");
      else if (key === "south") tags.push("Orientación sur");
    }
  });

  return { score, tags };
};

const buildEnergyAndFeeBonus = (p: any) => {
  let score = 0;
  const tags: string[] = [];

  const energy = String(p?.energyConsumption || "").toUpperCase();
  const community = safeNumber(p?.communityFees || 0);

  if (energy === "A" || energy === "B") {
    score += 12;
    tags.push("Alta eficiencia");
  }

  if (community > 0 && community <= 60) {
    score += 6;
  }

  return { score, tags };
};

export const cleanGeoQueryForMap = (rawQuery: string) => {
  let q = normalizeSearchText(rawQuery);

  q = q
    .replace(/[0-9.,]+\s*(€|euros|euro|k|m|millon|millones)?/gi, " ")
    .replace(
      /\b\d+\s*(hab|habitacion|habitaciones|dorm|dormitorio|dormitorios|ban|bano|banos|baños|aseo|aseos|m2|metros|mts)\b/gi,
      " "
    )
    .replace(
      /\b(quiero|buscar|busco|necesito|comprar|alquilar|ver|encontrar|zona|cerca|cerca de|alrededor de)\b/gi,
      " "
    );

  TYPE_IDS.forEach((id) => {
    const words = [...STRATOS_TYPE_META[id].exact, ...STRATOS_TYPE_META[id].soft];
    words.forEach((w) => {
      q = q.replace(new RegExp(`\\b${escapeRegExp(normalizeSearchText(w))}\\b`, "gi"), " ");
    });
  });

  Object.values(EXTRA_SYNONYMS)
    .flat()
    .forEach((w) => {
      q = q.replace(new RegExp(`\\b${escapeRegExp(normalizeSearchText(w))}\\b`, "gi"), " ");
    });

  q = q.replace(/\s+/g, " ").trim();

  return q;
};

export const applyGeoOverride = (query: string) => {
  const q = normalizeSearchText(query);
  return GEO_OVERRIDES[q] || query;
};

const shouldPreferSpain = (query: string) => {
  const q = normalizeSearchText(query);

  if (!q) return false;

  for (const term of GLOBAL_INTL_TERMS) {
    if (q.includes(term)) return false;
  }

  return true;
};

export const buildMapboxSearchPlan = (rawQuery: string) => {
  const cleaned = cleanGeoQueryForMap(rawQuery);
  const overridden = applyGeoOverride(cleaned);
  const q = normalizeSearchText(cleaned);

  const looksLandmark =
    q.includes("estadio") ||
    q.includes("aeropuerto") ||
    q.includes("club") ||
    q.includes("golf") ||
    q.includes("puerto") ||
    q.includes("marina") ||
    q.includes("torre");

  const primaryTypes = looksLandmark
    ? "poi,place,locality,district,neighborhood,address"
    : "place,locality,district,neighborhood,postcode,address,poi";

  return {
    cleanedQuery: cleaned,
    finalQuery: overridden,
    looksLandmark,
    preferSpain: shouldPreferSpain(cleaned),
    typesParam: primaryTypes,
  };
};

const getMapboxContextCountry = (feature: any) => {
  const ctx = Array.isArray(feature?.context) ? feature.context : [];
  const countryCtx = ctx.find((c: any) => String(c?.id || "").startsWith("country."));
  return normalizeSearchText(countryCtx?.text || feature?.place_name || "");
};

const getPlaceTypeRank = (placeType: string, landmarkMode: boolean) => {
  if (landmarkMode) {
    const rank: Record<string, number> = {
      poi: 120,
      place: 95,
      locality: 80,
      district: 70,
      neighborhood: 60,
      address: 40,
      postcode: 30,
      region: 25,
    };
    return rank[placeType] || 0;
  }

  const rank: Record<string, number> = {
    place: 120,
    locality: 100,
    district: 85,
    neighborhood: 80,
    postcode: 55,
    address: 50,
    poi: 40,
    region: 30,
  };

  return rank[placeType] || 0;
};

export const pickBestMapboxFeature = (features: any[], rawQuery: string) => {
  if (!Array.isArray(features) || features.length === 0) return null;

  const plan = buildMapboxSearchPlan(rawQuery);
  const normalizedQuery = normalizeSearchText(plan.cleanedQuery);
  const queryTokens = normalizeWords(normalizedQuery);

  const ranked = [...features].sort((a: any, b: any) => {
    const scoreFeature = (f: any) => {
      const placeType = String(f?.place_type?.[0] || "");
      const placeName = normalizeSearchText(f?.place_name || "");
      const text = normalizeSearchText(f?.text || "");
      const country = getMapboxContextCountry(f);

      let score = 0;

      score += getPlaceTypeRank(placeType, plan.looksLandmark);
      score += Number(f?.relevance || 0) * 60;

      if (plan.preferSpain && (country.includes("espana") || country.includes("spain") || placeName.includes("espana"))) {
        score += 120;
      }

      if (text === normalizedQuery) score += 200;
      if (placeName.includes(normalizedQuery)) score += 100;

      const tokenHits = queryTokens.filter((t) => placeName.includes(t) || text.includes(t)).length;
      score += tokenHits * 28;

      if (plan.finalQuery !== plan.cleanedQuery && placeName.includes(normalizeSearchText(plan.finalQuery))) {
        score += 65;
      }

      return score;
    };

    return scoreFeature(b) - scoreFeature(a);
  });

  return ranked[0] || null;
};

export const StratosBrain = {
  getClarifications,

  process: (query: string, properties: any[]) => {
    if (!query || !query.trim()) {
      return (properties || []).map((p) => ({
        ...p,
        aiScore: 0,
        matchPercentage: null,
        dopamineTags: [],
        isPerfectMatch: false,
      }));
    }

    const q = normalizeSearchText(query);
    const budget = parseBudgetFromQuery(q);
    const reqBeds = parseCountFromQuery(q, "beds");
    const reqBaths = parseCountFromQuery(q, "baths");
    const reqM2 = parseCountFromQuery(q, "m2");
    const requestedTypeIds = extractRequestedTypeIds(q);
    const requestedExtras = extractRequestedExtras(q);
    const locationTokens = parseLocationTokens(q);

    const processed = (properties || [])
      .map((p: any) => {
        const propPrice = getPriceNumber(p);
        const propBeds = getBedsNumber(p);
        const propBaths = getBathsNumber(p);
        const propM2 = getM2Number(p);

        const fullText = normalizePropertyText(p);
        const locationText = normalizeSearchText(
          `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`
        );

        const typeStrength = getTypeStrength(String(p?.type || ""), requestedTypeIds);

        const typeScore = buildTypeScore(typeStrength);
        const budgetScore = buildBudgetScore(propPrice, budget);
        const locationScore = buildLocationScore(locationText, locationTokens);
        const bedsScore = buildCountScore(propBeds, reqBeds, "hab");
        const bathsScore = buildCountScore(propBaths, reqBaths, "bath");
        const m2Score = buildCountScore(propM2, reqM2, "m2");
        const extrasScore = buildExtrasScore(p, requestedExtras, fullText);
        const energyScore = buildEnergyAndFeeBonus(p);

        let score = 0;
        let maxScore = 0;
        const tags: string[] = [];

        if (requestedTypeIds.length > 0) {
          maxScore += 260;
          score += typeScore.score;
          if (typeScore.tag) tags.push(typeScore.tag);
        }

        if (budget < Infinity && propPrice > 0) {
          maxScore += 220;
          score += budgetScore.score;
          if (budgetScore.tag) tags.push(budgetScore.tag);
        }

        if (locationTokens.length > 0) {
          maxScore += 260;
          score += locationScore.score;
          if (locationScore.tag) tags.push(locationScore.tag);
        }

        if (reqBeds > 0) {
          maxScore += 95;
          score += bedsScore.score;
          if (bedsScore.tag) tags.push(bedsScore.tag);
        }

        if (reqBaths > 0) {
          maxScore += 55;
          score += bathsScore.score;
          if (bathsScore.tag) tags.push(bathsScore.tag);
        }

        if (reqM2 > 0) {
          maxScore += 55;
          score += m2Score.score;
          if (m2Score.tag) tags.push(m2Score.tag);
        }

        if (requestedExtras.length > 0) {
          maxScore += requestedExtras.length * 40;
          score += extrasScore.score;
          tags.push(...extrasScore.tags);
        }

        score += energyScore.score;
        tags.push(...energyScore.tags);

        if (p?.isFire === true) score += 10;

        if (maxScore === 0) {
          return {
            ...p,
            aiScore: 120,
            matchPercentage: 100,
            dopamineTags: uniq(tags).slice(0, 3),
            isPerfectMatch: true,
          };
        }

        const normalizedPositive = Math.max(0, score);
        let matchPercentage = Math.round((normalizedPositive / maxScore) * 100);

        if (score > 0 && matchPercentage < 12) matchPercentage = 12;
        matchPercentage = clamp(matchPercentage, 0, 100);

        const isPerfectMatch =
          (requestedTypeIds.length === 0 || typeStrength === "exact") &&
          (budget === Infinity || budgetScore.exact) &&
          (locationTokens.length === 0 || locationScore.exact) &&
          (reqBeds === 0 || bedsScore.exact);

        return {
          ...p,
          aiScore: score,
          matchPercentage,
          dopamineTags: uniq(tags).slice(0, 3),
          isPerfectMatch,
        };
      })
      .filter((p: any) => Number(p?.aiScore || 0) > -220)
      .sort((a: any, b: any) => {
        const scoreDiff = Number(b?.aiScore || 0) - Number(a?.aiScore || 0);
        if (scoreDiff !== 0) return scoreDiff;

        return Number(b?.matchPercentage || 0) - Number(a?.matchPercentage || 0);
      });

    return processed;
  },
};