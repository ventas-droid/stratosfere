// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Bed, Bath, Maximize2, Navigation, Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp, Crown } from 'lucide-react';
import Image from 'next/image';
import { getPropertyByIdAction } from '@/app/actions';
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
  const img = finalAlbum[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

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
      img: finalAlbum[0] || null,
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
      
      {/* 🚀 1. EL POPUP (TARJETA FLOTANTE) - AHORA CONECTADA CORRECTAMENTE A 'isFire' */}
<div className={`absolute bottom-[100%] origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isFire ? 'w-[500px] z-[250] pb-14' : 'w-[280px] z-[100] pb-5'} ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} onClick={(e) => handleAction(e, 'open')}>          <div className={`flex flex-col rounded-[24px] overflow-hidden cursor-pointer bg-white transition-all duration-300 ${isFire ? 'shadow-[0_0_60px_rgba(239,68,68,0.5)] border-4 border-red-500' : 'shadow-2xl border border-white/80'}`}>
              <div className="relative">
                  <div className={`relative overflow-hidden group/img ${isFire ? 'h-80' : 'h-44'}`}>
<Image 
    src={img} 
    alt="Propiedad" 
    fill
    sizes="(max-width: 768px) 100vw, 400px"
    className="object-cover transition-transform duration-1000 group-hover/img:scale-105"
    loading="lazy"
    quality={60}
/>                   
  {isFire && <div className="absolute inset-0 bg-gradient-to-tr from-red-500/30 via-transparent to-white/40 pointer-events-none mix-blend-overlay"></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>
                      <div className="absolute top-4 left-4 px-3 py-2 rounded-full backdrop-blur-xl bg-white/95 shadow-lg flex items-center gap-2 border-2 border-white/50">
                          {isFire ? ( <><Crown size={14} className="text-red-600 fill-red-500 animate-pulse"/><span className="text-[11px] font-black uppercase tracking-widest text-red-700">FUEGO</span></> ) : ( <>{getPropertyIcon(type)}<span className="text-[10px] font-bold uppercase tracking-wide text-gray-800">{type}</span></> )}
                      </div>
                      {!isFire && <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: style.hex }}><span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span></div>}
                      <div className="absolute top-4 right-4 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${liked ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white border-white/30 hover:bg-black/50'}`}>
                              <Heart size={18} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>
                  <div className={`p-6 pt-5 ${isFire ? 'bg-gradient-to-b from-[#FEF2F2] to-white' : 'bg-white'}`}>
                      <div className="mb-2">
                          {isFire && liveData?.title && <h3 className="text-xl font-black text-gray-900 truncate mb-1">{liveData.title}</h3>}
                          <div className="flex justify-between items-start items-center">
                              <span className={`font-black tracking-tight leading-none ${isFire ? 'text-4xl text-red-600 drop-shadow-sm' : 'text-xl text-gray-900'}`}>{displayLabel}</span>
                              {floor && <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wide"><ArrowUp size={12}/> <span>P.{floor}</span></div>}
                          </div>
                      </div>
{/* 📍 DIRECCIÓN: Dos filas permitidas y cero comas */}
                      <div className="flex items-start gap-1.5 text-gray-500 mb-5">
                          <Navigation size={12} className="mt-0.5 shrink-0" style={{ color: style.hex }}/>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 line-clamp-2 leading-snug">
                              {locationText}
                          </span>
                      </div>                      

                      {/* Habitación y Baños */}
                      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                          {showOnlyM2 ? ( 
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

     {/* 🎯 2. EL MARCADOR (PASTILLA) - TOTALMENTE ESTÁTICO Y SÓLIDO PARA TODOS */}
      <div 
        // Eliminado el "transition-all" y el hover. Ahora son inamovibles.
        className={`relative rounded-full shadow-lg flex flex-col items-center justify-center z-20 cursor-pointer border-[3px] border-white origin-bottom
        ${isFire 
            ? 'scale-[1.35] z-[300] px-5 py-2 border-orange-200 shadow-2xl' 
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