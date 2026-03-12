// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Bed, Bath, Maximize2, Navigation, Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp, Crown } from 'lucide-react';
import Image from 'next/image';
import { getPropertyByIdAction } from '@/app/actions';
import { optimizeStratosImage } from '@/app/utils/imageOptimizer';
// ------------------------------------------------------------------
// 1. MOTORES DE PARSEO (NO TOCAR)
// ------------------------------------------------------------------
const safeParsePrice = (inputVal: any, inputString?: any): number => {
  let valToParse = inputString;
  if (valToParse === undefined || valToParse === null || valToParse === "") {
      if (inputVal === undefined || inputVal === null) return 0;
      valToParse = inputVal;
  }
  let str = String(valToParse).toUpperCase().trim().replace(/\s/g, "").replace(/€/g, "");
  let multiplier = 1; let hasSuffix = false;
  if (str.includes("M") || str.includes("K")) {
      hasSuffix = true;
      if (str.includes("M")) multiplier = 1_000_000;
      if (str.includes("K")) multiplier = 1_000;
      str = str.replace(/[MK]/g, "");
  }
  if (hasSuffix) str = str.replace(/,/g, ".");
  else str = str.replace(/,/g, "DEC").replace(/\./g, "").replace("DEC", ".");
  const val = parseFloat(str.replace(/[^\d.]/g, ""));
  return (Number.isFinite(val) ? val : 0) * multiplier;
};

const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#8E8E93", text: "white", label: "PENDING" };
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "RENT" };
  if (price < 200000)     return { hex: "#30B0C7", text: "white", label: "INVEST" };
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPPORTUNITY" };
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" };
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUXURY" };
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVE" };
};

const getPropertyIcon = (typeStr: string) => {
    const t = (typeStr || "").toUpperCase();
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION") || t.includes("BUNGALOW")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("DUPLEX") || t.includes("DÚPLEX") || t.includes("LOFT")) return <Maximize2 size={14} className="text-purple-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO") || t.includes("LAND")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE") || t.includes("INDUSTRIAL")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>;
};

// ==========================================
// COMPONENTE PRINCIPAL BLINDADO
// ==========================================
export default function MapNanoCard(props: any) {
  
  const [liveData, setLiveData] = useState(() => ({ ...props.data, ...props }));
  const id = useMemo(() => String(liveData.id ?? liveData.propertyId ?? liveData._id ?? Date.now()), [liveData]);

  const parseJsonSafe = (val: any) => {
      if (typeof val === 'string') { try { return JSON.parse(val); } catch(e) { return null; } }
      return val;
  };

  // 🔥 RESTAURAMOS EL PRECIO (Que se había borrado por accidente)
  const [currentPrice, setCurrentPrice] = useState(() => safeParsePrice(liveData.rawPrice ?? liveData.priceValue, liveData.price));
  
  // 🔥 ESTADOS PREMIUM Y FUEGO
  const [isPremium, setIsPremium] = useState(() => liveData.isPremium === true || liveData.promotedTier === 'PREMIUM' || liveData.isPromoted === true);
  const [isFire, setIsFire] = useState(() => liveData.isFire === true);
  
  const rooms = Number(liveData.rooms ?? 0);
  const baths = Number(liveData.baths ?? 0);
  const mBuilt = liveData.mBuilt || liveData.surface || liveData.m2 || 0;
  const type = liveData.type || "Propiedad";
  const floor = liveData.floor;

  // B2B Dinámico
  const b2bData = useMemo(() => {
    let b = parseJsonSafe(liveData.b2b);
    if (!b) {
      const ac = parseJsonSafe(liveData.activeCampaign);
      if (ac) b = { sharePct: Number(ac.commissionSharePct || 0), visibility: ac.commissionShareVisibility || 'PRIVATE' };
      else b = { sharePct: Number(liveData.sharePct ?? 0), visibility: liveData.shareVisibility ?? 'PRIVATE' };
    }
    return b;
  }, [liveData]);

  // Imágenes
  let finalAlbum: string[] = [];
  const sourceImages = parseJsonSafe(liveData.images);
  if (Array.isArray(sourceImages) && sourceImages.length > 0) {
    finalAlbum = sourceImages.map((i: any) => (typeof i === "string" ? i : i?.url || i)).filter(Boolean);
  } else {
    const backupImg = liveData.mainImage || liveData.img || liveData.image;
    if (backupImg) finalAlbum = [backupImg];
  }
// 🔥 Inyectamos la IA en la imagen principal de la tarjeta
  const img = optimizeStratosImage(finalAlbum[0]) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
  // 📡 Antena de Comunicaciones (BLINDADA)
  useEffect(() => {
    const handleUpdate = (e: any) => {
      // 🛡️ Blindaje anti-crashes: si la señal llega vacía, la ignoramos
      if (!e || !e.detail) return;

      if (String(e.detail.id) === String(id) && e.detail.updates) {
        const u = e.detail.updates;
        
        // 1. Actualizamos los datos generales
        setLiveData((prev: any) => ({ ...prev, ...u }));
        
        // 2. Actualizamos el precio si ha cambiado
        if (u.price !== undefined || u.rawPrice !== undefined || u.priceValue !== undefined) {
            setCurrentPrice(safeParsePrice(u.rawPrice ?? u.priceValue, u.price));
        }
        
        // 🔥 3. Actualizamos los nuevos estados de Premium y Fuego
        if (u.isPremium !== undefined || u.promotedTier !== undefined || u.isPromoted !== undefined) {
            setIsPremium(u.isPremium === true || u.promotedTier === 'PREMIUM' || u.isPromoted === true);
        }
        if (u.isFire !== undefined) {
            setIsFire(u.isFire === true);
        }
      }
    };

    // Conectamos la antena usando "as EventListener" para que TypeScript no se queje
    if (typeof window !== "undefined") {
        window.addEventListener("update-property-signal", handleUpdate as EventListener);
    }
    
    // Apagamos la antena al desmontar
    return () => { 
        if (typeof window !== "undefined") {
            window.removeEventListener("update-property-signal", handleUpdate as EventListener); 
        }
    };
  }, [id]);

  const style = getPriceStyle(currentPrice);
  const displayLabel = currentPrice === 0 ? "Consultar" : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(currentPrice);

  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLiked(!!(liveData.isFav ?? liveData.isFavorited));
    const onSync = (e: any) => {
      if (String(e?.detail?.id) === String(id)) {
        setLiked(!!e.detail.isFav);
      }
    };
    window.addEventListener("sync-property-state", onSync as EventListener);
    return () => window.removeEventListener("sync-property-state", onSync as EventListener);
  }, [id, liveData.isFav, liveData.isFavorited]);

 // 🔥 4. DISPARADOR DE ACCIONES (LA MALETA PURA Y LA APERTURA DIRECTA)
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!id) return;

    let normalizedCoords = null;
    const navCoords = liveData.coordinates || liveData.geometry?.coordinates || [liveData.lng, liveData.lat];
    if (Array.isArray(navCoords) && navCoords.length === 2 && navCoords[0] != null) {
      normalizedCoords = (navCoords[0] > 30 && navCoords[1] < 0) ? [navCoords[1], navCoords[0]] : [navCoords[0], navCoords[1]];
    }

    const parsedCampaigns = parseJsonSafe(liveData.campaigns);
    const safeActiveCampaign = parseJsonSafe(liveData.activeCampaign) || (Array.isArray(parsedCampaigns) ? parsedCampaigns[0] : null);

    const parsedOpenHouses = parseJsonSafe(liveData.openHouses);
    const safeOpenHouse = parseJsonSafe(liveData.openHouse) || parseJsonSafe(liveData.open_house_data) || (Array.isArray(parsedOpenHouses) ? parsedOpenHouses[0] : null);

    let finalUser = parseJsonSafe(liveData.user) || parseJsonSafe(liveData.ownerSnapshot) || {};
    
    if (safeActiveCampaign && safeActiveCampaign.status === 'ACCEPTED' && safeActiveCampaign.agency) {
        const agency = safeActiveCampaign.agency;
        finalUser = {
            ...agency,
            id: agency.id,
            name: agency.companyName || agency.name || "Agencia Asociada",
            role: "AGENCIA",
            avatar: agency.companyLogo || agency.avatar || null,
            email: agency.email,
            phone: agency.mobile || agency.phone,
            mobile: agency.mobile,
            coverImage: agency.coverImage || null,
            companyName: agency.companyName,
            licenseNumber: agency.licenseNumber,
            website: agency.website
        };
    }

    // 🧳 LA MALETA PURA (Cero lavadoras, datos crudos directos al Panel)
    const payload = {
      ...liveData,
      id: String(id),
      
      // 🔥 DATOS FÍSICOS PUROS (Si no existen, viajan como null o texto por defecto, sin romper nada)
    // 🔥 DATOS FÍSICOS PUROS (Todo a null si no existe, el panel ya lo gestionará)
    address: liveData.address || null,
      city: liveData.city || null,
      postcode: liveData.postcode || null,
      region: liveData.region || null,
      
      images: finalAlbum,
      // 🔥 Mandamos la foto con IA directamente al HoloInspector
      img: optimizeStratosImage(finalAlbum[0]) || null,
      price: currentPrice,
      priceValue: currentPrice,
      b2b: b2bData,
      user: finalUser, 
      realOwner: parseJsonSafe(liveData.user), 
      openHouse: safeOpenHouse, 
      open_house_data: safeOpenHouse,
      activeCampaign: safeActiveCampaign, 
      promotedTier: isPremium ? 'PREMIUM' : undefined
    };

    // ❤️ FAVORITOS
    if (action === "fav") {
      const next = !liked; 
      setLiked(next);
      window.dispatchEvent(new CustomEvent("toggle-fav-signal", { detail: { ...payload, isFav: next, isFavorite: next, isFavorited: next } }));
      window.dispatchEvent(new CustomEvent("update-property-signal", { detail: { id: String(id), updates: { isFav: next, isFavorite: next, isFavorited: next } } }));
      window.dispatchEvent(new CustomEvent("fav-change-signal", { detail: { id: String(id), isFavorite: next } }));
    }

    // 🚀 ABRIR PANEL (Cero bloqueos)
    if (action === "open") {
      const strId = String(id);
      
      // 1. Iluminamos el pin en el mapa
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: strId } }));
      
      // 2. 📡 DISPARO DIRECTO: Forzamos la variable de memoria y mandamos la maleta
      (window as any).__currentOpenPropertyId = strId;
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));

      // 3. Vuelo suave
      if (normalizedCoords) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('fly-to-location', { detail: { center: normalizedCoords, zoom: 18.5, pitch: 60, duration: 1500 } }));
        }, 150);
      }
    }
  }; // <-- CIERRE EXACTO DE LA FUNCIÓN handleAction
 
  // 🔥 Z-INDEX TÁCTICO: El Fuego está encima, pero el ratón siempre manda.
  useEffect(() => {
    if (cardRef.current) {
        const marker = cardRef.current.closest('.mapboxgl-marker') as HTMLElement;
        if (marker) {
            // Si tiene el ratón encima: MÁXIMA PRIORIDAD (99999)
            // Si es Fuego: ALTA PRIORIDAD (9999)
            // Si es normal: PRIORIDAD BASE (1)
            marker.style.zIndex = isHovered ? "99999" : (isFire ? "9999" : "1");
        }
    }
  }, [isHovered, isFire]);

// 🏷️ EL TEXTO DE LA TARJETA (Directo de la base de datos)
  const locationText = String(liveData.address || liveData.city || "UBICACIÓN PRIVADA").toUpperCase();
  
  // 🔥 CORRECCIÓN DEL BUG DE HABITACIONES OCULTAS
  // Si tiene habitaciones O baños, NO las ocultamos nunca.
  const isLandOrIndustrial = ['Suelo', 'Nave', 'Oficina', 'Land', 'Industrial'].includes(type) || type.toUpperCase().includes('SUELO');
  const hasRoomsOrBaths = rooms > 0 || baths > 0;
  const showOnlyM2 = isLandOrIndustrial && !hasRoomsOrBaths;

  return (
    <div ref={cardRef} className={`pointer-events-auto flex flex-col items-center group relative ${isFire ? 'z-[200]' : 'z-[50]'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
     {/* 🚀 1. EL POPUP (TARJETA FLOTANTE) - DISEÑO COMPACTO Y PROPORCIONADO */}
      <div 
        className={`absolute bottom-[100%] origin-bottom duration-300 ease-out transform transition-[opacity,transform] pb-3
        ${isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
        ${isFire ? 'z-[250]' : 'z-[100]'}`} 
        onClick={(e) => handleAction(e, 'open')}
      >   
        <div 
          className={`flex rounded-[16px] overflow-hidden cursor-pointer transition-all duration-300 backdrop-blur-xl 
          ${isFire 
            ? 'w-[370px] min-h-[135px] bg-white border-[2px] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]' 
            : 'w-[270px] min-h-[105px] bg-white/95 border border-slate-200 shadow-2xl hover:shadow-xl'}`}
        >
            
            {/* 📸 SECCIÓN IZQUIERDA: 50% FOTO PARA MÁS IMPACTO */}
            <div className={`relative shrink-0 overflow-hidden group/img ${isFire ? 'w-[185px]' : 'w-[135px]'}`}>
                <Image 
                    src={img} 
                    alt="Propiedad" 
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-cover transition-transform duration-1000 group-hover/img:scale-110"
                    loading="lazy"
                    quality={isFire ? 80 : 60}
                />                   
                {isFire && <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-white/10 pointer-events-none mix-blend-overlay"></div>}
                
                {/* Etiquetas */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {isFire ? ( 
                        <div className="px-1.5 py-0.5 rounded backdrop-blur-md bg-white/95 shadow-sm flex items-center gap-1 border border-red-100 w-fit">
                            <Crown size={10} className="text-red-600 fill-red-500 animate-[pulse_1.5s_ease-in-out_infinite]"/>
                            <span className="text-[8px] font-black uppercase tracking-widest text-red-700 leading-none mt-[1px]">FUEGO</span>
                        </div> 
                    ) : ( 
                        <div className="px-1.5 py-0.5 rounded backdrop-blur-md bg-white/90 shadow-sm flex items-center gap-1 border border-white/50 w-fit">
                            {getPropertyIcon(type)}
                            <span className="text-[7px] font-bold uppercase tracking-widest text-gray-800 leading-none mt-[1px]">{type}</span>
                        </div> 
                    )}
                </div>

                {/* Botón Fav */}
                <div className="absolute bottom-2 left-2 z-20">
                    <button onClick={(e) => handleAction(e, 'fav')} className={`flex items-center justify-center rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 active:scale-95 shadow-md ${isFire ? 'w-7 h-7' : 'w-6 h-6'} ${liked ? 'bg-red-500 text-white border-red-400' : 'bg-black/40 text-white border-white/30 hover:bg-black/60'}`}>
                        <Heart size={isFire ? 12 : 10} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                    </button>
                </div>
            </div>

            {/* 📝 SECCIÓN DERECHA: TEXTOS COMPACTOS (El otro 50%) */}
            <div className={`flex flex-col justify-between p-2.5 flex-1 min-w-0 ${isFire ? 'bg-gradient-to-br from-[#FFF8F6] to-white p-3' : ''}`}>
                
                <div>
                    <div className="flex justify-between items-start gap-1 mb-0.5">
                        <span className={`font-black uppercase tracking-widest block leading-none truncate ${isFire ? 'text-[7.5px] text-red-500' : 'text-[6.5px] text-slate-400'}`}>
                            {liveData.refCode || "REF"}
                        </span>
                    </div>
                    
                    <h3 className={`font-black text-slate-900 truncate tracking-tight ${isFire ? 'text-[15px] mb-1' : 'text-[12px] mb-0.5'}`}>
                        {liveData?.title || type}
                    </h3>

                    <div className={`${isFire ? 'mb-1.5' : 'mb-1'}`}>
                        <span className={`block font-black tracking-tighter leading-none ${isFire ? 'text-[24px] bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent' : 'text-[17px] text-slate-900'}`}>
                            {displayLabel}
                        </span>
                    </div>

                    <div className="flex items-start gap-1">
                        <Navigation size={isFire ? 9 : 8} className={`shrink-0 mt-[1px] ${isFire ? 'text-red-400' : 'text-slate-400'}`} />
                        <span className={`font-bold uppercase line-clamp-2 leading-snug ${isFire ? 'tracking-wider text-[8px] text-slate-600' : 'tracking-wide text-[7px] text-slate-500'}`}>
                            {locationText}
                        </span>
                    </div>
                </div>

                <div className={`mt-1.5 pt-1.5 flex items-center justify-between border-t ${isFire ? 'border-red-100' : 'border-slate-100'}`}>
                    {showOnlyM2 ? (
                        <div className="flex items-center gap-1 text-slate-800">
                            <Maximize2 size={isFire ? 11 : 9} className={isFire ? "text-red-400" : "text-slate-400"} />
                            <span className={`font-black ${isFire ? 'text-[11px]' : 'text-[9.5px]'}`}>{mBuilt} m²</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 text-slate-800">
                                <Bed size={isFire ? 11 : 9} className={isFire ? "text-red-400" : "text-slate-400"} />
                                <span className={`font-black ${isFire ? 'text-[11px]' : 'text-[9.5px]'}`}>{rooms}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-800">
                                <Bath size={isFire ? 11 : 9} className={isFire ? "text-red-400" : "text-slate-400"} />
                                <span className={`font-black ${isFire ? 'text-[11px]' : 'text-[9.5px]'}`}>{baths}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-800">
                                <Maximize2 size={isFire ? 11 : 9} className={isFire ? "text-red-400" : "text-slate-400"} />
                                <span className={`font-black ${isFire ? 'text-[11px]' : 'text-[9.5px]'}`}>{mBuilt}<span className={`font-bold text-slate-400 ml-[1px] ${isFire ? 'text-[7px]' : 'text-[6px]'}`}>m²</span></span>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
      </div>
    {/* 🎯 2. EL MARCADOR (PASTILLA) - TOTALMENTE ESTÁTICO Y SÓLIDO PARA TODOS */}
      <div 
        // Eliminado el "transition-all" y el hover. Ahora son inamovibles.
        className={`relative rounded-full shadow-lg flex flex-col items-center justify-center z-20 cursor-pointer border-[3px] border-white origin-bottom
        ${isFire 
            ? 'scale-105 z-[300] px-4 py-1.5 border-orange-200 shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
            : 'scale-100 z-[100] px-3 py-1.5'
        }`} 
        style={{ background: isFire ? 'linear-gradient(to bottom right, #fbbf24, #ef4444)' : style.hex }} 
        onClick={(e) => handleAction(e, 'open')}
      >
         {/* Ondas expansivas SOLO PARA FUEGO - pointer-events-none para no bloquear clics */}
         {isFire && ( 
            <>
              <span className="absolute inset-0 rounded-full border-4 border-[#f97316] opacity-80 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></span>
              <span className="absolute inset-0 rounded-full border-2 border-white opacity-90 animate-pulse pointer-events-none"></span>
            </> 
         )}
         
         {/* Texto siempre sólido y estático */}
         <span className={`${isFire ? 'text-sm' : 'text-xs'} font-black font-sans tracking-tight whitespace-nowrap text-white`}>
            {displayLabel}
         </span>
         
         {/* Piquito inferior estático */}
         <div 
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent 
            ${isFire ? '-bottom-[7px] border-l-[8px] border-r-[8px] border-t-[9px]' : '-bottom-1.5 border-l-[6px] border-r-[6px] border-t-[8px]'}`} 
            style={{ borderTopColor: isFire ? '#ef4444' : style.hex }}
         ></div>
      </div>
    </div>
  );
}