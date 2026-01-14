// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase,
    Star, Home, Maximize2, Building2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, 
    Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, 
    TrendingUp, Share2, Mail, FileText, FileCheck, Activity, 
    Newspaper, KeyRound, Sofa, Droplets, Paintbrush, Truck, 
    Bed, Bath
} from 'lucide-react';

// --- DICCIONARIO MAESTRO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves, 'garage': Car, 'garaje': Car, 'parking': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees, 'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun, 'storage': Box, 'trastero': Box, 
    'ac': Thermometer, 'aire': Thermometer, 'calefaccion': Thermometer,
    'security': ShieldCheck, 'seguridad': ShieldCheck, 'alarma': ShieldCheck,
    'foto': Camera, 'video': Globe, 'drone': Plane, 'tour3d': Box, 'render': Hammer, 
    'plano': Ruler, 'plano_2d': Ruler, 'destacado': TrendingUp, 'ads': Share2, 
    'email': Mail, 'certificado': FileCheck, 'tasacion': Activity, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 'abogado': Briefcase
};

const PHYSICAL_KEYWORDS = [
  'pool', 'piscina', 'garage', 'garaje', 'parking', 'garden', 'jardin', 'jardín', 
  'terrace', 'terraza', 'storage', 'trastero', 'ac', 'aire', 'security', 'seguridad',
  'elevator', 'ascensor', 'lift'
];

export default function AgencyDetailsPanel({ 
  selectedProp: initialProp, 
  onClose, 
  onToggleFavorite, 
  favorites = [], 
  onOpenInspector,
  agencyData: initialAgencyData // <--- RECIBIMOS EL DATO (Puede ser null)
}: any) {
    
    // 1. ESTADO DE LA PROPIEDAD (Para actualizaciones en vivo)
    const [selectedProp, setSelectedProp] = useState(initialProp);
    
    // 2. SINCRONIZACIÓN (Si cambias de casa en el mapa, actualizamos aquí)
    useEffect(() => { setSelectedProp(initialProp); }, [initialProp]);

    // 🔥 CORRECCIÓN MAESTRA: DATOS DEL DUEÑO DIRECTOS (SIN MEMORIA)
    // No usamos useState aquí. Leemos directamente lo que entra.
    // Prioridad: Lo que manda el index > El usuario de la propiedad > Objeto vacío
    const activeData = initialAgencyData || selectedProp?.user || {};

    // 3. ESCUCHA ACTIVA (Para cambios de precio en tiempo real)
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

    // --- VARIABLES DE IDENTIDAD (PARA USAR EN EL HTML MÁS ABAJO) ---
    const name = activeData.companyName || activeData.name || "Usuario Stratos";
    const avatar = activeData.companyLogo || activeData.avatar || null;
    const role = activeData.role || "PARTICULAR";
    const phone = activeData.phone || activeData.mobile || null;
    const isVerified = !!(activeData.cif || activeData.licenseNumber);
    
    // --- LÓGICA DE LIMPIEZA DE DATOS ---
    const cleanKey = (raw: any) => String(raw || "").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
    
    const getNiceLabel = (key: string) => {
        const labels: any = {
            'pool': 'Piscina', 'garage': 'Garaje', 'garden': 'Jardín', 'elevator': 'Ascensor', 
            'terrace': 'Terraza', 'storage': 'Trastero', 'ac': 'Aire Acond.', 'security': 'Seguridad', 
            'foto': 'Fotografía Pro', 'video': 'Vídeo', 'drone': 'Dron', 'ads': 'Campaña Ads',
            'plano_2d': 'Plano 2D', 'email': 'Email Mkt'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    if (!selectedProp) return null;

    // --- RECOLECCIÓN DE TAGS ---
    const allTags = new Set<string>();
    if (selectedProp?.selectedServices) {
        let services = selectedProp.selectedServices;
        if (typeof services === 'string') services.split(',').forEach(s => allTags.add(cleanKey(s)));
        else if (Array.isArray(services)) services.forEach(s => allTags.add(cleanKey(s)));
    }
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac'].forEach(k => {
        const val = selectedProp?.[k];
        if (val === true || val === "true" || val === "Sí" || val === "Si" || val === 1) allTags.add(cleanKey(k));
    });

    const physicalItems: any[] = [];
    const serviceItems: any[] = [];

    allTags.forEach(tag => {
        if (!tag || ['elevator', 'ascensor', 'lift'].includes(tag)) return;
        const itemObj = { id: tag, label: getNiceLabel(tag), icon: ICON_MAP[tag] || Star };
        if (PHYSICAL_KEYWORDS.includes(tag)) physicalItems.push(itemObj); 
        else serviceItems.push(itemObj);
    });
    
    // Lógica Ascensor
    let hasElevator = false;
    const isYes = (val: any) => ['si', 'sí', 'yes', 'true', '1', 'on'].includes(String(val || '').toLowerCase().trim());
    if (isYes(selectedProp?.elevator) || isYes(selectedProp?.ascensor) || allTags.has('elevator')) hasElevator = true;
    
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = Number(selectedProp?.mBuilt || selectedProp?.m2 || selectedProp?.surface || 0);
    const isFavorite = favorites.some((f: any) => f.id === selectedProp?.id);
    
    // Colores Energía
    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[rating] || "bg-gray-400";
    };

  
   
    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            {/* FONDO CRYSTAL */}
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                
                {/* --- 🔥 HEADER CORPORATIVO PREMIUM --- */}
                <div className="relative shrink-0 z-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e293b] border-b border-white/10"></div>
                    <div className="relative z-10 px-8 pt-12 pb-8 flex flex-col gap-6">
                         {/* Fila Superior: Logo y Botón Cerrar */}
                         <div className="flex justify-between items-start">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-2xl shadow-black/50 border border-white/20 rotate-1 group-hover:rotate-0 transition-transform duration-500">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Logo" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white px-2 py-1 rounded-full border-[3px] border-[#020617] shadow-lg flex items-center gap-1">
                                    <ShieldCheck size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 text-white/70 hover:text-white">
                                <X size={20} />
                            </button>
                         </div>

                         {/* Fila Inferior: Datos de la Agencia */}
                         <div>
                            <h2 className="text-3xl font-black text-white leading-none mb-3 tracking-tight drop-shadow-md">
                                {name}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-blue-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase size={12}/> {role}
                                </span>
                               {phone && (  // <--- CAMBIAR agencyData.phone POR phone
                                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Phone size={12}/> {phone}
                                    </span>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* --- CONTENIDO SCROLL --- */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-40">
                    
                    {/* FOTO */}
                    <div onClick={onOpenInspector} className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:shadow-2xl transition-shadow group">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Propiedad" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <Sparkles size={14}/> ABRIR HOLO-INSPECTOR
                            </div>
                        </div>
                    </div>

                    {/* TÍTULO Y PRECIO */}
                    <div>
                         <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block shadow-blue-200 shadow-sm">
                            {selectedProp?.type || "INMUEBLE"}
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">
                            {selectedProp?.title || "Sin Título"}
                        </h1>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                            {(() => {
                              const raw = selectedProp?.rawPrice ?? selectedProp?.price;
                              const num = Number(String(raw).replace(/[^0-9]/g, ''));
                              return Number.isFinite(num) ? new Intl.NumberFormat('es-ES').format(num) + ' €' : 'Consultar';
                            })()}
                        </p>
                    </div>

                    {/* DATOS RÁPIDOS */}
                    <div className="flex justify-between gap-2">
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Hab.</span>
                            <div className="font-black text-base flex items-center gap-1"><Bed size={14}/> {selectedProp?.rooms || 0}</div>
                        </div>
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Baños</span>
                            <div className="font-black text-base flex items-center gap-1"><Bath size={14}/> {selectedProp?.baths || 0}</div>
                        </div>
                        <div className="flex-1 bg-white p-2.5 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">M²</span>
                            <div className="font-black text-base flex items-center gap-1"><Maximize2 size={14}/> {m2}</div>
                        </div>
                    </div>

                    {/* FICHA TÉCNICA */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Home size={12} className="text-blue-500"/> Ficha Técnica
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Tipología</span>
                                <span className="font-bold text-xs text-slate-800">{selectedProp?.type || "Piso"}</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Superficie</span>
                                <span className="font-bold text-xs text-slate-800">{m2} m²</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center group">
                                <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Ascensor</span><span className={`font-bold text-xs ${hasElevator ? 'text-green-600' : 'text-slate-400'}`}>{hasElevator ? 'SÍ TIENE' : 'NO TIENE'}</span></div>
                                {hasElevator && <ArrowUp size={14} className="text-green-500" />}
                            </div>
                            {physicalItems.map((item) => (
                                <div key={item.id} className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <div><span className="text-[8px] text-blue-400 font-bold uppercase block">Incluido</span><span className="font-bold text-xs text-blue-900">{item.label}</span></div>
                                    <item.icon size={14} className="text-blue-500"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    {selectedProp?.description && (
                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Descripción</span>
                            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium">{selectedProp.description}</p>
                        </div>
                    )}

                    {/* CERTIFICADO ENERGÉTICO */}
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-white flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Certificación<br/>Energética</span>
                        {selectedProp?.energyPending ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 animate-pulse">En trámite</span>
                        ) : (
                            <div className="flex gap-3">
                                {selectedProp?.energyConsumption ? (<div className="flex flex-col items-center"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyConsumption)}`}>{selectedProp.energyConsumption}</div><span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Cons.</span></div>) : (<span className="text-[10px] text-gray-400 font-bold self-center">N/D</span>)}
                                {selectedProp?.energyEmissions && (<div className="flex flex-col items-center"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyEmissions)}`}>{selectedProp.energyEmissions}</div><span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Emis.</span></div>)}
                            </div>
                        )}
                    </div>

                    {/* SERVICIOS ACTIVOS (ESTILO PARTICULAR) */}
                    {serviceItems.length > 0 && (
                        <div className="bg-[#F2F2F7] rounded-[24px] p-5 shadow-inner border border-white">
                            <div className="text-center mb-4 opacity-60">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-slate-500">
                                    <Sparkles size={10} className="text-purple-500"/> Servicios Activos
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {serviceItems.map((item) => (
                                    <div key={item.id} className="flex flex-col items-center gap-1.5 group cursor-default">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                                            <item.icon size={16} strokeWidth={2}/>
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase text-center leading-tight">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="h-6"></div>
                </div>

                {/* --- FOOTER: CONTACTAR AGENTE --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20">
                    <button className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs">
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