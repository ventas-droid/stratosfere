"use client";
import React, { useState, useEffect } from 'react';import { 
    X, Heart, Phone, Sparkles, 
    // Iconos Genéricos
    Star, 
    // Iconos Físicos (Para Ficha Técnica)
    Home, Maximize2, Building2, ArrowUp, // Básicos
    Car, Trees, Waves, Sun, Box, Thermometer, ShieldCheck,
    // Iconos Servicios (Para Sección Servicios)
    Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, 
    TrendingUp, Share2, Mail, FileText, FileCheck, Activity, 
    Newspaper, KeyRound, Sofa, Droplets, Paintbrush, Truck, Briefcase,
    Bed, Bath
} from 'lucide-react';

// --- 1. CONFIGURACIÓN: DICCIONARIO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    // --- FÍSICOS (Van a Ficha Técnica) ---
    'pool': Waves, 'piscina': Waves,
    'garage': Car, 'garaje': Car, 'parking': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees,
    'elevator': ArrowUp, 'ascensor': ArrowUp, 'lift': ArrowUp,
    'terrace': Sun, 'terraza': Sun,
    'storage': Box, 'trastero': Box, 
    'ac': Thermometer, 'aire': Thermometer, 'calefaccion': Thermometer,
    'security': ShieldCheck, 'seguridad': ShieldCheck, 'alarma': ShieldCheck,

    // --- SERVICIOS MARKETING/GESTIÓN (Van abajo) ---
    'foto': Camera, 'photo': Camera,
    'video': Globe, 
    'drone': Plane, 
    'tour3d': Box, '3d': Box,
    'render': Hammer, 
    'plano': Ruler, 'plano_2d': Ruler, 'plano_3d': LayoutGrid, 
    'destacado': TrendingUp, 
    'ads': Share2, 'publicidad': Share2,
    'email': Mail, 
    'copy': FileText, 
    'certificado': FileCheck, 
    'tasacion': Activity, 
    'revista': Newspaper, 
    'openhouse': KeyRound, 
    'homestaging': Sofa, 
    'limpieza': Droplets, 
    'pintura': Paintbrush, 
    'mudanza': Truck, 
    'abogado': Briefcase, 
    'seguro': ShieldCheck
};

// Claves que FORZAREMOS a ir a la Ficha Técnica (ignorando mayúsculas/corchetes)
const PHYSICAL_KEYWORDS = [
  'pool', 'piscina', 'garage', 'garaje', 'parking', 'garden', 'jardin', 'jardín', 
  'terrace', 'terraza', 'storage', 'trastero', 'ac', 'aire', 'security', 'seguridad',
  'elevator', 'ascensor', 'lift'
];

export default function DetailsPanel({ 
  // 🔥 AQUÍ ESTÁ EL TRUCO: Renombramos la entrada usando los dos puntos (:)
  // Esto dice: "Recibe 'selectedProp', pero llámalo 'initialProp' aquí dentro"
  selectedProp: initialProp, 
  onClose, 
  onToggleFavorite, 
  favorites = [], 
  onOpenInspector 
}: any) {
    
    // 1. AHORA SÍ PODEMOS CREAR 'selectedProp' SIN QUE CHOQUE
    const [selectedProp, setSelectedProp] = useState(initialProp);

    // 2. SINCRONIZACIÓN (Si cambia la casa seleccionada desde fuera)
    useEffect(() => {
        setSelectedProp(initialProp);
    }, [initialProp]);

    // 3. RECEPTOR DE SEÑAL (Actualización en vivo)
    useEffect(() => {
        const handleLiveUpdate = (e: any) => {
            const { id, updates } = e.detail;
            if (selectedProp && String(selectedProp.id) === String(id)) {
                setSelectedProp((prev: any) => ({ ...prev, ...updates }));
            }
        };
        window.addEventListener('update-property-signal', handleLiveUpdate);
        return () => window.removeEventListener('update-property-signal', handleLiveUpdate);
    }, [selectedProp]);

    // Guard de seguridad
    if (!selectedProp) return null;

    // ========================================================================
    // 🛠️ 1. LIMPIEZA DE DATOS (Tags y Strings sucios)
    // ========================================================================

    // Función: Deja SOLO letras y números. Elimina [" ] ' y cualquier símbolo raro.
    // ESTO ARREGLA EL PROBLEM DE ["POOL"]
    const cleanKey = (raw: any): string => {
        if (!raw) return "";
        let str = String(raw);
        str = str.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
        return str;
    };

    // Función: Etiquetas bonitas (ej: pool -> Piscina)
    const getNiceLabel = (key: string) => {
        const labels: any = {
            'pool': 'Piscina', 'garage': 'Garaje', 'garden': 'Jardín',
            'elevator': 'Ascensor', 'ascensor': 'Ascensor', 'lift': 'Ascensor',
            'terrace': 'Terraza', 'storage': 'Trastero',
            'ac': 'Aire Acond.', 'security': 'Seguridad', 
            'foto': 'Fotografía Pro', 'video': 'Vídeo', 'drone': 'Dron', 
            'ads': 'Campaña Ads', 'destacado': 'Destacado', 
            'plano_2d': 'Plano 2D', 'plano_3d': 'Plano 3D',
            'email': 'Email Mkt', 'copy': 'Copywriting'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    // A. RECOLECCIÓN DE TODOS LOS TAGS
    const allTags = new Set<string>();

    // 1. Del array selectedServices
    if (selectedProp?.selectedServices) {
        let services = selectedProp.selectedServices;
        if (typeof services === 'string') {
             services.split(',').forEach(s => allTags.add(cleanKey(s)));
        } else if (Array.isArray(services)) {
             services.forEach(s => allTags.add(cleanKey(s)));
        }
    }

    // 2. De las propiedades booleanas directas
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac'].forEach(k => {
        const val = selectedProp?.[k];
        // Aquí usamos una comprobación laxa para añadir el tag
        if (val === true || val === "true" || val === "Sí" || val === "Si" || val === 1) {
            allTags.add(cleanKey(k));
        }
    });

    // B. SEPARACIÓN EN DOS LISTAS: FÍSICOS VS SERVICIOS
    const physicalItems: any[] = [];
    const serviceItems: any[] = [];

    allTags.forEach(tag => {
        if (!tag) return;
        
        // El Ascensor lo quitamos de aquí porque tiene su propia caja especial
        if (['elevator', 'ascensor', 'lift'].includes(tag)) return;

        const itemObj = {
            id: tag,
            label: getNiceLabel(tag),
            icon: ICON_MAP[tag] || Star 
        };

        if (PHYSICAL_KEYWORDS.includes(tag)) {
            physicalItems.push(itemObj);
        } else {
            serviceItems.push(itemObj);
        }
    });

    // ========================================================================
    // 🚨 FIX ASCENSOR: CAPTURA EL "Sí" DEL ARCHITECTHUD
    // ========================================================================
    
    let hasElevator = false;

    // Helper para detectar "Sí", "Si", "Yes", "true", "1"
    // AQUÍ ESTÁ LA SOLUCIÓN A TU PROBLEMA DEL "NO TIENE"
    const isYes = (val: any) => {
        if (!val) return false;
        const s = String(val).toLowerCase().trim();
        // Agregamos explícitamente 'si' y 'sí' con tilde
        return ['si', 'sí', 'yes', 'true', '1', 'on'].includes(s);
    };
    
    // 1. Revisión masiva de cualquier campo que suene a ascensor
    if (isYes(selectedProp?.elevator)) hasElevator = true;
    if (isYes(selectedProp?.ascensor)) hasElevator = true;
    if (isYes(selectedProp?.hasElevator)) hasElevator = true;
    if (selectedProp?.specs && isYes(selectedProp.specs.elevator)) hasElevator = true;

    // 2. Revisión de Tags (Por si viene en la lista de extras)
    if (allTags.has('elevator') || allTags.has('ascensor')) {
        hasElevator = true;
    }

    // 3. Fallback: Búsqueda de texto bruto en servicios
    const rawServicesString = JSON.stringify(selectedProp?.selectedServices || "").toLowerCase();
    if (rawServicesString.includes("elevator") || rawServicesString.includes("ascensor")) {
        hasElevator = true;
    }

    // Configuración visual del Ascensor
    const elevatorText = hasElevator ? "SÍ TIENE" : "NO TIENE";
    const elevatorColor = hasElevator ? "text-green-600" : "text-slate-400";
    const elevatorIconColor = hasElevator ? "text-green-500" : "text-slate-300";


    // D. DATOS GENERALES Y FORMATO
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = selectedProp?.mBuilt || selectedProp?.m2 || selectedProp?.surface || 0;
    const isFavorite = favorites.some((f: any) => f.id === selectedProp?.id);
    
    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[rating] || "bg-gray-400";
    };

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                {/* --- HEADER --- */}
                <div className="px-8 pt-10 pb-4 flex justify-between items-start shrink-0">
                    <div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block shadow-blue-200 shadow-sm">
                            {selectedProp?.type || "INMUEBLE"}
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 leading-none mb-1">
                            {selectedProp?.title || "Detalle del Inmueble"}
                        </h2>
                        <p className="text-xl font-bold text-slate-500">
                            {(() => {
                              const raw = (selectedProp as any)?.rawPrice ?? (selectedProp as any)?.priceValue ?? (selectedProp as any)?.price;
                              const num = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(String(raw).replace(/[^0-9]/g, '')) : NaN;
                              if (!Number.isFinite(num) || num <= 0) {
                                return (selectedProp as any)?.formattedPrice || (selectedProp as any)?.displayPrice || (selectedProp as any)?.price || 'Consultar';
                              }
                              return new Intl.NumberFormat('es-ES').format(num) + ' €';
                            })()}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* --- SCROLL CONTENT --- */}
                <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-6 scrollbar-hide">
                    
                    {/* 1. FOTO */}
                    <div onClick={onOpenInspector} className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:shadow-2xl transition-shadow">
                        <img src={img} className="w-full h-full object-cover" alt="Propiedad" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
                    </div>

                    {/* 2. DATOS RÁPIDOS */}
                    <div className="flex justify-between gap-3">
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Hab.</span>
                            <div className="font-black text-lg flex items-center gap-1">
                                <Bed size={16} className="text-slate-800"/> {selectedProp?.rooms || 0}
                            </div>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Baños</span>
                            <div className="font-black text-lg flex items-center gap-1">
                                <Bath size={16} className="text-slate-800"/> {selectedProp?.baths || 0}
                            </div>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">M²</span>
                            <div className="font-black text-lg flex items-center gap-1">
                                <Maximize2 size={16} className="text-slate-800"/> {m2}
                            </div>
                        </div>
                    </div>

                    {/* 3. FICHA TÉCNICA (FÍSICOS) */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Home size={14} className="text-blue-500"/> Ficha Técnica & Extras
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Tipología */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Tipología</span>
                                <span className="font-bold text-sm text-slate-800">{selectedProp?.type || "Piso"}</span>
                            </div>
                            
                            {/* Superficie */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Superficie</span>
                                <span className="font-bold text-sm text-slate-800">{m2} m²</span>
                            </div>

                            {/* EL ASCENSOR (Arreglado para "Sí") */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center group">
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Ascensor</span>
                                    <span className={`font-bold text-sm ${elevatorColor}`}>
                                        {elevatorText}
                                    </span>
                                </div>
                                <ArrowUp size={18} className={`${elevatorIconColor} group-hover:-translate-y-1 transition-transform`} />
                            </div>

                            {/* Extras Físicos (Piscina, Garaje...) */}
                            {physicalItems.map((item) => (
                                <div key={item.id} className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center group">
                                    <div>
                                        <span className="text-[9px] text-blue-400 font-bold uppercase block">Incluido</span>
                                        <span className="font-bold text-sm text-blue-900">{item.label}</span>
                                    </div>
                                    <item.icon size={18} className="text-blue-500 group-hover:scale-110 transition-transform"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. DESCRIPCIÓN */}
                    {selectedProp?.description && (
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-white">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-3">
                                Sobre este inmueble
                            </span>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                                {selectedProp.description}
                            </p>
                        </div>
                    )}

                    {/* 5. CERTIFICADO ENERGÉTICO */}
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-white flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Certificación<br/>Energética</span>
                        
                        {selectedProp?.energyPending ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 animate-pulse">
                                En trámite
                            </span>
                        ) : (
                            <div className="flex gap-3">
                                {selectedProp?.energyConsumption ? (
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyConsumption)}`}>
                                            {selectedProp.energyConsumption}
                                        </div>
                                        <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Cons.</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-gray-400 font-bold self-center">N/D</span>
                                )}

                                {selectedProp?.energyEmissions && (
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyEmissions)}`}>
                                            {selectedProp.energyEmissions}
                                        </div>
                                        <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Emis.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 6. SERVICIOS ACTIVOS (Marketing/Gestión) */}
                    {serviceItems.length > 0 && (
                        <div className="bg-[#F2F2F7] rounded-[24px] p-6 shadow-inner border border-white">
                            <div className="text-center mb-5 opacity-60">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-slate-500">
                                    <Sparkles size={12} className="text-purple-500"/> Servicios Activos
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {serviceItems.map((item) => (
                                    <div key={item.id} className="flex flex-col items-center gap-2 group cursor-default">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform duration-300">
                                            <item.icon size={20} strokeWidth={2}/>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase text-center leading-tight">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="h-6"></div>
                </div>

                {/* --- FOOTER --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20">
                    <button className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95">
                        <Phone size={18} /> Contactar Agente
                    </button>
                    <button 
                        onClick={() => onToggleFavorite && onToggleFavorite(selectedProp)}
                        className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500"}`}
                    >
                        <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
    );
}

