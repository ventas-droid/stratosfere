"use client";
import React from 'react';
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
  
  // 1. SI NO ES EL PANEL ACTIVO, NO RENDERIZAR NADA
  if (rightPanel !== 'VAULT') return null;

  // 2. LÓGICA DE VUELO TÁCTICO (La parte que usted ya tenía bien)
  const handleFlyTo = (prop: any) => {
    if (soundEnabled) playSynthSound('click');
    
    // A. ABRIR FICHA DE DETALLES (Izquierda)
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-details-signal', { detail: prop }));
    }

    // B. RECUPERAR EL MOTOR DEL MAPA
    const mapInstance = map?.current || map;
    if (!mapInstance || !mapInstance.flyTo) {
        console.error("🚨 MOTOR DE MAPA NO RESPONDE");
        return;
    }

    // C. RASTREO DE COORDENADAS
    let finalCoords = null;

    if (prop.coordinates && Array.isArray(prop.coordinates)) {
        finalCoords = prop.coordinates;
    } else if (prop.geometry?.coordinates) {
        finalCoords = prop.geometry.coordinates;
    } else if (prop.lat && prop.lng) {
        finalCoords = [prop.lng, prop.lat]; 
    } else if (prop.location && Array.isArray(prop.location)) {
        finalCoords = prop.location; 
    }

    // D. EJECUCIÓN DEL VUELO
    if (finalCoords) {
        const c1 = parseFloat(finalCoords[0]);
        const c2 = parseFloat(finalCoords[1]);
        
        // Corrección Madrid (Si latitud/longitud están invertidas)
        let target = [c1, c2];
        if (c1 > 30 && c2 < 0) {
            target = [c2, c1]; 
        }

        console.log(`✈️ VUELO TÁCTICO A: ${prop.title}`, target);

        mapInstance.flyTo({
            center: target,
            zoom: 18.5,      
            pitch: 60,       
            bearing: -45,    
            duration: 2500,  
            essential: true
        });
    }
  };

  // 3. RENDERIZADO VISUAL (Aquí estaba el destrozo, ahora reparado)
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-right border-l border-white/20">
      
      {/* FONDO EFECTO CRISTAL */}
      <div className="absolute inset-0 bg-[#F2F2F7]/95 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.15)]"></div>

      <div className="relative z-10 flex flex-col h-full text-slate-900">
        
        {/* HEADER: TÍTULO Y CIERRE */}
        <div className="p-6 pb-4 flex justify-between items-center shrink-0 border-b border-black/5">
            <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-0.5">Favoritos.</h2>
                <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">COLECCIÓN PRIVADA</span>
                    <span className="text-xs font-bold text-slate-400">{favorites.length} Activos</span>
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
            
            {/* CASO VACÍO */}
            {favorites.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Heart size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-center">Bóveda Vacía</p>
                    <p className="text-xs mt-2 max-w-[200px] text-center">Explora el mapa y pulsa el corazón para guardar activos.</p>
                </div>
            ) : (
                /* LISTA DE TARJETAS */
                favorites.map((prop: any, index: number) => (
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
                                {/* Overlay al pasar el ratón */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Navigation size={20} className="text-white drop-shadow-md"/>
                                </div>
                            </div>

                            {/* DATOS DE LA PROPIEDAD */}
                            <div className="flex-1 min-w-0 py-1 flex flex-col h-24 justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider truncate max-w-[100px]">
                                            {prop.type || "Inmueble"}
                                        </span>
                                        {/* PRECIO */}
                                        <span className="font-black text-slate-900 text-sm">
                                            {prop.formattedPrice || prop.price || "Consultar"}
                                        </span>
                                    </div>
                                    
                                    <h4 className="font-bold text-[#1c1c1e] text-sm leading-tight truncate">
                                        {prop.title || "Propiedad sin nombre"}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 font-mono truncate uppercase">
                                        {prop.location || "Ubicación desconocida"}
                                    </p>
                                </div>
                                
                                {/* BOTONES DE ACCIÓN (LOCALIZAR Y BORRAR) */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleFlyTo(prop); }} 
                                        className="flex-1 bg-[#1c1c1e] text-white h-7 rounded-[10px] text-[9px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-black hover:scale-105 transition-all shadow-md active:scale-95"
                                    >
                                        <MapPin size={10} /> LOCALIZAR
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); // Evita que vuele al hacer clic en borrar
                                            onToggleFavorite(prop); // Llama a la función de borrado de UIPanels
                                        }} 
                                        className="w-7 h-7 rounded-[10px] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100 hover:border-red-500"
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


