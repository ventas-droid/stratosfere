"use client";

import React, { useState } from "react";
import { 
  Search, MapPin, Building2, Home, Briefcase, LandPlot, Check, X, ArrowRight,
  BedDouble, Bath, Car, Trees, Waves, Sun, Warehouse, Shield
} from "lucide-react";

// --- 1. CONFIGURACIÓN DE COLORES (MODO CLARO) ---
const PRICE_TIERS = [
  { id: 'INVEST', label: 'INVERSIÓN', color: 'emerald-600', max: 200000, desc: '< 200k' },
  { id: 'OPPORTUNITY', label: 'OPORTUNIDAD', color: 'yellow-500', max: 550000, desc: '200-550k' },
  { id: 'PREMIUM', label: 'PREMIUM', color: 'orange-500', max: 1200000, desc: '550k-1.2M' },
  { id: 'LUXURY', label: 'LUJO', color: 'red-600', max: 3000000, desc: '1.2M-3M' },
  { id: 'EXCLUSIVE', label: 'EXCLUSIVO', color: 'purple-600', max: 50000000, desc: '> 3M' },
];

// --- 2. TIPOLOGÍA ---
const ASSET_TYPES = [
  { id: 'flat', label: 'Piso', icon: Building2 },
  { id: 'penthouse', label: 'Ático', icon: Sun },
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'office', label: 'Oficina', icon: Briefcase },
  { id: 'land', label: 'Suelo', icon: LandPlot },
  { id: 'industrial', label: 'Nave', icon: Warehouse },
];

// --- 3. EXTRAS ---
const FEATURES = [
  { id: 'pool', label: 'Piscina', icon: Waves },
  { id: 'garage', label: 'Garaje', icon: Car },
  { id: 'garden', label: 'Jardín', icon: Trees },
  { id: 'security', label: 'Seguridad', icon: Shield },
];

export default function StratosConsole({ 
  onLaunch, 
  onClose, 
  isInitial = false,
  onToggleProfile,  // <--- Nuevo
  onToggleMarket,   // <--- Nuevo
  onToggleWizard    // <--- Nuevo
}: any) {  
    
  // ESTADOS
  const [location, setLocation] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]); 
  const [selectedType, setSelectedType] = useState("all");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // LOGICA
  const toggleTier = (id: string) => setSelectedTiers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const toggleFeature = (id: string) => setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const handleLaunch = () => {
    let maxPrice = 50000000;
    if (selectedTiers.length > 0) {
        const activeTiers = PRICE_TIERS.filter(t => selectedTiers.includes(t.id));
        maxPrice = Math.max(...activeTiers.map(t => t.max));
    }

    const payload = {
        location,
        priceMax: maxPrice,
        type: selectedType,
        specs: { beds, baths, features: selectedFeatures }
    };
    onLaunch(payload);
  };

  return (
    <div className={`
        pointer-events-auto
        ${isInitial ? 'fixed inset-0 z-[60000] flex items-center justify-center bg-black/20 backdrop-blur-xl' : 'absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[20000]'}
        animate-fade-in transition-all duration-500
    `}>
      {/* 🔥 CONTENEDOR CRISTAL BLANCO (ESTILO APPLE) */}
      <div className={`
          relative w-full max-w-6xl 
          bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80
          border border-white/50 shadow-2xl ring-1 ring-black/5
          overflow-hidden flex flex-col text-black
          ${isInitial ? 'rounded-[2.5rem] h-[85vh]' : 'rounded-[2rem] max-h-[80vh]'}
      `}>
        
        {/* CABECERA: LOGO TIPOGRÁFICO PURO */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-gray-100 bg-white/50">
            <div>
                {/* 🟢 LOGO CÓDIGO (Sin Imagen) */}
                <h2 className="text-4xl font-extrabold tracking-tighter text-black leading-none cursor-default mb-1">
                    Stratosfere OS.
                </h2>
                <p className="text-gray-400 font-bold text-[10px] tracking-[0.2em] uppercase pl-1">
                    MÓDULO DE BÚSQUEDA AVANZADA
                </p>
            </div>
            {!isInitial && (
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-black flex items-center justify-center transition-all">
                    <X size={20} />
                </button>
            )}
        </div>

        {/* CUERPO DEL PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gradient-to-b from-white to-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* === COLUMNA IZQUIERDA (5 cols) === */}
                <div className="lg:col-span-5 space-y-10">
                    
                    {/* 1. OBJETIVO */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin size={12} className="text-black"/> 1. Zona de Despliegue
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                            </div>
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ciudad, Barrio o Zona..."
                                autoFocus={isInitial}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-5 pl-14 pr-4 text-xl text-black font-bold placeholder-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* 2. REQUERIMIENTOS */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-6">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">2. Especificaciones</label>
                        
                        {/* Contadores */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><BedDouble size={12}/> Dormitorios</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBeds(Math.max(0, beds-1))} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                                    <span className="text-2xl font-black text-black w-6 text-center">{beds === 0 ? '0+' : beds}</span>
                                    <button onClick={() => setBeds(beds+1)} className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 font-bold">+</button>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Bath size={12}/> Baños</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBaths(Math.max(0, baths-1))} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">-</button>
                                    <span className="text-2xl font-black text-black w-6 text-center">{baths === 0 ? '0+' : baths}</span>
                                    <button onClick={() => setBaths(baths+1)} className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 font-bold">+</button>
                                </div>
                            </div>
                        </div>

                        {/* Extras */}
                        <div className="grid grid-cols-2 gap-3">
                            {FEATURES.map(feat => (
                                <button 
                                    key={feat.id}
                                    onClick={() => toggleFeature(feat.id)}
                                    className={`
                                        flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-bold transition-all border
                                        ${selectedFeatures.includes(feat.id) ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <feat.icon size={14} /> {feat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === COLUMNA DERECHA (7 cols) === */}
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* 3. ESTRATEGIA (COLORES) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">3. Estrategia de Inversión</label>
                            {selectedTiers.length > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{selectedTiers.length} SELECCIONADOS</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {PRICE_TIERS.map((tier) => {
                                const isSelected = selectedTiers.includes(tier.id);
                                return (
                                    <button
                                        key={tier.id}
                                        onClick={() => toggleTier(tier.id)}
                                        className={`
                                            relative h-24 pl-5 rounded-2xl border transition-all duration-300 text-left overflow-hidden group shadow-sm hover:shadow-md
                                            ${isSelected ? `bg-white ring-2 ring-${tier.color} border-transparent` : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${tier.color} transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}></div>
                                        
                                        <div className="flex flex-col justify-center h-full pl-3">
                                            <span className={`text-sm font-black tracking-wide ${isSelected ? 'text-black' : 'text-gray-600'}`}>{tier.label}</span>
                                            <span className={`text-[10px] font-bold mt-1 ${isSelected ? `text-${tier.color}` : 'text-gray-400'}`}>{tier.desc}</span>
                                        </div>
                                        {isSelected && <div className={`absolute top-3 right-3 bg-${tier.color} text-white p-1 rounded-full`}><Check size={10}/></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. TIPO DE ACTIVO */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">4. Clase de Activo</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {ASSET_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`
                                        flex flex-col items-center justify-center gap-3 p-3 rounded-2xl border transition-all aspect-square shadow-sm hover:shadow
                                        ${selectedType === type.id ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200' : 'bg-white border-gray-200 text-gray-400 hover:text-black hover:border-gray-300'}
                                    `}
                                >
                                    <type.icon size={20} strokeWidth={2} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-gray-100 bg-white/50 backdrop-blur-md flex justify-between items-center">
            <div className="hidden md:block">
                <p className="text-xs text-gray-500 font-medium">
                   {location ? <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500"/> Buscando en <b className="text-black">{location}</b></span> : 'Esperando coordenadas...'}
                </p>
            </div>
            <button 
                onClick={handleLaunch}
                className="w-full md:w-auto px-12 py-5 bg-[#0071e3] hover:bg-[#0077ED] text-white font-black text-xs tracking-[0.2em] uppercase rounded-full hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95"
            >
                <span>{isInitial ? 'Ver Resultados' : 'Actualizar'}</span>
                <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </div>
  );
}

