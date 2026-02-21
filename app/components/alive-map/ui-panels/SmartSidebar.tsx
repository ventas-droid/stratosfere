"use client";

import React, { useState, useEffect, useMemo } from 'react';
// 🔥 Añadidos iconos de Sun (Áticos), Briefcase (Oficinas) y X (Cerrar)
import { Search, MapPin, Flame, BedDouble, Bath, ArrowRight, Sparkles, Building2, Home, Sun, Briefcase, Maximize, X } from 'lucide-react';
import { StratosEngine } from '@/app/utils/StratosEngine';

// 🔥 1. VITAL: Añadimos { onClose } para que el botón de su barra lo pueda cerrar
export default function SmartSidebar({ onClose }: { onClose?: () => void }) {
  const [inventory, setInventory] = useState<any[]>([]);
  
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  
// 2. ESCUCHAMOS AL MAPA Y PEDIMOS LOS DATOS
  useEffect(() => {
    const handleInventory = (e: any) => {
        if (e.detail && Array.isArray(e.detail)) {
            setInventory(e.detail);
        }
    };
    window.addEventListener('stratos-inventory-ready', handleInventory);
    
    // 🔥 3. EL GRITO: Pedimos las casas inmediatamente al abrirse
    window.dispatchEvent(new CustomEvent('request-stratos-inventory'));
    
    return () => window.removeEventListener('stratos-inventory-ready', handleInventory);
  }, []);

  const results = useMemo(() => {
    if (inventory.length === 0) return [];
    return StratosEngine.processRadar(inventory, {
        location: query,
        type: selectedType,
        premiumOnly: premiumOnly
    });
  }, [inventory, query, selectedType, premiumOnly]);

 const handleCardClick = (p: any) => {
      // Misil 1: Volar al mapa (Frecuencia corregida a "map-fly-to")
      const lng = p.longitude || p.lng || (p.coordinates && p.coordinates[0]);
      const lat = p.latitude || p.lat || (p.coordinates && p.coordinates[1]);
      
      if (lng && lat) {
          window.dispatchEvent(new CustomEvent('map-fly-to', { 
              detail: { center: [lng, lat], zoom: 18, pitch: 60, bearing: -20, duration: 2500 } 
          }));
      }

      // 🔥 Misil 2: DISPARO DIRECTO A LA ANTENA OFICIAL DE SU SISTEMA
      window.dispatchEvent(new CustomEvent('open-details-signal', { detail: p }));
  };

  return (
    
    // 🔥 4. AJUSTE DE DISEÑO: top-0 (Sube hasta el final de la pantalla) y pt-16 (baja el buscador 1 dedo). z-[999999] aplasta el SYSTEM ONLINE.
<div className="fixed right-7 top-0 bottom-10 w-[490px] pt-8 z-[999999] flex flex-col gap-4 pointer-events-none animate-fade-in-right">        {/* === BUSCADOR INTELIGENTE === */}
<div className="bg-white/95 backdrop-blur-xl rounded-[28px] pt-12 pb-12 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white pointer-events-auto shrink-0 flex flex-col gap-6 relative">        
          
            {/* 🔥 5. LA 'X' PARA CERRAR EL RADAR DESDE ARRIBA */}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-all z-10"
                    title="Cerrar radar"
                >
                    <X size={18} />
                </button>
            )}

            {/* Cabecera / Input */}
            <div className="relative group mt-2 pr-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                </div>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ciudad, zona, precio..."
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-base text-black font-bold placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>

            {/* 🔥 6. LOS BOTONES (Pisos, Villas, Áticos, Oficinas) */}
            <div className="flex flex-wrap items-center gap-2">
                <button 
                    onClick={() => setSelectedType(selectedType === 'flat' ? 'all' : 'flat')}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === 'flat' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                    <Building2 size={13} /> Pisos
                </button>
                <button 
                    onClick={() => setSelectedType(selectedType === 'villa' ? 'all' : 'villa')}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === 'villa' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                    <Home size={13} /> Villas
                </button>
                <button 
                    onClick={() => setSelectedType(selectedType === 'penthouse' ? 'all' : 'penthouse')}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === 'penthouse' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                    <Sun size={13} /> Áticos
                </button>
                <button 
                    onClick={() => setSelectedType(selectedType === 'office' ? 'all' : 'office')}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === 'office' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                    <Briefcase size={13} /> Oficinas
                </button>
                
                {/* Botón VIP Fuego */}
                <button 
                    onClick={() => setPremiumOnly(!premiumOnly)}
                    className={`w-12 h-10 shrink-0 flex items-center justify-center rounded-xl border transition-all ${premiumOnly ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30' : 'bg-white border-gray-200 hover:bg-amber-50'}`}
                >
                    <Flame size={18} className={premiumOnly ? 'text-white fill-white' : 'text-gray-400'} />
                </button>
            </div>
        </div>

        {/* === LISTA DE RESULTADOS (CASCADA) === */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto flex flex-col gap-4 pb-10">
            {results.map((p, index) => {
                const isMatch = p.isPerfectMatch;
                const safeImg = p.img || (p.images && p.images[0]?.url) || p.mainImage;
                
                return (
                    <div 
                        key={p.id || index}
                        onClick={() => handleCardClick(p)}
                        className={`group bg-white rounded-[24px] p-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 ${isMatch ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-transparent shadow-md'}`}
                    >
                        {/* Foto de la Propiedad */}
                        <div className="relative w-full h-48 rounded-[18px] overflow-hidden mb-3 bg-gray-100">
                            {safeImg ? (
                                <img src={safeImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={32}/></div>
                            )}
                            
                            {/* Badges Flotantes */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {(p.promotedTier === 'PREMIUM' || p.isPromoted) && (
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                        <Flame size={10} className="fill-white"/> VIP
                                    </span>
                                )}
                            </div>

                            {/* Refuerzo Positivo: Alma Gemela */}
                            {isMatch && (
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-amber-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                                    <Sparkles size={12} /> 100% Match
                                </div>
                            )}
                        </div>

                     {/* Detalles */}
                        <div className="px-3 pb-3">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    {/* Etiqueta de Tipo */}
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        {p.type || 'Propiedad'}
                                    </h3>
                                    {/* Etiqueta de Referencia (REF) */}
                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                                        REF: {p.refCode || p.ref || p.id?.substring(0,6)}
                                    </span>
                                </div>
                                {/* Precio */}
                                <span className="text-2xl font-black text-black tracking-tight">{Number(p.priceValue || p.price || 0).toLocaleString('es-ES')} €</span>
                            </div>
                            
                            {/* Título de la propiedad */}
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">{p.title || 'Propiedad Exclusiva'}</h4>
                            
                            {/* 📍 Localidad / Ubicación Real */}
                            <div className="flex items-center gap-1 text-gray-500 text-[11px] font-medium mb-2">
                                <MapPin size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate">{p.city || p.region || p.address || 'Ubicación no especificada'}</span>
                            </div>
                            
                            {/* Especificaciones e Icono Flecha */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div className="flex gap-4 text-gray-500 text-xs font-bold">
                                    <span className="flex items-center gap-1" title="Dormitorios"><BedDouble size={14}/> {p.rooms || 0}</span>
                                    <span className="flex items-center gap-1" title="Baños"><Bath size={14}/> {p.baths || 0}</span>
                                    {/* 🔥 AQUÍ ESTÁ EL AÑADIDO: Metros cuadrados */}
                                    <span className="flex items-center gap-1" title="Metros construidos"><Maximize size={14}/> {p.mBuilt || p.m2 || 0} m²</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {results.length === 0 && (
                <div className="bg-white/95 backdrop-blur rounded-[24px] p-8 text-center flex flex-col items-center justify-center h-48 border border-gray-100 shadow-xl mt-2">
                    <Search className="text-gray-300 mb-3" size={32} />
                    <p className="text-gray-500 font-bold text-sm">El radar no ha detectado objetivos con ese perfil.</p>
                </div>
            )}
        </div>
    </div>
  );
}