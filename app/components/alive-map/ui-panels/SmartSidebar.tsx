"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  MapPin,
  Flame,
  BedDouble,
  Bath,
  ArrowRight,
  Sparkles,
  Building2,
  Home,
  Sun,
  Briefcase,
  Maximize,
  X,
  User,
  LayoutGrid,
  Star,
  LandPlot,
  Warehouse,
  FilterX,
  Target,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import {
  StratosBrain,
  STRATOS_TYPE_META,
  normalizeSearchText,
  parseBudgetFromQuery,
  parseCountFromQuery,
  parseLocationTokens,
  extractRequestedTypeIds,
  getTypeStrength,
  type StratosTypeId,
  type TypeStrength,
} from "@/app/components/alive-map/StratosMapBrain";

import { getGlobalPropertiesAction } from "@/app/actions";
import { playSynthSound } from "./audio";


const ASSET_TYPES = [
  { id: "flat", label: "Piso", icon: Building2 },
  { id: "penthouse", label: "Ático", icon: Sun },
  { id: "duplex", label: "Dúplex", icon: LayoutGrid },
  { id: "loft", label: "Loft", icon: Star },
  { id: "villa", label: "Villa", icon: Home },
  { id: "office", label: "Oficina", icon: Briefcase },
  { id: "land", label: "Suelo", icon: LandPlot },
  { id: "industrial", label: "Nave", icon: Warehouse },
];

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const getPriceNumber = (p: any) => {
  const raw = p?.priceValue ?? p?.rawPrice ?? p?.price ?? 0;
  if (typeof raw === "number") return raw;
  return (
    Number(
      String(raw)
        .replace(/[^\d.,-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0
  );
};

const getCoords = (p: any) => {
  const lat = Number(
    p?.latitude ?? p?.lat ?? (Array.isArray(p?.coordinates) ? p.coordinates[1] : 0)
  );
  const lng = Number(
    p?.longitude ?? p?.lng ?? (Array.isArray(p?.coordinates) ? p.coordinates[0] : 0)
  );
  return { lat, lng };
};

const getDistanceKm = (
  p: any,
  crosshair: { lng: number; lat: number } | null
) => {
  const { lat, lng } = getCoords(p);
  if (!crosshair || !crosshair.lat || !crosshair.lng || !lat || !lng) return null;
  return calculateDistance(crosshair.lat, crosshair.lng, lat, lng);
};

const getTypeLabel = (typeId: string) =>
  STRATOS_TYPE_META[typeId as StratosTypeId]?.label || "activo";

const distanceBonus = (distanceKm: number | null) => {
  if (distanceKm === null || Number.isNaN(distanceKm)) return 0;
  if (distanceKm < 3) return 80;
  if (distanceKm < 10) return 55;
  if (distanceKm < 25) return 30;
  if (distanceKm < 50) return 12;
  return 0;
};

const dedupeById = (items: any[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = String(item?.id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const enrichCard = (
  p: any,
  crosshair: { lng: number; lat: number } | null,
  typeStrength: TypeStrength = "exact"
) => {
  const distanceKm = getDistanceKm(p, crosshair);
  return {
    ...p,
    distanceKm,
    typeStrength,
  };
};

const buildSoftFallbackScore = (
  p: any,
  rawQuery: string,
  requestedTypeIds: string[],
  crosshair: { lng: number; lat: number } | null
) => {
  const q = normalizeSearchText(rawQuery);
  const propPrice = getPriceNumber(p);
  const propBeds = Number(p?.rooms || 0);
  const propBaths = Number(p?.baths || 0);
  const propM2 = Number(p?.mBuilt || p?.m2 || 0);
  const locationTokens = parseLocationTokens(q);
  const budget = parseBudgetFromQuery(q);
  const reqBeds = parseCountFromQuery(q, "beds");
  const reqBaths = parseCountFromQuery(q, "baths");
  const reqM2 = parseCountFromQuery(q, "m2");
  const distanceKm = getDistanceKm(p, crosshair);
  const locationText = normalizeSearchText(
    `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`
  );

  let score = 0;
  const tags: string[] = [];
  const typeStrength = getTypeStrength(String(p?.type || ""), requestedTypeIds);

  // 1. Tipología
  if (requestedTypeIds.length > 0) {
    if (typeStrength === "exact") {
      score += 320;
      tags.push("Tipología exacta");
    } else if (typeStrength === "soft") {
      score += 170;
      tags.push("Alternativa cercana");
    } else {
      score -= 250;
    }
  }

  // 2. Presupuesto (prioriza cercanía al presupuesto, no solo "ser más barato")
if (budget < Infinity && propPrice > 0) {
  const ratio = propPrice / budget;

  if (ratio <= 1) {
    if (ratio >= 0.9) {
      score += 280;
      tags.push("Presupuesto muy afín");
    } else if (ratio >= 0.75) {
      score += 220;
      tags.push("Dentro de presupuesto");
    } else if (ratio >= 0.55) {
      score += 140;
      tags.push("Buen precio");
    } else if (ratio >= 0.4) {
      score += 70;
    } else {
      score += 20;
    }
  } else if (ratio <= 1.1) {
    score += 130;
    tags.push("Se pasa poco");
  } else if (ratio <= 1.35) {
    score += 80;
    tags.push("Alternativa por precio");
  } else if (ratio <= 2.1) {
    score += 25;
  } else {
    score -= 180;
  }
}
  // 3. Habitaciones
  if (reqBeds > 0) {
    if (propBeds >= reqBeds) {
      score += 90;
      tags.push(`${propBeds} hab`);
    } else if (propBeds === reqBeds - 1) {
      score += 35;
    } else {
      score -= 60;
    }
  }

  // 4. Baños
  if (reqBaths > 0) {
    if (propBaths >= reqBaths) {
      score += 55;
      tags.push(`${propBaths} baños`);
    } else if (propBaths === reqBaths - 1) {
      score += 20;
    } else {
      score -= 45;
    }
  }

  // 5. m2
  if (reqM2 > 0) {
    if (propM2 >= reqM2) {
      score += 55;
      tags.push(`${propM2}m²`);
    } else if (propM2 >= reqM2 * 0.85) {
      score += 20;
    } else {
      score -= 35;
    }
  }

  // 6. Ubicación textual + rescate por cercanía real
if (locationTokens.length > 0) {
  const hits = locationTokens.filter((token) => locationText.includes(token));

  if (hits.length === locationTokens.length) {
    score += 150;
    tags.push("Zona exacta");
  } else if (hits.length > 0) {
    score += 90;
    tags.push("Zona próxima");
  } else if (distanceKm !== null && distanceKm <= 12) {
    score += 70;
    tags.push("Alternativa cercana");
  } else if (distanceKm !== null && distanceKm <= 25) {
    score += 30;
    tags.push("Cercano");
  } else {
    score -= 90;
  }
}

  // 7. Distancia
  score += distanceBonus(distanceKm);
  if (distanceKm !== null && distanceKm < 10) tags.push("Cercano");

  // 8. Premium
  if (p?.isFire === true) score += 12;

  // 9. Afinidad mínima
  const matchPercentage = Math.max(
    14,
    Math.min(88, Math.round(score / 8))
  );

  return {
    ...p,
    distanceKm,
    smartScore: score,
    matchPercentage,
    isPerfectMatch: false,
    dopamineTags: uniq(tags).slice(0, 3),
    typeStrength,
  };
};

const sortForUi = (
  items: any[],
  sortOrder: "match" | "price-desc" | "price-asc"
) => {
  const clone = [...items];

  if (sortOrder === "price-desc") {
    clone.sort((a, b) => {
      const laneA = Number(a?.lanePriority ?? 0);
      const laneB = Number(b?.lanePriority ?? 0);
      if (laneA !== laneB) return laneA - laneB;

      return getPriceNumber(b) - getPriceNumber(a);
    });
    return clone;
  }

  if (sortOrder === "price-asc") {
    clone.sort((a, b) => {
      const laneA = Number(a?.lanePriority ?? 0);
      const laneB = Number(b?.lanePriority ?? 0);
      if (laneA !== laneB) return laneA - laneB;

      return getPriceNumber(a) - getPriceNumber(b);
    });
    return clone;
  }

  clone.sort((a, b) => {
    const laneA = Number(a?.lanePriority ?? 0);
    const laneB = Number(b?.lanePriority ?? 0);
    if (laneA !== laneB) return laneA - laneB;

    const scoreA = Number(a?.smartScore || a?.aiScore || 0);
    const scoreB = Number(b?.smartScore || b?.aiScore || 0);
    if (scoreB !== scoreA) return scoreB - scoreA;

    const matchA = Number(a?.matchPercentage || 0);
    const matchB = Number(b?.matchPercentage || 0);
    if (matchB !== matchA) return matchB - matchA;

    const distA = a?.distanceKm ?? 9999;
    const distB = b?.distanceKm ?? 9999;
    return distA - distB;
  });

  return clone;
};

export default function SmartSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [top10Only, setTop10Only] = useState(false); // 🔥 NUEVO ESTADO TOP 10
  const [isParked, setIsParked] = useState(false);
  const [sortOrder, setSortOrder] = useState<"match" | "price-desc" | "price-asc">(
    "match"
  );
  const [crosshair, setCrosshair] = useState<{ lng: number; lat: number } | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  const hasSidebarAudioBootedRef = useRef(false);
const prevExactCountRef = useRef(0);
const prevFallbackRef = useRef(false);
  
  const suggestions = useMemo(() => {
    return StratosBrain.getClarifications(query);
  }, [query]);

  useEffect(() => {
    const handleEpicenter = (e: any) => {
      if (e.detail?.lng !== undefined && e.detail?.lat !== undefined) {
        setCrosshair({ lng: e.detail.lng, lat: e.detail.lat });
      }
    };

    const handlePark = (e: any) => {
      if (e.detail && e.detail.park !== undefined) {
        setIsParked(e.detail.park);
      }
    };

    const handleInventoryReady = (e: any) => {
      const payload = Array.isArray(e.detail) ? e.detail : [];
      setInventory(payload);
    };

    window.addEventListener("set-epicenter", handleEpicenter);
    window.addEventListener("park-smart-sidebar", handlePark);
    window.addEventListener("stratos-inventory-ready", handleInventoryReady);

    window.dispatchEvent(new CustomEvent("request-stratos-inventory"));

    return () => {
      window.removeEventListener("set-epicenter", handleEpicenter);
      window.removeEventListener("park-smart-sidebar", handlePark);
      window.removeEventListener("stratos-inventory-ready", handleInventoryReady);
    };
  }, []);

  const resultsData = useMemo(() => {
    if (inventory.length === 0) {
      return {
        items: [] as any[],
        isFallback: false,
        exactCount: 0,
        bannerText: "",
      };
    }

  // 🔥 FILTRO MAESTRO (Premium y Top 10)
    let basePool = [...inventory];
    
    if (premiumOnly) {
        basePool = basePool.filter((p) => p?.isFire === true);
    }
    
    if (top10Only) {
        basePool = basePool.filter((p) => p?.isTop10 === true);
    }

    if (basePool.length === 0) {
      return {
        items: [] as any[],
        isFallback: false,
        exactCount: 0,
        bannerText: "",
      };
    }

    const queryTrimmed = query.trim();
    const buttonTypeIds =
      selectedType !== "all" ? [selectedType as StratosTypeId] : [];
    const queryTypeIds = extractRequestedTypeIds(queryTrimmed);
    const combinedTypeIds = uniq([...buttonTypeIds, ...queryTypeIds]);

    const exactTypePool =
      combinedTypeIds.length > 0
        ? basePool.filter(
            (p) =>
              getTypeStrength(String(p?.type || ""), combinedTypeIds) === "exact"
          )
        : basePool;

    // ----------------------------------------------------------------------
    // SIN QUERY → filtro natural + fallback suave por tipo
    // ----------------------------------------------------------------------
    if (!queryTrimmed) {
      let items: any[] = [];
      let isFallback = false;
      let bannerText = "";

      if (combinedTypeIds.length === 0) {
        items = basePool.map((p) => ({
          ...enrichCard(p, crosshair, "exact"),
          smartScore: distanceBonus(getDistanceKm(p, crosshair)),
          matchPercentage: null,
          isPerfectMatch: false,
          dopamineTags: [],
        }));
      } else if (exactTypePool.length > 0) {
        items = exactTypePool.map((p) => ({
          ...enrichCard(p, crosshair, "exact"),
          smartScore: 240 + distanceBonus(getDistanceKm(p, crosshair)),
          matchPercentage: null,
          isPerfectMatch: false,
          dopamineTags: [],
        }));
      } else {
        items = basePool
          .map((p) =>
            buildSoftFallbackScore(p, selectedType, combinedTypeIds, crosshair)
          )
          .filter((p) => p.smartScore > -120);

        isFallback = true;
        bannerText = `No hay ${getTypeLabel(
          selectedType
        ).toLowerCase()}s exactos. Mostrando alternativas cercanas por IA.`;
      }

      items = sortForUi(items, sortOrder);

      return {
        items,
        isFallback,
        exactCount: exactTypePool.length,
        bannerText,
      };
    }

    // ----------------------------------------------------------------------
    // CON QUERY → exactos + fallback IA + rescate por cercanía
    // ----------------------------------------------------------------------
    const primaryPool = exactTypePool.length > 0 ? exactTypePool : basePool;

   const strictBrain = StratosBrain.process(queryTrimmed, primaryPool).map(
  (p: any) => {
    const distanceKm = getDistanceKm(p, crosshair);
const typeStrength =
  combinedTypeIds.length > 0
    ? getTypeStrength(String(p?.type || ""), combinedTypeIds)
    : "exact";

const budget = parseBudgetFromQuery(queryTrimmed);
const propPrice = getPriceNumber(p);

let budgetBoost = 0;
if (budget < Infinity && propPrice > 0) {
  const ratio = propPrice / budget;

  if (ratio <= 1) {
    if (ratio >= 0.9) budgetBoost = 140;
    else if (ratio >= 0.75) budgetBoost = 105;
    else if (ratio >= 0.55) budgetBoost = 55;
    else if (ratio >= 0.4) budgetBoost = 10;
    else budgetBoost = -35;
  } else if (ratio <= 1.1) {
    budgetBoost = 70;
  } else if (ratio <= 1.25) {
    budgetBoost = 20;
  } else {
    budgetBoost = -120;
  }
}

    const locationTokens = parseLocationTokens(queryTrimmed);
    const locationText = normalizeSearchText(
      `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`
    );
    const hits = locationTokens.filter((token) => locationText.includes(token));

    let locationBoost = 0;
    if (locationTokens.length > 0) {
      if (hits.length === locationTokens.length) {
        locationBoost = 150;
      } else if (hits.length > 0) {
        locationBoost = 75;
      } else if (distanceKm !== null && distanceKm <= 12) {
        locationBoost = 45;
      } else if (distanceKm !== null && distanceKm > 30) {
        locationBoost = -35;
      }
    }

  const smartScore =
  Number(p?.aiScore || 0) +
  budgetBoost +
  locationBoost +
  distanceBonus(distanceKm) +
  (typeStrength === "exact" ? 60 : typeStrength === "soft" ? 20 : -40) +
  (p?.isPerfectMatch ? 120 : 0);

    return {
      ...p,
      distanceKm,
      smartScore,
      typeStrength,
    };
  }
);

    const strictStrong = strictBrain.filter((p: any) => {
      const score = Number(p?.aiScore || 0);
      const match = Number(p?.matchPercentage || 0);

      if (combinedTypeIds.length > 0 && p.typeStrength === "none") return false;
      return score > -200 && match >= 18;
    });

  const strongExact = strictStrong.filter((p: any) => {
  const match = Number(p?.matchPercentage || 0);
  const typeOk =
    combinedTypeIds.length === 0 || p.typeStrength === "exact";

  const locationTokens = parseLocationTokens(queryTrimmed);
  const locationText = normalizeSearchText(
    `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`
  );
  const locationHits = locationTokens.filter((token) =>
    locationText.includes(token)
  );

  const locationOk =
    locationTokens.length === 0 ||
    locationHits.length === locationTokens.length ||
    (p?.distanceKm !== null && p?.distanceKm <= 12);

  return typeOk && locationOk && match >= 55;
});

    const usedIds = new Set(strictStrong.map((p: any) => String(p?.id || "")));

    const fallbackRaw = basePool.filter(
      (p) => !usedIds.has(String(p?.id || ""))
    );

   const fallbackBrain = StratosBrain.process(queryTrimmed, fallbackRaw).map(
  (p: any) => {
    const distanceKm = getDistanceKm(p, crosshair);
    const budget = parseBudgetFromQuery(queryTrimmed);
const propPrice = getPriceNumber(p);

let budgetBoost = 0;
if (budget < Infinity && propPrice > 0) {
  const ratio = propPrice / budget;

  if (ratio <= 1) {
    if (ratio >= 0.9) budgetBoost = 140;
    else if (ratio >= 0.75) budgetBoost = 105;
    else if (ratio >= 0.55) budgetBoost = 55;
    else if (ratio >= 0.4) budgetBoost = 10;
    else budgetBoost = -35;
  } else if (ratio <= 1.1) {
    budgetBoost = 70;
  } else if (ratio <= 1.25) {
    budgetBoost = 20;
  } else {
    budgetBoost = -120;
  }
}
    
    const typeStrength =
      combinedTypeIds.length > 0
        ? getTypeStrength(String(p?.type || ""), combinedTypeIds)
        : "exact";

    const locationTokens = parseLocationTokens(queryTrimmed);
    const locationText = normalizeSearchText(
      `${p?.city || ""} ${p?.region || ""} ${p?.address || ""} ${p?.postcode || ""}`
    );
    const hits = locationTokens.filter((token) => locationText.includes(token));

    let locationBoost = 0;
    if (locationTokens.length > 0) {
      if (hits.length === locationTokens.length) {
        locationBoost = 130;
      } else if (hits.length > 0) {
        locationBoost = 65;
      } else if (distanceKm !== null && distanceKm <= 12) {
        locationBoost = 40;
      } else if (distanceKm !== null && distanceKm > 30) {
        locationBoost = -40;
      }
    }

    const smartScore =
      Number(p?.aiScore || 0) +
      locationBoost +
      distanceBonus(distanceKm) +
      (typeStrength === "exact" ? 45 : typeStrength === "soft" ? 12 : -70);

    return {
      ...p,
      distanceKm,
      smartScore,
      typeStrength,
    };
  }
);

   const fallbackSoft = fallbackRaw
  .map((p) =>
    buildSoftFallbackScore(p, queryTrimmed, combinedTypeIds, crosshair)
  )
  .filter((p) => {
    if (combinedTypeIds.length > 0) {
      return p.typeStrength === "exact" || p.typeStrength === "soft";
    }
    return p.smartScore > 40;
  });

 let merged = dedupeById([
  ...strictStrong.map((p: any) => ({
    ...p,
    lanePriority: 0,
  })),

  ...(strongExact.length < 8
    ? fallbackBrain
        .filter((p: any) => {
          const match = Number(p?.matchPercentage || 0);

          if (combinedTypeIds.length > 0) {
            if (p.typeStrength === "none") return false;
            if (p.typeStrength === "soft") return match >= 26;
            return match >= 20;
          }

          return match >= 20;
        })
        .map((p: any) => ({
          ...p,
          lanePriority: 1,
          smartScore: Number(p?.smartScore || 0) - 90,
          matchPercentage: Math.min(Number(p?.matchPercentage || 0), 89),
          isPerfectMatch: false,
        }))
    : []),

...(strongExact.length < 8    ? fallbackSoft.map((p: any) => ({
        ...p,
        lanePriority: 2,
        smartScore: Number(p?.smartScore || 0) - 160,
        matchPercentage: Math.min(Number(p?.matchPercentage || 0), 82),
        isPerfectMatch: false,
      }))
    : []),
]);

    merged = sortForUi(merged, sortOrder).slice(0, 40);

    let isFallback = false;
    let bannerText = "";

    if (strongExact.length === 0 && merged.length > 0) {
      isFallback = true;
      bannerText = `No hay coincidencia exacta. Activando IA para mostrar lo más afín por tipología, presupuesto y cercanía.`;
    } else if (strongExact.length > 0 && merged.length > strongExact.length) {
      isFallback = true;
      bannerText = `Mostrando ${strongExact.length} coincidencias fuertes y otras alternativas muy afines por IA.`;
    }

    return {
      items: merged,
      isFallback,
      exactCount: strongExact.length,
      bannerText,
    };
}, [inventory, query, selectedType, premiumOnly, top10Only, crosshair, sortOrder]); // 🔥 AÑADIR top10Only al final
  useEffect(() => {
    const hasQuery = query.trim().length > 0;

    if (!hasQuery) {
      hasSidebarAudioBootedRef.current = false;
      prevExactCountRef.current = 0;
      prevFallbackRef.current = false;
      return;
    }

    if (!hasSidebarAudioBootedRef.current) {
      hasSidebarAudioBootedRef.current = true;
      prevExactCountRef.current = resultsData.exactCount;
      prevFallbackRef.current = resultsData.isFallback;
      return;
    }

    const hadExactBefore = prevExactCountRef.current > 0;
    const hasExactNow = resultsData.exactCount > 0;

    if (!hadExactBefore && hasExactNow) {
      playSynthSound("success");
    } else if (!prevFallbackRef.current && resultsData.isFallback) {
      playSynthSound("soft");
    }

    prevExactCountRef.current = resultsData.exactCount;
    prevFallbackRef.current = resultsData.isFallback;
  }, [query, resultsData.exactCount, resultsData.isFallback]);

  const handleCardClick = (p: any) => {
    playSynthSound("open");
    const lng = p.longitude || p.lng || (p.coordinates && p.coordinates[0]);
    const lat = p.latitude || p.lat || (p.coordinates && p.coordinates[1]);

    if (lng && lat) {
      window.dispatchEvent(
        new CustomEvent("map-fly-to", {
          detail: {
            center: [lng, lat],
            zoom: 18,
            pitch: 60,
            bearing: -20,
            duration: 2500,
          },
        })
      );
    }

    window.dispatchEvent(new CustomEvent("open-details-signal", { detail: p }));
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedType("all");
    setPremiumOnly(false);
    setSortOrder("match");

    window.dispatchEvent(
      new CustomEvent("apply-filter-signal", {
        detail: {
          type: "all",
          premiumOnly: false,
          priceMax: 999999999,
        },
      })
    );
  };

  const handleEnterSearch = async () => {
    if (!query.trim()) return;
playSynthSound("click");


    const cityTokens = parseLocationTokens(query);
    const cityQuery = cityTokens.join(" ").trim();

    window.dispatchEvent(
      new CustomEvent("stratos-search-city", {
        detail: cityQuery || query,
      })
    );

    if (inventory.length === 0) {
      const response = await getGlobalPropertiesAction();
      const globalData = response.success ? (response.data as any[]) : [];
      setInventory(globalData);
    }
  };

  return (
    <div
      className={`fixed right-7 top-0 bottom-10 w-[490px] pt-8 flex flex-col gap-4 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isParked
          ? "translate-x-[120%] opacity-0 z-[10]"
          : "translate-x-0 opacity-100 z-[999999]"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-[28px] pt-8 pb-6 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white pointer-events-auto shrink-0 flex flex-col gap-4 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-1.5 rounded-full transition-all z-10"
          >
            <X size={18} />
          </button>
        )}

     {/* 🔥 CABECERA CON LOGO NEÓN Y TEXTO ALINEADO 🔥 */}
        <div className="pr-10 mt-1 mb-6">
          <div className="flex items-center gap-4">
            
            {/* 💠 Ícono Neón (Sin cortes y con color OKLCH exacto) */}
            <div className="relative shrink-0 w-11 h-11">
              <svg viewBox="-5 -5 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_oklch(78.9%_0.154_211.53_/_0.6)]">
                <path d="M 85 45 A 40 40 0 1 0 45 85" stroke="oklch(78.9% 0.154 211.53)" strokeWidth="5" strokeLinecap="round" />
                <path d="M 73 45 A 28 28 0 1 0 45 73" stroke="oklch(78.9% 0.154 211.53)" strokeWidth="5" strokeLinecap="round" />
                <path d="M 50 65 L 75 45 L 100 65 V 95 H 50 Z" stroke="oklch(78.9% 0.154 211.53)" strokeWidth="5" strokeLinejoin="round" fill="white" fillOpacity="0.05" />
                <path d="M 65 95 V 75 C 65 72 68 70 70 70 H 80 C 82 70 85 72 85 75 V 95" stroke="oklch(78.9% 0.154 211.53)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 🏷️ Texto "Stratosfere OS" y Subtítulo */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl tracking-tighter text-slate-900 leading-none flex items-baseline gap-1.5">
                <span className="font-bold">Stratosfere</span> 
                {/* OS más grueso y contundente */}
                <span className="font-black text-4xl">OS</span> 
              </h2>
              {/* Texto inferior con el mismo color OKLCH inyectado */}
              <p className="text-[10px] font-black uppercase tracking-[0.15em] mt-1.5 text-[oklch(78.9%_0.154_211.53)]">
                Intelligence: Search Better.
              </p>
            </div>

          </div>
        </div>

        {/* 🔍 BARRA DE BÚSQUEDA */}
        <div className="relative group pr-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {/* Si quiere que la lupa también tenga el mismo color, use text-[oklch(...)] */}
            <Search className="text-[oklch(78.9%_0.154_211.53)] transition-colors" size={20} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await handleEnterSearch();
              }
            }}
            placeholder="Ej: Madrid, Marbella, Sotogrande... + DORM... PRECIO €... + ENTER"
            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 font-bold placeholder-blue-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 mb-1 animate-fade-in-down bg-blue-50/80 p-3 rounded-2xl border border-blue-100 shadow-inner">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} /> Ojo, hay varios resultados. ¿Te refieres a...?
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-blue-600 hover:text-white hover:shadow-md transition-all border border-blue-200 active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextVal = !premiumOnly;
              setPremiumOnly(nextVal);
              window.dispatchEvent(
                new CustomEvent("apply-filter-signal", {
                  detail: {
                    type: selectedType,
                    premiumOnly: nextVal,
                    priceMax: 999999999,
                  },
                })
              );
            }}
            className={`w-12 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-300 ${
              premiumOnly
                ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent shadow-lg shadow-orange-500/30"
                : "bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-200"
            }`}
          >
            <Flame
              size={18}
              className={premiumOnly ? "text-white fill-white" : "text-slate-400"}
            />
          </button>

          <div className="w-[1px] h-8 bg-slate-200 shrink-0 mx-1"></div>

          <div
            ref={carouselRef}
            className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 snap-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => {
                setSelectedType("all");
                window.dispatchEvent(
                  new CustomEvent("apply-filter-signal", {
                    detail: {
                      type: "all",
                      premiumOnly: premiumOnly,
                      priceMax: 999999999,
                    },
                  })
                );
              }}
              className={`shrink-0 snap-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selectedType === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Todos
            </button>

            {ASSET_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  window.dispatchEvent(
                    new CustomEvent("apply-filter-signal", {
                      detail: {
                        type: type.id,
                        premiumOnly: premiumOnly,
                        priceMax: 999999999,
                      },
                    })
                  );
                }}
                className={`shrink-0 snap-start flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedType === type.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <type.icon size={14} /> {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end px-1 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {resultsData.items.length} Objetivos
            </span>
            {crosshair && (
              <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1">
                <Target size={10} /> Radar Calibrado
              </span>
            )}
          </div>

       {/* BOTONERA DE ORDENACIÓN Y FILTRO TOP 10 */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner items-center">
            
            {/* ⭐ NUEVO BOTÓN TOP 10 */}
            <button
              onClick={() => {
                setTop10Only(!top10Only);
                // Si tiene error con playSynthSound, bórrelo de esta línea
                if (typeof playSynthSound === 'function') playSynthSound("click");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                top10Only
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-sm"
                  : "text-amber-600 hover:bg-amber-50"
              }`}
              title="Mostrar solo el Top 10"
            >
              <Star size={12} className={top10Only ? "fill-amber-950" : ""} /> TOP 10
            </button>

            {/* SEPARADOR VERTICAL */}
            <div className="w-px h-5 bg-slate-200 mx-1.5"></div>

            <button
              onClick={() => { setSortOrder("match"); if (typeof playSynthSound === 'function') playSynthSound("click"); }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                sortOrder === "match"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              IA Match
            </button>
            <button
              onClick={() => { setSortOrder("price-desc"); if (typeof playSynthSound === 'function') playSynthSound("click"); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                sortOrder === "price-desc"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Mayor a menor precio"
            >
              Precio <ArrowDown size={12} strokeWidth={3} />
            </button>
            <button
              onClick={() => { setSortOrder("price-asc"); if (typeof playSynthSound === 'function') playSynthSound("click"); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                sortOrder === "price-asc"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Menor a mayor precio"
            >
              Precio <ArrowUp size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {resultsData.isFallback && resultsData.bannerText && (
        <div className="bg-blue-50/95 backdrop-blur-md border border-blue-200 p-3 rounded-2xl mx-2 mt-1 mb-1 shadow-lg animate-fade-in-down z-10 relative">
          <p className="text-[11px] font-bold text-blue-800 flex items-start gap-2 leading-snug">
            <Sparkles size={14} className="shrink-0 text-blue-600 mt-0.5" />
            <span>{resultsData.bannerText}</span>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto flex flex-col gap-4 pb-10">
        {resultsData.items.map((p, index) => {
        const safeImg =
            p.top10CustomImage || // 🔥 Lee la custom primero
            p.img ||
            (Array.isArray(p.images)
              ? typeof p.images[0] === "string"
                ? p.images[0]
                : p.images[0]?.url
              : null) ||
            p.mainImage;

          const hasB2B = p.b2b && Number(p.b2b.sharePct) > 0;
          const isAgency =
            hasB2B ||
            String(p.user?.role || p.role || "")
              .toUpperCase()
              .includes("AGEN");

          return (
            <div
              key={p.id || index}
              onClick={() => handleCardClick(p)}
              className={`group bg-white rounded-[24px] p-2.5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 ${
                p.isPerfectMatch
                  ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                  : "border-transparent shadow-md hover:border-blue-100"
              }`}
            >
              <div className="relative w-full h-48 rounded-[18px] overflow-hidden mb-3 bg-slate-100 shadow-inner">
                {safeImg ? (
                  <img
                    src={safeImg}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Home size={32} className="mb-2" />
                    <span className="text-[9px] uppercase font-bold tracking-widest">
                      Sin Foto
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60"></div>

              <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                  {/* 🔥 ETIQUETA DE FUEGO ORIGINAL */}
                  {p.isFire === true && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-sm">
                      <Flame size={12} className="fill-white animate-pulse" /> FUEGO
                    </span>
                  )}

                  {/* ⭐ NUEVA ETIQUETA TOP 10 DORADA */}
                  {p.isTop10 === true && (
                    <span className="bg-gradient-to-r from-yellow-300 to-amber-500 text-amber-950 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5 border border-white/50 backdrop-blur-md animate-pulse">
                      <Star size={12} className="fill-amber-950" /> TOP 10
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  {isAgency ? (
                    <div className="bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <Briefcase size={10} /> Agencia
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-md text-slate-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/50 flex items-center gap-1.5 shadow-lg">
                      <User size={10} /> Particular
                    </div>
                  )}
                </div>

                {p.matchPercentage && (
                  <div
                    className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                      p.isPerfectMatch
                        ? "bg-amber-400 text-amber-950"
                        : "bg-white/90 backdrop-blur text-blue-600"
                    }`}
                  >
                    <Sparkles size={12} />
                    {p.isPerfectMatch
                      ? "100% MATCH"
                      : `${p.matchPercentage}% AFINIDAD`}
                  </div>
                )}

                {p.dopamineTags && p.dopamineTags.length > 0 && (
                  <div className="absolute top-1/2 left-0 w-full px-3 flex flex-col items-start gap-1.5 -translate-y-1/2 pointer-events-none">
                    {p.dopamineTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl shadow-black/20 border border-white/50 animate-fade-in-right"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {p.distanceKm !== null && !isNaN(p.distanceKm) && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/20 shadow-lg flex items-center gap-1.5">
                    <Target size={12} className="text-blue-400" />
                    a {p.distanceKm < 1 ? "< 1" : p.distanceKm.toFixed(1)} km
                  </div>
                )}
              </div>

              <div className="px-3 pb-2">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                      {p.type || "Inmueble"}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      REF: {p.refCode || p.ref || p.id?.substring(0, 6)}
                    </span>
                  </div>

                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {getPriceNumber(p).toLocaleString("es-ES")} €
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 mt-1">
                  {p.title || "Propiedad Exclusiva"}
                </h4>
<div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-3">
                  <MapPin size={12} className="text-indigo-400 shrink-0" />
                  <span className="truncate">
                    {p.city || p.region || p.address || "Ubicación Privada"}
                  </span>
                </div>

                {/* 🏢 ETIQUETA VIP DE AGENCIA (Logo + Nombre + Check + Eslogan) */}
                {isAgency && (
                  <div className="flex items-center gap-3 mb-3 bg-slate-50 p-2.5 rounded-[14px] border border-slate-100 shadow-inner">
                    {(() => {
                      // Extracción inteligente de datos de la agencia
                      const activeAssignment = p.assignment?.agency || p.campaigns?.[0]?.agency || null;
                      const displayUser = activeAssignment || p.user || {};
                      const agencyName = displayUser.companyName || displayUser.name || "Agencia Verificada";
                      
                      // 🔥 AQUÍ INYECTAMOS EL LOGO CUSTOM DEL TOP 10 (Manda sobre todos los demás)
                      const agencyLogo = p.top10CustomLogo || p.campaignLogo || displayUser.companyLogo || displayUser.avatar || null;
                      
                      const agencySlogan = p.subtitle || p.customBio || displayUser.tagline || "TU AGENTE DE CONFIANZA";

                      return (
                        <>
                          {/* Logo */}
                          {agencyLogo ? (
                            <img src={agencyLogo} alt={agencyName} className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                              <Briefcase size={18} />
                            </div>
                          )}

                          {/* Textos */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[13px] font-black text-slate-900 truncate tracking-tight">{agencyName}</span>
                              {/* Check Azul Verificado */}
                              <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            </div>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest truncate mt-0.5">{agencySlogan}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    {Number(p.rooms) > 0 && (
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold">
                        <BedDouble size={12} className="text-slate-400" />{" "}
                        {p.rooms}
                      </span>
                    )}
                    {Number(p.baths) > 0 && (
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold">
                        <Bath size={12} className="text-slate-400" /> {p.baths}
                      </span>
                    )}
                    {Number(p.mBuilt || p.m2) > 0 && (
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold">
                        <Maximize size={12} className="text-slate-400" />{" "}
                        {p.mBuilt || p.m2}m²
                      </span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-md group-hover:scale-105 active:scale-95">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {resultsData.items.length === 0 && (
          <div className="bg-white/95 backdrop-blur rounded-[28px] p-8 text-center flex flex-col items-center justify-center border border-slate-100 shadow-xl mt-2 animate-scale-in">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FilterX className="text-slate-400" size={28} />
            </div>
            <h4 className="text-slate-900 font-black text-lg mb-1">
              Radar Limpio
            </h4>
            <p className="text-slate-500 font-medium text-xs mb-6 px-4">
              Ningún activo cumple esos requisitos estrictos. Prueba a ser menos restrictivo.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
            >
              Limpiar Búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}