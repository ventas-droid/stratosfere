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
    };

    window.addEventListener("sync-property-state", onSync as EventListener);
    return () => window.removeEventListener("sync-property-state", onSync as EventListener);
  }, [id, props?.isFav, data?.isFav]);

  // GESTOR DE ACCIONES
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    // Coordenadas
    const navCoords = props.coordinates || data.coordinates || data.geometry?.coordinates ||
      (props.lng != null && props.lat != null ? [props.lng, props.lat] : null) ||
      (data.lng != null && data.lat != null ? [data.lng, data.lat] : null);
    
    let normalizedCoords = null;
    if (Array.isArray(navCoords) && navCoords.length === 2) {
      const a = Number(navCoords[0]), b = Number(navCoords[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) {
         normalizedCoords = (a > 30 && b < 0) ? [b, a] : [a, b];
      }
    }

    // Imagen final
    let finalAlbum: string[] = [];
    if (Array.isArray(props.images) && props.images.length > 0) finalAlbum = props.images as any;
    else if (Array.isArray(data.images) && data.images.length > 0) finalAlbum = data.images as any;
    if (finalAlbum.length === 0) {
      if (props.mainImage) finalAlbum = [props.mainImage];
      else if (data.mainImage) finalAlbum = [data.mainImage];
      else if (img) finalAlbum = [img];
    }
    finalAlbum = finalAlbum.map((i: any) => (typeof i === "string" ? i : i?.url || i)).filter(Boolean);

    // Payload (Datos que viajan al abrir la carta)
    const payload = {
      ...data,
      id: String(id),
      refCode: data?.refCode ?? props?.refCode ?? null,
      title: data?.title || props?.title || "",
      type: data?.type || props?.type || "Piso",
      address: data?.address || props?.address || "",
      coordinates: normalizedCoords,
      longitude: normalizedCoords ? normalizedCoords[0] : null,
      latitude: normalizedCoords ? normalizedCoords[1] : null,
      selectedServices: selectedServices,
      img: finalAlbum[0] || null,
      images: finalAlbum,
      price: currentPrice,
      user: data?.user || props?.user || null,
      promotedTier: isPremium ? 'PREMIUM' : undefined
    };

    if (action === "fav") {
      const next = !lastFavRef.current;
      lastFavRef.current = next;
      setLiked(next);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("toggle-fav-signal", { detail: { ...payload, isFav: next } }));
        window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));
        window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(id) } }));
      }
      return;
    }

    if (action === "open") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));
        window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(id) } }));
      }
    }
  };

  // Z-Index Hover
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

  // ============================================
  // RENDERIZADO VISUAL
  // ============================================
  return (
    <div ref={cardRef} className={`pointer-events-auto flex flex-col items-center group relative ${isPremium ? 'z-[100] scale-110' : 'z-[50]'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
      {/* TARJETA FLOTANTE */}
      <div 
          className={`absolute bottom-[100%] pb-3 w-[280px] z-[100] origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} 
          onClick={(e) => handleAction(e, 'open')}
      >
          {/* CONTENEDOR (CAMBIA A DORADO SI ES PREMIUM) */}
          <div className={`flex flex-col rounded-[20px] overflow-hidden cursor-pointer bg-white transition-all duration-300 ${isPremium ? 'shadow-[0_0_50px_rgba(251,191,36,0.6)] border-2 border-amber-400' : 'shadow-2xl border border-white/80'}`}>
              
              <div className="bg-white relative">
                  <div className="h-44 relative overflow-hidden group/img">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" alt="Propiedad"/>
                      
                      {/* EFECTO DESTELLO (SOLO PREMIUM) */}
                      {isPremium && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-white/30 pointer-events-none mix-blend-overlay"></div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      
                      {/* BADGE TIPO (Si es Premium -> Corona. Si no -> Icono Normal) */}
                      <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full backdrop-blur-md bg-white/90 shadow-sm flex items-center gap-1.5 border border-white/40">
                          {isPremium ? (
                              <>
                                <Crown size={12} className="text-amber-600 fill-amber-500 animate-pulse"/>
                                <span className="text-[10px] font-black uppercase tracking-wide text-amber-700">PREMIUM</span>
                              </>
                          ) : (
                              <>
                                {getPropertyIcon(type)}
                                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-800">{type}</span>
                              </>
                          )}
                      </div>

                      {/* BADGE PRECIO */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: style.hex }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span>
                      </div>
                      
                      {/* FAVORITO */}
                      <div className="absolute top-3 right-3 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${liked ? 'bg-red-500 text-white border-transparent' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                              <Heart size={14} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>
                  
                  {/* INFO PROPIEDAD */}
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

                      {/* DATOS FÍSICOS (Habitaciones / Baños) */}
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
                  
                  {/* (AQUÍ BORRAMOS EL ERROR: Ya no hay barra de 'Elite Pack') */}
              </div>
          </div>
      </div>

     {/* PIN DE MAPA (CON ONDAS SI ES PREMIUM) */}
      <div 
         className={`relative px-3 py-1.5 rounded-full shadow-lg transition-transform duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer border-[2px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-xl' : 'scale-100'} ${isPremium ? 'bg-amber-500 border-amber-200' : ''}`} 
         style={{ backgroundColor: isPremium ? '#F59E0B' : style.hex }} 
         onClick={(e) => handleAction(e, 'open')}
      >
         {/* ONDAS DE RADAR (SOLO PREMIUM) */}
         {isPremium && (
            <>
                <span className="absolute inset-0 rounded-full border-2 border-amber-500 opacity-75 animate-ping"></span>
            </>
         )}

         <span className="text-xs font-bold font-sans tracking-tight whitespace-nowrap text-white">{displayLabel}</span>
         
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: isPremium ? '#F59E0B' : style.hex }}></div>
      </div>
    </div>
  );
}