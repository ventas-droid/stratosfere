"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Search, MapPin, Flame, BedDouble, Bath, ArrowRight, Sparkles, 
    Building2, Home, Sun, Briefcase, Maximize, X, User, LayoutGrid, Star, LandPlot, Warehouse, FilterX, Target, ArrowDown, ArrowUp
} from 'lucide-react';
import { StratosBrain } from '@/app/utils/StratosBrain';

const ASSET_TYPES = [
    { id: 'flat', label: 'Piso', icon: Building2 },
    { id: 'penthouse', label: 'Ático', icon: Sun },
    { id: 'duplex', label: 'Dúplex', icon: LayoutGrid }, 
    { id: 'loft', label: 'Loft', icon: Star },  
    { id: 'villa', label: 'Villa', icon: Home },
    { id: 'office', label: 'Oficina', icon: Briefcase },
    { id: 'land', label: 'Suelo', icon: LandPlot },
    { id: 'industrial', label: 'Nave', icon: Warehouse },
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
};

export default function SmartSidebar({ onClose }: { onClose?: () => void }) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  // 🔥 ESTADO DE APARCAMIENTO TÁCTICO
  const [isParked, setIsParked] = useState(false);
  // 🔥 ESTADO DE ORDENACIÓN (Relevancia, Mayor a Menor, Menor a Mayor)
  const [sortOrder, setSortOrder] = useState<'match' | 'price-desc' | 'price-asc'>('match');
  
  const [crosshair, setCrosshair] = useState<{lng: number, lat: number} | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 🔥 CONSULTA AL CEREBRO: ¿HAY AMBIGÜEDAD?
  const suggestions = useMemo(() => {
      return StratosBrain.getClarifications(query);
  }, [query]);

  useEffect(() => {
    const handleInventory = (e: any) => {
        if (e.detail && Array.isArray(e.detail)) setInventory(e.detail);
    };
    const handleMapMove = (e: any) => {
        if (e.detail?.lng !== undefined && e.detail?.lat !== undefined) {
            setCrosshair({ lng: e.detail.lng, lat: e.detail.lat });
        }
    };
const handlePark = (e: any) => {
        if (e.detail && e.detail.park !== undefined) {
            setIsParked(e.detail.park);
        }
    };

    window.addEventListener('stratos-inventory-ready', handleInventory);
    window.addEventListener('map-center-updated', handleMapMove); 
    window.addEventListener('park-smart-sidebar', handlePark);
    window.dispatchEvent(new CustomEvent('request-stratos-inventory'));
    window.dispatchEvent(new CustomEvent('request-map-center'));
    
    return () => {
        window.removeEventListener('stratos-inventory-ready', handleInventory);
        window.removeEventListener('map-center-updated', handleMapMove);
        window.removeEventListener('park-smart-sidebar', handlePark);
    };
  }, []);

  const results = useMemo(() => {
    if (inventory.length === 0) return [];
    
    let processed = [...inventory];

    if (selectedType !== 'all') {
        processed = processed.filter(p => p.type?.toLowerCase() === selectedType.toLowerCase());
    }
    if (premiumOnly) {
        processed = processed.filter(p => p.isFire === true);
    }

    if (query.trim() !== "") {
        processed = StratosBrain.process(query, processed);
    } else {
        processed = processed.map(p => ({ ...p, matchPercentage: null, isPerfectMatch: false, dopamineTags: [] }));
    }

    processed = processed.map(p => {
        let distanceKm = null;
        const propLat = Number(p.latitude ?? p.lat ?? (p.coordinates ? p.coordinates[1] : 0));
        const propLng = Number(p.longitude ?? p.lng ?? (p.coordinates ? p.coordinates[0] : 0));
        if (crosshair && propLat && propLng) distanceKm = calculateDistance(crosshair.lat, crosshair.lng, propLat, propLng);
        return { ...p, distanceKm };
    });

    // 🔥 APLICAR LA ORDENACIÓN SELECCIONADA POR EL USUARIO
    if (sortOrder === 'price-desc') {
        // Mayor a Menor
        processed.sort((a, b) => {
            const priceA = Number(String(a.priceValue || a.price || 0).replace(/\D/g, ""));
            const priceB = Number(String(b.priceValue || b.price || 0).replace(/\D/g, ""));
            return priceB - priceA;
        });
    } else if (sortOrder === 'price-asc') {
        // Menor a Mayor
        processed.sort((a, b) => {
            const priceA = Number(String(a.priceValue || a.price || 0).replace(/\D/g, ""));
            const priceB = Number(String(b.priceValue || b.price || 0).replace(/\D/g, ""));
            return priceA - priceB;
        });
    } else {
        // Por defecto: Relevancia (Match o Distancia)
        if (query.trim() !== "") {
            processed.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
        } else if (crosshair) {
            processed.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }
    }

    return processed;
  }, [inventory, query, selectedType, premiumOnly, crosshair, sortOrder]);

  const handleCardClick = (p: any) => {
      const lng = p.longitude || p.lng || (p.coordinates && p.coordinates[0]);
      const lat = p.latitude || p.lat || (p.coordinates && p.coordinates[1]);
      if (lng && lat) {
          window.dispatchEvent(new CustomEvent('map-fly-to', { 
              detail: { center: [lng, lat], zoom: 18, pitch: 60, bearing: -20, duration: 2500 } 
          }));
      }
      window.dispatchEvent(new CustomEvent('open-details-signal', { detail: p }));
  };

  const clearFilters = () => {
      setQuery("");
      setSelectedType("all");
      setPremiumOnly(false);
      setSortOrder('match');
  };

  return (
<div className={`fixed right-7 top-0 bottom-10 w-[490px] pt-8 flex flex-col gap-4 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isParked ? 'translate-x-[120%] opacity-0 z-[10]' : 'translate-x-0 opacity-100 z-[999999]'}`}>        
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] pt-12 pb-6 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white pointer-events-auto shrink-0 flex flex-col gap-5 relative">        
            {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-1.5 rounded-full transition-all z-10">
                    <X size={18} />
                </button>
            )}

            <div className="relative group mt-2 pr-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-blue-500 transition-colors" size={20} />
                </div>
             <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: Madrid hasta 12.000.000..."
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 font-bold placeholder-blue-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>

            {/* 🔥 EL FALDÓN DE DESAMBIGUACIÓN 🔥 */}
            {suggestions && suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-1 mb-1 animate-fade-in-down bg-blue-50/80 p-3 rounded-2xl border border-blue-100 shadow-inner">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={12} /> Ojo, hay varios resultados. ¿Te refieres a...?
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setQuery(s)} 
                                className="px-4 py-2 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-blue-600 hover:text-white hover:shadow-md transition-all border border-blue-200 active:scale-95"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setPremiumOnly(!premiumOnly)}
                    className={`w-12 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-300 ${premiumOnly ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-transparent shadow-lg shadow-orange-500/30' : 'bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-200'}`}
                >
                    <Flame size={18} className={premiumOnly ? 'text-white fill-white' : 'text-slate-400'} />
                </button>
                <div className="w-[1px] h-8 bg-slate-200 shrink-0 mx-1"></div>
                <div ref={carouselRef} className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button onClick={() => setSelectedType('all')} className={`shrink-0 snap-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Todos</button>
                    {ASSET_TYPES.map((type) => (
                        <button key={type.id} onClick={() => setSelectedType(type.id)} className={`shrink-0 snap-start flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedType === type.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}>
                            <type.icon size={14} /> {type.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* 🔥 CONTROLES DE ORDENACIÓN Y ESTADÍSTICAS */}
            <div className="flex justify-between items-end px-1 mt-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{results.length} Objetivos</span>
                    {crosshair && <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1"><Target size={10}/> Radar Calibrado</span>}
                </div>

                {/* BOTONES DE ORDEN (Relevancia / Caro / Barato) */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setSortOrder('match')} 
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sortOrder === 'match' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        IA Match
                    </button>
                    <button 
                        onClick={() => setSortOrder('price-desc')} 
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sortOrder === 'price-desc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Mayor a menor precio"
                    >
                        Precio <ArrowDown size={12} strokeWidth={3}/>
                    </button>
                    <button 
                        onClick={() => setSortOrder('price-asc')} 
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sortOrder === 'price-asc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Menor a mayor precio"
                    >
                        Precio <ArrowUp size={12} strokeWidth={3}/>
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto flex flex-col gap-4 pb-10">
            {results.map((p, index) => {
                const safeImg = p.img || (p.images && p.images[0]?.url) || p.mainImage;
                const hasB2B = p.b2b && Number(p.b2b.sharePct) > 0;
                const isAgency = hasB2B || String(p.user?.role || p.role || "").toUpperCase().includes('AGEN');
                
                return (
                    <div key={p.id || index} onClick={() => handleCardClick(p)} className={`group bg-white rounded-[24px] p-2.5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 ${p.isPerfectMatch ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : 'border-transparent shadow-md hover:border-blue-100'}`}>
                        <div className="relative w-full h-48 rounded-[18px] overflow-hidden mb-3 bg-slate-100 shadow-inner">
                            {safeImg ? ( <img src={safeImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> ) : ( <div className="w-full h-full flex flex-col items-center justify-center text-slate-300"><Home size={32} className="mb-2"/><span className="text-[9px] uppercase font-bold tracking-widest">Sin Foto</span></div> )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60"></div>

                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {p.isFire === true && (
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-sm">
                                        <Flame size={12} className="fill-white animate-pulse"/> FUEGO
                                    </span>
                                )}
                            </div>
                            
                            <div className="absolute top-3 right-3">
                                {isAgency ? ( <div className="bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg"><Briefcase size={10} /> Agencia</div> ) : ( <div className="bg-white/90 backdrop-blur-md text-slate-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/50 flex items-center gap-1.5 shadow-lg"><User size={10} /> Particular</div> )}
                            </div>

                            {p.matchPercentage && (
                                <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${p.isPerfectMatch ? 'bg-amber-400 text-amber-950' : 'bg-white/90 backdrop-blur text-blue-600'}`}>
                                    <Sparkles size={12} /> {p.isPerfectMatch ? '100% MATCH' : `${p.matchPercentage}% AFINIDAD`}
                                </div>
                            )}

                            {p.dopamineTags && p.dopamineTags.length > 0 && (
                                <div className="absolute top-1/2 left-0 w-full px-3 flex flex-col items-start gap-1.5 -translate-y-1/2 pointer-events-none">
                                    {p.dopamineTags.map((tag: string, i: number) => (
                                        <span key={i} className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl shadow-black/20 border border-white/50 animate-fade-in-right" style={{ animationDelay: `${i * 150}ms` }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {p.distanceKm !== null && !isNaN(p.distanceKm) && (
                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-white/20 shadow-lg flex items-center gap-1.5">
                                    <Target size={12} className="text-blue-400" /> 
                                    a {p.distanceKm < 1 ? '< 1' : p.distanceKm.toFixed(1)} km
                                </div>
                            )}
                        </div>

                        <div className="px-3 pb-2">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">{p.type || 'Inmueble'}</h3>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REF: {p.refCode || p.ref || p.id?.substring(0,6)}</span>
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">{Number(p.priceValue || p.price || 0).toLocaleString('es-ES')} €</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 mt-1">{p.title || 'Propiedad Exclusiva'}</h4>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-3">
                                <MapPin size={12} className="text-indigo-400 shrink-0" />
                                <span className="truncate">{p.city || p.region || p.address || 'Ubicación Privada'}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex gap-2">
                                    {Number(p.rooms) > 0 && ( <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold"><BedDouble size={12} className="text-slate-400"/> {p.rooms}</span> )}
                                    {Number(p.baths) > 0 && ( <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold"><Bath size={12} className="text-slate-400"/> {p.baths}</span> )}
                                    {Number(p.mBuilt || p.m2) > 0 && ( <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-bold"><Maximize size={12} className="text-slate-400"/> {p.mBuilt || p.m2}m²</span> )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-md group-hover:scale-105 active:scale-95"><ArrowRight size={14} /></div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {results.length === 0 && (
                <div className="bg-white/95 backdrop-blur rounded-[28px] p-8 text-center flex flex-col items-center justify-center border border-slate-100 shadow-xl mt-2 animate-scale-in">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><FilterX className="text-slate-400" size={28} /></div>
                    <h4 className="text-slate-900 font-black text-lg mb-1">Radar Limpio</h4>
                    <p className="text-slate-500 font-medium text-xs mb-6 px-4">Ningún activo cumple esos requisitos estrictos. Prueba a ser menos restrictivo.</p>
                    <button onClick={clearFilters} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg">Limpiar Búsqueda</button>
                </div>
            )}
        </div>
    </div>
  );
}