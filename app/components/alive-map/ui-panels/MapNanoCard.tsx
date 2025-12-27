"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, ChevronRight, Bed, Bath, Maximize2, Navigation } from 'lucide-react';

// --- PEGAR ESTO ARRIBA DEL TODO DEL ARCHIVO ---

// 1. MOTOR DE PARSEO (V7 - CÓDIGO MAESTRO)
const safeParsePrice = (
  inputVal: number | string | null | undefined,
  inputString?: string | null
): number => {
  
  // A. OBTENER EL DATO CRUDO (STRING)
  // Ignoramos inputVal si tenemos inputString.
  // Si solo tenemos inputVal, lo convertimos a String para analizarlo nosotros.
  let str = inputString;
  if (!str) {
      if (inputVal === undefined || inputVal === null) return 0;
      str = String(inputVal);
  }

  // B. LIMPIEZA INICIAL
  str = str.toUpperCase().trim();
  str = str.replace(/\s/g, "").replace(/€/g, "");

  // C. DETECTAR SUFIJOS (M = Millones, K = Miles)
  let multiplier = 1;
  let hasSuffix = false;

  if (str.includes("M") || str.includes("K")) {
      hasSuffix = true;
      if (str.includes("M")) multiplier = 1_000_000;
      if (str.includes("K")) multiplier = 1_000;
      str = str.replace(/[MK]/g, "");
  }

  // D. LÓGICA DE LIMPIEZA BIFURCADA
  if (hasSuffix) {
      // CASO 1: TIENE SUFIJO (Ej: "1.2 M")
      // Aquí asumimos formato inglés para decimales cortos (punto es decimal)
      str = str.replace(/,/g, "."); 
  } else {
      // CASO 2: NÚMERO LARGO ESPAÑOL (Ej: "433.000" o "1.200.000")
      // Aquí el punto es MILES. Hay que ELIMINARLO.
      
      // 1. Protegemos la coma decimal real (si existe)
      str = str.replace(/,/g, "DECIMAL_PLACEHOLDER");
      
      // 2. BORRAMOS LOS PUNTOS (Esto arregla el 433.000 -> 433)
      str = str.replace(/\./g, ""); 
      
      // 3. Restauramos la coma como punto
      str = str.replace("DECIMAL_PLACEHOLDER", ".");
  }

  // E. CONVERSIÓN FINAL
  str = str.replace(/[^\d.]/g, ""); // Solo dígitos y punto
  const val = parseFloat(str);

  return (Number.isFinite(val) ? val : 0) * multiplier;
};


// 2. MOTOR DE COLORES
const getPriceStyle = (price: number) => {
  if (!price || price <= 0) return { hex: "#9CA3AF", text: "white", label: "PENDING" }; 
  if (price < 3500)       return { hex: "#34C759", text: "white", label: "RENT / ENTRY" }; 
  if (price < 200000)     return { hex: "#34C759", text: "white", label: "INVEST" }; 
  if (price < 550000)     return { hex: "#FFD60A", text: "black", label: "OPPORTUNITY" }; 
  if (price < 1200000)    return { hex: "#FF9500", text: "white", label: "PREMIUM" }; 
  if (price < 3000000)    return { hex: "#FF2D55", text: "white", label: "LUXURY" }; 
  return { hex: "#AF52DE", text: "white", label: "EXCLUSIVE" }; 
};

export default function MapNanoCard(props: any) {
  const data = props.data || {};
  const id = props.id || data.id || data._id || `prop-${Math.random()}`;

  // Datos
  const rooms = props.rooms ?? data.rooms ?? 0;
  const baths = props.baths ?? data.baths ?? 0;
  const mBuilt = props.mBuilt ?? data.mBuilt ?? 0;
  const type = props.type || data.type || "Propiedad";
  const img = props.img || props.image || data.img || data.images?.[0] || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3?auto=format&fit=crop&w=800&q=80";
  const city = props.city || data.city;
  const location = props.location || data.location;
  const address = props.address || data.address;
// 1. Entradas con seguridad (Optional Chaining ?. para evitar crash si data es null)
  const rawPriceInput = props.rawPrice ?? data?.rawPrice ?? props.priceValue;
  const stringPriceInput = props.price ?? data?.price; 
  
  // 2. Cálculo memorizado
  const numericPrice = useMemo(() => safeParsePrice(rawPriceInput, stringPriceInput), [rawPriceInput, stringPriceInput]);
  
  // 3. Etiqueta visual (Evitamos mostrar "0 €")
  const displayLabel = useMemo(() => {
    if (numericPrice === 0) return "Consultar"; 
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(numericPrice);
  }, [numericPrice]);

  // 4. Estilo basado en el precio numérico
  const style = getPriceStyle(numericPrice);
 // --- ESTADO & MEMORIA BLINDADA (CORREGIDO) ---
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // EFECTO MAESTRO: MEMORIA + RADIO
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // A. RECUPERAR MEMORIA (Para que nazca del color correcto)
        // 1. Miramos la llave rápida
        let isSaved = localStorage.getItem(`fav-${id}`) === 'true';

        // 2. Si falla, buscamos en la lista maestra por seguridad (Anti-Amnesia)
        if (!isSaved) {
            try {
                const masterList = JSON.parse(localStorage.getItem('stratos_favorites_v1') || '[]');
                // Usamos '==' para que texto y números coincidan
                isSaved = masterList.some((item: any) => item.id == id);
                // Autocorrección: Si estaba en la lista, creamos la llave rápida
                if (isSaved) localStorage.setItem(`fav-${id}`, 'true');
            } catch (e) { console.error(e); }
        }

        // Aplicamos el color correcto al nacer
        setLiked(isSaved);
    }

    // B. ESCUCHAR LA RADIO (Sincronización en tiempo real)
    const handleRemoteCommand = (e: CustomEvent) => {
        // Usamos '==' para evitar errores de tipo (texto vs número)
        if (e.detail && (e.detail.id == id)) {
            // Obedecemos la orden del General (UIPanels)
            setLiked(!!e.detail.isFav);
        }
    };

    if (typeof window !== 'undefined') {
        // Escuchamos la frecuencia correcta: 'sync-property-state'
        window.addEventListener('sync-property-state', handleRemoteCommand as EventListener);
    }
    
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('sync-property-state', handleRemoteCommand as EventListener);
        }
    };
  }, [id]);

  // --- DISPARADOR TÁCTICO CORREGIDO (Sincronizado con UIPanels) ---
  const handleAction = (e: React.MouseEvent, action: string) => {
      e.preventDefault();
      e.stopPropagation(); // Detiene propagación al mapa
      const targetState = action === 'fav' ? !liked : liked;
      
      // 1. OBTENCIÓN DE COORDENADAS (Vital para el vuelo de vuelta desde Favoritos)
      // Buscamos en todas las posibles ubicaciones de los datos
      const navCoords = props.coordinates || 
                        data.coordinates || 
                        data.geometry?.coordinates || 
                        (props.lng && props.lat ? [props.lng, props.lat] : null);

      // 2. PAYLOAD LIMPIO (Paquete de datos estandarizado)
      const payload = {
          id, 
          ...props, 
          ...data,
          // Datos visuales clave
          price: numericPrice,     
          formattedPrice: displayLabel,
          role: style.label,
          img: img,
          type: type,
          location: (city || location || address || "MADRID").toUpperCase(),
          // Estado y Navegación
          isFav: targetState,      
          isFavorite: targetState, // Redundancia de seguridad
          coordinates: navCoords   // <--- ESTO ARREGLA EL VUELO CINEMÁTICO
      };

      if (action === 'fav') {
          setLiked(targetState); // 1. Feedback visual inmediato
          
          if (typeof window !== 'undefined') {
              // 2. SEÑAL CORRECTA: 'toggle-fav-signal'
              // Enviamos el payload DIRECTAMENTE en detail, sin envoltorios extra
              window.dispatchEvent(new CustomEvent('toggle-fav-signal', { 
                  detail: payload 
              }));

              // 3. Opcional: Si damos Like, abrimos la ficha para confirmar
              if (targetState) {
                  window.dispatchEvent(new CustomEvent('open-details-signal', { 
                      detail: payload 
                  }));
              }
          }
          
          // Callback legacy (por seguridad)
          if (props.onToggleFavorite) props.onToggleFavorite(payload);
      }
      
      else if (action === 'open') {
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-details-signal', { 
                  detail: payload 
              }));
          }
          if (props.onSelect) props.onSelect(payload);
      }
  };

  // Z-Index Hack para Mapbox (Evita solapamientos)
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

  return (
    <div 
      ref={cardRef}
      className="pointer-events-auto flex flex-col items-center group relative z-[50]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* TARJETA FLOTANTE 
         FIX DEL RATÓN: Añadido 'pb-6' y ajustado 'bottom' para crear puente invisible 
         entre el Pin y la Tarjeta. El ratón ya no cae al vacío.
      */}
      <div 
          className={`
            absolute bottom-[100%] pb-3 w-[280px] z-[100] origin-bottom
            transition-all duration-300 ease-out transform
            ${isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
          `}
          onClick={(e) => handleAction(e, 'open')}
      >
          <div className="flex flex-col rounded-[24px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/60 cursor-pointer bg-white ring-1 ring-black/5">
              <div className="bg-white relative">
                  <div className="h-44 relative overflow-hidden group/img">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Propiedad"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md border border-white/10" style={{ backgroundColor: style.hex }}>
                          <span className="text-[10px] font-black uppercase tracking-wider text-white shadow-sm">{style.label}</span>
                      </div>

                      {/* BOTÓN CORAZÓN MEJORADO */}
                      <div className="absolute top-3 right-3 z-20">
                          <button 
                              onClick={(e) => handleAction(e, 'fav')} 
                              className={`
                                w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/20 
                                transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg
                                ${liked ? 'bg-red-500 text-white border-transparent' : 'bg-black/40 text-white hover:bg-black/60'}
                              `}
                          >
                              <Heart size={14} className={`transition-transform duration-300 ${liked ? "fill-current scale-110" : "scale-100"}`} />
                          </button>
                      </div>
                  </div>

                  <div className="p-4 pt-3">
                      <div className="flex justify-between items-start mb-0.5">
                          <h3 className="text-base font-bold text-gray-900 leading-tight truncate pr-2 w-2/3">{type}</h3>
                          <span className="text-lg font-black text-gray-900 tracking-tight">{displayLabel}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500 mb-3">
                          <Navigation size={10} style={{ color: style.hex }}/>
                          <span className="text-[9px] font-bold uppercase tracking-wider truncate text-gray-400">{locationText}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-1.5"><Bed size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{rooms}</span></div>
                          <div className="w-[1px] h-3 bg-gray-200"></div>
                          <div className="flex items-center gap-1.5"><Bath size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{baths}</span></div>
                          <div className="w-[1px] h-3 bg-gray-200"></div>
                          <div className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gray-400"/><span className="text-xs font-bold text-gray-700">{mBuilt}m</span></div>
                      </div>
                  </div>
                  <div className="h-1 w-full" style={{ backgroundColor: style.hex }}></div>
              </div>
          </div>
      </div>

      {/* PIN DE MAPA (ESTABLE) */}
      <div 
          className={`
            relative px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] 
            transition-all duration-300 ease-out flex flex-col items-center justify-center z-20 cursor-pointer
            border-[2px] border-white
            ${isHovered ? 'scale-110 -translate-y-1 shadow-xl' : 'scale-100'}
          `}
          style={{ backgroundColor: style.hex }}
          onClick={(e) => handleAction(e, 'open')}
      >
         <span className="text-xs font-bold font-mono tracking-tight whitespace-nowrap text-white drop-shadow-md">
            {displayLabel}
         </span>
         {/* Triángulo del Pin */}
         <div 
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 
            border-l-[6px] border-l-transparent 
            border-r-[6px] border-r-transparent 
            border-t-[8px]" 
            style={{ borderTopColor: style.hex }}
         ></div>
      </div>
    </div>
  );
}


