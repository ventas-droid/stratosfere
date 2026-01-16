"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, Bed, Bath, Maximize2, Navigation, 
  Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp,
  Crown, Award, Zap, Star // Iconos para los Packs
} from 'lucide-react';

// ------------------------------------------------------------------
// 1. MOTOR DE PARSEO (V8 FINAL - CORREGIDO Y SIN ERRORES)
// ------------------------------------------------------------------
const safeParsePrice = (
  inputVal: number | string | null | undefined,
  inputString?: string | null | number
): number => {
  
  // A. ELEGIR FUENTE
  let valToParse = inputString;
  if (valToParse === undefined || valToParse === null || valToParse === "") {
      if (inputVal === undefined || inputVal === null) return 0;
      valToParse = inputVal;
  }

  // B. ESCUDO ANTI-ERROR
  let str = String(valToParse); 

  // C. LIMPIEZA
  str = str.toUpperCase().trim().replace(/\s/g, "").replace(/€/g, "");

  // D. DETECTAR SUFIJOS
  let multiplier = 1; 
  let hasSuffix = false;

  if (str.includes("M") || str.includes("K")) {
      hasSuffix = true;
      if (str.includes("M")) multiplier = 1_000_000;
      if (str.includes("K")) multiplier = 1_000;
      str = str.replace(/[MK]/g, "");
  }

  // E. GESTIÓN DE PUNTOS Y COMAS
  if (hasSuffix) {
      str = str.replace(/,/g, "."); 
  } else {
      str = str.replace(/,/g, "DECIMAL_PLACEHOLDER")
               .replace(/\./g, "")
               .replace("DECIMAL_PLACEHOLDER", ".");
  }

  // F. CÁLCULO FINAL
  str = str.replace(/[^\d.]/g, ""); 
  const val = parseFloat(str);

  return (Number.isFinite(val) ? val : 0) * multiplier;
};

// 2. MOTOR DE ESTILO (CUPERTINO / NEUTRO)
const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#8E8E93", text: "white", label: "PENDING" }; // System Gray
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "RENT" }; // System Green
  if (price < 200000)     return { hex: "#30B0C7", text: "white", label: "INVEST" }; // System Teal
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPPORTUNITY" }; // System Yellow
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" }; // System Orange
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUXURY" }; // System Pink
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVE" }; // System Purple
};

// 3. DICCIONARIO DE ICONOS (Sincronizado)
const getPropertyIcon = (typeStr: string) => {
    const t = (typeStr || "").toUpperCase();
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>; 
};

// 4. CONFIGURACIÓN DE PACKS (RANGOS)
const PACK_BADGES: Record<string, any> = {
  'pack_elite':   { icon: Crown, label: 'ELITE', color: 'bg-gradient-to-r from-amber-200 to-yellow-500', text: 'text-black shadow-sm', border: 'border-yellow-200' },
  'pack_investor':{ icon: Award, label: 'INVERSOR', color: 'bg-gradient-to-r from-emerald-400 to-cyan-500', text: 'text-white shadow-sm', border: 'border-emerald-200' },
  'pack_pro':     { icon: Star,  label: 'PRO',      color: 'bg-gradient-to-r from-indigo-400 to-purple-500', text: 'text-white shadow-sm', border: 'border-indigo-200' },
  'pack_express': { icon: Zap,   label: 'EXPRESS',  color: 'bg-gradient-to-r from-orange-400 to-red-500',    text: 'text-white shadow-sm', border: 'border-orange-200' },
  'pack_basic':   { icon: Star,  label: 'BASIC',    color: 'bg-gray-800', text: 'text-white shadow-sm', border: 'border-gray-600' },
};

export default function MapNanoCard(props: any) {
  const data = props.data || {};

 // DENTRO DE MapNanoCard.tsx (Al principio)

// 🔥 FIX #1: ID ESTABLE Y UNIFICADO
// Buscamos el ID real hasta debajo de las piedras. Si no hay, mejor null que random.
const id = useMemo(() => {
  const raw =
    props?.id ??
    data?.id ??
    data?._id ??
    data?.propertyId ??
    data?.property?.id ??
    data?.property?.propertyId;

  return raw ? String(raw) : null;
}, [
  props?.id,
  data?.id,
  data?._id,
  data?.propertyId,
  data?.property?.id,
  data?.property?.propertyId,
]);

// Datos
const rooms = props.rooms ?? data.rooms ?? 0;
const baths = props.baths ?? data.baths ?? 0;
const mBuilt =
  props.mBuilt ||
  data.mBuilt ||
  props.surface ||
  data.surface ||
  props.m2 ||
  data.m2 ||
  0;
const type = props.type || data.type || "Propiedad";

// 🔥 CORRECCIÓN DE IMAGEN (VERSION FINAL)
const img =
  (Array.isArray(props.images) && props.images.length > 0 ? props.images[0] : null) ||
  (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null) ||
  props.img ||
  props.image ||
  data.img ||
  "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

const city = props.city || data.city;
const location = props.location || data.location;
const address = props.address || data.address;
const floor = props.floor || data.floor;

// Servicios para los Packs
const selectedServices = props.selectedServices || data.selectedServices || [];

// Precio Vivo
const rawPriceInput = props.rawPrice ?? data?.rawPrice ?? props.priceValue;
const stringPriceInput = props.price ?? data?.price;
const [currentPrice, setCurrentPrice] = useState(() =>
  safeParsePrice(rawPriceInput, stringPriceInput)
);

useEffect(() => {
  const handleUpdate = (e: any) => {
    if (String(e.detail.id) === String(id) && e.detail.updates) {
      const u = e.detail.updates;
      if (u.price || u.rawPrice || u.priceValue) {
        const newP = safeParsePrice(u.rawPrice ?? u.priceValue, u.price);
        setCurrentPrice(newP);
      }
    }
  };
  if (typeof window !== "undefined")
    window.addEventListener("update-property-signal", handleUpdate);
  return () => {
    if (typeof window !== "undefined")
      window.removeEventListener("update-property-signal", handleUpdate);
  };
}, [id]);

const displayLabel = useMemo(() => {
  if (currentPrice === 0) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(currentPrice);
}, [currentPrice]);

const style = getPriceStyle(currentPrice);

// Detectar Pack Activo
const activePack = useMemo(() => {
  if (!selectedServices || selectedServices.length === 0) return null;
  if (selectedServices.includes("pack_elite")) return PACK_BADGES["pack_elite"];
  if (selectedServices.includes("pack_investor")) return PACK_BADGES["pack_investor"];
  if (selectedServices.includes("pack_pro")) return PACK_BADGES["pack_pro"];
  if (selectedServices.includes("pack_express")) return PACK_BADGES["pack_express"];
  if (selectedServices.includes("pack_basic")) return PACK_BADGES["pack_basic"];
  return null;
}, [selectedServices]);

// Estado Favorito
const [liked, setLiked] = useState(false);
const lastFavRef = useRef<boolean>(false);
const [isHovered, setIsHovered] = useState(false);
const cardRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!id || typeof window === "undefined") return;

  // Estado inicial (opcional): si viene marcado desde props/data, lo respetamos
  const initial = !!(props?.isFav ?? props?.isFavorited ?? data?.isFav ?? data?.isFavorited);

  lastFavRef.current = initial; // ✅ verdad estable inicial
  setLiked(initial);

  // ÚNICA fuente de verdad: eventos del sistema (UIPanels / servidor)
  const onSync = (e: any) => {
    if (String(e?.detail?.id) !== String(id)) return;
    const next = !!e.detail.isFav;
    lastFavRef.current = next; // ✅ guardamos verdad estable
    setLiked(next);            // ✅ UI
  };

  window.addEventListener("sync-property-state", onSync as EventListener);

  return () => {
    window.removeEventListener("sync-property-state", onSync as EventListener);
  };
}, [
  id,
  props?.isFav,
  props?.isFavorited,
  data?.isFav,
  data?.isFavorited,
]);

// GESTOR DE ACCIONES (VERSIÓN DEFINITIVA: SEGURA + SIN ROMPER APERTURA)
const handleAction = (e: React.MouseEvent, action: string) => {
  e.preventDefault();
  e.stopPropagation();

  if (!id) return;

 
  const targetState = action === "fav" ? !lastFavRef.current : liked;

 const navCoords =
  props.coordinates ||
  data.coordinates ||
  data.geometry?.coordinates ||
  (props.lng != null && props.lat != null ? [props.lng, props.lat] : null) ||
  (props.longitude != null && props.latitude != null ? [props.longitude, props.latitude] : null) ||
  (data.lng != null && data.lat != null ? [data.lng, data.lat] : null) ||
  (data.longitude != null && data.latitude != null ? [data.longitude, data.latitude] : null);
const normalizedCoords = (() => {
  if (!Array.isArray(navCoords) || navCoords.length !== 2) return null;

  const a = Number(navCoords[0]);
  const b = Number(navCoords[1]);

  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  // ✅ Corrección lat/lng invertidos (España): lat ~ 40, lng ~ -3
  // Si viene [lat, lng] -> [40, -3], lo giramos.
  if (a > 30 && b < 0) return [b, a];

  return [a, b];
})();



  // 2. RECUPERACIÓN DE FOTOS (MEJORADA + SIN FOTOS FALSAS)
  let finalAlbum: string[] = [];

  if (Array.isArray(props.images) && props.images.length > 0) finalAlbum = props.images as any;
  else if (Array.isArray(data.images) && data.images.length > 0) finalAlbum = data.images as any;

  if (finalAlbum.length === 0) {
    if (props.mainImage) finalAlbum = [props.mainImage];
    else if (data.mainImage) finalAlbum = [data.mainImage];
    else if (img) finalAlbum = [img]; // si quieres 0 placeholders, deja `img` como null
  }

  finalAlbum = finalAlbum
    .map((i: any) => (typeof i === "string" ? i : i?.url || i))
    .filter(Boolean);

  const finalImg = finalAlbum[0] || null;

  // 3. PAQUETE DE DATOS (PRECIO FRESCO + IMAGEN LIMPIA)
  const payload = {
     ...data,
    id: String(id || ""),
    title: data?.title || props?.title || "",
    type: data?.type || props?.type || "Piso",

    // localización
    address: data?.address || props?.address || "",
   // ✅ coords completas para Vault/Details + server persistence
coordinates: normalizedCoords,
longitude: normalizedCoords ? normalizedCoords[0] : (data?.longitude ?? data?.lng ?? props?.longitude ?? props?.lng ?? null),
latitude:  normalizedCoords ? normalizedCoords[1] : (data?.latitude  ?? data?.lat ?? props?.latitude  ?? props?.lat ?? null),
lng:       normalizedCoords ? normalizedCoords[0] : (data?.lng ?? data?.longitude ?? props?.lng ?? props?.longitude ?? null),
lat:       normalizedCoords ? normalizedCoords[1] : (data?.lat ?? data?.latitude  ?? props?.lat ?? props?.latitude  ?? null),

// ✅ lo que Details necesita para no salir “roto”
selectedServices: selectedServices || [],
communityFees: data?.communityFees ?? props?.communityFees ?? 0,


    img: finalImg,
images: finalAlbum,

    // precio + básicos
    price: data?.price ?? props?.price ?? "",
    rooms: data?.rooms ?? props?.rooms ?? 0,
    baths: data?.baths ?? props?.baths ?? 0,
    mBuilt: data?.mBuilt ?? props?.mBuilt ?? "",

    // --- IMPORTANT: keep ownerSnapshot top-level (durable branding at creation time) ---
    ownerSnapshot: (data?.ownerSnapshot || (props as any)?.ownerSnapshot) ?? null,

    // ✅ Preferimos user “vivo” (DB) para que los edits del perfil se reflejen.
    //    Si no existe, caemos al snapshot.
    user: (() => {
      const snap = (data?.ownerSnapshot || (props as any)?.ownerSnapshot) ?? null;
      const live = (props?.user || data?.user) ?? null;

      const base =
        live && typeof live === "object"
          ? live
          : snap && typeof snap === "object"
          ? snap
          : null;

      if (!base) return null;

      return {
        ...base,
        role:
          (base as any)?.role ??
          (props as any)?.role ??
          (data as any)?.role ??
          (props as any)?.user?.role ??
          (data as any)?.user?.role ??
          null,
      };
    })(),

    // ✅ Compatibilidad extra (por si algún panel usa estos campos sueltos)
    userName:
      (props as any)?.userName ||
      (data as any)?.userName ||
      (props as any)?.user?.name ||
      (data as any)?.user?.name ||
      (data as any)?.ownerSnapshot?.companyName ||
      (data as any)?.ownerSnapshot?.name ||
      "Propietario",

    userAvatar:
      (props as any)?.userAvatar ||
      (data as any)?.userAvatar ||
      (props as any)?.user?.avatar ||
      (data as any)?.user?.avatar ||
      (data as any)?.ownerSnapshot?.companyLogo ||
      (data as any)?.ownerSnapshot?.avatar ||
      null,

    role:
      (props as any)?.role ||
      (data as any)?.role ||
      (props as any)?.user?.role ||
      (data as any)?.user?.role ||
      (data as any)?.ownerSnapshot?.role ||
      null,
  };

  /// 4. DISPARO DE SEÑALES (SIN ROMPER NADA)
if (action === "fav") {
  // ✅ Estado objetivo (siempre basado en la verdad estable)
  const next = !lastFavRef.current;

  // ✅ UI optimista + verdad local (SIN localStorage)
  lastFavRef.current = next;
  setLiked(next);

  if (typeof window !== "undefined") {
    // 1) Toggle favorito (server-side lo gestiona UIPanels)
    window.dispatchEvent(
      new CustomEvent("toggle-fav-signal", {
        detail: { ...payload, isFav: next }, // ✅ intención explícita
      })
    );

    // 2) ✅ Abrir Details SIEMPRE al pulsar el corazón
    window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));
    window.dispatchEvent(
      new CustomEvent("select-property-signal", { detail: { id: String(id) } })
    );
  }
  return;
}

if (action === "open") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));
    window.dispatchEvent(
      new CustomEvent("select-property-signal", { detail: { id: String(id) } })
    );
  }
}
};


  useEffect(() => {
    if (cardRef.current) {
        const marker = cardRef.current.closest('.mapboxgl-marker') as HTMLElement;
        if (marker) marker.style.zIndex = isHovered ? "99999" : "auto";
    }
  }, [isHovered]);

  const locationText = useMemo(() => {
     let txt = (city || location || address || "MADRID").toUpperCase();
     return txt.replace("PROVINCIA DE ", "").substring(0, 20);
  }, [city, location, address]);

  const isLandOrIndustrial = ['Suelo', 'Nave', 'Oficina', 'Land', 'Industrial'].includes(type) || type.toUpperCase().includes('SUELO');

  return (
    <div ref={cardRef} className="pointer-events-auto flex flex-col items-center group relative z-[50]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
     {/* TARJETA FLOTANTE (ESTILO APPLE/CUPERTINO) */}
      <div 
          className={`absolute bottom-[100%] pb-3 w-[280px] z-[100] origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} 
          onClick={(e) => handleAction(e, 'open')}
      >
          <div className="flex flex-col rounded-[20px] overflow-hidden shadow-2xl border border-white/80 cursor-pointer bg-white">
              <div className="bg-white relative">
                  <div className="h-44 relative overflow-hidden group/img">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" alt="Propiedad"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      
                      {/* TIPO + ICONO */}
                      <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full backdrop-blur-md bg-white/90 shadow-sm flex items-center gap-1.5 border border-white/40">
                          {getPropertyIcon(type)}
                          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-800">{type}</span>
                      </div>

                      {/* BADGE CATEGORIA DE PRECIO */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: style.hex }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span>
                      </div>
                      
                      {/* 🔥 BADGE DE PACK (RANGO) - DISEÑO PULIDO */}
                      {activePack && (
                         <div className={`absolute top-3 right-12 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border ${activePack.color} ${activePack.text} ${activePack.border}`}>
                            <activePack.icon size={10} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{activePack.label}</span>
                         </div>
                      )}

                      {/* FAVORITO */}
                      <div className="absolute top-3 right-3 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${liked ? 'bg-red-500 text-white border-transparent' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                              <Heart size={14} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>
                  
                  {/* INFO */}
                  <div className="p-4 pt-3">
                      <div className="flex justify-between items-start mb-0.5">
                          <span className="text-xl font-bold text-gray-900 tracking-tight">{displayLabel}</span>
                          {floor && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-500">
                                  <ArrowUp size={10}/> <span>P.{floor}</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500 mb-3">
                          <Navigation size={10} style={{ color: style.hex }}/>
                          <span className="text-[10px] font-medium uppercase tracking-wider truncate text-gray-400">{locationText}</span>
                      </div>

                      {/* DATOS FÍSICOS */}
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100/50">
                          {isLandOrIndustrial ? (
                              <div className="flex items-center gap-1.5 w-full justify-center">
                                  <Maximize2 size={14} className="text-gray-400"/>
                                  <span className="text-xs font-semibold text-gray-700">{mBuilt} m²</span>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-1.5"><Bed size={14} className="text-gray-400"/><span className="text-xs font-semibold text-gray-700">{rooms}</span></div>
                                  <div className="w-[1px] h-3 bg-gray-200"></div>
                                  <div className="flex items-center gap-1.5"><Bath size={14} className="text-gray-400"/><span className="text-xs font-semibold text-gray-700">{baths}</span></div>
                                  <div className="w-[1px] h-3 bg-gray-200"></div>
                                  <div className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gray-400"/><span className="text-xs font-semibold text-gray-700">{mBuilt}m</span></div>
                              </>
                          )}
                      </div>
                  </div>
                  
                  {/* BARRA INFERIOR DE PACK (Solo si es ELITE o similar) */}
                  {activePack && (activePack.label === 'ELITE' || activePack.label === 'GOD MODE') && (
                      <div className={`h-1 w-full ${activePack.color}`}></div>
                  )}
              </div>
          </div>
      </div>

     {/* PIN DE MAPA (MINIMALISTA) */}
      <div 
         className={`relative px-3 py-1.5 rounded-full shadow-lg transition-transform duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer border-[2px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-xl' : 'scale-100'}`} 
         style={{ backgroundColor: style.hex }} 
         onClick={(e) => handleAction(e, 'open')}
      >
         <span className="text-xs font-bold font-sans tracking-tight whitespace-nowrap text-white">{displayLabel}</span>
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: style.hex }}></div>
      </div>
    </div>
  );
}

// FUERZA BRUTA V1 - CAMBIO OBLIGATORIO