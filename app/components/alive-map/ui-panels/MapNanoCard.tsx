"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart, Bed, Bath, Maximize2, Navigation,
  Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp,
  Crown // Solo dejamos la Corona para el Premium
} from 'lucide-react';

// ------------------------------------------------------------------
// 1. MOTOR DE PARSEO DE PRECIO (NO TOCAR)
// ------------------------------------------------------------------
const safeParsePrice = (
  inputVal: number | string | null | undefined,
  inputString?: string | null | number
): number => {
  let valToParse = inputString;
  if (valToParse === undefined || valToParse === null || valToParse === "") {
      if (inputVal === undefined || inputVal === null) return 0;
      valToParse = inputVal;
  }
  let str = String(valToParse);
  str = str.toUpperCase().trim().replace(/\s/g, "").replace(/€/g, "");

  let multiplier = 1;
  let hasSuffix = false;

  if (str.includes("M") || str.includes("K")) {
      hasSuffix = true;
      if (str.includes("M")) multiplier = 1_000_000;
      if (str.includes("K")) multiplier = 1_000;
      str = str.replace(/[MK]/g, "");
  }

  if (hasSuffix) {
      str = str.replace(/,/g, ".");
  } else {
      str = str.replace(/,/g, "DECIMAL_PLACEHOLDER")
               .replace(/\./g, "")
               .replace("DECIMAL_PLACEHOLDER", ".");
  }

  str = str.replace(/[^\d.]/g, "");
  const val = parseFloat(str);
  return (Number.isFinite(val) ? val : 0) * multiplier;
};

// 2. MOTOR DE ESTILO DE PRECIO (COLORES IOS)
const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#8E8E93", text: "white", label: "PENDING" };
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "RENT" };
  if (price < 200000)     return { hex: "#30B0C7", text: "white", label: "INVEST" };
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPPORTUNITY" };
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" };
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUXURY" };
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVE" };
};

// 3. ICONOS POR TIPO DE PROPIEDAD
const getPropertyIcon = (typeStr: string) => {
    const t = (typeStr || "").toUpperCase();
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function MapNanoCard(props: any) {
  const data = props.data || {};

  // 🔥 1. DETECCIÓN PREMIUM: ESTADO VIVO (REACTIVO)
  const [isPremium, setIsPremium] = useState(() => {
      return data?.promotedTier === 'PREMIUM' ||
             data?.isPromoted === true ||
             props?.promotedTier === 'PREMIUM' ||
             props?.isPromoted === true;
  });

  // ID ESTABLE (NO TOCAR)
  const id = useMemo(() => {
    const raw = props?.id ?? data?.propertyId ?? data?.id ?? data?._id ?? data?.property?.id ?? data?.property?.propertyId;
    return raw ? String(raw) : null;
  }, [props?.id, data?.id, data?._id, data?.propertyId, data?.property?.id]);

  // Datos Básicos
  const rooms = props.rooms ?? data.rooms ?? 0;
  const baths = props.baths ?? data.baths ?? 0;
  const mBuilt = props.mBuilt || data.mBuilt || props.surface || data.surface || props.m2 || data.m2 || 0;
  const type = props.type || data.type || "Propiedad";

 const b2bData = useMemo(() => {
    // 1. Buscamos en la raíz del objeto
    let b = data?.b2b || props?.b2b;
    
    if (!b) {
      // 2. Si no está, lo fabricamos desde la campaña activa (Lógica Portfolio)
      const ac = data?.activeCampaign || props?.activeCampaign;
      if (ac) {
        b = {
          sharePct: Number(ac.commissionSharePct || 0),
          visibility: ac.commissionShareVisibility || 'PRIVATE'
        };
      } else {
        // 3. Fallback a campos sueltos
        const share = data?.sharePct ?? props?.sharePct ?? 0;
        b = {
          sharePct: Number(share),
          visibility: data?.shareVisibility ?? props?.shareVisibility ?? 'PRIVATE'
        };
      }
    }
    return b;
  }, [data, props]);

  // Compatibilidad con selectedServices (vacío para no romper nada)
  const selectedServices = props.selectedServices || data.selectedServices || [];

  // Imagen
  const img =
    (Array.isArray(props.images) && props.images.length > 0 ? props.images[0] : null) ||
    (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null) ||
    props.img || props.image || data.img ||
    "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  const city = props.city || data.city;
  const location = props.location || data.location;
  const address = props.address || data.address;
  const floor = props.floor || data.floor;

  // Precio Vivo
  const rawPriceInput = props.rawPrice ?? data?.rawPrice ?? props.priceValue;
  const stringPriceInput = props.price ?? data?.price;
  const [currentPrice, setCurrentPrice] = useState(() => safeParsePrice(rawPriceInput, stringPriceInput));

  // 🔥 2. ANTENA DE SEÑALES UNIFICADA (PRECIO + PREMIUM)
  useEffect(() => {
    const handleUpdate = (e: any) => {
      // Filtrar señal para esta propiedad
      if (String(e.detail.id) === String(id) && e.detail.updates) {
        const u = e.detail.updates;

        // A) Actualizar Precio
        if (u.price || u.rawPrice || u.priceValue) {
          const newP = safeParsePrice(u.rawPrice ?? u.priceValue, u.price);
          setCurrentPrice(newP);
        }

        // B) Actualizar Modo Premium
        if (u.promotedTier || u.isPromoted !== undefined) {
            const newPremium = u.promotedTier === 'PREMIUM' || u.isPromoted === true;
            setIsPremium(newPremium);
        }
      }
    };

    if (typeof window !== "undefined") window.addEventListener("update-property-signal", handleUpdate);
    return () => { if (typeof window !== "undefined") window.removeEventListener("update-property-signal", handleUpdate); };
  }, [id]);

  const displayLabel = useMemo(() => {
    if (currentPrice === 0) return "Consultar";
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(currentPrice);
  }, [currentPrice]);

  const style = getPriceStyle(currentPrice);

  // Estado Favorito
  const [liked, setLiked] = useState(false);
  const lastFavRef = useRef<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
    if (!id || typeof window === "undefined") return;
    const initial = !!(props?.isFav ?? props?.isFavorited ?? data?.isFav ?? data?.isFavorited);
    lastFavRef.current = initial;
    setLiked(initial);

    const onSync = (e: any) => {
      if (String(e?.detail?.id) !== String(id)) return;
      const next = !!e.detail.isFav;
      lastFavRef.current = next;
      setLiked(next);

      // 🔥 PERSISTENCIA: Si el sistema limpia el B2B, lo re-inyectamos desde el useMemo
      if (next && !e.detail.b2b) {
         e.detail.b2b = b2bData;
      }
    };

    window.addEventListener("sync-property-state", onSync as EventListener);
    return () => window.removeEventListener("sync-property-state", onSync as EventListener);
  }, [id, props?.isFav, data?.isFav, b2bData]);

  // GESTOR DE ACCIONES (VERSIÓN FINAL BLINDADA)
const handleAction = (e: React.MouseEvent, action: string) => {
  e.preventDefault();
  e.stopPropagation();
  if (!id) return;

  // 1. COORDINADAS: Extracción y Normalización [Lng, Lat]
  const navCoords = props.coordinates || data.coordinates || data.geometry?.coordinates ||
    (props.lng != null && props.lat != null ? [props.lng, props.lat] : null) ||
    (data.lng != null && data.lat != null ? [data.lng, data.lat] : null);

  let normalizedCoords = null;
  if (Array.isArray(navCoords) && navCoords.length === 2) {
    const a = Number(navCoords[0]), b = Number(navCoords[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      // Lógica de giro para España (Si el primer valor > 30, es la Latitud y debe ir segundo)
      normalizedCoords = (a > 30 && b < 0) ? [b, a] : [a, b];
    }
  }

  // 2. ÁLBUM DE IMÁGENES: Construcción del array final
  let finalAlbum: string[] = [];
  const sourceImages = Array.isArray(props.images) && props.images.length > 0 ? props.images : 
                       Array.isArray(data.images) && data.images.length > 0 ? data.images : [];
  
  if (sourceImages.length > 0) {
    finalAlbum = sourceImages.map((i: any) => (typeof i === "string" ? i : i?.url || i)).filter(Boolean);
  } else {
    const backupImg = props.mainImage || data.mainImage || img;
    if (backupImg) finalAlbum = [backupImg];
  }

  // 3. RECONSTRUCCIÓN B2B: Datos críticos para la NanoCard
  let b2bData = data?.b2b || props?.b2b;
  if (!b2bData) {
    const ac = data?.activeCampaign || props?.activeCampaign;
    if (ac) {
      b2bData = {
        sharePct: Number(ac.commissionSharePct || 0),
        visibility: ac.commissionShareVisibility || 'PRIVATE'
      };
    } else {
      const share = data?.sharePct ?? props?.sharePct ?? 0;
      b2bData = {
        sharePct: Number(share),
        visibility: data?.shareVisibility ?? props?.shareVisibility ?? 'PRIVATE'
      };
    }
  }

  // 4. PAYLOAD RICO: El paquete de datos unificado
    const payload = {
      ...data,
      ...props, 
      id: String(id),
      refCode: data?.refCode ?? props?.refCode ?? null,
      title: data?.title || props?.title || "Propiedad",
      type: data?.type || props?.type || "Inmueble",
      address: data?.address || props?.address || "",
      coordinates: normalizedCoords,
      longitude: normalizedCoords ? normalizedCoords[0] : null,
      latitude: normalizedCoords ? normalizedCoords[1] : null,
      img: finalAlbum[0] || null,
      images: finalAlbum,
      price: currentPrice,
      user: data?.user || props?.user || null,
      promotedTier: isPremium ? 'PREMIUM' : undefined,
      b2b: b2bData, // <--- Ahora usa el b2bData global del paso 1
      activeCampaign: data?.activeCampaign || props?.activeCampaign,
      openHouse: props.openHouse || data.openHouse || data.open_house_data || null
    };

  // --- EJECUCIÓN DE ACCIONES (CORREGIDO Y BLINDADO) ---
  if (typeof window !== "undefined") {
    
    // 0. PREPARACIÓN DEL COMBUSTIBLE (Inyección de persistencia)
    // Extraemos el B2B del componente para que no dependa del estado del payload
    const b2bToTransmit = payload.b2b || b2bData;
    const ohToTransmit = payload.openHouse || (data?.openHouses && data.openHouses[0]) || null;

    // CASO A: FAVORITO (Toggle + Abrir + Volar)
    if (action === "fav") {
      const next = !liked; 
      setLiked(next);
      if (lastFavRef) lastFavRef.current = next;

      // 1. Sincronizar Base de Datos
      // Enviamos copia profunda para evitar que el receptor mutara el objeto original
      window.dispatchEvent(new CustomEvent("toggle-fav-signal", { 
        detail: { ...payload, isFav: next, b2b: b2bToTransmit } 
      }));
      
      // 2. Transmisión a Details (La ficha lateral)
      // 🔥 REPARACIÓN: Forzamos la reinyección del B2B y OpenHouse aquí mismo
      window.dispatchEvent(new CustomEvent("open-details-signal", { 
        detail: { ...payload, isFav: next, b2b: b2bToTransmit, openHouse: ohToTransmit } 
      }));
      
      // 3. Ejecución de Vuelo Táctico
      if (normalizedCoords) {
        window.dispatchEvent(new CustomEvent('fly-to-location', { 
          detail: { 
            center: normalizedCoords, 
            zoom: 18.5, 
            pitch: 60, 
            duration: 1500 
          } 
        }));
      }
    }

    // CASO B: ABRIR (Click normal en Pin o NanoCard)
    if (action === "open") {
      // Notificamos qué ID está bajo el foco
      window.dispatchEvent(new CustomEvent("select-property-signal", { 
        detail: { id: String(id) } 
      }));

      // Abrimos ficha lateral con el paquete de datos blindado
      window.dispatchEvent(new CustomEvent("open-details-signal", { 
        detail: { ...payload, b2b: b2bToTransmit, openHouse: ohToTransmit } 
      }));
      
      // 🔥 Vuelo habilitado por defecto para asegurar sincronización visual
      if (normalizedCoords) {
        window.dispatchEvent(new CustomEvent('fly-to-location', { 
          detail: { 
            center: normalizedCoords, 
            zoom: 18.5, 
            pitch: 60, 
            duration: 1500 
          } 
        }));
      }
    }
  }
};
  // Z-Index Hover
  useEffect(() => {
    if (cardRef.current) {
        const marker = cardRef.current.closest('.mapboxgl-marker') as HTMLElement;
        if (marker) marker.style.zIndex = isHovered || isPremium ? "99999" : "auto";
    }
  }, [isHovered, isPremium]);

  const locationText = useMemo(() => {
     let txt = (city || location || address || "MADRID").toUpperCase();
     return txt.replace("PROVINCIA DE ", "").substring(0, 20);
  }, [city, location, address]);

  const isLandOrIndustrial = ['Suelo', 'Nave', 'Oficina', 'Land', 'Industrial'].includes(type) || type.toUpperCase().includes('SUELO');

  // ============================================
  // RENDERIZADO VISUAL (MEGA-PREMIUM)
  // ============================================
  return (
    <div ref={cardRef} className={`pointer-events-auto flex flex-col items-center group relative ${isPremium ? 'z-[200]' : 'z-[50]'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>

      {/* TARJETA FLOTANTE (COLOSAL SI ES PREMIUM) */}
      <div
          className={`absolute bottom-[100%] pb-5 origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isPremium ? 'w-[500px] z-[250]' : 'w-[280px] z-[100]'} ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}
          onClick={(e) => handleAction(e, 'open')}
      >
          {/* CONTENEDOR (BORDE ORO MACIZO) */}
          <div className={`flex flex-col rounded-[24px] overflow-hidden cursor-pointer bg-white transition-all duration-300 ${isPremium ? 'shadow-[0_0_60px_rgba(251,191,36,0.7)] border-4 border-amber-400' : 'shadow-2xl border border-white/80'}`}>

              <div className="relative">
                  {/* IMAGEN PANORÁMICA ALTÍSIMA */}
                  <div className={`relative overflow-hidden group/img ${isPremium ? 'h-80' : 'h-44'}`}>
                      <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105" alt="Propiedad"/>

                      {/* EFECTO DESTELLO ORO */}
                      {isPremium && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-transparent to-white/40 pointer-events-none mix-blend-overlay"></div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>

                      {/* BADGE TIPO (CORONA PULSANTE) */}
                      <div className="absolute top-4 left-4 px-3 py-2 rounded-full backdrop-blur-xl bg-white/95 shadow-lg flex items-center gap-2 border-2 border-white/50">
                          {isPremium ? (
                              <>
                                <Crown size={14} className="text-amber-600 fill-amber-500 animate-pulse"/>
                                <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">PREMIUM</span>
                              </>
                          ) : (
                              <>
                                {getPropertyIcon(type)}
                                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-800">{type}</span>
                              </>
                          )}
                      </div>

                      {/* BADGE PRECIO (Solo en normal) */}
                      {!isPremium && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: style.hex }}>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span>
                        </div>
                      )}

                      {/* FAVORITO */}
                      <div className="absolute top-4 right-4 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${liked ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white border-white/30 hover:bg-black/50'}`}>
                              <Heart size={18} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>

                  {/* INFO PROPIEDAD (FONDO DEGRADADO PREMIUM) */}
                  <div className={`p-6 pt-5 ${isPremium ? 'bg-gradient-to-b from-[#FFFBEB] to-white' : 'bg-white'}`}>
                      {/* TÍTULO Y PRECIO GIGANTE */}
                      <div className="mb-2">
                          {isPremium && data?.title && (
                              <h3 className="text-xl font-black text-gray-900 truncate mb-1">{data.title}</h3>
                          )}
                          <div className="flex justify-between items-start items-center">
                              <span className={`font-black tracking-tight leading-none ${isPremium ? 'text-4xl text-amber-600 drop-shadow-sm' : 'text-xl text-gray-900'}`}>{displayLabel}</span>
                              {floor && (
                                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                      <ArrowUp size={12}/> <span>P.{floor}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-500 mb-5">
                          <Navigation size={12} style={{ color: style.hex }}/>
                          <span className="text-xs font-bold uppercase tracking-wider truncate text-gray-500">{locationText}</span>
                      </div>

                      {/* DATOS FÍSICOS (Diseño más limpio) */}
                      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                          {isLandOrIndustrial ? (
                              <div className="flex items-center gap-2 w-full justify-center text-gray-700">
                                  <Maximize2 size={18} className="text-gray-400"/>
                                  <span className="text-sm font-bold">{mBuilt} m²</span>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-2 text-gray-700"><Bed size={18} className="text-gray-400"/><span className="text-sm font-bold">{rooms}</span></div>
                                  <div className="w-px h-5 bg-gray-200"></div>
                                  <div className="flex items-center gap-2 text-gray-700"><Bath size={18} className="text-gray-400"/><span className="text-sm font-bold">{baths}</span></div>
                                  <div className="w-px h-5 bg-gray-200"></div>
                                  <div className="flex items-center gap-2 text-gray-700"><Maximize2 size={18} className="text-gray-400"/><span className="text-sm font-bold">{mBuilt}m²</span></div>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>

     {/* PIN DE MAPA (GIGANTE SI ES PREMIUM) */}
      <div
         className={`relative rounded-full shadow-lg transition-all duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer border-[3px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-2xl' : 'scale-100'} ${isPremium ? 'bg-amber-500 border-amber-200 scale-[1.75] z-[200] px-5 py-2.5' : 'px-3 py-1.5'}`}
         style={{ backgroundColor: isPremium ? '#F59E0B' : style.hex }}
         onClick={(e) => handleAction(e, 'open')}
      >
         {/* ONDAS DE RADAR (SOLO PREMIUM) */}
         {isPremium && (
            <>
                <span className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-60 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="absolute inset-0 rounded-full border-2 border-amber-300 opacity-80 animate-pulse"></span>
            </>
         )}

         <span className={`${isPremium ? 'text-sm' : 'text-xs'} font-black font-sans tracking-tight whitespace-nowrap text-white`}>{displayLabel}</span>

         {/* FLECHA INFERIOR MAS GRANDE */}
         <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent ${isPremium ? '-bottom-2.5 border-l-[10px] border-r-[10px] border-t-[12px]' : '-bottom-1.5 border-l-[6px] border-r-[6px] border-t-[8px]'}`} style={{ borderTopColor: isPremium ? '#F59E0B' : style.hex }}></div>
      </div>
    </div>
  );
}