// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';

// 🔥 IMPORTAMOS ACCIONES CLAVE
import { 
    getCampaignByPropertyAction, 
    getPropertyByIdAction,
    getActiveManagementAction,
    incrementStatsAction,
    submitLeadAction
} from "@/app/actions";

// 🔔 NOTIFICACIONES
import { Toaster, toast } from 'sonner';

import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase,
    Star, Home, Maximize2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, 
    Camera, Globe, Plane, Hammer, Ruler, Handshake, Coins,
    TrendingUp, Share2, Mail, FileCheck, Activity, MessageCircle,
    Sofa, Droplets, Paintbrush, Truck, Bed, Bath, Copy, Check, Building2, Eye, ChevronDown,
    FileDown, PlayCircle, MapPin, 
    Loader2, Send
} from 'lucide-react';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropertyFlyer } from '../../pdf/PropertyFlyer';
import AgencyExtrasViewer from "./AgencyExtrasViewer";
import OpenHouseOverlay from "./OpenHouseOverlay";
import GuestList from "./GuestList";
import ReferralListener from '../../ReferralListener';

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
    const [activeOwner, setActiveOwner] = useState(() => {
        if (initialAgencyData) return initialAgencyData;
        if (currentUser && initialProp?.userId === currentUser.id) return currentUser;
        if (initialProp?.user) return initialProp.user;
        if (initialProp?.ownerSnapshot) return initialProp.ownerSnapshot;
        return {};
    });

    const [campaignData, setCampaignData] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
const [showOpenHouse, setShowOpenHouse] = useState(false);
const [openHouseSnap, setOpenHouseSnap] = useState<any>(null); // 🥶 NUEVO: Snapshot de memoria
const [showB2BModal, setShowB2BModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const [sendingLead, setSendingLead] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSendLead = async (e: any) => {
        e.preventDefault();
        setSendingLead(true);
        const res = await submitLeadAction({
            propertyId: selectedProp.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || "Hola, me interesa esta propiedad."
        });
        setSendingLead(false);

        if (res.success) {
            toast.success("Solicitud Enviada", { description: "El contacto ha sido notificado." });
            setShowContactModal(false); 
            setLeadForm({ name: '', email: '', phone: '', message: '' }); 
        } else {
            toast.error("Error", { description: "No se pudo entregar el mensaje." });
        }
    };

 // 🧠 CEREBRO 1: Recepción inicial (CON MERGE ANTI-DESTRUCCIÓN)
 useEffect(() => {
    if (!initialProp?.id) return;

    setSelectedProp((prev: any) => {
      if (!prev) return initialProp;
      if (String(prev.id) !== String(initialProp.id)) return initialProp;

      // 🔥 BLINDAJE: Usamos "||" para que si viene un "null" malicioso, lo rechace y se quede con lo nuestro.
      const nextOpenHouse = initialProp?.openHouse || initialProp?.open_house_data || prev?.openHouse || prev?.open_house_data;
      const nextB2B = initialProp?.b2b || prev?.b2b;
      const nextCampaign = initialProp?.activeCampaign || prev?.activeCampaign;

      return {
        ...prev,
        ...initialProp,
        b2b: nextB2B,
        activeCampaign: nextCampaign,
        openHouse: nextOpenHouse,
        open_house_data: nextOpenHouse,
      };
    });

    if (initialAgencyData) setActiveOwner(initialAgencyData);
    else if (currentUser && initialProp?.userId === currentUser.id) setActiveOwner(currentUser);
    else if (initialProp?.user) setActiveOwner(initialProp.user);

    setCampaignData(null);
  }, [initialProp?.id]);

 // 🔥 CEREBRO NUEVO ACTUALIZADO: Recupera la Propiedad Y RECONSTRUYE a la Agencia
    useEffect(() => {
        const verifyRealData = async () => {
            if (!selectedProp?.id) return;
            try {
                // 1. Pedimos el expediente completo al servidor
                const realData = await getPropertyByIdAction(selectedProp.id);
                
                if (realData?.success && realData.data) {
                    const data = realData.data;
                    
                    // 2. Actualizamos la propiedad con los datos frescos
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

                    // 3. 🔥 LA MAGIA: RECONSTRUIR AL DUEÑO / AGENCIA
                    const mgmtRes = await getActiveManagementAction(selectedProp.id);
                    let finalOwner = data.user || {}; // Por defecto el creador
                    
                    // Si tiene gestión activa (Campaña), el dueño de la ficha pasa a ser la AGENCIA
                    if (mgmtRes?.success && mgmtRes?.data?.agency) {
                        setCampaignData(mgmtRes.data);
                        finalOwner = mgmtRes.data.agency;
                    } else if (data.activeCampaign?.status === 'ACCEPTED' && data.activeCampaign?.agency) {
                        // Backup por si viene dentro de la propiedad
                        finalOwner = data.activeCampaign.agency;
                    }

                    // Actualizamos el estado visual con el Avatar, Portada, Teléfono, etc. de la Agencia
                    if (Object.keys(finalOwner).length > 0) {
                        setActiveOwner((prev: any) => ({ ...prev, ...finalOwner }));
                    }
                }
            } catch (error) { 
                console.error("Error en protocolo de fusión:", error); 
            }
        };
        
        verifyRealData();
    }, [selectedProp?.id]);

    useEffect(() => {
    const handleLiveUpdate = (e: any) => {
      const rawData = e.detail?.updates || e.detail;
      const targetId = e.detail?.id || rawData?.id;

      if (!targetId || String(selectedProp?.id) !== String(targetId)) return;

      setSelectedProp((prev: any) => {
        if (!prev) return rawData;

        // 🔥 BLINDAJE: Usamos "||" para rechazar los null destructivos
        const nextB2B = rawData?.b2b || prev?.b2b;
        const incomingOH = rawData?.openHouse || rawData?.open_house_data;
        const nextOH = incomingOH || prev?.openHouse || prev?.open_house_data;

        return {
          ...prev,
          ...rawData,
          b2b: nextB2B,
          openHouse: nextOH,
          open_house_data: nextOH,
        };
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("update-property-signal", handleLiveUpdate);
      window.addEventListener("sync-property-state", handleLiveUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("update-property-signal", handleLiveUpdate);
        window.removeEventListener("sync-property-state", handleLiveUpdate);
      }
    };
  }, [selectedProp?.id]);
  

    const handleMainPhotoClick = () => {
        if (selectedProp?.id) incrementStatsAction(selectedProp.id, 'photo');
        if (onOpenInspector) onOpenInspector();
    };

    const copyRefCode = async () => {
      const ref = String(selectedProp?.refCode || "");
      if (!ref) return;
      try { 
          await navigator.clipboard.writeText(ref); 
      } catch {}
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    };

    const copyPhone = () => {
        navigator.clipboard.writeText(activeOwner.mobile || activeOwner.phone || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const name = activeOwner.companyName || activeOwner.name || "Agencia";
    
    // 🔥 EL DETECTOR DE ROLES
    const roleString = String(activeOwner.role || "").toUpperCase();
    const isAgency = roleString.includes('AGEN') || activeOwner.licenseType === 'PRO';
    const roleLabel = isAgency ? "AGENCIA CERTIFICADA" : "PARTICULAR VERIFICADO";

    const avatar = activeOwner.companyLogo || activeOwner.avatar || activeOwner.image || null;
    const cover = activeOwner.coverImage || activeOwner.cover || null;
    const email = activeOwner.email || "---";
    const phone = activeOwner.mobile || activeOwner.phone || "";

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

    // 🛡️ LÓGICA DE PRIVACIDAD: ¿Quién manda en este evento?
    const isOwner = (() => {
        if (!currentUser?.id) return false;
        
        // 1. Si la casa está cedida a una Agencia (Campaña), SOLO la Agencia es dueña del evento.
        if (selectedProp?.activeCampaign?.status === 'ACCEPTED') {
            const idAgenciaGestora = selectedProp.activeCampaign.agencyId || selectedProp.activeCampaign.agency?.id;
            return String(currentUser.id) === String(idAgenciaGestora);
        }
        
        // 2. Si no hay campaña, el dueño del evento es el creador original.
        return String(currentUser.id) === String(selectedProp?.userId);
    })();

    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[String(rating).toUpperCase()] || "bg-gray-400";
    };

    const cleanDescription = selectedProp?.description ? selectedProp.description.replace(/<[^>]+>/g, '') : null;

    const sharePercent = Number(
        selectedProp?.b2b?.sharePct ??                       
        selectedProp?.activeCampaign?.commissionSharePct ??  
        selectedProp?.commissionSharePct ??                  
        selectedProp?.sharePct ??                            
        0
    );

    const visibilityMode = String(
        selectedProp?.b2b?.visibility ?? 
        selectedProp?.activeCampaign?.commissionShareVisibility ?? 
        selectedProp?.shareVisibility ?? 
        "PRIVATE"
    ).toUpperCase();
    
    let canSeeCommission = false;
    if (sharePercent > 0) {
        const myRole = String(currentUser?.role || "").toUpperCase();
        if (visibilityMode === 'PUBLIC' || (visibilityMode.includes('AGEN') && (myRole.includes('AGEN') || myRole === 'ADMIN'))) {
            canSeeCommission = true;
        }
    }

   const numericPrice = Number(String(selectedProp?.price || "0").replace(/[^0-9]/g, ""));
    
    // 🔥 EL ARREGLO MAESTRO DEL CÁLCULO B2B 🔥
    // Extraemos la comisión base real del contrato (Ej: su 20%), si falla usa un 3% de salvavidas
    const baseCommissionPct = Number(
        selectedProp?.activeCampaign?.commissionPct ?? 
        selectedProp?.commissionPct ?? 
        3
    );

    // Cálculo Real: Precio total * (Comisión Agencia / 100) * (Porcentaje a compartir / 100)
    // Su caso: 8.5M * 20% * 80% = 1.360.000 €
    const estimatedEarnings = numericPrice * (baseCommissionPct / 100) * (sharePercent / 100);
    const formattedEarnings = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedEarnings);

    if (!selectedProp) return null;

    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            
            <Toaster position="bottom-center" richColors />
            
            {selectedProp?.id && <ReferralListener propertyId={selectedProp.id} />}

            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                
                {/* CABECERA */}
                <div className="relative shrink-0 z-20 h-72 overflow-hidden bg-gray-100">
                    <div className="absolute inset-0">
                        {cover ? ( 
                            <img src={cover} className="w-full h-full object-cover" alt="Fondo" /> 
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
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-lg"
                            >
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
                                <span className={`px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${isAgency ? 'bg-black/60 text-emerald-300' : 'bg-black/40 text-white'}`}>
                                    {isAgency ? <Briefcase size={12} className="text-emerald-400"/> : <User size={12} className="text-white"/>} 
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

                {/* CONTENIDO PRINCIPAL */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide pb-40 bg-[#F5F5F7]">
                    
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
                      
                      {/* 📍 LA INYECCIÓN LETAL: AHORA SÍ TIENE DIRECCIÓN */}
                      <div className="flex items-start gap-1.5 text-slate-500 mb-6 mt-2">
                          <MapPin size={16} className="shrink-0 text-indigo-500 mt-0.5" />
                          <span className="text-[12px] font-bold leading-relaxed uppercase tracking-wide">
                              {selectedProp?.address || selectedProp?.city || "UBICACIÓN PRIVADA"}
                          </span>
                      </div>
                      
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                          {new Intl.NumberFormat("es-ES").format(numericPrice)} €
                      </p>
                    </div>

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
                                <div>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block">Ascensor</span>
                                    <span className={`font-bold text-xs ${hasElevator ? 'text-green-600' : 'text-slate-400'}`}>
                                        {hasElevator ? 'SÍ TIENE' : 'NO TIENE'}
                                    </span>
                                </div>
                                {hasElevator && <ArrowUp size={14} className="text-green-500" />}
                            </div>
                            
                            {physicalItems.map((item) => (
                                <div key={item.id} className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-[8px] text-blue-400 font-bold uppercase block">Incluido</span>
                                        <span className="font-bold text-xs text-blue-900">{item.label}</span>
                                    </div>
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
                      
                    <AgencyExtrasViewer
  property={selectedProp}
  onOpenHouseClick={() => {
    setOpenHouseSnap(selectedProp?.openHouse || selectedProp?.open_house_data || openHouseSnap);
    setShowOpenHouse(true);
  }}
/>
                   </div>
               
                {/* 🔥 LA LISTA PRIVADA (SOLO LA VE EL DUEÑO DE LA AGENCIA) 🔥 */}
                    {selectedProp?.openHouse?.enabled && selectedProp?.openHouse?.id && isOwner && (
                        <div className="mt-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
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
                        </div>
                    )}

                 {showOpenHouse && (
  <OpenHouseOverlay
    property={{
      ...selectedProp,
      openHouse: selectedProp?.openHouse || selectedProp?.open_house_data || openHouseSnap,
    }}
    onClose={() => setShowOpenHouse(false)}
    isOrganizer={isOwner}
  />
)}
                   
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

                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white mt-3 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-blue-600"/>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Métricas de Interés</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Eye size={20}/></div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.views || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Ficha</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400"><Camera size={20}/></div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.photoViews || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vistas Fotos</p>
                                </div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-400"><Heart size={20} className="fill-current"/></div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.favoritedBy?.length || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guardado</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-400"><Share2 size={20}/></div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.shareCount || 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compartido</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 text-[9px] text-slate-400 font-medium text-center bg-slate-50 py-1 rounded-lg">
                            Datos actualizados en tiempo real por Stratos Intelligence™
                        </div>
                    </div>
                    
                    <div className="h-32 w-full shrink-0"></div>
                </div>

                {/* FOOTER */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20 relative">
                  {canSeeCommission && (
                      <button 
                          onClick={() => setShowB2BModal(true)} 
                          className="w-14 h-14 bg-gradient-to-br from-amber-200 to-yellow-400 text-yellow-900 rounded-[20px] border border-yellow-300 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse-slow z-50 relative cursor-pointer" 
                          title={`Colaboración disponible: ${sharePercent}%`}
                      >
                          <Handshake size={24} strokeWidth={2.5} />
                      </button>
                  )}
                  <button 
                      onClick={() => setShowContactModal(true)} 
                      className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
                  >
                    <Phone size={18} /> Contactar
                  </button>
                  
                  {(() => {
                      const pdfBranding = (currentUser?.role === 'AGENCIA' || currentUser?.role === 'AGENCY') ? currentUser : (initialAgencyData || currentUser); 
                      if (!pdfBranding) return null;
                      return ( 
                          <PDFDownloadLink document={<PropertyFlyer property={selectedProp} agent={pdfBranding} />} fileName={`Ficha_${selectedProp.refCode || 'Stratos'}.pdf`} className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90" title="Descargar Ficha PDF">
                              {({ loading }) => ( loading ? ( <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div> ) : ( <FileDown size={22} /> ) )}
                          </PDFDownloadLink> 
                      );
                  })()}

                  <button 
                      onClick={(ev) => { 
                          ev.preventDefault(); ev.stopPropagation(); 
                          try { 
                              const propertyId = String(selectedProp?.id || ""); 
                              const toUserId = String( activeOwner?.id || selectedProp?.user?.id || selectedProp?.ownerSnapshot?.id || selectedProp?.userId || ""); 
                              if (!propertyId || !toUserId) return; 
                              window.dispatchEvent( new CustomEvent("open-chat-signal", { detail: { propertyId, toUserId, property: selectedProp }, }) ); 
                          } catch (e) { console.warn("open-chat-signal failed", e); } 
                      }} 
                      className="w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" title="Mensaje"
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button 
                      onClick={() => onToggleFavorite && onToggleFavorite({ ...selectedProp, isFav: !isFavorite })} 
                      className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors cursor-pointer ${ isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500" }`}
                  >
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* 🔥🔥🔥 EL MODAL INTELIGENTE (CAMALEÓNICO) 🔥🔥🔥 */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0 cursor-pointer"></div>
                        
                        {isAgency ? (
                            // ==========================================
                            // 🏢 VISTA PARA AGENCIAS (MODAL OSCURO)
                            // ==========================================
                            <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6 ring-1 ring-white/20">
                                <div className="relative h-44 bg-gray-900 flex items-end p-6 gap-5">
                                    <div className="absolute inset-0">
                                        {cover ? ( 
                                            <img src={cover} className="w-full h-full object-cover opacity-80" alt="Fondo" /> 
                                        ) : ( 
                                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black" /> 
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                    </div>
                                    <div className="relative z-10 w-24 h-24 rounded-2xl bg-white p-1.5 shadow-2xl shrink-0 border border-white/20 mb-1 rotate-2">
                                        {avatar ? ( 
                                            <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Logo" /> 
                                        ) : ( 
                                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User className="text-slate-300" size={40}/></div> 
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm"><ShieldCheck size={14} strokeWidth={3}/></div>
                                    </div>
                                    <div className="relative z-10 mb-2 flex-1 min-w-0">
                                        <h3 className="text-white font-black text-2xl leading-none mb-2 drop-shadow-md truncate">{name}</h3>
                                        <div className="flex items-center gap-2 bg-black/30 w-fit px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Respuesta Inmediata</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/30 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"><X size={20}/></button>
                                </div>
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
                                            placeholder={`Hola, me interesa la propiedad REF: ${selectedProp.refCode || '...'}...`} 
                                            value={leadForm.message} 
                                            onChange={e => setLeadForm({...leadForm, message: e.target.value})} 
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={sendingLead} 
                                            className="w-full py-4 bg-[#1c1c1e] hover:bg-black text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer"
                                        >
                                            {sendingLead ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} className="text-blue-400"/>}
                                            {sendingLead ? "PROCESANDO..." : "ENVIAR SOLICITUD"}
                                        </button>
                                    </form>
                                    <div className="pt-2 border-t border-slate-200/50 text-center">
                                        <p className="text-[10px] text-slate-400 mb-2 font-medium">¿Prefiere hablar directamente?</p>
                                        {!copied ? (
                                            <button 
                                                onClick={(e) => { e.preventDefault(); copyPhone(); window.location.href = `tel:${phone.replace(/\s/g, '')}`; }} 
                                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95 shadow-sm cursor-pointer"
                                            >
                                                <Phone size={14} className="text-emerald-500"/>
                                                Llamar a la Agencia
                                            </button>
                                        ) : (
                                            <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                                                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-xl font-black text-slate-900 tracking-tight hover:underline mb-1">{phone}</a>
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Check size={12} /> Copiado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        ) : (

                            // ==========================================
                            // 🏡 VISTA PARA PARTICULARES (MODAL CLARO Y VERDE)
                            // ==========================================
                            <div className="relative bg-white rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-0 pb-6 ring-1 ring-white/20 w-full h-auto max-h-[90vh] flex flex-col">
                                <div className="relative h-32 bg-slate-900 shrink-0">
                                    <div className="absolute inset-0">
                                        <img src={img} className="w-full h-full object-cover opacity-40 blur-sm" alt="Background" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                                    </div>
                                    <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"><X size={20}/></button>

                                    <div className="absolute -bottom-10 left-6 right-6 flex items-end gap-4 z-20">
                                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl shrink-0 border border-white/20">
                                            {avatar ? ( 
                                                <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Avatar" /> 
                                            ) : ( 
                                                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User className="text-slate-300" size={32}/></div> 
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm"><ShieldCheck size={12} strokeWidth={3}/></div>
                                        </div>
                                        
                                        <div className="mb-11 flex-1 min-w-0 text-white">
                                            <h3 className="font-black text-2xl leading-none drop-shadow-md truncate mb-1">{name}</h3>
                                            <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                                                <Check size={10} className="text-green-300" />
                                                <span className="text-[10px] font-bold text-green-100 uppercase tracking-wider">Particular Verificado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pt-14 pb-4 flex-1 overflow-y-auto">
                                    <div className="mb-5 text-center sm:text-left">
                                        <h4 className="text-slate-900 font-black text-lg leading-tight">Contactar con el dueño</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Complete sus datos para ser atendido directamente.</p>
                                    </div>
                                    
                                    <form onSubmit={handleSendLead} className="space-y-3">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                            <input 
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-900 border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                                                placeholder="Tu Nombre" 
                                                value={leadForm.name} 
                                                onChange={e => setLeadForm({...leadForm, name: e.target.value})} 
                                                required 
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                                <input 
                                                    type="email" 
                                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-900 border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                                                    placeholder="Email" 
                                                    value={leadForm.email} 
                                                    onChange={e => setLeadForm({...leadForm, email: e.target.value})} 
                                                    required 
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                                <input 
                                                    type="tel" 
                                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-bold text-slate-900 border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                                                    placeholder="Teléfono" 
                                                    value={leadForm.phone} 
                                                    onChange={e => setLeadForm({...leadForm, phone: e.target.value})} 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <textarea 
                                                className="w-full p-4 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-sm font-medium text-slate-900 border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none min-h-[100px] resize-none transition-all" 
                                                placeholder={`Hola, me interesa la referencia ${selectedProp.refCode || '...'}...`} 
                                                value={leadForm.message} 
                                                onChange={e => setLeadForm({...leadForm, message: e.target.value})} 
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={sendingLead} 
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 mt-2 cursor-pointer"
                                        >
                                            {sendingLead ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} className="text-blue-100"/>}
                                            {sendingLead ? "ENVIANDO..." : "ENVIAR MENSAJE AL DUEÑO"}
                                        </button>
                                    </form>
                                    
                                    <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-center gap-2 text-green-700">
                                        <ShieldCheck size={14} className="fill-green-200"/>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Protección Anti-Spam Activa</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                                            // 1. Abrimos el chat con el mensaje de B2B
                                            window.dispatchEvent(new CustomEvent('open-chat-signal', { 
                                                detail: { 
                                                    propertyId: selectedProp?.id, 
                                                    toUserId: activeOwner?.id || selectedProp?.userId, 
                                                    message: `Hola, compañero. Me interesa la colaboración al ${sharePercent}% para la propiedad REF: ${selectedProp?.refCode || 'Sin Ref'}. ¿Hablamos?` 
                                                } 
                                            })); 

                                            // 🔥 2. BENGALA TÁCTICA: Forzamos la actualización de la columna izquierda (B2B)
                                            setTimeout(() => {
                                                window.dispatchEvent(new CustomEvent('refresh-b2b-list'));
                                            }, 800); // Pequeño retraso para dar tiempo a que la DB cree el chat
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