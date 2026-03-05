// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { X, Heart, MapPin, Trash2, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function VaultPanel({ 
  rightPanel, 
  toggleRightPanel, 
  favorites = [], 
  onToggleFavorite, 
  map, 
  soundEnabled, 
  playSynthSound 
}: any) {
  
  // 1. MEMORIA DE COMBATE
  const [localFavorites, setLocalFavorites] = useState<any[]>(favorites);

  // 2. REABASTECIMIENTO
  useEffect(() => { setLocalFavorites(favorites); }, [favorites]);

  // 3. RADAR DE PRECIOS EN TIEMPO REAL
  useEffect(() => {
      const handleInstantUpdate = (e: any) => {
          const { id, updates } = e.detail;
          
          setLocalFavorites((prevList: any[]) => prevList.map((item: any) => {
              if (String(item.id) === String(id)) {
                  const merged = { ...item, ...updates };
                  
                  // Formateo de precio si cambia
                  const rawVal = updates.rawPrice ?? updates.priceValue ?? updates.price;
                  const numVal = Number(String(rawVal).replace(/\D/g, ''));

                  if (!isNaN(numVal) && numVal > 0) {
                      const prettyPrice = new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR', 
                          maximumFractionDigits: 0 
                      }).format(numVal);
                      merged.formattedPrice = prettyPrice;
                      merged.price = prettyPrice; 
                  }
                  return merged;
              }
              return item;
          }));
      };
      
      window.addEventListener('update-property-signal', handleInstantUpdate);
      return () => window.removeEventListener('update-property-signal', handleInstantUpdate);
  }, []);

 // 🏷️ EL TEXTO CORTO DE LA TARJETA (La Verdad de Mapbox)
  const getLocationLabel = (p: any) => {
      return String(p.address || p.city || "UBICACIÓN PRIVADA").toUpperCase();
  };

  // 🔥 SOLUCIÓN ESTRATÉGICA FINAL (VERSIÓN INMORTAL): VUELO + DATOS RICOS
const handleFlyTo = (prop) => {
  if (soundEnabled && typeof playSynthSound === 'function') playSynthSound('click');
  
  try {
      // 1. EXTRACCIÓN AGRESIVA (Normalización de Coordenadas)
      const rawLng = prop.coordinates?.[0] ?? prop.longitude ?? prop.lng;
      const rawLat = prop.coordinates?.[1] ?? prop.latitude ?? prop.lat;

      const lng = parseFloat(String(rawLng));
      const lat = parseFloat(String(rawLat));

      const areCoordsValid = Number.isFinite(lng) && Number.isFinite(lat) && (Math.abs(lng) > 0.0001);
      
      let finalCoords = null;
      if (areCoordsValid) {
           // Si Lng > 30 es Latitud (Giro para España)
           finalCoords = (Math.abs(lng) > 30 && Math.abs(lat) < 20) ? [lat, lng] : [lng, lat];
      }

      // 2. 🔥 RESCATE PROFUNDO DE B2B (Evita que desaparezca al 2º click)
      // Buscamos la campaña en: 1. El objeto b2b, 2. activeCampaign, 3. El primer elemento del array campaigns
      const sourceCampaign = prop.activeCampaign || (prop.campaigns && prop.campaigns[0]);
      
      let b2bData = prop.b2b;
      if (!b2bData && sourceCampaign) {
          b2bData = {
              sharePct: Number(sourceCampaign.commissionSharePct || 0),
              visibility: sourceCampaign.commissionShareVisibility || 'PRIVATE'
          };
      } else if (!b2bData && prop.sharePct) {
          b2bData = {
              sharePct: Number(prop.sharePct || 0),
              visibility: prop.shareVisibility || 'PRIVATE'
          };
      }

      // 3. RESCATE DE OPEN HOUSE
      const openHouseData = prop.openHouse || prop.open_house_data || (prop.openHouses && prop.openHouses[0]) || null;

     // 4. EMPAQUETADO BLINDADO
      const richPayload = {
          ...prop,
          id: String(prop.id),
          
         // 🔥 DATOS FÍSICOS PUROS (Usando 'prop' en lugar de 'liveData')
      address: prop.address || null,
      city: prop.city || null,
      postcode: prop.postcode || null,
      region: prop.region || null,
          
          coordinates: finalCoords, 
          b2b: b2bData, 
          openHouse: openHouseData, 
          user: prop.user || prop.ownerSnapshot || { name: "Agencia" },
          isCaptured: !!(prop.isCaptured || sourceCampaign)
      };

// 5. EJECUCIÓN SÍNCRONA DE SEÑALES
if (typeof window !== 'undefined') {
    // A) SELECCIÓN
    window.dispatchEvent(new CustomEvent("select-property-signal", { 
        detail: { id: String(prop.id) } 
    }));

    // B) APERTURA
    window.dispatchEvent(new CustomEvent('open-details-signal', { 
        detail: richPayload 
    }));
    
    // C) 🔥 VUELO TURBO (Sin Lag)
    if (finalCoords) {
        // Usamos requestAnimationFrame para esperar al siguiente frame de renderizado (aprox 16ms)
        // Esto es instantáneo para el ojo, pero seguro para el motor del mapa.
        requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('fly-to-location', { 
                detail: { 
                    center: finalCoords,
                    zoom: 18.5,      
                    pitch: 60,
                    duration: 1500 // La duración del vuelo se mantiene suave
                } 
            }));
        });
    } else {
        console.warn("⚠️ Coordenadas inválidas.");
    }
}

  } catch (err) { 
      console.error("❌ Error crítico en secuencia de vuelo:", err); 
  }
};
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-right border-l border-white/20">
      
      {/* FONDO EFECTO CRISTAL */}
      <div className="absolute inset-0 bg-[#F2F2F7]/95 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.15)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
      {/* HEADER ESTRUCTURADO CON BOTÓN VOLVER */}
        <div className="p-6 pb-4 shrink-0 border-b border-black/5 flex flex-col gap-6">
            
            {/* 🔥 BOTÓN DE RETIRADA TÁCTICA (VOLVER) - DISEÑO CLONADO 🔥 */}
            <button 
                onClick={() => toggleRightPanel('NONE')} 
                className="flex items-center gap-2 px-5 py-2.5 bg-[#8b7b6c]/90 hover:bg-[#8b7b6c] text-white font-bold tracking-widest text-xs rounded-full transition-all active:scale-95 shadow-md w-fit backdrop-blur-sm"
            >
                <ArrowLeft size={16} strokeWidth={2.5} /> VOLVER
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-0.5">Favoritos.</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">COLECCIÓN PRIVADA</span>
                       <span className="text-xs font-bold text-slate-400">{localFavorites.length} Activos</span>
                    </div>
                </div>
                <button 
                    onClick={() => toggleRightPanel('NONE')} 
                    className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer border border-black/5 shrink-0"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* LISTA SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-20">
            
            {localFavorites.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Heart size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-center">Bóveda Vacía</p>
                    <p className="text-xs mt-2 max-w-[200px] text-center">Explora el mapa y pulsa el corazón para guardar activos.</p>
                </div>
            ) : (
                localFavorites.map((prop: any, index: number) => (
                 <div 
                        key={prop.id || index} 
                        className="bg-white p-3 md:p-4 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all group relative overflow-hidden border border-slate-100 cursor-pointer"
                        onClick={() => handleFlyTo(prop)}
                    >
                        <div className="flex gap-4 items-start">
                            
                           {/* FOTO MINIATURA (AMPLIADA Y MEJORADA) */}
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[18px] bg-slate-200 overflow-hidden shrink-0 relative shadow-inner">
                                <Image 
                                    src={prop.img || prop.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3"} 
                                    alt="Miniatura" 
                                    fill
                                    sizes="128px"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                    quality={50}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Navigation size={20} className="text-white drop-shadow-md"/>
                                </div>
                            </div>

                            {/* DATOS (SIN RESTRICCIÓN DE ALTURA, TOTALMENTE ELÁSTICO) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[7rem] py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0">
                                            {prop.type || "Inmueble"}
                                        </span>
                                        <span className="font-black text-slate-900 text-sm truncate">
                                            {prop.formattedPrice || prop.price || "Consultar"}
                                        </span>
                                    </div>
                                    
                                    <h4 className="font-bold text-[#1c1c1e] text-sm md:text-base leading-tight truncate">
                                        {prop.title || "Propiedad sin nombre"}
                                    </h4>
                                    
                                   {/* DIRECCIÓN: Estilo limpio (Mis Activos) */}
                                    <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2 leading-snug pr-2">
                                       {prop.address || prop.city || "Ubicación Privada"}
                                    </p>
                                </div>
                                
                               {/* BOTONERA INTERNA MÁS GRANDE Y ESPACIADA */}
                                <div className="flex items-center gap-2 mt-3 w-full">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFlyTo(prop);
                                    }}
                                    className="flex-1 min-w-0 bg-[#1c1c1e] text-white h-8 md:h-9 rounded-[10px] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:scale-[1.02] transition-all shadow-md active:scale-95 px-2"
                                  >
                                    <MapPin size={12} className="shrink-0" /> 
                                    <span className="truncate">LOCALIZAR</span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onToggleFavorite) onToggleFavorite({ ...prop, isFav: false });
                                    }}
                                    className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100 hover:border-red-500"
                                    title="Eliminar de Favoritos"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}