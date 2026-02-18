// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { X, Heart, MapPin, Trash2, Navigation, ArrowRight } from 'lucide-react';

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

  const getLocationLabel = (p: any) => {
    if (typeof p?.location === "string" && p.location.trim()) return p.location;
    if (typeof p?.address === "string" && p.address.trim()) return p.address;
    if (typeof p?.city === "string" && p.city.trim()) return p.city;
    if (typeof p?.zone === "string" && p.zone.trim()) return p.zone;
    return "Ubicación desconocida";
  };

  // 🔥 SOLUCIÓN ESTRATÉGICA: VUELO + DATOS RICOS
  const handleFlyTo = (prop: any) => {
    if (soundEnabled && typeof playSynthSound === 'function') playSynthSound('click');
    
    try {
        // 1. EXTRACCIÓN AGRESIVA (Rompe el bucle de los 2 toques)
        // Buscamos el dato donde sea. Si coordinates está vacío, salta a longitude.
        const rawLng = prop.coordinates?.[0] ?? prop.longitude ?? prop.lng;
        const rawLat = prop.coordinates?.[1] ?? prop.latitude ?? prop.lat;

        // Convertimos a número matemático YA. (El mapa odia el texto)
        const lng = parseFloat(String(rawLng));
        const lat = parseFloat(String(rawLat));

        // Validación Final
        const areCoordsValid = Number.isFinite(lng) && Number.isFinite(lat) && (Math.abs(lng) > 0.0001);
        
        // Giramos si es necesario (España: Lat ~40, Lng ~-3)
        let finalCoords = null;
        if (areCoordsValid) {
             finalCoords = (lng > 30 && lat < 0) ? [lat, lng] : [lng, lat];
        }

        // 2. FABRICACIÓN DE DATOS (Arregla la NanoCard vacía)
        let b2bData = prop.b2b;
        if (!b2bData) {
            if (prop.activeCampaign) {
                b2bData = {
                    sharePct: Number(prop.activeCampaign.commissionSharePct || 0),
                    visibility: prop.activeCampaign.commissionShareVisibility || 'PRIVATE'
                };
            } else if (prop.sharePct) {
                b2bData = {
                    sharePct: Number(prop.sharePct || 0),
                    visibility: prop.shareVisibility || 'PRIVATE'
                };
            }
        }

        // 3. EMPAQUETADO BLINDADO
        const richPayload = {
            ...prop,
            id: String(prop.id),
            coordinates: finalCoords, 
            b2b: b2bData, // <--- Aquí inyectamos lo que faltaba
            
            // Aseguramos identidad
            user: prop.user || prop.ownerSnapshot || { name: "Propietario" },
            isCaptured: prop.isCaptured || (prop.activeCampaign?.status === 'ACCEPTED'),
            activeCampaign: prop.activeCampaign
        };

        // 4. EJECUCIÓN (Con micro-pausa para que el mapa no se queje)
        if (typeof window !== 'undefined') {
            // A) Abrir ficha YA (con datos ricos)
            window.dispatchEvent(new CustomEvent('open-details-signal', { detail: richPayload }));
            
            // B) Volar en 100ms
            if (finalCoords) {
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('fly-to-location', { 
                        detail: { 
                            center: finalCoords,
                            zoom: 18.5,      
                            pitch: 60,
                            duration: 1500
                        } 
                    }));
                }, 100);
            } else {
                console.warn("⚠️ Coordenadas inválidas, se abre ficha sin vuelo.");
            }
        }

    } catch (err) { console.error("Error táctico en vuelo:", err); }
  };
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-right border-l border-white/20">
      
      {/* FONDO EFECTO CRISTAL */}
      <div className="absolute inset-0 bg-[#F2F2F7]/95 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.15)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER */}
        <div className="p-6 pb-4 flex justify-between items-center shrink-0 border-b border-black/5">
            <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-0.5">Favoritos.</h2>
                <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">COLECCIÓN PRIVADA</span>
                   <span className="text-xs font-bold text-slate-400">{localFavorites.length} Activos</span>
                </div>
            </div>
            <button 
                onClick={() => toggleRightPanel('NONE')} 
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer border border-black/5"
            >
                <X size={20} />
            </button>
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
                        className="bg-white p-3 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all group relative overflow-hidden border border-white cursor-pointer"
                        onClick={() => handleFlyTo(prop)}
                    >
                        <div className="flex gap-4 items-start">
                            
                            {/* FOTO MINIATURA */}
                            <div className="w-24 h-24 rounded-[18px] bg-slate-200 overflow-hidden shrink-0 relative shadow-inner">
                                <img 
                                    src={prop.img || prop.image || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3"} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Navigation size={20} className="text-white drop-shadow-md"/>
                                </div>
                            </div>

                            {/* DATOS */}
                            <div className="flex-1 min-w-0 py-1 flex flex-col h-24 justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider truncate max-w-[100px]">
                                            {prop.type || "Inmueble"}
                                        </span>
                                        <span className="font-black text-slate-900 text-sm">
                                            {prop.formattedPrice || prop.price || "Consultar"}
                                        </span>
                                    </div>
                                    
                                    <h4 className="font-bold text-[#1c1c1e] text-sm leading-tight truncate">
                                        {prop.title || "Propiedad sin nombre"}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 font-mono truncate uppercase">
                                       {getLocationLabel(prop)}
                                    </p>
                                </div>
                                
                               {/* BOTONERA INTERNA */}
                                <div className="flex items-center gap-2 mt-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFlyTo(prop);
                                    }}
                                    className="flex-1 bg-[#1c1c1e] text-white h-7 rounded-[10px] text-[9px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-black hover:scale-105 transition-all shadow-md active:scale-95"
                                  >
                                    <MapPin size={10} /> LOCALIZAR
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onToggleFavorite) onToggleFavorite({ ...prop, isFav: false });
                                    }}
                                    className="w-7 h-7 rounded-[10px] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100 hover:border-red-500"
                                    title="Eliminar de Favoritos"
                                  >
                                    <Trash2 size={12} />
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