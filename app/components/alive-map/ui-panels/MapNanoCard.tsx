"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Bed, Bath, Maximize2, Navigation, Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp, Crown } from 'lucide-react';

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
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>;
};

// ==========================================
// COMPONENTE PRINCIPAL BLINDADO
// ==========================================
export default function MapNanoCard(props: any) {
  
  // 🔥 1. EL NÚCLEO CAMALEÓNICO
  const [liveData, setLiveData] = useState(() => ({ ...props.data, ...props }));

  const id = useMemo(() => String(liveData.id ?? liveData.propertyId ?? liveData._id ?? Date.now()), [liveData]);

  // 🔥 2. PARSEO SEGURO
  const parseJsonSafe = (val: any) => {
      if (typeof val === 'string') { try { return JSON.parse(val); } catch(e) { return null; } }
      return val;
  };

  const [currentPrice, setCurrentPrice] = useState(() => safeParsePrice(liveData.rawPrice ?? liveData.priceValue, liveData.price));
  const [isPremium, setIsPremium] = useState(() => liveData.promotedTier === 'PREMIUM' || liveData.isPromoted === true);
  
  const rooms = liveData.rooms ?? 0;
  const baths = liveData.baths ?? 0;
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

  // Imágenes Dinámicas
  let finalAlbum: string[] = [];
  const sourceImages = parseJsonSafe(liveData.images);
  if (Array.isArray(sourceImages) && sourceImages.length > 0) {
    finalAlbum = sourceImages.map((i: any) => (typeof i === "string" ? i : i?.url || i)).filter(Boolean);
  } else {
    const backupImg = liveData.mainImage || liveData.img || liveData.image;
    if (backupImg) finalAlbum = [backupImg];
  }
  const img = finalAlbum[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  // 🔥 3. ANTENA DE SEÑALES (AHORA ABSORBE TODO)
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (String(e.detail.id) === String(id) && e.detail.updates) {
        const u = e.detail.updates;
        setLiveData((prev: any) => ({ ...prev, ...u }));
        if (u.price || u.rawPrice || u.priceValue) setCurrentPrice(safeParsePrice(u.rawPrice ?? u.priceValue, u.price));
        if (u.promotedTier !== undefined || u.isPromoted !== undefined) setIsPremium(u.promotedTier === 'PREMIUM' || u.isPromoted === true);
      }
    };
    if (typeof window !== "undefined") window.addEventListener("update-property-signal", handleUpdate);
    return () => { if (typeof window !== "undefined") window.removeEventListener("update-property-signal", handleUpdate); };
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

  // 🔥 4. DISPARADOR DE ACCIONES
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!id) return;

    let normalizedCoords = null;
    const navCoords = liveData.coordinates || liveData.geometry?.coordinates || [liveData.lng, liveData.lat];
    if (Array.isArray(navCoords) && navCoords.length === 2 && navCoords[0] != null) {
      normalizedCoords = (navCoords[0] > 30 && navCoords[1] < 0) ? [navCoords[1], navCoords[0]] : [navCoords[0], navCoords[1]];
    }

    const payload = {
      ...liveData,
      id: String(id),
      images: finalAlbum,
      img: finalAlbum[0] || null,
      price: currentPrice,
      priceValue: currentPrice,
      b2b: b2bData,
      user: parseJsonSafe(liveData.user),
      openHouse: parseJsonSafe(liveData.openHouse) || parseJsonSafe(liveData.open_house_data) || null,
      activeCampaign: parseJsonSafe(liveData.activeCampaign),
      promotedTier: isPremium ? 'PREMIUM' : undefined
    };

    if (action === "fav") {
      const next = !liked; setLiked(next);
      window.dispatchEvent(new CustomEvent("toggle-fav-signal", { detail: { ...payload, isFav: next } }));
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: { ...payload, isFav: next } }));
    }

    if (action === "open") {
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id: String(id) } }));
      window.dispatchEvent(new CustomEvent("open-details-signal", { detail: payload }));
    }

    if (normalizedCoords) {
      window.dispatchEvent(new CustomEvent('fly-to-location', { detail: { center: normalizedCoords, zoom: 18.5, pitch: 60, duration: 1500 } }));
    }
  };

  useEffect(() => {
    if (cardRef.current) {
        const marker = cardRef.current.closest('.mapboxgl-marker') as HTMLElement;
        if (marker) marker.style.zIndex = isHovered || isPremium ? "99999" : "auto";
    }
  }, [isHovered, isPremium]);

  const locationText = String(liveData.city || liveData.location || liveData.address || "MADRID").toUpperCase().replace("PROVINCIA DE ", "").substring(0, 20);
  const isLandOrIndustrial = ['Suelo', 'Nave', 'Oficina', 'Land', 'Industrial'].includes(type) || type.toUpperCase().includes('SUELO');

  return (
    <div ref={cardRef} className={`pointer-events-auto flex flex-col items-center group relative ${isPremium ? 'z-[200]' : 'z-[50]'}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={`absolute bottom-[100%] pb-5 origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isPremium ? 'w-[500px] z-[250]' : 'w-[280px] z-[100]'} ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} onClick={(e) => handleAction(e, 'open')}>
          <div className={`flex flex-col rounded-[24px] overflow-hidden cursor-pointer bg-white transition-all duration-300 ${isPremium ? 'shadow-[0_0_60px_rgba(251,191,36,0.7)] border-4 border-amber-400' : 'shadow-2xl border border-white/80'}`}>
              <div className="relative">
                  <div className={`relative overflow-hidden group/img ${isPremium ? 'h-80' : 'h-44'}`}>
                      <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105" alt="Propiedad"/>
                      {isPremium && <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-transparent to-white/40 pointer-events-none mix-blend-overlay"></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>
                      <div className="absolute top-4 left-4 px-3 py-2 rounded-full backdrop-blur-xl bg-white/95 shadow-lg flex items-center gap-2 border-2 border-white/50">
                          {isPremium ? ( <><Crown size={14} className="text-amber-600 fill-amber-500 animate-pulse"/><span className="text-[11px] font-black uppercase tracking-widest text-amber-700">PREMIUM</span></> ) : ( <>{getPropertyIcon(type)}<span className="text-[10px] font-bold uppercase tracking-wide text-gray-800">{type}</span></> )}
                      </div>
                      {!isPremium && <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: style.hex }}><span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span></div>}
                      <div className="absolute top-4 right-4 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${liked ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white border-white/30 hover:bg-black/50'}`}>
                              <Heart size={18} className={`transition-transform duration-300 ${liked ? "fill-current scale-105" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>
                  <div className={`p-6 pt-5 ${isPremium ? 'bg-gradient-to-b from-[#FFFBEB] to-white' : 'bg-white'}`}>
                      <div className="mb-2">
                          {isPremium && liveData?.title && <h3 className="text-xl font-black text-gray-900 truncate mb-1">{liveData.title}</h3>}
                          <div className="flex justify-between items-start items-center">
                              <span className={`font-black tracking-tight leading-none ${isPremium ? 'text-4xl text-amber-600 drop-shadow-sm' : 'text-xl text-gray-900'}`}>{displayLabel}</span>
                              {floor && <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wide"><ArrowUp size={12}/> <span>P.{floor}</span></div>}
                          </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-5"><Navigation size={12} style={{ color: style.hex }}/><span className="text-xs font-bold uppercase tracking-wider truncate text-gray-500">{locationText}</span></div>
                      <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                          {isLandOrIndustrial ? ( <div className="flex items-center gap-2 w-full justify-center text-gray-700"><Maximize2 size={18} className="text-gray-400"/><span className="text-sm font-bold">{mBuilt} m²</span></div> ) : ( <><div className="flex items-center gap-2 text-gray-700"><Bed size={18} className="text-gray-400"/><span className="text-sm font-bold">{rooms}</span></div><div className="w-px h-5 bg-gray-200"></div><div className="flex items-center gap-2 text-gray-700"><Bath size={18} className="text-gray-400"/><span className="text-sm font-bold">{baths}</span></div><div className="w-px h-5 bg-gray-200"></div><div className="flex items-center gap-2 text-gray-700"><Maximize2 size={18} className="text-gray-400"/><span className="text-sm font-bold">{mBuilt}m²</span></div></> )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div className={`relative rounded-full shadow-lg transition-all duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer border-[3px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-2xl' : 'scale-100'} ${isPremium ? 'bg-amber-500 border-amber-200 scale-[1.75] z-[200] px-5 py-2.5' : 'px-3 py-1.5'}`} style={{ backgroundColor: isPremium ? '#F59E0B' : style.hex }} onClick={(e) => handleAction(e, 'open')}>
         {isPremium && ( <><span className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-60 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span><span className="absolute inset-0 rounded-full border-2 border-amber-300 opacity-80 animate-pulse"></span></> )}
         <span className={`${isPremium ? 'text-sm' : 'text-xs'} font-black font-sans tracking-tight whitespace-nowrap text-white`}>{displayLabel}</span>
         <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent ${isPremium ? '-bottom-2.5 border-l-[10px] border-r-[10px] border-t-[12px]' : '-bottom-1.5 border-l-[6px] border-r-[6px] border-t-[8px]'}`} style={{ borderTopColor: isPremium ? '#F59E0B' : style.hex }}></div>
      </div>
    </div>
  );
}