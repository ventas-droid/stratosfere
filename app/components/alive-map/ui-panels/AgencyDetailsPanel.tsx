// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';

// 🔥 IMPORTAMOS ACCIONES CLAVE (AÑADIDO submitLeadAction)
import { 
    getCampaignByPropertyAction, 
    getPropertyByIdAction,
    getActiveManagementAction,
    incrementStatsAction,
    submitLeadAction // ✅ NUEVO: La orden de captura
} from "@/app/actions";

// 🔔 NOTIFICACIONES (NUEVO)
import { Toaster, toast } from 'sonner';

import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase,
    Star, Home, Maximize2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, 
    Camera, Globe, Plane, Hammer, Ruler, Handshake, Coins,
    TrendingUp, Share2, Mail, FileCheck, Activity, MessageCircle,
    Sofa, Droplets, Paintbrush, Truck, Bed, Bath, Copy, Check, Building2, Eye, ChevronDown,
    FileDown, PlayCircle,
    Loader2, Send // ✅ ICONOS NUEVOS AÑADIDOS AQUÍ
} from 'lucide-react';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropertyFlyer } from '../../pdf/PropertyFlyer';
import AgencyExtrasViewer from "./AgencyExtrasViewer";
import OpenHouseOverlay from "./OpenHouseOverlay";
import GuestList from "./GuestList";
// 🔥 EL ESPÍA TÁCTICO
import ReferralListener from '../../ReferralListener';


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
    
    // ============================================================
    // 1. ESTADOS
    // ============================================================
    const [selectedProp, setSelectedProp] = useState(initialProp);
    
    // ESTADO DE IDENTIDAD HÍBRIDO (SIN SPINNER)
    // Inicializamos con lo que tengamos a mano para que sea instantáneo.
    const [activeOwner, setActiveOwner] = useState(() => {
        // Prioridad 1: Datos de agencia pasados explícitamente
        if (initialAgencyData) return initialAgencyData;
        // Prioridad 2: Si soy yo el dueño (Stock), uso mis datos de sesión
        if (currentUser && initialProp?.userId === currentUser.id) return currentUser;
        // Prioridad 3: Datos incrustados en la propiedad (aunque sean viejos, mejor que nada)
        if (initialProp?.user) return initialProp.user;
        if (initialProp?.ownerSnapshot) return initialProp.ownerSnapshot;
        return {};
    });

    const [campaignData, setCampaignData] = useState<any>(null);
    
    // UI Toggles
    const [showContactModal, setShowContactModal] = useState(false);
    const [showOpenHouse, setShowOpenHouse] = useState(true); 
    const [showB2BModal, setShowB2BModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

// --- 🔫 SISTEMA DE CAPTURA DE LEADS (TRAMPA) ---
    const [sendingLead, setSendingLead] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
    // Usaremos el estado 'showContactModal' que ya tienes para mostrar el formulario

    const handleSendLead = async (e: any) => {
        e.preventDefault();
        setSendingLead(true);

        // Disparamos la acción que lee la Cookie del Embajador
        const res = await submitLeadAction({
            propertyId: selectedProp.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || "Hola, me interesa esta propiedad."
        });

        setSendingLead(false);

        if (res.success) {
            toast.success("Solicitud Enviada", { description: "La agencia ha recibido tu contacto." });
            setShowContactModal(false); // Cerramos el modal
            setLeadForm({ name: '', email: '', phone: '', message: '' }); // Limpiamos
        } else {
            toast.error("Error", { description: "No se pudo entregar el mensaje." });
        }
    };

    // ============================================================
    // 2. EFECTOS TÁCTICOS
    // ============================================================

    // A) Reset al cambiar de propiedad
    useEffect(() => { 
        setSelectedProp(initialProp);
        // Reiniciamos el dueño con la mejor data disponible al cambiar
        if (initialAgencyData) setActiveOwner(initialAgencyData);
        else if (currentUser && initialProp?.userId === currentUser.id) setActiveOwner(currentUser);
        else if (initialProp?.user) setActiveOwner(initialProp.user);
        
        setCampaignData(null);
    }, [initialProp, initialAgencyData]);

    // B) Sensor de Visitas
    useEffect(() => {
        if (selectedProp?.id) {
            incrementStatsAction(selectedProp.id, 'view');
        }
    }, [selectedProp?.id]);

   // C) Protocolo de Auto-Reparación (VERSIÓN BLINDADA B2B)
    useEffect(() => {
        const verifyRealData = async () => {
            if (!selectedProp?.id) return;
            try {
                // 1. Pedimos datos frescos al servidor
                const realData = await getPropertyByIdAction(selectedProp.id);
                if (realData?.success && realData.data) {
                    const data = realData.data;
                    
                    // 🔥 SMART MERGE: Solo actualizamos si el nuevo dato aporta valor.
                    // Si el servidor manda B2B null pero nosotros ya teníamos uno, lo preservamos.
                    setSelectedProp((prev: any) => {
                        const nextB2B = data.b2b || prev.b2b;
                        const nextCampaign = data.activeCampaign || prev.activeCampaign;
                        const nextOpenHouse = data.openHouse || prev.openHouse || prev.open_house_data;

                        return { 
                            ...prev, 
                            ...data,
                            b2b: nextB2B, 
                            activeCampaign: nextCampaign,
                            openHouse: nextOpenHouse,
                            open_house_data: nextOpenHouse
                        };
                    });

                    // 2. Gestión de Identidad Blindada
                    const mgmtRes = await getActiveManagementAction(selectedProp.id);
                    let finalOwner = data.user || {};

                    if (mgmtRes?.success && mgmtRes?.data?.agency) {
                        setCampaignData(mgmtRes.data);
                        finalOwner = mgmtRes.data.agency;
                    }

                    if (Object.keys(finalOwner).length > 0) {
                        setActiveOwner((prev: any) => ({ ...prev, ...finalOwner }));
                    }
                }
            } catch (error) {
                console.error("❌ Error en protocolo de fusión de datos:", error);
            }
        };
        
        verifyRealData();
    }, [selectedProp?.id]);

   // E) Listener Updates (CON SEGURO DE VIDA ANTI-UNDEFINED)
    useEffect(() => {
        const handleLiveUpdate = (e: any) => {
            // 1. Extraemos con seguridad. Algunas señales vienen en e.detail.updates, otras en e.detail directamente.
            const rawData = e.detail?.updates || e.detail;
            const targetId = e.detail?.id || rawData?.id;

            // 2. Si no hay ID o no es esta propiedad, abortamos antes de romper nada
            if (!targetId || String(selectedProp?.id) !== String(targetId)) return;

            // 3. FUSIÓN BLINDADA
            setSelectedProp((prev: any) => {
                // Si por algún motivo prev es nulo, devolvemos el nuevo dato
                if (!prev) return rawData;

                // Solo fusionamos si rawData existe
                const nextB2B = rawData?.b2b || prev.b2b;
                const nextOH = rawData?.openHouse || rawData?.open_house_data || prev.openHouse;
                
                return { 
                    ...prev, 
                    ...rawData, 
                    b2b: nextB2B,
                    openHouse: nextOH,
                    open_house_data: nextOH
                };
            });
        };

        if (typeof window !== "undefined") {
            window.addEventListener('update-property-signal', handleLiveUpdate);
            window.addEventListener('sync-property-state', handleLiveUpdate);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener('update-property-signal', handleLiveUpdate);
                window.removeEventListener('sync-property-state', handleLiveUpdate);
            }
        };
    }, [selectedProp?.id]); // Quitamos b2b de aquí para evitar bucles

    // D) Vuelo Automático
    useEffect(() => {
        const lat = Number(selectedProp?.location?.lat || selectedProp?.lat);
        const lng = Number(selectedProp?.location?.lng || selectedProp?.lng);
        if (lat && lng && !isNaN(lat) && lat !== 0) {
            window.dispatchEvent(new CustomEvent("fly-to-location", { 
                detail: { latitude: lat, longitude: lng, duration: 1.5 } 
            }));
        }
    }, [selectedProp?.id, selectedProp?.lat]);

    // E) Listener Updates (Tiempo Real)
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


    // ============================================================
    // 3. HELPERS Y CALCULADORAS
    // ============================================================
    const handleMainPhotoClick = () => {
        if (selectedProp?.id) incrementStatsAction(selectedProp.id, 'photo');
        if (onOpenInspector) onOpenInspector();
    };

    const copyRefCode = async () => {
      const ref = String(selectedProp?.refCode || "");
      if (!ref) return;
      try { await navigator.clipboard.writeText(ref); } catch {}
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    };

    const copyPhone = () => {
        navigator.clipboard.writeText(activeOwner.mobile || activeOwner.phone || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // DATOS DE DISPLAY (Usamos activeOwner que ya está inicializado)
    const name = activeOwner.companyName || activeOwner.name || "Agencia";
    
    // Detector de Rol Seguro
    const roleString = String(activeOwner.role || "").toUpperCase();
    const isAgency = roleString.includes('AGEN') || activeOwner.licenseType === 'PRO';
    const roleLabel = isAgency ? "AGENCIA CERTIFICADA" : "PARTICULAR VERIFICADO";

    // Mapeo triple para asegurar foto (Avatar > Logo > Image > Placeholder)
    const avatar = activeOwner.companyLogo || activeOwner.avatar || activeOwner.image || null;
    const cover = activeOwner.coverImage || activeOwner.cover || null;
    const email = activeOwner.email || "---";
    const phone = activeOwner.mobile || activeOwner.phone || "";

    // PARSEO DE CARACTERÍSTICAS
    const cleanKey = (raw: any) => String(raw || "").replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g, "").toLowerCase();
    
    const allTags = new Set<string>();
    if (selectedProp?.selectedServices) {
        let s = selectedProp.selectedServices;
        (Array.isArray(s) ? s : String(s).split(',')).forEach(x => allTags.add(cleanKey(x)));
    }
    ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished', 'security'].forEach(k => {
        if (selectedProp?.[k] === true || selectedProp?.[k] === 1 || selectedProp?.[k] === "true") allTags.add(cleanKey(k));
    });

    const physicalItems: any[] = [];
    allTags.forEach(tag => {
        if (!tag || ['elevator', 'ascensor'].includes(tag)) return;
        if (PHYSICAL_KEYWORDS.includes(tag)) {
             const item = { id: tag, label: (tag.charAt(0).toUpperCase() + tag.slice(1)), icon: ICON_MAP[tag] || Star };
             physicalItems.push(item);
        }
    });

    const hasElevator = allTags.has('elevator') || allTags.has('ascensor') || selectedProp?.elevator === true;
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = Number(selectedProp?.mBuilt || selectedProp?.m2 || 0);
    const isFavorite = (favorites || []).some((f: any) => String(f?.id) === String(selectedProp?.id));
    const isOwner = selectedProp?.isOwner || (currentUser?.id && selectedProp?.userId && currentUser.id === selectedProp.userId);

    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[String(rating).toUpperCase()] || "bg-gray-400";
    };

    const cleanDescription = selectedProp?.description ? selectedProp.description.replace(/<[^>]+>/g, '') : null;

   // 🔥🔥🔥 LÓGICA B2B OMNÍVORA (Basada en Prisma Schema) 🔥🔥🔥
    // Buscamos el dato en cada rincón posible de la base de datos
    const sharePercent = Number(
        selectedProp?.b2b?.sharePct ??                       // Dialecto UI
        selectedProp?.activeCampaign?.commissionSharePct ??  // Dialecto Campaign (Prisma)
        selectedProp?.commissionSharePct ??                  // Dialecto Directo
        selectedProp?.sharePct ??                            // Dialecto Property (Prisma)
        0
    );

    const visibilityMode = String(
        selectedProp?.b2b?.visibility ?? 
        selectedProp?.activeCampaign?.commissionShareVisibility ?? 
        selectedProp?.shareVisibility ?? 
        "PRIVATE"
    ).toUpperCase();
    
    // Filtro de Seguridad Inteligente
    let canSeeCommission = false;
    if (sharePercent > 0) {
        const myRole = String(currentUser?.role || "").toUpperCase();
        // Modo PÚBLICO o Modo AGENCIAS (Validando rol de quien mira)
        if (visibilityMode === 'PUBLIC' || (visibilityMode.includes('AGEN') && (myRole.includes('AGEN') || myRole === 'ADMIN'))) {
            canSeeCommission = true;
        }
    }

    // 4. Cálculos Financieros (Estimación para el botón)
    const numericPrice = Number(String(selectedProp?.price || "0").replace(/[^0-9]/g, ""));
    // Estimación visual: Asumimos un 3% estándar de honorarios totales para calcular la parte
    const estimatedEarnings = numericPrice * (3/100) * (sharePercent / 100);
    const formattedEarnings = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedEarnings);


    if (!selectedProp) return null;

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            
            {/* 🔥 PEGUE ESTA LÍNEA AQUÍ MISMO, LA PRIMERA DE TODAS 👇 */}
            <Toaster position="bottom-center" richColors />
            
            {/* 🕵️ EL ESPÍA ACTIVADO: Rastrea visitas en el panel de Agencia */}
            {selectedProp?.id && <ReferralListener propertyId={selectedProp.id} />}

            {/* Fondo Borroso (Ya existente) */}
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                
              {/* HEADER (SIN SPINNER) */}
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
                                {(isAgency) && (
                                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white px-2 py-1 rounded-full border-[3px] border-white shadow-lg flex items-center gap-1">
                                        <ShieldCheck size={12} strokeWidth={3} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-lg">
                                <X size={20} />
                            </button>
                         </div>

                         <div>
                            <h2 className="text-3xl font-black text-white leading-none mb-2 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                {name}
                            </h2>
                            {activeOwner.tagline && (
                                <p className="text-white/90 text-xs font-bold italic tracking-wide mb-4 drop-shadow-md border-l-2 border-emerald-400 pl-3">
                                    "{activeOwner.tagline}"
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                    <Briefcase size={12} className="text-emerald-400"/> 
                                    {roleLabel}
                                </span>
                               {activeOwner.zone && (
                                    <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-blue-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                        <Globe size={12} className="text-blue-400"/> {activeOwner.zone}
                                    </span>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* CONTENIDO SCROLL */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-40 bg-[#F5F5F7]">
                    
                    {/* FOTO CON SENSOR */}
                    <div className="relative aspect-video w-full bg-gray-200 rounded-[24px] overflow-hidden shadow-lg border-4 border-white group">
                        <img 
                            src={img} 
                            onClick={handleMainPhotoClick}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
                            alt="Propiedad" 
                        />
                        <div onClick={handleMainPhotoClick} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

                        {selectedProp?.videoUrl && (
                             <a 
                                href={selectedProp.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()} 
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all z-20 active:scale-95 cursor-pointer"
                             >
                                <Globe size={16} /> VER VÍDEO
                             </a>
                        )}

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
                      {new Intl.NumberFormat("es-ES").format(numericPrice)} €
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

                   <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white transition-all duration-300">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Descripción</span>
                        <div className="relative">
                            <p className={`text-slate-600 text-xs leading-relaxed whitespace-pre-line font-medium ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                                {cleanDescription || "Sin descripción detallada disponible."}
                            </p>
                            {!isDescExpanded && cleanDescription && cleanDescription.length > 200 && (
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
                            )}
                        </div>
                        {cleanDescription && cleanDescription.length > 200 && (
                            <button 
                                onClick={() => setIsDescExpanded(!isDescExpanded)} 
                                className="mt-3 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 transition-colors"
                            >
                                {isDescExpanded ? ( <>Leer menos <ArrowUp size={12}/></> ) : ( <>Leer descripción completa <ChevronDown size={12}/></> )}
                            </button>
                        )}
                   </div>

                   <div className="mt-4">
                        <AgencyExtrasViewer property={selectedProp} />
                   </div>

            {selectedProp?.openHouse?.enabled && selectedProp?.openHouse?.id && (
                <div className="mt-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
                    {isOwner ? (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-yellow-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">MI EVENTO</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[9px] font-bold text-white">EN VIVO</span>
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-hidden">
                                <GuestList openHouseId={selectedProp.openHouse.id} />
                            </div>
                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                <p className="text-[9px] text-gray-400 font-medium">Esta lista es privada. Solo tú puedes verla.</p>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="bg-[#111] rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
                            onClick={() => setShowOpenHouse(true)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10">Open House</span>
                                <h3 className="text-xl font-black mb-1 leading-tight">{selectedProp.openHouse.title || "Evento Exclusivo"}</h3>
                                <p className="text-xs text-gray-400 mb-4 line-clamp-1">{new Date(selectedProp.openHouse.startTime).toLocaleDateString()} • Aforo limitado</p>
                                <button className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg">Solicitar Invitación</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

                    {/* CERTIFICADO ENERGÉTICO */}
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-white flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Certificación<br/>Energética</span>
                        {selectedProp?.energyPending ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 animate-pulse">En trámite</span>
                        ) : (
                            <div className="flex gap-3">
                                {selectedProp?.energyConsumption ? (
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyConsumption)}`}>{selectedProp.energyConsumption}</div>
                                        <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Cons.</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-gray-400 font-bold self-center">N/D</span>
                                )}
                                {selectedProp?.energyEmissions && (
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm ${getEnergyColor(selectedProp.energyEmissions)}`}>{selectedProp.energyEmissions}</div>
                                        <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Emis.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 🔥🔥🔥 PANEL DE INTELIGENCIA DE MERCADO (NUEVO - SIEMPRE VISIBLE) 🔥🔥🔥 */}
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white mt-3 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                             <Activity size={16} className="text-blue-600"/>
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Métricas de Interés</h3>
                        </div>
                       
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Eye size={20}/></div>
                                <div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.views || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Ficha</p></div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Camera size={20}/></div>
                                <div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.photoViews || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Fotos</p></div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-400"><Heart size={20} className="fill-current"/></div>
                                <div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.favoritedBy?.length || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guardado</p></div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-400"><Share2 size={20}/></div>
                                <div><p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.shareCount || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compartido</p></div>
                            </div>
                        </div>
                        <div className="mt-3 text-[9px] text-slate-400 font-medium text-center bg-slate-50 py-1 rounded-lg">Datos actualizados en tiempo real por Stratos Intelligence™</div>
                    </div>
                    {/* 🔥 FIN DEL PANEL */}
                    
                    {/* 👇 AIRBAG: Aumentado a h-32 para seguridad visual 👇 */}
                    <div className="h-32 w-full shrink-0"></div>
                </div>

               {/* --- FOOTER: ACCIONES --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20 relative">
                  
                  {/* B2B BUTTON */}
                  {canSeeCommission && (
                      <button 
                        onClick={() => setShowB2BModal(true)} 
                        className="w-14 h-14 bg-gradient-to-br from-amber-200 to-yellow-400 text-yellow-900 rounded-[20px] border border-yellow-300 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse-slow z-50 relative cursor-pointer" 
                        title={`Colaboración disponible: ${sharePercent}%`}
                      >
                        <Handshake size={24} strokeWidth={2.5} />
                      </button>
                  )}

                  {/* CONTACT BUTTON */}
                  <button onClick={() => setShowContactModal(true)} className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs">
                    <Phone size={18} /> {isAgency ? "Contact. Agente" : "Contactar Propietario"}
                  </button>

                  {/* PDF BUTTON */}
                  {(() => {
                      const pdfBranding = (currentUser?.role === 'AGENCIA' || currentUser?.role === 'AGENCY') ? currentUser : (initialAgencyData || currentUser); 
                      if (!pdfBranding) return null;
                      return (
                          <PDFDownloadLink document={<PropertyFlyer property={selectedProp} agent={pdfBranding} />} fileName={`Ficha_${selectedProp.refCode || 'Stratos'}.pdf`} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90" title="Descargar Ficha PDF">
                            {({ loading }) => ( loading ? ( <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div> ) : ( <FileDown size={22} /> ) )}
                          </PDFDownloadLink>
                      );
                  })()}

                  {/* CHAT BUTTON */}
                  <button onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); try { const propertyId = String(selectedProp?.id || ""); const toUserId = String( activeOwner?.id || selectedProp?.user?.id || selectedProp?.ownerSnapshot?.id || selectedProp?.userId || ""); if (!propertyId || !toUserId) return; window.dispatchEvent( new CustomEvent("open-chat-signal", { detail: { propertyId, toUserId, property: selectedProp }, }) ); } catch (e) { console.warn("open-chat-signal failed", e); } }} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Mensaje">
                    <MessageCircle size={22} />
                  </button>

                  {/* FAVORITE BUTTON */}
                  <button onClick={() => onToggleFavorite && onToggleFavorite({ ...selectedProp, isFav: !isFavorite })} className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${ isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500" }`}>
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

         {/* MODAL CONTACTO (DISEÑO CORPORATIVO REFINADO) */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0 cursor-pointer"></div>
                        <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6 ring-1 ring-white/20">
                            
                            {/* ✅ CABECERA MÁS ALTA (h-44) PARA MÁS IMPACTO */}
                            <div className="relative h-44 bg-gray-900 flex items-end p-6 gap-5">
                                <div className="absolute inset-0">
                                    {cover ? ( <img src={cover} className="w-full h-full object-cover opacity-80" alt="Fondo Corporativo" /> ) : ( <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black" /> )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                </div>
                                
                                {/* ✅ AVATAR MÁS GRANDE (w-24 h-24) */}
                                <div className="relative z-10 w-24 h-24 rounded-2xl bg-white p-1.5 shadow-2xl shrink-0 border border-white/20 mb-1 rotate-2 hover:rotate-0 transition-transform">
                                    {avatar ? ( <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Logo Agencia" /> ) : ( <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User className="text-slate-300" size={40}/></div> )}
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm"><ShieldCheck size={14} strokeWidth={3}/></div>
                                </div>
                                
                                <div className="relative z-10 mb-2 flex-1 min-w-0">
                                    <h3 className="text-white font-black text-2xl leading-none mb-2 drop-shadow-md truncate">{name || "Agencia Certificada"}</h3>
                                    <div className="flex items-center gap-2 bg-black/30 w-fit px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Respuesta Inmediata</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/30 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all border border-white/10"><X size={20}/></button>
                            </div>

                            {/* FORMULARIO PRINCIPAL */}
                            <div className="px-6 pt-5 space-y-4">
                                <div className="text-center">
                                    <h4 className="text-slate-900 font-black text-lg leading-tight">Solicitar Visita / Información</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Complete sus datos para ser atendido por un agente.</p>
                                </div>
                                
                                <form onSubmit={handleSendLead} className="space-y-3">
                                    <input 
                                        className="w-full p-4 bg-white rounded-2xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-sm"
                                        placeholder="Nombre Completo"
                                        value={leadForm.name}
                                        onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            type="email"
                                            className="w-full p-4 bg-white rounded-2xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-sm"
                                            placeholder="Email"
                                            value={leadForm.email}
                                            onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                                            required
                                        />
                                        <input 
                                            type="tel"
                                            className="w-full p-4 bg-white rounded-2xl text-sm font-bold text-slate-900 border border-slate-200 focus:border-blue-500 outline-none shadow-sm"
                                            placeholder="Teléfono"
                                            value={leadForm.phone}
                                            onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <textarea 
                                        className="w-full p-4 bg-white rounded-2xl text-sm font-medium text-slate-900 border border-slate-200 focus:border-blue-500 outline-none min-h-[100px] resize-none shadow-sm"
                                        placeholder={`Hola, me interesa la propiedad REF: ${selectedProp.refCode || '...'} y me gustaría recibir más información.`}
                                        value={leadForm.message}
                                        onChange={e => setLeadForm({...leadForm, message: e.target.value})}
                                    />

                                    <button 
                                        type="submit" 
                                        disabled={sendingLead}
                                        className="w-full py-4 bg-[#1c1c1e] hover:bg-black text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                                    >
                                        {sendingLead ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} className="text-blue-400"/>}
                                        {sendingLead ? "PROCESANDO..." : "ENVIAR SOLICITUD AHORA"}
                                    </button>
                                </form>

                             {/* ✅ RED DE SEGURIDAD: BOTÓN DE LLAMADA INTELIGENTE */}
                                <div className="pt-2 border-t border-slate-200/50 text-center">
                                    <p className="text-[10px] text-slate-400 mb-2 font-medium">¿Prefiere hablar directamente?</p>
                                    
                                    {!copied ? (
                                        // ESTADO 1: Botón para revelar y llamar
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (typeof copyPhone === 'function') copyPhone(); 
                                                // Intento de llamada real para móviles
                                                window.location.href = `tel:${phone.replace(/\s/g, '')}`;
                                            }} 
                                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                                        >
                                            <Phone size={14} className="text-emerald-500"/>
                                            Llamar a la Agencia
                                        </button>
                                    ) : (
                                        // ESTADO 2: Número visible y confirmación
                                        <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                                            <a 
                                                href={`tel:${phone.replace(/\s/g, '')}`} 
                                                className="text-xl font-black text-slate-900 tracking-tight hover:underline mb-1"
                                            >
                                                {phone}
                                            </a>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                <Check size={12} /> Copiado al portapapeles
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
               {showOpenHouse && ( <OpenHouseOverlay property={selectedProp} onClose={() => setShowOpenHouse(false)} /> )}

               {showB2BModal && (
                    <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in" onClick={() => setShowB2BModal(false)}>
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"/>
                            <button onClick={() => setShowB2BModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-lg z-20 hover:rotate-90 active:scale-90"><X size={20} /></button>
                            <div className="p-8 text-center relative z-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-yellow-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-6 rotate-3"><Handshake size={40} className="text-white drop-shadow-md"/></div>
                                <h3 className="text-2xl font-black text-white leading-tight mb-2">Colaboración Activa</h3>
                                <p className="text-slate-400 text-xs font-medium mb-8 px-4">Esta propiedad admite colaboración inmediata. Trae a tu comprador y comparte honorarios.</p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/>
                                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Tu Comisión</span><span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black border border-amber-500/30">{sharePercent}% DEL TOTAL</span></div>
                                    <div className="flex items-center justify-center gap-3 mt-4"><Coins size={28} className="text-amber-400"/><span className="text-4xl font-black text-white tracking-tight">{formattedEarnings}</span></div>
                                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">ESTIMADO (+ IVA)</p>
                                </div>
                                <button 
                                    onClick={() => { 
                                        setShowB2BModal(false); 
                                        if (typeof window !== 'undefined') { 
                                            window.dispatchEvent(new CustomEvent('open-chat-signal', { 
                                                detail: { 
                                                    propertyId: selectedProp?.id, 
                                                    // 🔥 MEJORA DE SEGURIDAD: Fallback de identidad
                                                    toUserId: activeOwner?.id || selectedProp?.userId, 
                                                    message: `Hola, compañero. Me interesa la colaboración al ${sharePercent}% para la propiedad REF: ${selectedProp?.refCode || 'Sin Ref'}. ¿Hablamos?` 
                                                } 
                                            })); 
                                        } 
                                    }} 
                                    className="w-full mt-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 font-black text-xs rounded-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Briefcase size={16}/> Aceptar Colaboración
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}