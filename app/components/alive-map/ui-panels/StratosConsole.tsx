"use client";

import React, { useState } from "react";
import { 
  Search, MapPin, Building2, Home, Briefcase, LandPlot, Check, X, ArrowRight,
  BedDouble, Bath, Car, Trees, Waves, Sun, Warehouse, Shield,
  LayoutGrid, Star, Zap, Activity, Sofa, Flame
} from "lucide-react";

// --- 1. CONFIGURACIÓN DE COLORES ---
const PRICE_TIERS = [
  { id: 'INVEST', label: 'INVERSIÓN', color: 'emerald-600', max: 200000, desc: '< 200k' },
  { id: 'OPPORTUNITY', label: 'OPORTUNIDAD', color: 'yellow-500', max: 550000, desc: '200-550k' },
  { id: 'PREMIUM', label: 'PREMIUM', color: 'orange-500', max: 1200000, desc: '550k-1.2M' },
  { id: 'LUXURY', label: 'LUJO', color: 'red-600', max: 3000000, desc: '1.2M-3M' },
  { id: 'EXCLUSIVE', label: 'EXCLUSIVO', color: 'purple-600', max: 999999999, desc: '> 3M' }, // Límite infinito para mansiones
];

// --- 2. TIPOLOGÍA (AMPLIADA Y SEGURA) ---
const ASSET_TYPES = [
  { id: 'flat', label: 'Piso', icon: Building2 },
  { id: 'penthouse', label: 'Ático', icon: Sun },
  { id: 'duplex', label: 'Dúplex', icon: LayoutGrid }, 
  { id: 'loft', label: 'Loft', icon: Star },  
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'bungalow', label: 'Bungalow', icon: Trees }, 
  { id: 'office', label: 'Oficina', icon: Briefcase },
  { id: 'land', label: 'Suelo', icon: LandPlot },
  { id: 'industrial', label: 'Nave', icon: Warehouse },
];

// --- 3. EXTRAS (AMPLIADOS Y SEGUROS) ---
const FEATURES = [
  { id: 'pool', label: 'Piscina', icon: Waves },
  { id: 'garage', label: 'Garaje', icon: Car },
  { id: 'garden', label: 'Jardín', icon: Trees },
  { id: 'terrace', label: 'Terraza', icon: Sun },    
  { id: 'balcony', label: 'Balcón', icon: LayoutGrid },    
  { id: 'storage', label: 'Trastero', icon: Warehouse },
  { id: 'ac', label: 'Aire Acond.', icon: Zap },       
  { id: 'heating', label: 'Calefacción', icon: Activity }, 
  { id: 'furnished', label: 'Amueblado', icon: Sofa },    
  { id: 'security', label: 'Seguridad', icon: Shield },
];

export default function StratosConsole({ 
  onLaunch, 
  onClose, 
  isInitial = false,
  onToggleProfile,
  onToggleMarket,
  onToggleWizard
}: any) {  
    
  // ESTADOS ORIGINALES RESPETADOS
  const [location, setLocation] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]); 
  const [selectedType, setSelectedType] = useState("all"); // Vuelve a ser String para no romper el mapa
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // 🔥 NUEVO ESTADO: MODO FUEGO (VIP)
  const [premiumOnly, setPremiumOnly] = useState(false);

  // LOGICA
  const toggleTier = (id: string) => setSelectedTiers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const toggleFeature = (id: string) => setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const handleLaunch = () => {
    let maxPrice = 999999999; // Presupuesto infinito por defecto
    if (selectedTiers.length > 0) {
        const activeTiers = PRICE_TIERS.filter(t => selectedTiers.includes(t.id));
        maxPrice = Math.max(...activeTiers.map(t => t.max));
    }

    // 📦 PAQUETE IDÉNTICO AL ORIGINAL + premiumOnly
    const payload = {
        location,
        priceMax: maxPrice,
        type: selectedType, 
        premiumOnly: premiumOnly, // <--- La orden secreta del Fuego
        specs: { beds, baths, features: selectedFeatures }
    };
    
    // 🔥 ENLACE DE RADIO DIRECTO: Disparamos la orden directamente al cerebro del mapa
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apply-filter-signal', { detail: payload }));
    }
    
    // Mantenemos esto para que la consola se cierre correctamente
    if (onLaunch) onLaunch(payload);
  };

  return (
    <div className={`
        pointer-events-auto
        ${isInitial ? 'fixed inset-0 z-[60000] flex items-center justify-center bg-black/20 backdrop-blur-xl' : 'absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl z-[20000]'}
        animate-fade-in transition-all duration-500
    `}>
      <div className={`
          relative w-full max-w-6xl 
          bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80
          border border-white/50 shadow-2xl ring-1 ring-black/5
          overflow-hidden flex flex-col text-black
          ${isInitial ? 'rounded-[2.5rem] h-[85vh]' : 'rounded-[2rem] max-h-[85vh]'}
      `}>
        
        {/* CABECERA: LOGO */}
        <div className="flex justify-between items-center px-10 py-6 border-b border-gray-100 bg-white/50 shrink-0">
            <div>
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

                        {/* Extras Ampliados en Grid Perfecto de 2 columnas */}
                        <div className="grid grid-cols-2 gap-3">
                            {FEATURES.map(feat => (
                                <button 
                                    key={feat.id}
                                    onClick={() => toggleFeature(feat.id)}
                                    className={`
                                        flex items-center justify-start gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase
                                        ${selectedFeatures.includes(feat.id) ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <feat.icon size={14} className="shrink-0" /> <span className="truncate">{feat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === COLUMNA DERECHA (7 cols) === */}
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* 🔥 EL MODO FUEGO CORONANDO LA COLUMNA DERECHA 🔥 */}
                    <div 
                        onClick={() => setPremiumOnly(!premiumOnly)}
                        className={`cursor-pointer p-5 rounded-[24px] border-2 flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-md ${
                            premiumOnly 
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400' 
                            : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/20'
                        }`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${premiumOnly ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] rotate-12' : 'bg-gray-50'}`}>
                                <Flame size={24} className={premiumOnly ? "text-white fill-white" : "text-gray-300"} />
                            </div>
                            <div>
                                <h4 className={`text-xl font-black tracking-tight ${premiumOnly ? 'text-amber-700' : 'text-gray-800'}`}>
                                    Modo Fuego <span className="text-[10px] uppercase tracking-widest ml-1 opacity-60 bg-black/5 px-2 py-0.5 rounded-md">VIP</span>
                                </h4>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">Filtrar solo propiedades exclusivas promocionadas.</p>
                            </div>
                        </div>
                        {/* Toggle Switch Apple Style */}
                        <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${premiumOnly ? 'bg-amber-500' : 'bg-gray-200'}`}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${premiumOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

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
                                            relative h-20 pl-4 rounded-2xl border transition-all duration-300 text-left overflow-hidden group shadow-sm hover:shadow-md
                                            ${isSelected ? `bg-white ring-2 ring-${tier.color} border-transparent` : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${tier.color} transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}></div>
                                        <div className="flex flex-col justify-center h-full pl-2">
                                            <span className={`text-sm font-black tracking-wide ${isSelected ? 'text-black' : 'text-gray-600'}`}>{tier.label}</span>
                                            <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? `text-${tier.color}` : 'text-gray-400'}`}>{tier.desc}</span>
                                        </div>
                                        {isSelected && <div className={`absolute top-2 right-2 bg-${tier.color} text-white p-1 rounded-full`}><Check size={10}/></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. TIPO DE ACTIVO (Grid 3x3 perfecto) */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">4. Clase de Activo</label>
                        <div className="grid grid-cols-3 gap-3">
                            {ASSET_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(selectedType === type.id ? "all" : type.id)}
                                    className={`
                                        flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all shadow-sm hover:shadow
                                        ${selectedType === type.id ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200 scale-105' : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <type.icon size={20} strokeWidth={selectedType === type.id ? 2.5 : 1.5} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER RESTAURADO A SU FORMA ORIGINAL */}
        <div className="p-8 border-t border-gray-100 bg-white/50 backdrop-blur-md flex justify-between items-center shrink-0">
            <div className="hidden md:block">
                <p className="text-xs text-gray-500 font-medium">
                   {location ? <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500"/> Buscando en <b className="text-black">{location}</b></span> : 'Esperando coordenadas...'}
                </p>
            </div>
            <button 
                onClick={handleLaunch}
                className="w-full md:w-auto px-12 py-5 bg-[#0071e3] hover:bg-[#0077ED] text-white font-black text-xs tracking-[0.2em] uppercase rounded-full hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95"
            >
                <span>{isInitial ? 'Ver Resultados' : 'Actualizar Mapa'}</span>
                <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </div>
  );
}