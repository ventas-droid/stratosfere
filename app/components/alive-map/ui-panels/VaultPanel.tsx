"use client";
import React from 'react';
import { X, Heart, MapPin, Trash2, Navigation } from 'lucide-react';

export default function VaultPanel({ 
  rightPanel, 
  toggleRightPanel, 
  favorites = [], 
  onToggleFavorite, 
  map, 
  soundEnabled, 
  playSynthSound 
}: any) {
  
  if (rightPanel !== 'VAULT') return null;

  const handleFlyTo = (prop: any) => {
    if (soundEnabled) playSynthSound('click');
    
    // 1. ABRIR FICHA DE DETALLES
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-details-signal', { detail: prop }));
    }

    // 2. RECUPERAR EL MOTOR DEL MAPA
    const mapInstance = map?.current || map;
    if (!mapInstance || !mapInstance.flyTo) {
        console.error("🚨 MOTOR DE MAPA NO RESPONDE");
        return;
    }

    // 3. RASTREO DE COORDENADAS (PRIORIDAD TÁCTICA)
    let finalCoords = null;

    // A) Opción 1: Array directo [lng, lat] o [lat, lng]
    if (prop.coordinates && Array.isArray(prop.coordinates)) {
        finalCoords = prop.coordinates;
    } 
    // B) Opción 2: GeoJSON standard
    else if (prop.geometry?.coordinates) {
        finalCoords = prop.geometry.coordinates;
    }
    // C) Opción 3: Propiedades sueltas
    else if (prop.lat && prop.lng) {
        finalCoords = [prop.lng, prop.lat]; // Mapbox requiere [LNG, LAT]
    }
    // D) Opción 4: Location object
    else if (prop.location) {
        finalCoords = prop.location;
    }

    // 4. VALIDACIÓN Y CORRECCIÓN
    if (finalCoords) {
        // Aseguramos que son números
        const c1 = parseFloat(finalCoords[0]);
        const c2 = parseFloat(finalCoords[1]);

        // DETECCIÓN DE LATITUD/LONGITUD INVERTIDA (Corrección automática)
        // En España (Madrid), la Longitud es negativa (-3.x) y Latitud positiva (40.x)
        // Si el primer número es > 30, probablemente es la Latitud y están al revés.
        let target = [c1, c2];
        if (c1 > 30 && c2 < 0) {
            console.warn("⚠️ Coordenadas invertidas detectadas. Corrigiendo rumbo...");
            target = [c2, c1]; // Invertimos a [Lng, Lat]
        }

        console.log(`✈️ VUELO TÁCTICO A: ${prop.title}`, target);

        mapInstance.flyTo({
            center: target,
            zoom: 19.5,      // Zoom extremo (Casi a ras de suelo)
            pitch: 65,       // Inclinación cinematográfica
            bearing: -45,    // Ángulo de entrada
            duration: 3000,  // Vuelo suave
            essential: true
        });
    } else {
        console.error("❌ ERROR: Sin coordenadas válidas para este objetivo.", prop);
        // NO volamos a sitios aleatorios. Nos quedamos quietos para no confundir.
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-right">
      
      {/* FONDO APPLE GLASS */}
      <div className="absolute inset-0 bg-[#E5E5EA]/90 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.2)] border-l border-white/20"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER */}
        <div className="p-8 pb-6 flex justify-between items-start shrink-0">
            <div>
                <h2 className="text-4xl font-black tracking-tight text-[#1c1c1e] mb-1">Favoritos.</h2>
                <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">COLECCIÓN PRIVADA</span>
                    <span className="text-xs font-bold text-slate-400">{favorites.length} Activos</span>
                </div>
            </div>
            <button onClick={() => toggleRightPanel('NONE')} className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-all shadow-sm flex items-center justify-center cursor-pointer"><X size={20} /></button>
        </div>

        {/* LISTA */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-4 scrollbar-hide">
            {favorites.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Heart size={32} className="mb-4 text-slate-300" />
                    <p className="text-sm font-bold uppercase tracking-widest">Sin propiedades</p>
                </div>
            ) : (
                favorites.map((prop: any, index: number) => (
                    <div 
                        key={prop.id || index} 
                        className="bg-white p-3 rounded-[24px] shadow-sm hover:shadow-lg transition-all group relative overflow-hidden border border-white/50"
                    >
                        <div className="flex gap-4 items-center">
                            
                            {/* FOTO (Clic = Volar) */}
                            <div 
                                className="w-24 h-24 rounded-[18px] bg-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-inner relative" 
                                onClick={() => handleFlyTo(prop)}
                            >
                                <img src={prop.img || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Navigation size={20} className="text-white drop-shadow-md"/></div>
                            </div>

                            {/* DATOS */}
                            <div className="flex-1 min-w-0 py-1">
                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">{prop.type || "Inmueble"}</span>
                                
                                <h4 className="font-black text-[#1c1c1e] text-lg leading-tight mb-1 truncate mt-1">
                                    {prop.title || "Propiedad Sin Nombre"}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 mb-3 font-mono">
                                    {prop.formattedPrice || "Precio a consultar"}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleFlyTo(prop)} 
                                        className="flex-1 bg-[#1c1c1e] text-white h-8 rounded-[14px] text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-black hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                                    >
                                        <MapPin size={10} /> LOCALIZAR
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(prop); }} 
                                        className="w-8 h-8 rounded-[14px] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90 cursor-pointer"
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

