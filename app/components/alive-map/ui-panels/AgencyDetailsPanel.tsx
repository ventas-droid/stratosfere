// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';

// 1. TODOS LOS ICONOS JUNTOS (CORREGIDO: Sin duplicados)
import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase,
    Star, Home, Maximize2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, 
    Camera, Globe, Plane, Hammer, Ruler, 
    TrendingUp, Share2, Mail, FileCheck, Activity, MessageCircle,
    Sofa, Droplets, Paintbrush, Truck, Bed, Bath, Copy, Check, Building2, Eye, ChevronDown,
    FileDown, PlayCircle
} from 'lucide-react';

import { getCampaignByPropertyAction, getPropertyByIdAction } from "@/app/actions";
import { PDFDownloadLink } from '@react-pdf/renderer';

// 2. RUTA DEL PDF CORREGIDA
import { PropertyFlyer } from '../../pdf/PropertyFlyer';
import AgencyExtrasViewer from "./AgencyExtrasViewer";
import OpenHouseOverlay from "./OpenHouseOverlay";
import GuestList from "./GuestList"; // Asegúrese de que la ruta sea correcta
// --- DICCIONARIO MAESTRO DE ICONOS ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves, 'garage': Car, 'garaje': Car, 'parking': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees, 'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun, 'storage': Box, 'trastero': Box, 
    'ac': Thermometer, 'aire': Thermometer, 'calefaccion': Thermometer, 'heating': Thermometer,
    'security': ShieldCheck, 'seguridad': ShieldCheck, 'alarma': ShieldCheck,
    'foto': Camera, 'video': Globe, 'drone': Plane, 'tour3d': Box, 'render': Hammer, 
    'plano': Ruler, 'plano_2d': Ruler, 'destacado': TrendingUp, 'ads': Share2, 
    'email': Mail, 'certificado': FileCheck, 'tasacion': Activity, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 'abogado': Briefcase, 
    'exterior': Eye, 
    'interior': Home,
    'furnished': Sofa, 
    'amueblado': Sofa,
    'wardrobes': Box, 
    'armarios': Box
};

const PHYSICAL_KEYWORDS = [
  'pool', 'piscina', 'garage', 'garaje', 'parking', 'garden', 'jardin', 'jardín', 
  'terrace', 'terraza', 'storage', 'trastero', 'ac', 'aire', 'security', 'seguridad',
  'elevator', 'ascensor', 'lift', 'heating', 'calefaccion', 'furnished', 'amueblado'
];

export default function AgencyDetailsPanel({ 
  selectedProp: initialProp, 
  onClose, 
  onToggleFavorite, 
  favorites = [], 
  onOpenInspector,
  agencyData: initialAgencyData,
  currentUser 
}: any) {
    
    const [selectedProp, setSelectedProp] = useState(initialProp);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showOpenHouse, setShowOpenHouse] = useState(true); // Se abre por defecto si hay evento
    const [copied, setCopied] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);
const [isDescExpanded, setIsDescExpanded] = useState(false);
    const isOwner = selectedProp?.isOwner || (currentUser?.id && selectedProp?.userId && currentUser.id === selectedProp.userId);
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

    const [ownerData, setOwnerData] = useState(
      initialAgencyData || initialProp?.user || initialProp?.ownerSnapshot || {}
    );

    useEffect(() => { 
      setSelectedProp(initialProp); 
      setOwnerData(initialAgencyData || initialProp?.user || initialProp?.ownerSnapshot || {});
    }, [initialProp, initialAgencyData]);

    // LISTENERS DE ACTUALIZACIÓN
    useEffect(() => {
        const handleProfileUpdate = (e: any) => {
            const updatedProfile = e.detail;
            setOwnerData((prev: any) => ({
                ...prev,
                companyName: updatedProfile.name,
                companyLogo: updatedProfile.avatar,
                coverImage: updatedProfile.cover,
                phone: updatedProfile.phone,
                mobile: updatedProfile.mobile,
                email: updatedProfile.email,
                zone: updatedProfile.zone,
                tagline: updatedProfile.tagline
            }));
        };
        window.addEventListener('agency-profile-updated', handleProfileUpdate);
        return () => window.removeEventListener('agency-profile-updated', handleProfileUpdate);
    }, []);

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

    // DATOS DE AGENTE
    const activeOwner = ownerData; 
    const name = activeOwner.companyName || activeOwner.name || "Usuario";
    
    let roleLabel = "AGENCIA"; 
    if (activeOwner.role === 'PARTICULAR') roleLabel = "PARTICULAR";
    else {
        const lic = activeOwner.licenseType;
        if (lic === 'STARTER') roleLabel = "ESSENTIAL PARTNER";
        else if (lic === 'PRO') roleLabel = "PRO PARTNER";
        else if (lic === 'CORP') roleLabel = "CORPORATE";
        else roleLabel = "AGENCIA CERTIFICADA";
    }

    const avatar = activeOwner.companyLogo || activeOwner.avatar || null;
    const cover = activeOwner.coverImage || null;
    const phone = activeOwner.mobile || activeOwner.phone || "";
    const email = ownerData.email || "---";
    
    const cleanKey = (raw: any) => String(raw || "").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
    
    const getNiceLabel = (key: string) => {
        const labels: any = {
            'pool': 'Piscina', 'garage': 'Garaje', 'garden': 'Jardín', 'elevator': 'Ascensor', 
            'terrace': 'Terraza', 'storage': 'Trastero', 'ac': 'Aire Acond.', 'security': 'Seguridad', 
            'foto': 'Fotografía Pro', 'video': 'Vídeo', 'drone': 'Dron', 'ads': 'Campaña Ads',
            'plano_2d': 'Plano 2D', 'email': 'Email Mkt', 'heating': 'Calefacción', 'furnished': 'Amueblado'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    if (!selectedProp) return null;

    // --- RECOLECCIÓN DE TAGS (CARACTERÍSTICAS) ---
    const allTags = new Set<string>();
    
    // 1. Desde selectedServices (Texto separado por comas)
    if (selectedProp?.selectedServices) {
        let services = selectedProp.selectedServices;
        if (typeof services === 'string') services.split(',').forEach(s => allTags.add(cleanKey(s)));
        else if (Array.isArray(services)) services.forEach(s => allTags.add(cleanKey(s)));
    }

    // 2. Desde booleanos directos (Aquí es donde AC aparecía si estaba en true)
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished'].forEach(k => {
        const val = selectedProp?.[k];
        // Solo añadimos si es explícitamente TRUE
        if (val === true || val === "true" || val === 1) allTags.add(cleanKey(k));
    });

    const physicalItems: any[] = [];
    const serviceItems: any[] = [];

    allTags.forEach(tag => {
        if (!tag || ['elevator', 'ascensor', 'lift'].includes(tag)) return;
        const itemObj = { id: tag, label: getNiceLabel(tag), icon: ICON_MAP[tag] || Star };
        if (PHYSICAL_KEYWORDS.includes(tag)) physicalItems.push(itemObj); 
        else serviceItems.push(itemObj);
    });
    
    // ASCENSOR APARTE
    let hasElevator = false;
    const isYes = (val: any) => ['si', 'sí', 'yes', 'true', '1', 'on'].includes(String(val || '').toLowerCase().trim());
    if (isYes(selectedProp?.elevator) || isYes(selectedProp?.ascensor) || allTags.has('elevator')) hasElevator = true;
    
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = Number(selectedProp?.mBuilt || selectedProp?.m2 || selectedProp?.surface || 0);
    const isFavorite = (favorites || []).some((f: any) => String(f?.id) === String(selectedProp?.id));

    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[rating] || "bg-gray-400";
    };

    const copyPhone = () => {
        navigator.clipboard.writeText(phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
  
    // PREPARACIÓN DE DESCRIPCIÓN SEGURA
    // Limpiamos etiquetas HTML si las hay para mostrar texto plano limpio
    const cleanDescription = selectedProp?.description 
        ? selectedProp.description.replace(/<[^>]+>/g, '') 
        : null;

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            {/* FONDO CRYSTAL */}
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                
               {/* --- HEADER CORPORATIVO --- */}
                <div className="relative shrink-0 z-20 h-72 overflow-hidden bg-gray-100">
                    <div className="absolute inset-0">
                        {cover ? (
                            <img src={cover} className="w-full h-full object-cover" alt="Fondo Agencia" />
                        ) : (
                            <div className="w-full h-full bg-slate-200" />
                        )}
                    </div>

                    <div className="relative z-10 px-8 pt-12 pb-8 flex flex-col justify-between h-full">
                         <div className="flex justify-between items-start">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-2xl shadow-black/20 border border-white/50 rotate-1 group-hover:rotate-0 transition-transform duration-500">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full rounded-xl object-cover bg-white" alt="Logo" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white px-2 py-1 rounded-full border-[3px] border-white shadow-lg flex items-center gap-1">
                                    <ShieldCheck size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-lg">
                                <X size={20} />
                            </button>
                         </div>

                         <div>
                            <h2 className="text-3xl font-black text-white leading-none mb-2 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                {name}
                            </h2>
                            {ownerData.tagline && (
                                <p className="text-white/90 text-xs font-bold italic tracking-wide mb-4 drop-shadow-md border-l-2 border-emerald-400 pl-3">
                                    "{ownerData.tagline}"
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                    <Briefcase size={12} className="text-emerald-400"/> 
                                    {roleLabel}
                                </span>
                               {ownerData.zone && (
                                    <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-blue-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                        <Globe size={12} className="text-blue-400"/> {ownerData.zone}
                                    </span>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* --- CONTENIDO SCROLL --- */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-40 bg-[#F5F5F7]">
                    
                    {/* FOTO CON BOTÓN DE VÍDEO INTEGRADO */}
                    <div className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white group">
                        <img 
                            src={img} 
                            onClick={onOpenInspector}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
                            alt="Propiedad" 
                        />
                        
                        {/* CAPA OSCURA AL HOVER */}
                        <div onClick={onOpenInspector} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

                        {/* 🔥 BOTÓN DE VÍDEO FLOTANTE (Si existe URL) 🔥 */}
                        {selectedProp?.videoUrl && (
                             <a 
                                href={selectedProp.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()} // 🛑 IMPRESCINDIBLE: Evita que se abra el inspector a la vez
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all z-20 active:scale-95 cursor-pointer"
                             >
                                <Globe size={16} /> VER VÍDEO
                             </a>
                        )}

                        {/* BOTÓN INSPECTOR (CENTRAL - APARECE AL HOVER) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

                    {selectedProp?.refCode && (
                      <div
                        onClick={copyRefCode}
                        className="text-[12px] text-slate-500 mb-2 flex items-center gap-2 cursor-pointer hover:text-slate-700 select-none"
                        title="Copiar referencia"
                      >
                        <span>Ref:</span>
                        <span className="font-mono text-slate-700">{selectedProp.refCode}</span>
                        <span className="ml-1 text-slate-400">
                          {copiedRef ? <Check size={14} /> : <Copy size={14} />}
                        </span>
                      </div>
                    )}

                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {(() => {
                        const raw = selectedProp?.rawPrice ?? selectedProp?.price;
                        const num = Number(String(raw).replace(/[^0-9]/g, ""));
                        return Number.isFinite(num)
                          ? new Intl.NumberFormat("es-ES").format(num) + " €"
                          : "Consultar";
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
                            {selectedProp?.communityFees > 0 ? (
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Comunidad</span>
                                        <span className="font-bold text-xs text-slate-800">{selectedProp.communityFees} €/mes</span>
                                    </div>
                                    <Building2 size={14} className="text-slate-400"/>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block">Superficie</span>
                                    <span className="font-bold text-xs text-slate-800">{m2} m²</span>
                                </div>
                            )}
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
{/* 🔥 DESCRIPCIÓN TIPO IDEALISTA (EXPANDIBLE) 🔥 */}
                   <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white transition-all duration-300">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Descripción</span>
                        
                        <div className="relative">
                            <p className={`text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                                {cleanDescription || "Sin descripción detallada disponible."}
                            </p>
                            
                            {/* Efecto de desvanecimiento si está cerrado */}
                            {!isDescExpanded && cleanDescription && cleanDescription.length > 200 && (
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                            )}
                        </div>

                        {/* Botón de Leer Más / Leer Menos */}
                        {cleanDescription && cleanDescription.length > 200 && (
                            <button 
                                onClick={() => setIsDescExpanded(!isDescExpanded)} 
                                className="mt-3 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 transition-colors"
                            >
                                {isDescExpanded ? (
                                    <>Leer menos <ArrowUp size={12}/></>
                                ) : (
                                    <>Leer descripción completa <ChevronDown size={12}/></>
                                )}
                            </button>
                        )}
                   </div>
{/* --------------------------------------------------------- */}
                   {/* 🔥 INYECCIÓN VISUAL: EXTRAS DE AGENCIA (VÍDEO, DOCS) 🔥 */}
                   {/* --------------------------------------------------------- */}
                   <div className="mt-4">
                        {/* ✅ CORREGIDO: Usamos 'selectedProp' que es la variable real */}
                        <AgencyExtrasViewer property={selectedProp} />
                   </div>
                    {/* ============================================================== */}
            {/* 🦅 ZONA OPEN HOUSE: LÓGICA DE MANDO (DUEÑO vs VISITANTE)       */}
            {/* ============================================================== */}
            {selectedProp?.openHouse?.enabled && selectedProp?.openHouse?.id && (
                <div className="mt-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* CASO A: SOY EL DUEÑO (AGENCIA) -> VEO MI LISTA Y GESTIÓN */}
                    {isOwner ? (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            {/* Cabecera de Gestión */}
                            <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-yellow-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        MI EVENTO
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[9px] font-bold text-white">EN VIVO</span>
                                </div>
                            </div>

                            {/* 📋 AQUÍ APARECE SU LISTA DE INVITADOS AUTOMÁTICAMENTE */}
                            <div className="max-h-[300px] overflow-hidden">
                                <GuestList openHouseId={selectedProp.openHouse.id} />
                            </div>

                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                <p className="text-[9px] text-gray-400 font-medium">
                                    Esta lista es privada. Solo tú puedes verla.
                                </p>
                            </div>
                        </div>

                    ) : (

                        /* CASO B: SOY UN VISITANTE -> VEO LA TARJETA DE INVITACIÓN */
                        <div 
                            className="bg-[#111] rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
                            onClick={() => setShowOpenHouse(true)}
                        >
                            {/* Fondo decorativo */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                            
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10">
                                    Open House
                                </span>
                                <h3 className="text-xl font-black mb-1 leading-tight">
                                    {selectedProp.openHouse.title || "Evento Exclusivo"}
                                </h3>
                                <p className="text-xs text-gray-400 mb-4 line-clamp-1">
                                    {new Date(selectedProp.openHouse.startTime).toLocaleDateString()} • Aforo limitado
                                </p>
                                
                                <button className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg">
                                    Solicitar Invitación
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* ============================================================== */}
                    {/* CERTIFICADO ENERGÉTICO */}
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-white flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Certificación<br/>Energética</span>
                        {selectedProp?.energyPending ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 animate-pulse">En trámite</span>
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
                    
                    <div className="h-6"></div>
                </div>

                {/* --- FOOTER: CONTACTAR AGENTE --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20 relative">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs"
                  >
                    <Phone size={18} /> Contactar Agente
                  </button>

                  {/* BOTÓN PDF INTELIGENTE */}
                  {(() => {
                      const pdfBranding = (currentUser?.role === 'AGENCIA' || currentUser?.role === 'AGENCY') 
                                          ? currentUser                   
                                          : (initialAgencyData || currentUser); 

                      if (!pdfBranding) return null;

                      return (
                          <PDFDownloadLink
                            document={<PropertyFlyer property={selectedProp} agent={pdfBranding} />}
                            fileName={`Ficha_${selectedProp.refCode || 'Stratos'}.pdf`}
                            className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90"
                            title="Descargar Ficha PDF"
                          >
                            {({ loading }) => (
                                loading ? (
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                                ) : (
                                    <FileDown size={22} />
                                )
                            )}
                          </PDFDownloadLink>
                      );
                  })()}

                  {/* MENSAJE (CHAT) */}
                  <button
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      try {
                        const propertyId = String(selectedProp?.id || "");
                        const toUserId = String(
                          ownerData?.id ||
                            activeOwner?.id ||
                            selectedProp?.user?.id ||
                            selectedProp?.ownerSnapshot?.id ||
                            selectedProp?.userId ||
                            ""
                        );
                        if (!propertyId || !toUserId) return;
                        window.dispatchEvent(
                          new CustomEvent("open-chat-signal", {
                            detail: { propertyId, toUserId, property: selectedProp },
                          })
                        );
                      } catch (e) {
                        console.warn("open-chat-signal failed", e);
                      }
                    }}
                    className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Mensaje"
                  >
                    <MessageCircle size={22} />
                  </button>

                  <button
                    onClick={() =>
                      onToggleFavorite &&
                      onToggleFavorite({ ...selectedProp, isFav: !isFavorite })
                    }
                    className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${
                      isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
{/* --- POPUP CONTACTO AGENTE (CORREGIDO) --- */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0 cursor-pointer"></div>
                        
                        <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6 ring-1 ring-white/20">
                            {/* Cabecera con Imagen */}
                            <div className="relative h-36 bg-gray-100 flex items-end p-6 gap-4">
                                <div className="absolute inset-0">
                                    {cover ? (
                                        <img src={cover} className="w-full h-full object-cover opacity-90" alt="Fondo Agente" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>
                                
                                {/* Avatar */}
                                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white p-1 shadow-xl shrink-0 border border-white/20 mb-1">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center">
                                            <User className="text-slate-300" size={32}/>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-[3px] border-[#F5F5F7] shadow-sm">
                                        <ShieldCheck size={12} strokeWidth={4} />
                                    </div>
                                </div>

                                {/* Info Texto */}
                                <div className="relative z-10 mb-2 flex-1 min-w-0">
                                    <h3 className="text-white font-black text-2xl leading-none mb-1 drop-shadow-md truncate">{name || "Agente"}</h3>
                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full w-fit border border-emerald-500/30 backdrop-blur-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> En línea
                                    </p>
                                </div>

                                {/* Botón Cerrar */}
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/20 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all">
                                    <X size={18}/>
                                </button>
                            </div>

                            {/* Botones de Acción */}
                            <div className="px-6 pt-6 space-y-3">
                                <div onClick={typeof copyPhone === 'function' ? copyPhone : undefined} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center border border-[#C8E6C9] group-hover:scale-110 transition-transform">
                                        <Phone size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Teléfono / WhatsApp</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{phone || "No disponible"}</p>
                                    </div>
                                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                        {copied ? <span className="text-[10px] font-bold text-emerald-600 uppercase">Copiado!</span> : <Copy size={20}/>}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center border border-[#BBDEFB] group-hover:scale-110 transition-transform">
                                        <Mail size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Corporativo</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{email || "No disponible"}</p>
                                    </div>
                                </div>

                                <button onClick={() => setShowContactModal(false)} className="w-full py-4 bg-[#1c1c1e] text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-xs mt-2 shadow-xl hover:bg-black transition-all active:scale-95">
                                    Cerrar Ficha
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
             {/* 🔥 POPUP OPEN HOUSE: CONEXIÓN REAL (DATOS DE SU AGENCIA) 🔥 */}
               {showOpenHouse && (
                   <OpenHouseOverlay 
                       property={selectedProp} 
                       onClose={() => setShowOpenHouse(false)} 
                   />
               )}

            </div>
        </div>
    );
}