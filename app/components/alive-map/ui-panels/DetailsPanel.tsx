// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Phone, Sparkles, Star, Home, Maximize2, Building2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, ShieldCheck, Flame, Wind, Link, ExternalLink, 
    Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, TrendingUp, Share2, Eye, LinkIcon, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, ChevronDown,
    Droplets, Paintbrush, Truck, Briefcase, Bed, Bath, User, Copy, Check, MessageCircle, FileDown, MapPin, 
    Loader2, Send // ✅ AÑADIDOS: Para el formulario de contacto
} from 'lucide-react';

// 🔥 IMPORTAMOS ACCIONES CLAVE (INCLUIDO EL ENVÍO DE LEADS)
import { 
    toggleFavoriteAction, 
    getPropertyByIdAction, 
    incrementStatsAction,
    submitLeadAction // ✅ AÑADIDO: La pieza clave para el búnker
} from "@/app/actions";

// 🔔 NOTIFICACIONES (VITAL PARA EL FEEDBACK DEL USUARIO)
import { Toaster, toast } from 'sonner';

// 🔥 HERRAMIENTAS PDF
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropertyFlyer } from '../../pdf/PropertyFlyer';

// 🔥 EL ESPÍA TÁCTICO (RASTREADOR)
import ReferralListener from '../../ReferralListener';

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
    
    // ESTADO
    const [selectedProp, setSelectedProp] = useState(initialProp);
    
    // 🔥 ESTADO DE IDENTIDAD DINÁMICA (LA CLAVE DE LA VICTORIA)
    // Inicializamos con null para obligar a la carga fresca si hay duda
    const [freshOwner, setFreshOwner] = useState<any>(null);

    const [copiedRef, setCopiedRef] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
// --- 🛡️ SISTEMA DE CONTACTO BLINDADO (BÚNKER) ---
    const [sending, setSending] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSendLead = async (e: any) => {
        e.preventDefault();
        setSending(true);

        const res = await submitLeadAction({
            propertyId: selectedProp.id,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            message: leadForm.message || "Hola, me interesa tu propiedad."
        });

        setSending(false);

        if (res.success) {
            toast.success("Mensaje Enviado", { description: "El propietario recibirá tu solicitud." });
            setShowContactModal(false); // Cerramos el modal tras el disparo
            setLeadForm({ name: '', email: '', phone: '', message: '' }); // Recargamos munición
        } else {
            toast.error("Error", { description: "No se pudo entregar el mensaje." });
        }
    };
    // Sincronizar al abrir
    useEffect(() => { 
        setSelectedProp(initialProp); 
        setFreshOwner(null); // Reset al cambiar de propiedad
    }, [initialProp]);

    // Listener Updates
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

    // 🔥 SENSOR VISITAS
    useEffect(() => {
        if (selectedProp?.id) {
            incrementStatsAction(selectedProp.id, 'view');
        }
    }, [selectedProp?.id]);

  // ============================================================
    // 🚑 PROTOCOLO DE AUTO-REPARACIÓN (PURGA DE DATOS VIEJOS)
    // ============================================================
    useEffect(() => {
        const fetchFreshData = async () => {
            if (!selectedProp?.id) return;

            try {
                // 1. Pedimos a la base de datos la VERDAD
                const res = await getPropertyByIdAction(selectedProp.id);
                
                // 🔥 LA LLAVE: Verificamos que traiga el .data
                if (res && res.success && res.data) {
                    const realData = res.data;

                    // 2. Actualizamos la propiedad (Métricas, Precio, Estado)
                    setSelectedProp((prev: any) => ({ 
                        ...prev, 
                        ...realData, // AHORA SÍ SACA LOS DATOS CORRECTAMENTE
                        user: initialProp?.user || prev?.user || realData.user
                    }));

                    // 3. CAPTURAMOS AL DUEÑO REAL
                    if (realData.user) {
                        setFreshOwner(realData.user);
                    }
                }
            } catch (e) {
                console.error("Error fetching fresh data:", e);
            }
        };

        fetchFreshData();
    }, [selectedProp?.id, initialProp]);

    // 🔥 SENSOR FOTOS
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

    // ============================================================
    // 🛡️ LÓGICA DE IDENTIDAD BLINDADA (EL ARREGLO DEL AVATAR)
    // ============================================================
    
    // Detectamos si es tu propia casa
    const isViewingMyOwnProperty = currentUser?.id && String(currentUser.id) === String(selectedProp?.userId);
    
    // Prioridad INQUEBRANTABLE: 
    // 1. Tu mochila o perfil (Si es tu casa) -> 2. Dueño Fresco (BD) -> 3. Snapshot viejo
    const activeOwner = isViewingMyOwnProperty 
        ? (initialProp?.user || currentUser) 
        : (freshOwner || selectedProp?.user || initialProp?.user || selectedProp?.ownerSnapshot || {});

    const ownerName = activeOwner.companyName || activeOwner.name || "Propietario";
    
    // Truco para avatar: Busca en todos los rincones posibles
    const ownerAvatar = activeOwner.companyLogo || activeOwner.avatar || activeOwner.image || null;
    const ownerCover = activeOwner.coverImage || activeOwner.cover || null;
    
    const ownerPhone = activeOwner.mobile || activeOwner.phone || "Consultar";
    const ownerEmail = activeOwner.email || "---";
    
    // ROL NORMALIZADO (Respeta si le pasamos "Particular Verificado" desde la mochila)
    const ownerRole = String(activeOwner.badge || activeOwner.role || "PARTICULAR").toUpperCase();

    // Copiar teléfono
    const copyPhone = () => {
      if(ownerPhone === "Consultar") return;
      navigator.clipboard.writeText(ownerPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // ❤️ FAVORITOS
    const isFavorite = (favorites || []).some((f: any) => String(f?.id) === String(selectedProp?.id));

 
    // 🔥 FUNCIÓN 2: COPIAR TODO EL TEXTO (Para Email o pegar manualmente)
    const handleCopyVipLink = async () => {
        const p = selectedProp || {};
        const propId = p.id || p.propertyId || p._id || "NO_ID";
        
        // Generamos el texto completo también aquí
        const ref = p.refCode || "N/A";
        const tipo = p.type ? String(p.type).toUpperCase() : "INMUEBLE";
        const ubicacion = p.address || p.location || p.city || "Ubicación Privada";
        let precio = "Consultar Precio";
        if (p.price) {
            const numPrice = Number(String(p.price).replace(/\D/g, ''));
            if (!isNaN(numPrice) && numPrice > 0) precio = new Intl.NumberFormat('es-ES').format(numPrice) + " €";
            else precio = String(p.price);
        }
        const habs = p.rooms || p.bedrooms || 0;
        const banos = p.baths || p.bathrooms || 0;
        const metros = p.mBuilt || p.surface || 0;
const vipLink = p.refCode 
    ? `https://stratosfere.com/?ref=${encodeURIComponent(p.refCode.trim())}` 
    : `https://stratosfere.com/?p=${propId}`;      
    
    const shareText = `🏛️ *STRATOSFERE OS | EXPEDIENTE OFICIAL* 🏛️\n\n*REF:* ${ref}\n*Activo:* ${tipo}\n*Ubicación:* ${ubicacion}\n*Precio:* ${precio}\n\n🛏️ ${habs} Hab. | 🛁 ${banos} Baños | 📐 ${metros}m²\n\n🔗 *Ver Expediente y Fotos:*\n${vipLink}`;

        try {
            await navigator.clipboard.writeText(shareText);
            copiadoExitoso(propId);
        } catch (err) {
            try {
                const ta = document.createElement("textarea");
                ta.value = shareText;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                copiadoExitoso(propId);
            } catch (fallbackErr) {
                alert("Tu navegador bloqueó la copia. El link es: " + vipLink);
            }
        }
    };

    // Función auxiliar para actualizar contadores
    const copiadoExitoso = async (propId: string) => {
        setCopied(true);
        if (typeof toast !== 'undefined') toast.success("Expediente Copiado", { description: "Pase VIP listo para pegar." });
        setTimeout(() => setCopied(false), 2000);
        
        if (propId !== "NO_ID" && typeof incrementStatsAction === 'function') await incrementStatsAction(propId, 'share');
        setSelectedProp((prev: any) => ({ ...prev, shareCount: (prev?.shareCount || 0) + 1 }));
    };

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
            
            {/* ✅ SISTEMA DE ALERTAS (NUEVO) */}
            <Toaster position="bottom-center" richColors />

            {/* RASTREADOR (YA ESTABA) */}
            {selectedProp?.id && <ReferralListener propertyId={selectedProp.id} />}

            {/* FONDO (YA ESTABA) */}
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
                            <span className={`px-3 py-1 rounded-lg backdrop-blur-md border border-white/30 text-[10px] font-bold uppercase tracking-wider shadow-lg inline-flex items-center gap-2 ${ownerRole === 'AGENCIA' || ownerRole === 'AGENCY' ? 'bg-black/80 text-emerald-400' : 'bg-black/40 text-white'}`}>
                                {(ownerRole === 'AGENCIA' || ownerRole === 'AGENCY') ? <Building2 size={12}/> : <User size={12}/>} 
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

                     {/* 🔥 1. REFERENCIA */}
                      <div className="flex items-center gap-2 text-slate-400 mb-3 mt-1">
                          <span className="text-xs font-bold uppercase tracking-wider">
                              Ref: {selectedProp?.refCode || "Pendiente"}
                          </span>
                          <button onClick={copyRefCode} className="hover:text-blue-500 transition-colors cursor-pointer">
                              {copiedRef ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                      </div>

                      {/* 📍 2. DIRECCIÓN EXACTA (La verdad de la Base de Datos) */}
                      <div className="flex items-start gap-1.5 text-slate-500 mb-6 mt-2">
                          <MapPin size={16} className="shrink-0 text-indigo-500 mt-0.5" />
                          <span className="text-[12px] font-bold leading-relaxed uppercase tracking-wide">
                              {selectedProp?.address || "UBICACIÓN PRIVADA"}
                          </span>
                      </div>
                        
                      {/* 💰 3. PRECIO */}
                      <div className="mb-6">
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                          {String(selectedProp?.price || 0).includes('€') 
                              ? selectedProp?.price 
                              : new Intl.NumberFormat("es-ES").format(Number(String(selectedProp?.price || 0).replace(/\D/g, ''))) + " €"
                          }
                        </p>
                      </div>
                    </div> {/* <-- ESTE ES EL CIERRE DEL BLOQUE PRINCIPAL, VITAL PARA QUE NO DÉ ERROR */}
                  
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

               {/* 🔥 PANEL DE INTELIGENCIA DE MERCADO (VERSIÓN 3.0 - PREMIUM) */}
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 mt-3 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-5">
                             <Activity size={16} className="text-blue-600"/>
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Métricas & VIP Pass</h3>
                        </div>
                       
                        {/* 1. MÉTRICAS (3 Columnas Premium) */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                <Eye size={20} className="text-slate-400 mb-2"/>
                                <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.views || 0}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Visitas</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                <Camera size={20} className="text-slate-400 mb-2"/>
                                <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.photoViews || 0}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Fotos</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                                <Heart size={20} className="text-rose-400 mb-2 fill-rose-100"/>
                                <p className="text-2xl font-black text-slate-900 leading-none">{selectedProp?.favoritedCount || selectedProp?.favoritedBy?.length || 0}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Guardado</p>
                            </div>
                        </div>

                    {/* 2. ZONA VIP PASS - Limpio y Estable */}
<div className="mt-4">
    <div className="flex flex-col gap-3">
        {/* Solo mantenemos el botón de Copiar que ya te funciona */}
        <button
            type="button"
            onClick={handleCopyVipLink}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-3 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group cursor-pointer"
        >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <LinkIcon size={18} />
            </div>
            <div className="text-left flex flex-col justify-center">
                <p className="text-[11px] font-black text-white uppercase tracking-wide">
                    Copiar Invitación
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Acceso VIP Universal
                </p>
            </div>
        </button>
    </div>
</div>
                        
                        {/* 3. Indicador Total Compartidos */}
                        <div className="mt-4 flex items-center justify-between bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Share2 size={12} className="text-slate-400" />
                                Impacto del Expediente
                             </span>
                             <span className="text-sm font-black text-slate-900">{selectedProp?.shareCount || 0} <span className="text-[9px] text-slate-400 ml-1">SHARES</span></span>
                        </div>

                        <div className="mt-3 text-[9px] text-slate-400 font-medium text-center bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                            Datos en tiempo real • Stratos Intelligence™
                        </div>
                    </div>
                    {/* 🔥 FIN DEL PANEL */}

                </div> {/* 🛑 CIERRE DEL CONTENIDO SCROLLABLE */}

                {/* 3. FOOTER (BLINDADO Y SIEMPRE CLICABLE) */}
                <div className="relative shrink-0 w-full p-5 bg-white/95 backdrop-blur-2xl border-t border-slate-200 flex gap-3 z-[50000] pointer-events-auto shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                  
                  {/* Botón Contactar INTELIGENTE */}
                  <button 
                    onClick={() => setShowContactModal(true)} 
                    className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
                  >
                    <Phone size={18} /> 
                    {/* 👇 DETECTOR DE ROL AUTOMÁTICO (CORREGIDO) 👇 */}
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
                        const toUserId = String( activeOwner?.id || selectedProp?.userId || selectedProp?.ownerId || "" ); 
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

            {/* 🛡️ MODAL CONTACTO BLINDADO (SOLO FORMULARIO - SIN TELÉFONO) */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0 cursor-pointer"></div>
                        
                        {/* CONTENEDOR AJUSTABLE (Evita el monolito vacío) */}
                        <div className="relative bg-white rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-0 pb-6 ring-1 ring-white/20 w-full h-auto max-h-[90vh] flex flex-col">
                            
                            {/* CABECERA INTEGRADA (FONDO OSCURO) */}
                            <div className="relative h-32 bg-slate-900 shrink-0">
                                <div className="absolute inset-0">
                                    <img 
                                        src={img} 
                                        className="w-full h-full object-cover opacity-40 blur-sm" 
                                        alt="Background" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                                </div>
                                
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-all border border-white/10 cursor-pointer"><X size={20}/></button>

                                {/* INFO PROPIETARIO (SUPERPUESTA) */}
                                <div className="absolute -bottom-10 left-6 right-6 flex items-end gap-4 z-20">
                                    {/* Avatar superpuesto */}
                                    <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl shrink-0 border border-white/20">
                                         {ownerAvatar ? ( 
                                            <img src={ownerAvatar} className="w-full h-full rounded-xl object-cover" alt="Avatar" /> 
                                        ) : ( 
                                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"><User className="text-slate-300" size={32}/></div> 
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                            <ShieldCheck size={12} strokeWidth={3}/>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-11 flex-1 min-w-0 text-white">
                                         <h3 className="font-black text-2xl leading-none drop-shadow-md truncate mb-1">{ownerName}</h3>
                                         <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                                            <Check size={10} className="text-green-300" />
                                            <span className="text-[10px] font-bold text-green-100 uppercase tracking-wider">Particular Verificado</span>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* CUERPO DEL FORMULARIO (COMPACTO) */}
                            <div className="px-6 pt-14 pb-4 flex-1 overflow-y-auto">
                                <div className="mb-5 text-center sm:text-left">
                                    <h4 className="text-slate-900 font-black text-lg leading-tight">Contactar con el dueño</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Complete sus datos para ser atendido directamente.</p>
                                </div>
                                
                                <form onSubmit={handleSendLead} className="space-y-3">
                                    {/* Input Nombre con Icono */}
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
                                        disabled={sending}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 mt-2 cursor-pointer"
                                    >
                                        {sending ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} className="text-blue-100"/>}
                                        {sending ? "ENVIANDO..." : "ENVIAR MENSAJE AL DUEÑO"}
                                    </button>
                                </form>
                                
                                {/* PIE DE SEGURIDAD (ESTILO DE LA IMAGEN) */}
                                <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-center gap-2 text-green-700">
                                    <ShieldCheck size={14} className="fill-green-200"/>
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Protección Anti-Spam Activa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}