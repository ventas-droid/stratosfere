// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Phone, Sparkles, Star, Home, Maximize2, Building2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, ShieldCheck, Flame, Wind, 
    Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, TrendingUp, Share2, Eye, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, ChevronDown,
    Droplets, Paintbrush, Truck, Briefcase, Bed, Bath, User, Copy, Check, MessageCircle, FileDown,
} from 'lucide-react';

// 🔥 IMPORTAMOS LA ACCIÓN DE ESTADÍSTICAS Y DATOS
import { toggleFavoriteAction, getPropertyByIdAction, incrementStatsAction } from "@/app/actions";

// 🔥 HERRAMIENTAS PDF
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropertyFlyer } from '../../pdf/PropertyFlyer';

// --- 1. DICCIONARIO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves, 
    'garage': Car, 'garaje': Car, 'parking': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees, 
    'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun, 
    'storage': Box, 'trastero': Box, 
    'ac': Thermometer, 'aire': Thermometer, 
    'security': ShieldCheck, 'seguridad': ShieldCheck, 'alarma': ShieldCheck,
    'heating': Flame, 'calefaccion': Flame, 'calefacción': Flame,
    'furnished': Sofa, 'amueblado': Sofa,
    'balcony': Wind, 'balcon': Wind, 'balcón': Wind,
    'foto': Camera, 'video': Globe, 'drone': Plane, 'tour3d': Box, 'plano_2d': Ruler
};

// --- 2. LISTA BLANCA DE ACCESO ---
const PHYSICAL_KEYWORDS = [
    'pool', 'piscina', 
    'garage', 'garaje', 
    'garden', 'jardin', 
    'terrace', 'terraza', 
    'storage', 'trastero', 
    'ac', 'aire', 
    'security', 'seguridad', 
    'elevator', 'ascensor',
    'heating', 'calefaccion', 'calefacción',
    'furnished', 'amueblado',
    'balcony', 'balcon', 'balcón'
];

export default function DetailsPanel({ 
  selectedProp: initialProp, 
  onClose, 
  onToggleFavorite, 
  favorites, 
  currentUser,      
  onOpenInspector   
}: any) {
    
    const [selectedProp, setSelectedProp] = useState(initialProp);
    // Estado local para el dueño (para permitir actualización dinámica)
    const [dynamicOwner, setDynamicOwner] = useState<any>(null);

    const [copiedRef, setCopiedRef] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Sincronizar propiedad seleccionada inicial
    useEffect(() => { 
        setSelectedProp(initialProp); 
        // Reset del dueño dinámico al cambiar de propiedad
        setDynamicOwner(null);
    }, [initialProp]);

    // Listener para actualizaciones en vivo
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

    // 🔥 SENSOR DE VISITAS
    useEffect(() => {
        if (selectedProp?.id) {
            incrementStatsAction(selectedProp.id, 'view');
        }
    }, [selectedProp?.id]);

    // ============================================================
    // 🚑 PROTOCOLO DE AUTO-REPARACIÓN (VERSIÓN CLIENTE)
    // ============================================================
    // Esto soluciona el problema de "Favoritos viejos". 
    // Al abrir, descarga los datos frescos (incluyendo si ahora es Agencia).
    useEffect(() => {
        const refreshData = async () => {
            if (selectedProp?.id) {
                try {
                    const realData = await getPropertyByIdAction(selectedProp.id);
                    if (realData) {
                        // 1. Actualizamos datos de la casa (métricas, tipo, etc)
                        setSelectedProp((prev: any) => ({ ...prev, ...realData }));
                        
                        // 2. Actualizamos datos del dueño (si cambió de particular a agencia)
                        if (realData.user) {
                            setDynamicOwner(realData.user);
                        }
                    }
                } catch (e) {
                    console.error("Error refrescando datos:", e);
                }
            }
        };
        refreshData();
    }, [selectedProp?.id]);


    // 🔥 SENSOR DE FOTOS
    const handleMainPhotoClick = () => {
        if (selectedProp?.id) incrementStatsAction(selectedProp.id, 'photo');
        if (onOpenInspector) onOpenInspector();
    };

    // Copiar referencia
    const copyRefCode = async () => {
      const ref = String(selectedProp?.refCode || "");
      if (!ref) return;
      try {
        await navigator.clipboard.writeText(ref);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = ref;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    };

    // --- LÓGICA DE PROPIETARIO (COMBINADA: DATA VIEJA + DATA FRESCA) ---
    // Usamos 'dynamicOwner' si existe (fresco), si no, usamos el snapshot viejo.
    const activeUser = dynamicOwner || selectedProp?.user || selectedProp?.ownerSnapshot || {};

    const ownerName = activeUser.companyName || activeUser.name || "Propietario";
    const ownerAvatar = activeUser.companyLogo || activeUser.avatar || null;
    const ownerCover = activeUser.coverImage || activeUser.cover || null;
    const ownerPhone = activeUser.mobile || activeUser.phone || "Consultar";
    const ownerEmail = activeUser.email || "---";
    const ownerRole = String(activeUser.role || "PARTICULAR").toUpperCase();

    // Copiar teléfono
    const copyPhone = () => {
      if(ownerPhone === "Consultar") return;
      navigator.clipboard.writeText(ownerPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // ❤️ FAVORITOS
    const isFavorite = (favorites || []).some((f: any) => String(f?.id) === String(selectedProp?.id));

    const handleHeartClick = (e: any) => {
      if (e?.stopPropagation) e.stopPropagation();
      if (!selectedProp?.id) return;
      const newStatus = !isFavorite;
      if (onToggleFavorite) onToggleFavorite({ ...selectedProp, isFav: newStatus });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("update-property-signal", { detail: { id: selectedProp.id, updates: { isFav: newStatus, isFavorite: newStatus, isFavorited: newStatus } } }));
        window.dispatchEvent(new CustomEvent("fav-change-signal", { detail: { id: selectedProp.id, isFavorite: newStatus } }));
      }
    };

    if (!selectedProp) return null;

    // --- LOGICA DE PARSEO ---
    const cleanKey = (raw: any) => String(raw || "").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
    
    const getNiceLabel = (key: string) => {
        const labels: any = { 
            'pool': 'Piscina', 'garage': 'Garaje', 'garden': 'Jardín', 
            'elevator': 'Ascensor', 'terrace': 'Terraza', 'storage': 'Trastero',
            'heating': 'Calefacción', 'furnished': 'Amueblado', 
            'security': 'Seguridad', 'balcony': 'Balcón', 'ac': 'Aire Acond.'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    const allTags = new Set<string>();
    
    // 1. Array de servicios
    if (selectedProp?.selectedServices) {
        let s = selectedProp.selectedServices;
        (Array.isArray(s) ? s : String(s).split(',')).forEach(x => allTags.add(cleanKey(x)));
    }

    // 2. Booleans
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished', 'security', 'balcony'].forEach(k => {
        if (['true','Si','Sí',1,true].includes(selectedProp?.[k])) {
            allTags.add(cleanKey(k));
        }
    });

    const physicalItems: any[] = [];
    allTags.forEach(tag => {
        if(!tag || ['elevator','ascensor'].includes(tag)) return;
        if(PHYSICAL_KEYWORDS.includes(tag)) {
             const item = { id: tag, label: getNiceLabel(tag), icon: ICON_MAP[tag] || Star };
             physicalItems.push(item);
        }
    });

    const hasElevator = allTags.has('elevator') || allTags.has('ascensor') || selectedProp?.elevator === true;
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";

    const getEnergyColor = (letter: string) => {
        const l = String(letter || '').toUpperCase();
        if (l === 'A') return 'bg-green-600';
        if (l === 'B') return 'bg-green-500';
        if (l === 'C') return 'bg-green-400';
        if (l === 'D') return 'bg-yellow-400';
        if (l === 'E') return 'bg-yellow-500';
        if (l === 'F') return 'bg-orange-500';
        return 'bg-red-500'; 
    };

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
               
               {/* 1. CABECERA (PROPIETARIO) */}
                <div className="relative shrink-0 z-20 h-64 overflow-hidden bg-gray-900 group">
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
                    <div onClick={handleMainPhotoClick} className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:shadow-2xl transition-shadow group">
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <Sparkles size={14}/> ABRIR FOTOS
                            </div>
                        </div>
                    </div>

                    {/* Título y Precio */}
                    <div>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                        {selectedProp?.type || "INMUEBLE"}
                      </span>

                      <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">
                        {selectedProp?.title || "Sin Título"}
                      </h1>

                     {/* REF CODE + COPIAR */}
                    {selectedProp?.refCode && (
                      <div className="text-[12px] text-slate-500 mb-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          Ref:{" "}
                          <span className="font-mono text-slate-700 break-all">
                            {selectedProp.refCode}
                          </span>
                        </div>

                        <button
                          onClick={copyRefCode}
                          className="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Copiar referencia"
                        >
                          {copiedRef ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-slate-500" />
                          )}
                        </button>
                      </div>
                    )}

                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {new Intl.NumberFormat("es-ES").format(Number(selectedProp?.price || 0))} €
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
                            
                            {/* GASTOS COMUNIDAD */}
                            {selectedProp?.communityFees > 0 && (
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Comunidad</span>
                                        <span className="font-bold text-xs text-slate-900">{selectedProp.communityFees} €/mes</span>
                                    </div>
                                    <Building2 size={14} className="text-slate-400"/>
                                </div>
                            )}
                            
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
                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white transition-all duration-300">
                             {/* Etiqueta pequeña arriba */}
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-2">
                                Descripción
                            </span>

                            <div className="relative">
                                {/* AQUÍ ESTÁ LA MAGIA: 'line-clamp-4' corta el texto si no está expandido */}
                                <p className={`text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                                    {selectedProp.description}
                                </p>
                                
                                {/* Sombra blanca para difuminar el final */}
                                {!isDescExpanded && selectedProp.description.length > 200 && (
                                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                                )}
                            </div>

                            {/* Botón de Leer Más / Menos */}
                            {selectedProp.description.length > 200 && (
                                <button 
                                    onClick={() => setIsDescExpanded(!isDescExpanded)} 
                                    className="mt-3 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                    {isDescExpanded ? (
                                        <>Leer menos <ArrowUp size={12}/></>
                                    ) : (
                                        <>Leer descripción completa <ChevronDown size={12}/></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ⚡️ CERTIFICADO ENERGÉTICO */}
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
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp?.energyConsumption)}`}>
                                        {selectedProp?.energyConsumption || '-'}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Cons.</span>
                                </div>

                                {/* Emisiones */}
                                <div className="flex flex-col items-center">
                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp?.energyEmissions)}`}>
                                        {selectedProp?.energyEmissions || '-'}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Emis.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🔥 PANEL DE INTELIGENCIA DE MERCADO (PÚBLICO - SOCIAL PROOF) */}
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white mt-3 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                             <Activity size={16} className="text-blue-600"/>
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Métricas de Interés</h3>
                        </div>
                       
                        <div className="grid grid-cols-2 gap-4">
                            {/* Visitas Totales */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400">
                                    <Eye size={20}/>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">
                                        {selectedProp?.views || 0}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Ficha</p>
                                </div>
                            </div>

                            {/* Interés en Fotos */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400">
                                    <Camera size={20}/>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">
                                        {selectedProp?.photoViews || 0}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Fotos</p>
                                </div>
                            </div>

                             {/* Favoritos */}
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-400">
                                    <Heart size={20} className="fill-current"/>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">
                                        {selectedProp?.favoritedBy?.length || 0}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guardado</p>
                                </div>
                            </div>

                            {/* Compartidos */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-400">
                                    <Share2 size={20}/>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">
                                        {selectedProp?.shareCount || 0}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compartido</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-3 text-[9px] text-slate-400 font-medium text-center bg-slate-50 py-1 rounded-lg">
                            Datos en tiempo real • Stratos Intelligence™
                        </div>
                    </div>
                    {/* 🔥 FIN DEL PANEL */}

                    {/* 👇 AIRBAG: Espacio vital para que el footer no tape nada 👇 */}
                    <div className="h-32 w-full shrink-0"></div>

                </div> {/* 🛑 CIERRE DEL CONTENIDO SCROLLABLE */}

                {/* 3. FOOTER */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20">
                  
                  {/* Botón Contactar INTELIGENTE */}
                  <button 
                    onClick={() => setShowContactModal(true)} 
                    className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
                  >
                    <Phone size={18} /> 
                    {/* 👇 AQUÍ DETECTA SI ES AGENCIA O DUEÑO 👇 */}
                    {(ownerRole === 'AGENCIA' || ownerRole === 'AGENCY') ? "Contactar Agente" : "Contactar Propietario"}
                  </button>

                  {/* Botón PDF */}
                  {currentUser && (
                        <PDFDownloadLink document={<PropertyFlyer property={selectedProp} agent={(currentUser?.role === 'AGENCIA' || currentUser?.role === 'AGENCY') ? currentUser : (selectedProp?.user || currentUser)} />} fileName={`Ficha_${selectedProp.refCode || 'Stratos'}.pdf`} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90" title="Descargar Ficha PDF">
                            {({ loading }) => ( loading ? ( <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div> ) : ( <FileDown size={22} /> ) )}
                        </PDFDownloadLink>
                    )}

                    {/* Botón CHAT */}
                    <button onClick={(e) => { 
                        if (e?.stopPropagation) e.stopPropagation(); 
                        const propertyId = String( selectedProp?.id || selectedProp?.propertyId || selectedProp?._id || "" ); 
                        const toUserId = String( selectedProp?.user?.id || selectedProp?.ownerSnapshot?.id || selectedProp?.userId || selectedProp?.ownerId || "" ); 
                        if (!toUserId || !propertyId) return; 
                        window.dispatchEvent( new CustomEvent("open-chat-signal", { detail: { propertyId, toUserId, otherUserId: toUserId }, }) ); 
                    }} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 cursor-pointer active:scale-90" title="Mensaje">
                      <MessageCircle size={22} />
                    </button>

                    {/* Botón FAVORITO */}
                    <button onClick={handleHeartClick} className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-all duration-300 cursor-pointer active:scale-90 ${ isFavorite ? "text-rose-500 bg-rose-50 border-rose-100 shadow-inner" : "text-slate-400 hover:text-rose-500" }`}>
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

                              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <MessageCircle size={22} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Chat</p>
                                    <p className="text-sm font-black text-slate-900 truncate">Abrir conversación</p>
                                </div>
                                <button onClick={() => { const ownerId = selectedProp?.user?.id || selectedProp?.ownerSnapshot?.id || selectedProp?.userId || selectedProp?.ownerId || null; if (!ownerId) return; window.dispatchEvent( new CustomEvent("open-chat-signal", { detail: { propertyId: String(selectedProp?.id || selectedProp?.propertyId || selectedProp?._id || ""), toUserId: String(ownerId || ""), refCode: selectedProp?.refCode || null, title: selectedProp?.title || null, }, }) ); setShowContactModal(false); }} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] tracking-widest hover:bg-blue-700 transition-all active:scale-95">
                                    MENSAJE
                                </button>
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