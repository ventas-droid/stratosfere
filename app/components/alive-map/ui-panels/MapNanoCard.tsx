"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, Bed, Bath, Maximize2, Navigation, 
  Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp,
  Crown, Award, Zap, Star // Iconos para los Packs
} from 'lucide-react';

// ------------------------------------------------------------------
// 1. MOTOR DE PARSEO (BLINDADO)
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
  let str = String(valToParse).toUpperCase().trim().replace(/\s/g, "").replace(/€/g, "");
  let multiplier = 1; 
  if (str.includes("M")) { multiplier = 1_000_000; str = str.replace("M", ""); }
  if (str.includes("K")) { multiplier = 1_000; str = str.replace("K", ""); }
  str = str.replace(/[^\d.,]/g, "").replace(",", "."); 
  const val = parseFloat(str);
  return (Number.isFinite(val) ? val : 0) * multiplier;
};

// 2. ESTILO VISUAL (CUPERTINO)
const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#8E8E93", text: "white", label: "PENDING" };
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "ALQUILER" };
  if (price < 200000)     return { hex: "#30B0C7", text: "white", label: "INVERSIÓN" };
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPORTUNIDAD" };
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" };
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUJO" };
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVO" };
};

// 3. ICONOS DINÁMICOS
const getPropertyIcon = (typeStr: string) => {
    const t = (typeStr || "").toUpperCase();
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>; 
};

// 4. PACKS (ETIQUETAS VIP)
const PACK_BADGES: Record<string, any> = {
  'pack_elite':   { icon: Crown, label: 'ELITE', color: 'bg-gradient-to-r from-amber-200 to-yellow-500', text: 'text-black shadow-sm', border: 'border-yellow-200' },
  'pack_investor':{ icon: Award, label: 'INVERSOR', color: 'bg-gradient-to-r from-emerald-400 to-cyan-500', text: 'text-white shadow-sm', border: 'border-emerald-200' },
  'pack_pro':     { icon: Star,  label: 'PRO',      color: 'bg-gradient-to-r from-indigo-400 to-purple-500', text: 'text-white shadow-sm', border: 'border-indigo-200' },
  'pack_express': { icon: Zap,   label: 'EXPRESS',  color: 'bg-gradient-to-r from-orange-400 to-red-500',    text: 'text-white shadow-sm', border: 'border-orange-200' },
  'pack_basic':   { icon: Star,  label: 'BASIC',    color: 'bg-gray-800', text: 'text-white shadow-sm', border: 'border-gray-600' },
};

export default function MapNanoCard(props: any) {
  // A. EXTRACCIÓN SEGURA DE DATOS
  const data = props.data || {};
  const id = props.id || data.id || `temp-${Math.random()}`;

  // B. NORMALIZACIÓN DE PROPIEDADES
  const rooms = props.rooms ?? data.rooms ?? 0;
  const baths = props.baths ?? data.baths ?? 0;
  const mBuilt = props.mBuilt || data.mBuilt || props.m2 || 0;
  const type = props.type || data.type || "Propiedad";
  
  // 🔥 IMAGEN (CORRECCIÓN CLAVE): Prioridad Array -> String -> Placeholder
  const img = 
      (Array.isArray(props.images) && props.images.length > 0 ? props.images[0] : null) || 
      (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null) ||
      props.img || 
      data.img || 
      "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";

  const locationLabel = (props.city || data.city || props.location || "MADRID").toUpperCase().replace("PROVINCIA DE ", "").substring(0, 20);
  const selectedServices = props.selectedServices || data.selectedServices || [];

  // C. PRECIO VIVO
  const rawPriceInput = props.rawPrice ?? data?.rawPrice ?? props.priceValue;
  const stringPriceInput = props.price ?? data?.price; 
  const currentPrice = safeParsePrice(rawPriceInput, stringPriceInput);
  
  const displayLabel = useMemo(() => {
    if (currentPrice === 0) return "Consultar"; 
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(currentPrice);
  }, [currentPrice]);
  
  const style = getPriceStyle(currentPrice);

  // D. DETECCIÓN DE PACK
  const activePack = useMemo(() => {
    if (!selectedServices.length) return null;
    if (selectedServices.includes('pack_elite')) return PACK_BADGES['pack_elite'];
    if (selectedServices.includes('pack_investor')) return PACK_BADGES['pack_investor'];
    return null;
  }, [selectedServices]);

  // E. ESTADOS INTERACTIVOS
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // F. CONTROL DE Z-INDEX (SUPERPOSICIÓN)
  useEffect(() => {
    if (cardRef.current) {
        const marker = cardRef.current.closest('.mapboxgl-marker') as HTMLElement;
        if (marker) marker.style.zIndex = isHovered ? "99999" : "auto";
    }
  }, [isHovered]);

  const handleOpen = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Enviar evento con TODO el paquete de datos saneado
      const payload = { 
          ...props, 
          ...data,
          id,
          price: currentPrice,
          formattedPrice: displayLabel,
          img, // La imagen buena
          type,
          location: locationLabel
      };
      
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-details-signal', { detail: payload }));
          window.dispatchEvent(new CustomEvent('select-property-signal', { detail: { id } }));
      }
  };

  const isLandOrIndustrial = ['SUELO', 'NAVE', 'OFICINA', 'TERRENO'].some(t => type.toUpperCase().includes(t));

  return (
    <div 
        ref={cardRef} 
        className="pointer-events-auto flex flex-col items-center group relative z-[50]" 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
    >
      
     {/* 1. TARJETA FLOTANTE (HOVER) */}
      <div 
          className={`absolute bottom-[140%] pb-2 w-[260px] z-[100] origin-bottom duration-300 ease-out transform transition-all ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} 
          onClick={handleOpen}
      >
          <div className="flex flex-col rounded-[18px] overflow-hidden shadow-2xl border border-white/60 bg-white cursor-pointer hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-shadow">
              
              {/* IMAGEN + BADGES */}
              <div className="h-40 relative overflow-hidden">
                  <img src={img} className="w-full h-full object-cover" alt="Propiedad"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Etiqueta Tipo */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                      {getPropertyIcon(type)}
                      <span className="text-[9px] font-bold uppercase text-gray-800">{type}</span>
                  </div>

                  {/* Etiqueta Pack (Si existe) */}
                  {activePack && (
                     <div className={`absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border ${activePack.color} ${activePack.text} ${activePack.border}`}>
                        <activePack.icon size={10} strokeWidth={3} />
                        <span className="text-[8px] font-black uppercase">{activePack.label}</span>
                     </div>
                  )}

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md" style={{ backgroundColor: style.hex }}>
                      <span className="text-[9px] font-bold uppercase text-white">{style.label}</span>
                  </div>
              </div>
              
              {/* DATOS */}
              <div className="p-3 bg-white">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-gray-900">{displayLabel}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-400 mb-2">
                      <Navigation size={10} />
                      <span className="text-[10px] font-medium uppercase truncate">{locationLabel}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded border border-gray-100">
                      {isLandOrIndustrial ? (
                          <div className="flex items-center gap-1 mx-auto text-gray-600">
                              <Maximize2 size={12}/> <span className="text-[11px] font-semibold">{mBuilt} m²</span>
                          </div>
                      ) : (
                          <>
                              <div className="flex items-center gap-1 text-gray-600"><Bed size={12}/> <span className="text-[11px] font-semibold">{rooms}</span></div>
                              <div className="w-[1px] h-3 bg-gray-200"></div>
                              <div className="flex items-center gap-1 text-gray-600"><Bath size={12}/> <span className="text-[11px] font-semibold">{baths}</span></div>
                              <div className="w-[1px] h-3 bg-gray-200"></div>
                              <div className="flex items-center gap-1 text-gray-600"><Maximize2 size={12}/> <span className="text-[11px] font-semibold">{mBuilt}m</span></div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      </div>

     {/* 2. PIN DE MAPA (MINIMALISTA) */}
      <div 
         className={`relative px-3 py-1.5 rounded-full shadow-md transition-all duration-200 flex flex-col items-center justify-center cursor-pointer border-[2px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-xl z-50' : 'scale-100 z-0'}`} 
         style={{ backgroundColor: style.hex }} 
         onClick={handleOpen}
      >
         <span className="text-[11px] font-bold text-white whitespace-nowrap">{displayLabel}</span>
         {/* Triángulo inferior del pin */}
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style={{ borderTopColor: style.hex }}></div>
      </div>
    </div>
  );
}

