// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Phone, Sparkles, Star, Home, Maximize2, Building2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, ShieldCheck,
    Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, TrendingUp, Share2, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
    Droplets, Paintbrush, Truck, Briefcase, Bed, Bath, User, Copy, Check
} from 'lucide-react';

// --- DICCIONARIO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves, 'garage': Car, 'garaje': Car, 'parking': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees, 'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun, 'storage': Box, 'trastero': Box, 
    'ac': Thermometer, 'aire': Thermometer, 'security': ShieldCheck, 'seguridad': ShieldCheck,
    'foto': Camera, 'video': Globe, 'drone': Plane, 'tour3d': Box, 'plano_2d': Ruler
};

const PHYSICAL_KEYWORDS = ['pool', 'piscina', 'garage', 'garaje', 'garden', 'jardin', 'terrace', 'terraza', 'storage', 'trastero', 'ac', 'aire', 'security', 'elevator', 'ascensor'];

export default function DetailsPanel({ selectedProp: initialProp, onClose, onToggleFavorite, favorites = [], onOpenInspector }: any) {
    
    const [selectedProp, setSelectedProp] = useState(initialProp);
    const [showContactModal, setShowContactModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sincronizar propiedad seleccionada
    useEffect(() => { setSelectedProp(initialProp); }, [initialProp]);

    // 🔥 DATOS DE IDENTIDAD (Lectura Directa de la Nube)
    // Confiamos en el paquete 'user' normalizado que preparó actions.ts
   // PRIORIDAD: ownerSnapshot -> user
const ownerFromSnapshot = (selectedProp?.ownerSnapshot && typeof selectedProp.ownerSnapshot === 'object')
  ? selectedProp.ownerSnapshot
  : (selectedProp?.user || {});

const ownerName   = ownerFromSnapshot.companyName || ownerFromSnapshot.name || "Propietario";
const ownerAvatar = ownerFromSnapshot.companyLogo || ownerFromSnapshot.avatar || null;
const ownerCover  = ownerFromSnapshot.coverImage || ownerFromSnapshot.cover || null;
const ownerPhone  = ownerFromSnapshot.mobile || ownerFromSnapshot.phone || "Consultar";
const ownerEmail  = ownerFromSnapshot.email || "---";
const ownerRole   = (ownerFromSnapshot.role || "PARTICULAR").toUpperCase();


    // Listener para actualizaciones en vivo (Nano Card -> Detalle)
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

    if (!selectedProp) return null;

    // --- LOGICA DE PARSEO ---
    const cleanKey = (raw: any) => String(raw || "").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
    const getNiceLabel = (key: string) => {
        const labels: any = { 'pool': 'Piscina', 'garage': 'Garaje', 'garden': 'Jardín', 'elevator': 'Ascensor', 'terrace': 'Terraza', 'storage': 'Trastero' };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    const allTags = new Set<string>();
    if (selectedProp?.selectedServices) {
        let s = selectedProp.selectedServices;
        (Array.isArray(s) ? s : String(s).split(',')).forEach(x => allTags.add(cleanKey(x)));
    }
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac'].forEach(k => {
        if (['true','Si','Sí',1,true].includes(selectedProp?.[k])) allTags.add(cleanKey(k));
    });

    const physicalItems: any[] = [];
    allTags.forEach(tag => {
        if(!tag || ['elevator','ascensor'].includes(tag)) return;
        const item = { id: tag, label: getNiceLabel(tag), icon: ICON_MAP[tag] || Star };
        if(PHYSICAL_KEYWORDS.includes(tag)) physicalItems.push(item);
    });

    const hasElevator = allTags.has('elevator') || allTags.has('ascensor') || selectedProp?.elevator === true;
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
   // ❤️ SINCRONIZACIÓN TOTAL (Corazón + Bóveda + NanoCard)
    // 1. Verificación blindada (convierte IDs a texto para que no falle nunca)
    const isFavorite = favorites.some((f: any) => String(f.id) === String(selectedProp?.id));

   // ❤️ ESTE ES EL CONECTOR QUE TE FALTA PARA LA SINCRONIZACIÓN
    const handleHeartClick = (e: any) => {
        e.stopPropagation(); // Evita que el clic atraviese
        
        // 1. Calculamos el nuevo estado INMEDIATAMENTE para que sea visual
        const newStatus = !isFavorite;

        // 2. Ejecutar la acción real de base de datos (lo que ya tenías)
        if (onToggleFavorite) onToggleFavorite(selectedProp);

        // 3. 🔥 EL GRITO QUE FALTABA (RESTAURADO) 🔥
        // Esto avisa a la NanoCard, a la Bóveda y a las Notificaciones
        if (typeof window !== 'undefined') {
            // Señal A: Para actualizaciones de propiedades (NanoCard)
            window.dispatchEvent(new CustomEvent('update-property-signal', { 
                detail: { 
                    id: selectedProp.id, 
                    updates: { isFavorite: newStatus } // Enviamos el nuevo estado
                } 
            }));

            // Señal B: Específica para favoritos (Bóveda / Notificaciones)
            window.dispatchEvent(new CustomEvent('fav-change-signal', { 
                detail: { 
                    id: selectedProp.id, 
                    isFavorite: newStatus 
                } 
            }));
        }
    };
    const copyPhone = () => {
        if(ownerPhone === "Consultar") return;
        navigator.clipboard.writeText(ownerPhone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ⚡️ HELPER PARA COLOR DE CERTIFICADO
    const getEnergyColor = (letter: string) => {
        const l = String(letter || '').toUpperCase();
        if (l === 'A') return 'bg-green-600';
        if (l === 'B') return 'bg-green-500';
        if (l === 'C') return 'bg-green-400';
        if (l === 'D') return 'bg-yellow-400';
        if (l === 'E') return 'bg-yellow-500';
        if (l === 'F') return 'bg-orange-500';
        return 'bg-red-500'; // G o desconocido
    };

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
               
               {/* 1. CABECERA (PROPIETARIO) */}
                <div className="relative shrink-0 z-20 h-64 overflow-hidden bg-gray-900 group">
                    {/* Fondo */}
                    <div className="absolute inset-0">
                        {ownerCover ? (
                            <img src={ownerCover} className="w-full h-full object-cover opacity-100" alt="Fondo" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" /> 
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative z-10 px-8 pt-10 pb-6 flex flex-col justify-between h-full">
                         <div className="flex justify-between items-start">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md p-1 shadow-xl border border-white/30">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-white/10 relative flex items-center justify-center">
                                    {ownerAvatar ? (
                                        <img src={ownerAvatar} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : (
                                        <User size={30} className="text-white/50"/>
                                    )}
                                </div>
                            </div>
                            {/* Cerrar */}
                            <button onClick={onClose} className="w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20 text-white shadow-lg cursor-pointer">
                                <X size={20} />
                            </button>
                         </div>

                         <div>
                            <h2 className="text-3xl font-black text-white leading-none mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {ownerName}
                            </h2>
                            <span className={`px-3 py-1 rounded-lg backdrop-blur-md border border-white/30 text-[10px] font-bold uppercase tracking-wider shadow-lg inline-flex items-center gap-2 ${ownerRole === 'AGENCIA' ? 'bg-black/80 text-emerald-400' : 'bg-black/40 text-white'}`}>
                                {ownerRole === 'AGENCIA' ? <Building2 size={12}/> : <User size={12}/>} 
                                {ownerRole}
                            </span>
                         </div>
                    </div>
                </div>

                {/* 2. CONTENIDO SCROLLABLE */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-32">
                    
                    {/* Foto Propiedad */}
                    <div onClick={onOpenInspector} className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:shadow-2xl transition-shadow group">
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <Sparkles size={14}/> ABRIR INSPECTOR
                            </div>
                        </div>
                    </div>

                    {/* Título y Precio */}
                    <div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                            {selectedProp?.type || "INMUEBLE"}
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{selectedProp?.title || "Sin Título"}</h1>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                            {new Intl.NumberFormat('es-ES').format(Number(selectedProp?.price || 0))} €
                        </p>
                    </div>

                    {/* Métricas */}
                    <div className="flex justify-between gap-2">
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Hab.</span>
                            <div className="font-black text-lg flex items-center gap-1"><Bed size={16}/> {selectedProp?.rooms || 0}</div>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">Baños</span>
                            <div className="font-black text-lg flex items-center gap-1"><Bath size={16}/> {selectedProp?.baths || 0}</div>
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-2xl text-center shadow-sm border border-slate-100 flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">M²</span>
                            <div className="font-black text-lg flex items-center gap-1"><Maximize2 size={16}/> {selectedProp?.mBuilt || 0}</div>
                        </div>
                    </div>

                    {/* Características */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white">
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 border-b border-gray-100 pb-2 text-slate-900">Características</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Ascensor</span><span className={`font-bold text-xs ${hasElevator ? 'text-green-600':'text-slate-400'}`}>{hasElevator ? 'SÍ' : 'NO'}</span></div>
                                {hasElevator && <ArrowUp size={14} className="text-green-500"/>}
                            </div>
                            {physicalItems.map(item => (
                                <div key={item.id} className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <div><span className="text-[8px] text-blue-400 font-bold uppercase block">Incluido</span><span className="font-bold text-xs text-blue-900">{item.label}</span></div>
                                    <item.icon size={14} className="text-blue-500"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Descripción */}
                    {selectedProp?.description && (
                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
                            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium">{selectedProp.description}</p>
                        </div>
                    )}

                    {/* ⚡️ CERTIFICADO ENERGÉTICO CORREGIDO (DOS LETRAS) */}
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-white flex justify-between items-center mt-3">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Certificación<br/>Energética</span>
                        
                        {selectedProp?.energyPending ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 animate-pulse">
                                En trámite
                            </span>
                        ) : (
                            <div className="flex gap-3">
                                {/* Consumo */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${
                                        getEnergyColor(selectedProp?.energyConsumption)
                                    }`}>
                                        {selectedProp?.energyConsumption || '-'}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cons.</span>
                                </div>

                                {/* Emisiones */}
                                <div className="flex flex-col items-center">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${
                                        getEnergyColor(selectedProp?.energyEmissions)
                                    }`}>
                                        {selectedProp?.energyEmissions || '-'}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Emis.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. FOOTER */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20">
                    <button onClick={() => setShowContactModal(true)} className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer">
                        <Phone size={18} /> Contactar Propietario
                    </button>
                   <button 
                        onClick={handleHeartClick}
                        className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-all duration-300 cursor-pointer active:scale-90 ${isFavorite ? "text-rose-500 bg-rose-50 border-rose-100 shadow-inner" : "text-slate-400 hover:text-rose-500"}`}
                    >
                        <Heart size={24} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse-once" : ""} />
                    </button>
                </div>

                {/* 4. POPUP CONTACTO */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0"></div>
                        <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6">
                            
                            {/* Cabecera Popup */}
                            <div className="relative h-36 bg-gray-900 flex items-end p-6 gap-4">
                                <div className="absolute inset-0">
                                    {ownerCover ? <img src={ownerCover} className="w-full h-full object-cover opacity-60"/> : <div className="w-full h-full bg-slate-800"/>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                </div>
                                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white p-1 shadow-xl shrink-0 border border-white/20 mb-1">
                                    {ownerAvatar ? <img src={ownerAvatar} className="w-full h-full rounded-xl object-cover" /> : <User className="text-slate-300 w-full h-full p-4" />}
                                </div>
                                <div className="relative z-10 mb-2">
                                    <h3 className="text-white font-black text-2xl leading-none mb-1 drop-shadow-md">{ownerName}</h3>
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">{ownerRole}</p>
                                </div>
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/30 p-2 rounded-full cursor-pointer"><X size={18}/></button>
                            </div>

                            {/* Datos Contacto */}
                            <div className="px-6 pt-6 space-y-4">
                                <div onClick={copyPhone} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                                        <Phone size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Teléfono</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{ownerPhone}</p>
                                    </div>
                                    <div className="text-slate-300">{copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}</div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                        <Mail size={22} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{ownerEmail}</p>
                                    </div>
                                </div>

                                <button onClick={() => setShowContactModal(false)} className="w-full py-4 bg-[#1c1c1e] text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-xs mt-2 shadow-xl hover:bg-black transition-all active:scale-95 cursor-pointer">
                                    Cerrar Ficha
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}