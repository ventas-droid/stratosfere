// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Phone, Sparkles, User, ShieldCheck, Briefcase,
    Star, Home, Maximize2, ArrowUp,
    Car, Trees, Waves, Sun, Box, Thermometer, 
    Camera, Globe, Plane, Hammer, Ruler, 
    TrendingUp, Share2, Mail, FileCheck, Activity, MessageCircle,
    Sofa, Droplets, Paintbrush, Truck, Bed, Bath, Copy, Check, Building2,
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
  agencyData: initialAgencyData 
}: any) {
    
    const [selectedProp, setSelectedProp] = useState(initialProp);
    const [showContactModal, setShowContactModal] = useState(false);
    const [copied, setCopied] = useState(false);
const [copiedRef, setCopiedRef] = useState(false);

const copyRefCode = async () => {
  const ref = String(selectedProp?.refCode || "");
  if (!ref) return;

  try {
    await navigator.clipboard.writeText(ref);
  } catch {
    // fallback (por si clipboard no está permitido)
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

    // 🔥 2. PUENTE DE SINCRONIZACIÓN (LA SOLUCIÓN)
    // Escuchamos si el usuario edita su perfil en el panel derecho
    useEffect(() => {
        const handleProfileUpdate = (e: any) => {
            const updatedProfile = e.detail;
            
            // SOLO actualizamos si la propiedad que estamos viendo es MÍA
            // (Comparamos IDs o asumimos que si estoy editando, quiero ver mis cambios)
            // Para simplificar: Si recibo update, fusiono los datos visuales
            setOwnerData((prev: any) => ({
                ...prev,
                // Sobrescribimos con lo nuevo que viene del evento
                companyName: updatedProfile.name,
                companyLogo: updatedProfile.avatar, // El evento manda 'avatar' como logo
                coverImage: updatedProfile.cover,   // El evento manda 'cover' como fondo
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

    // 3. ACTUALIZACIÓN DE PRECIOS EN VIVO (Tu código existente)
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

  // --- VARIABLES DE IDENTIDAD ---
    
    // Si venimos del evento de edición (live) o de la propiedad (db)
    const activeOwner = ownerData; 

    // Nombre:
    const name = activeOwner.companyName || activeOwner.name || "Usuario";

    // Rol y Etiqueta (LÓGICA CORREGIDA)
    let roleLabel = "AGENCIA"; // Default por seguridad
    
    if (activeOwner.role === 'PARTICULAR') {
        roleLabel = "PARTICULAR";
    } else {
        // Si es agencia, miramos su licencia
        const lic = activeOwner.licenseType;
        if (lic === 'STARTER') roleLabel = "ESSENTIAL PARTNER";
        else if (lic === 'PRO') roleLabel = "PRO PARTNER";
        else if (lic === 'CORP') roleLabel = "CORPORATE";
        else roleLabel = "AGENCIA CERTIFICADA";
    }

    // Datos visuales
    const avatar = activeOwner.companyLogo || activeOwner.avatar || null;
    const cover = activeOwner.coverImage || null;
    
    // Contacto
    const phone = activeOwner.mobile || activeOwner.phone || "";
    
    // Si no tiene email, se queda vacío.
    const email = ownerData.email || "---";
    
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
    
    let hasElevator = false;
    const isYes = (val: any) => ['si', 'sí', 'yes', 'true', '1', 'on'].includes(String(val || '').toLowerCase().trim());
    if (isYes(selectedProp?.elevator) || isYes(selectedProp?.ascensor) || allTags.has('elevator')) hasElevator = true;
    
    const img = selectedProp?.img || (selectedProp?.images && selectedProp.images[0]) || "/placeholder.jpg";
    const m2 = Number(selectedProp?.mBuilt || selectedProp?.m2 || selectedProp?.surface || 0);
    const isFavorite = favorites.some((f: any) => f.id === selectedProp?.id);
    
    const getEnergyColor = (rating: string) => {
        const map: any = { A: "bg-green-600", B: "bg-green-500", C: "bg-green-400", D: "bg-yellow-400", E: "bg-yellow-500", F: "bg-orange-500", G: "bg-red-600" };
        return map[rating] || "bg-gray-400";
    };

    const copyPhone = () => {
        navigator.clipboard.writeText(phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
  
    return (
        <div className="fixed inset-y-0 left-0 w-full md:w-[480px] z-[50000] h-[100dvh] flex flex-col pointer-events-auto animate-slide-in-left">
            {/* FONDO CRYSTAL */}
            <div className="absolute inset-0 bg-[#E5E5EA]/95 backdrop-blur-3xl shadow-2xl border-r border-white/20"></div>

            <div className="relative z-10 flex flex-col h-full text-slate-900">
                
               {/* --- 🔥 HEADER CORPORATIVO PREMIUM (CORREGIDO: SLOGAN + LICENCIA + CONTRASTE) --- */}
                <div className="relative shrink-0 z-20 h-72 overflow-hidden bg-gray-100">
                    {/* FONDO REAL (Sin velos, al 100%) */}
                    <div className="absolute inset-0">
                        {cover ? (
                            <img src={cover} className="w-full h-full object-cover" alt="Fondo Agencia" />
                        ) : (
                            <div className="w-full h-full bg-slate-200" />
                        )}
                    </div>

                    {/* CONTENIDO (Con sombra de texto para asegurar lectura) */}
                    <div className="relative z-10 px-8 pt-12 pb-8 flex flex-col justify-between h-full">
                         
                         {/* Fila Superior: Logo y Cerrar */}
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

                         {/* Fila Inferior: Datos Agencia */}
                         <div>
                            {/* NOMBRE */}
                            <h2 className="text-3xl font-black text-white leading-none mb-2 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                {name}
                            </h2>

                            {/* 🔥 NUEVO: SLOGAN (Si existe, se muestra) */}
                            {ownerData.tagline && (
                                <p className="text-white/90 text-xs font-bold italic tracking-wide mb-4 drop-shadow-md border-l-2 border-emerald-400 pl-3">
                                    "{ownerData.tagline}"
                                </p>
                            )}

                            {/* ETIQUETAS (CAJITAS CON MÁS CONTRASTE) */}
                            <div className="flex flex-wrap gap-2">
                                
                                {/* 1. LICENCIA (PACK) - Ya no pone Particular */}
                                <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                    <Briefcase size={12} className="text-emerald-400"/> 
                                    {ownerData.licenseType === 'STARTER' ? 'ESSENTIAL PARTNER' :
                                     ownerData.licenseType === 'PRO' ? 'PRO PARTNER' :
                                     ownerData.licenseType === 'CORP' ? 'CORPORATE' : 
                                     'AGENCIA CERTIFICADA'}
                                </span>

                                {/* 2. ZONA OPERATIVA */}
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

  {/* ✅ REF CODE (click para copiar) */}
{selectedProp?.refCode && (
  <div
    onClick={copyRefCode}
    className="text-[12px] text-slate-500 mb-2 flex items-center gap-2 cursor-pointer hover:text-slate-700 select-none"
    title="Copiar referencia"
  >
    <span>Ref:</span>
    <span className="font-mono text-slate-700">{selectedProp.refCode}</span>

    {/* iconito estado */}
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

                    {/* FICHA TÉCNICA Y SERVICIOS (Igual que antes) ... */}
                    {/* ... Mantengo el resto de tu código de renderizado de características igual ... */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Home size={12} className="text-blue-500"/> Ficha Técnica
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[8px] text-slate-400 font-bold uppercase block">Tipología</span>
                                <span className="font-bold text-xs text-slate-800">{selectedProp?.type || "Piso"}</span>
                            </div>
                         {/* GASTOS COMUNIDAD (Prioridad sobre Superficie repetida) */}
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
<div className="absolute bottom-0 left-0 w-full p-5 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex gap-3 z-20">
  <button
    onClick={() => setShowContactModal(true)}
    className="flex-1 h-14 bg-[#1c1c1e] text-white rounded-[20px] font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-wider text-xs"
  >
    <Phone size={18} /> Contactar Agente
  </button>

  {/* ✅ MENSAJE (CHAT) */}
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
    onClick={() => onToggleFavorite && onToggleFavorite(selectedProp)}
    className={`w-14 h-14 bg-white rounded-[20px] border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${
      isFavorite ? "text-red-500 bg-red-50 border-red-100" : "text-slate-400 hover:text-red-500"
    }`}
  >
    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
  </button>
</div>


               {/* --- 🔥 POPUP CONTACTO AGENTE (AUTOMÁTICO Y REAL) --- */}
                {showContactModal && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end animate-fade-in bg-black/60 backdrop-blur-sm">
                        {/* Al hacer click fuera, cerramos */}
                        <div onClick={() => setShowContactModal(false)} className="absolute inset-0"></div>
                        
                        <div className="relative bg-[#F5F5F7] rounded-t-[32px] overflow-hidden shadow-2xl animate-slide-up mx-2 mb-2 pb-6">
                            
                            {/* 1. HEADER DEL POPUP (LIMPIO) */}
                            <div className="relative h-36 bg-gray-100 flex items-end p-6 gap-4">
                                {/* FONDO (Cover Real) */}
                                <div className="absolute inset-0">
                                    {cover ? (
                                        // ✅ FOTO AL 100%
                                        <img src={cover} className="w-full h-full object-cover" alt="Fondo Agente" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                    {/* ❌ ELIMINADO GRADIENTE NEGRO */}
                                </div>
                                
                                {/* ... Resto del contenido (Avatar, Textos con drop-shadow) ... */}
                                
                                {/* AVATAR (Logo Real) */}
                                <div className="relative z-10 w-20 h-20 rounded-2xl bg-white p-1 shadow-xl shrink-0 border border-white/20 mb-1">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full rounded-xl object-cover" alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center">
                                            <User className="text-slate-300" size={32}/>
                                        </div>
                                    )}
                                    {/* Badge Verificado */}
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-[3px] border-black shadow-sm">
                                        <ShieldCheck size={10} strokeWidth={4} />
                                    </div>
                                </div>

                                {/* NOMBRE Y ESTADO */}
                                <div className="relative z-10 mb-2">
                                    <h3 className="text-white font-black text-2xl leading-none mb-1 drop-shadow-md">{name}</h3>
                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded-full w-fit border border-emerald-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Responderé en breve
                                    </p>
                                </div>
                                
                                {/* Botón Cerrar X */}
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-20 bg-black/20 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all">
                                    <X size={18}/>
                                </button>
                            </div>

                            {/* 2. CUERPO DEL POPUP: DATOS REALES */}
                            <div className="px-6 pt-6 space-y-4">
                                
                                {/* TELÉFONO (Con función copiar) */}
                                <div onClick={copyPhone} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center border border-[#C8E6C9] group-hover:scale-110 transition-transform">
                                        <Phone size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Teléfono / WhatsApp</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{phone}</p>
                                    </div>
                                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                        {copied ? <span className="text-[10px] font-bold text-emerald-600 uppercase">Copiado!</span> : <Copy size={20}/>}
                                    </div>
                                </div>

                                {/* EMAIL */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center border border-[#BBDEFB] group-hover:scale-110 transition-transform">
                                        <Mail size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Corporativo</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{email}</p>
                                    </div>
                                </div>

                                {/* BOTÓN CERRAR GRANDE */}
                                <button onClick={() => setShowContactModal(false)} className="w-full py-4 bg-[#1c1c1e] text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-xs mt-2 shadow-xl hover:bg-black transition-all active:scale-95">
                                    Cerrar Ficha
                                </button>
                            </div>
                        </div>
                    </div>
                )}            </div>
        </div>
    );
}

