"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, ChevronRight, Bed, Bath, Maximize2, Navigation, 
  // 🔥 NUEVOS ICONOS PARA SINCRONIZACIÓN
  Building2, Home, Briefcase, LandPlot, Warehouse, Sun, ArrowUp
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

  // B. ESCUDO ANTI-ERROR (ESTO EVITA EL FALLO "toUpperCase")
  // Convertimos lo que sea (número o texto) a String obligatoriamente
  let str = String(valToParse); 

  // C. LIMPIEZA
  str = str.toUpperCase().trim().replace(/\s/g, "").replace(/€/g, "");

  // D. DETECTAR SUFIJOS (Millones/Miles)
  let multiplier = 1; // <--- CORREGIDO (Antes decía ltiplier)
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

// 2. MOTOR DE COLORES (INTACTO)
const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#9CA3AF", text: "white", label: "PENDING" }; 
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "RENT / ENTRY" }; 
  if (price < 200000)     return { hex: "#34C759", text: "white", label: "INVEST" }; 
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPPORTUNITY" }; 
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" }; 
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUXURY" }; 
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVE" }; 
};

// 3. 🔥 DICCIONARIO DE ICONOS (NUEVO - Sincronizado con ArchitectHud)
const getPropertyIcon = (typeStr: string) => {
    const t = (typeStr || "").toUpperCase();
    if (t.includes("VILLA") || t.includes("CASA") || t.includes("MANSION")) return <Home size={14} className="text-gray-900"/>;
    if (t.includes("ATICO") || t.includes("ÁTICO")) return <Sun size={14} className="text-orange-500"/>;
    if (t.includes("OFICINA")) return <Briefcase size={14} className="text-gray-500"/>;
    if (t.includes("SUELO") || t.includes("TERRENO")) return <LandPlot size={14} className="text-emerald-600"/>;
    if (t.includes("NAVE")) return <Warehouse size={14} className="text-slate-600"/>;
    return <Building2 size={14} className="text-blue-500"/>; // Piso por defecto
};

export default function MapNanoCard(props: any) {
  const data = props.data || {};

  // USAMOS useMemo: Calculamos el ID una vez y lo recordamos para siempre.
  // Esto evita que la tarjeta crea que es nueva en cada parpadeo.
  const id = useMemo(() => {
      return props.id || data.id || data._id || `prop-${Math.random().toString(36).substr(2, 9)}`;
  }, [props.id, data.id, data._id]);
 
  // Datos Básicos
  const rooms = props.rooms ?? data.rooms ?? 0;
  const baths = props.baths ?? data.baths ?? 0;
  
  // 🔥 CORRECCIÓN TÁCTICA (EL ARREGLO DEL 0 m²):
  // Ahora el sistema busca el dato en TODAS las variables posibles.
  // Si no encuentra 'mBuilt', busca 'surface', si no 'm2'.
  const mBuilt = props.mBuilt || data.mBuilt || props.surface || data.surface || props.m2 || data.m2 || 0;
  
  const type = props.type || data.type || "Propiedad";
  
  // Prioridad de Imagen: 1. props.image, 2. data.images[0] (ArchitectHud), 3. data.img (Legacy)
  const img = props.img || props.image || (data.images && data.images.length > 0 ? data.images[0] : null) || data.img || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
  
  const city = props.city || data.city;
  const location = props.location || data.location;
  const address = props.address || data.address;
  
  // Datos Técnicos (Nuevos)
  const floor = props.floor || data.floor;

  // Precios (MODIFICADO: AHORA TIENE OÍDO TÁCTICO)
  const rawPriceInput = props.rawPrice ?? data?.rawPrice ?? props.priceValue;
  const stringPriceInput = props.price ?? data?.price; 
  
  // 1. ESTADO LOCAL: Permite cambiar el precio sin recargar el mapa
  const [currentPrice, setCurrentPrice] = useState(() => safeParsePrice(rawPriceInput, stringPriceInput));

  // 2. 🔥 RECEPTOR DE SEÑAL DE ACTUALIZACIÓN (TURBO)
  useEffect(() => {
    const handleUpdate = (e: any) => {
        // Si la señal es para ESTA tarjeta (mismo ID)
        if (String(e.detail.id) === String(id) && e.detail.updates) {
            const u = e.detail.updates;
            // Si la actualización trae precio, lo cambiamos AL INSTANTE
            if (u.price || u.rawPrice || u.priceValue) {
                const newP = safeParsePrice(u.rawPrice ?? u.priceValue, u.price);
                setCurrentPrice(newP);
            }
        }
    };
    if (typeof window !== 'undefined') window.addEventListener('update-property-signal', handleUpdate);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('update-property-signal', handleUpdate); };
  }, [id]);

  // 3. Visualización basada en el precio VIVO (currentPrice)
  const displayLabel = useMemo(() => {
    if (currentPrice === 0) return "Consultar"; 
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(currentPrice);
  }, [currentPrice]);
  
  const style = getPriceStyle(currentPrice);

  // --- ESTADO & MEMORIA BLINDADA ---
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        let isSaved = localStorage.getItem(`fav-${id}`) === 'true';
        if (!isSaved) {
            try {
                const masterList = JSON.parse(localStorage.getItem('stratos_favorites_v1') || '[]');
                isSaved = masterList.some((item: any) => item.id == id);
                if (isSaved) localStorage.setItem(`fav-${id}`, 'true');
            } catch (e) { console.error(e); }
        }
        setLiked(isSaved);
    }
    const handleRemoteCommand = (e: CustomEvent) => {
        if (e.detail && (e.detail.id == id)) setLiked(!!e.detail.isFav);
    };
    if (typeof window !== 'undefined') window.addEventListener('sync-property-state', handleRemoteCommand as EventListener);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('sync-property-state', handleRemoteCommand as EventListener); };
  }, [id]);

 const handleAction = (e: React.MouseEvent, action: string) => {
      e.preventDefault();
      e.stopPropagation(); 
      const targetState = action === 'fav' ? !liked : liked;
      const navCoords = props.coordinates || data.coordinates || data.geometry?.coordinates || (props.lng && props.lat ? [props.lng, props.lat] : null);
      
      // 🔥 CORRECCIÓN CRÍTICA: INYECTAMOS LOS DATOS VIVOS (currentPrice y displayLabel)
      // En lugar de enviar los datos viejos (props), enviamos lo que la tarjeta está mostrando AHORA.
      const payload = { 
          id, 
          ...props, 
          ...data, 
          // AQUI ESTA LA MAGIA: Sobrescribimos el precio viejo con el nuevo
          price: currentPrice,       
          rawPrice: currentPrice,
          priceValue: currentPrice,
          formattedPrice: displayLabel, // "900.000 €" actualizado
          
          role: style.label, 
          img: img, 
          type: type, 
          location: (city || location || address || "MADRID").toUpperCase(), 
          isFav: targetState, 
          isFavorite: targetState, 
          coordinates: navCoords 
      };

      if (action === 'fav') {
          setLiked(targetState); 
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('toggle-fav-signal', { detail: payload }));
              // Si marcamos fav, actualizamos visualmente
              if (targetState) window.dispatchEvent(new CustomEvent('open-details-signal', { detail: payload }));
          }
          if (props.onToggleFavorite) props.onToggleFavorite(payload);
      } else if (action === 'open') {
          if (typeof window !== 'undefined') {
              // 1. AHORA SÍ: Enviamos el payload CON EL PRECIO NUEVO al panel de detalles
              window.dispatchEvent(new CustomEvent('open-details-signal', { detail: payload }));
              
              // 2. Avisamos al sistema
              window.dispatchEvent(new CustomEvent('select-property-signal', { detail: { id: id } }));
          }
          if (props.onSelect) props.onSelect(payload);
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

  // Lógica de visualización de datos físicos (Suelo vs Vivienda)
  const isLandOrIndustrial = ['Suelo', 'Nave', 'Oficina', 'Land', 'Industrial'].includes(type) || type.toUpperCase().includes('SUELO');

  return (
    <div ref={cardRef} className="pointer-events-auto flex flex-col items-center group relative z-[50]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
     {/* TARJETA FLOTANTE (ESTABILIZADA Y CERRADA) */}
      <div 
          className={`absolute bottom-[100%] pb-3 w-[280px] z-[100] origin-bottom duration-300 ease-out transform transition-[opacity,transform] ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} 
          onClick={(e) => handleAction(e, 'open')}
      >
          <div className="flex flex-col rounded-[24px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/60 cursor-pointer bg-white ring-1 ring-black/5">
              <div className="bg-white relative">
                  <div className="h-44 relative overflow-hidden group/img">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Propiedad"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* 🔥 BADGE TIPO + ICONO */}
                      <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-xl shadow-lg backdrop-blur-md border border-white/20 bg-white/90 flex items-center gap-1.5">
                          {getPropertyIcon(type)}
                          <span className="text-[10px] font-black uppercase tracking-wide text-gray-800">{type}</span>
                      </div>

                      {/* BADGE CATEGORIA */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md shadow-sm" style={{ backgroundColor: style.hex }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white">{style.label}</span>
                      </div>

                      <div className="absolute top-3 right-3 z-20">
                          <button onClick={(e) => handleAction(e, 'fav')} className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg ${liked ? 'bg-red-500 text-white border-transparent' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                              <Heart size={14} className={`transition-transform duration-300 ${liked ? "fill-current scale-110" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>
                  <div className="p-4 pt-3">
                      <div className="flex justify-between items-start mb-0.5">
                          {/* Precio destacado */}
                          <span className="text-xl font-black text-gray-900 tracking-tight">{displayLabel}</span>
                          
                          {/* 🔥 INDICADOR DE PLANTA (Si existe) */}
                          {floor && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                                  <ArrowUp size={10}/> <span>P.{floor}</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500 mb-3">
                          <Navigation size={10} style={{ color: style.hex }}/>
                          <span className="text-[9px] font-bold uppercase tracking-wider truncate text-gray-400">{locationText}</span>
                      </div>

                      {/* DATOS FÍSICOS: Si es Suelo/Nave mostramos solo M2 */}
                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                          {isLandOrIndustrial ? (
                              <div className="flex items-center gap-1.5 w-full justify-center">
                                  <Maximize2 size={14} className="text-gray-400"/>
                                  <span className="text-xs font-bold text-gray-700">{mBuilt} m²</span>
                              </div>
                          ) : (
                              <>
                                  <div className="flex items-center gap-1.5"><Bed size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{rooms}</span></div>
                                  <div className="w-[1px] h-3 bg-gray-200"></div>
                                  <div className="flex items-center gap-1.5"><Bath size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{baths}</span></div>
                                  <div className="w-[1px] h-3 bg-gray-200"></div>
                                  <div className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{mBuilt}m</span></div>
                              </>
                          )}
                      </div>
                  </div>
                  <div className="h-1 w-full" style={{ backgroundColor: style.hex }}></div>
              </div>
          </div>
      </div>

   {/* PIN DE MAPA (ESTABILIZADO) */}
      <div 
         className={`relative px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer border-[2px] border-white ${isHovered ? 'scale-110 -translate-y-1 shadow-xl' : 'scale-100'}`} 
         style={{ backgroundColor: style.hex }} 
         onClick={(e) => handleAction(e, 'open')}
      >
         <span className="text-xs font-bold font-mono tracking-tight whitespace-nowrap text-white drop-shadow-md">{displayLabel}</span>
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: style.hex }}></div>
      </div>
    </div>
  );
}
