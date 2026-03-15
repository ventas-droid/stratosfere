// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { 
  X, MapPin, ShieldCheck, Globe, Mail, Edit2, Save, Camera, 
  Zap, Award, TrendingUp, Layers, LogOut, Image as ImageIcon,
  Phone, Smartphone, User, Users, ChevronRight, Handshake, Crown // <--- AÑADIDO Handshake
} from "lucide-react";
import { getUserMeAction, updateUserAction, logoutAction } from '@/app/actions';
import { uploadToCloudinary } from '@/app/utils/upload';
import { getBillingGateAction } from "@/app/actions";

// 🔥 IMPORTANTE: GESTORES DE AGENCIA
import AgencyEventManager from "./AgencyEventManager"; 
import CollaborationManager from "./CollaborationManager"; // <--- NUEVO FICHAJE
import VanguardRequestModal from './VanguardRequestModal';
import { checkVanguardVipStatusAction } from '@/app/actions-zones';
import AgendaManager from "./AgendaManager";

// --- CONSTANTES DE LICENCIA ---
const LICENSE_LEVELS = {
  AGENCY: { name: "Agency SF PRO", credits: 50, maxCredits: 50, rank: "Agencia profesional", color: "emerald" },
  PRO:    { name: "Professional",  credits: 45, maxCredits: 100, rank: "Stratos Dominator", color: "emerald" },
  CORP:   { name: "Corporate",     credits: 200, maxCredits: 500, rank: "Market Leader", color: "purple" },
};


export default function AgencyProfilePanel({ isOpen, onClose, soundEnabled, playSynthSound }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState({ avatar: false, cover: false });
  const [userId, setUserId] = useState<string | null>(null);
const [billingInfo, setBillingInfo] = useState<any>(null);
  // 🔥 ESTADOS DE MODALES INTERNOS
  const [showEventManager, setShowEventManager] = useState(false);
  const [showCollabManager, setShowCollabManager] = useState(false); // <--- NUEVO ESTADO B2B
  const [showAgendaManager, setShowAgendaManager] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false); // 🔥 NUEVO ESTADO VANGUARD VIP
  const bust = (url: string | null | undefined) => {
   
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${Date.now()}`;
  };

  const emitAgencyProfileUpdated = (patch: any) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("agency-profile-updated", {
        detail: patch,
      })
    );
  };

 const [profile, setProfile] = useState({
      name: "",            // 🔥 Ya no pone "Nueva Agencia"
      legalName: "",            
      tagline: "",         // 🔥 Ya no pone "Slogan..."
      zone: "",            // 🔥 Ya no pone "Zona Operativa"
      address: "", 
      postalCode: "", 
      cif: "",
      web: "",
      email: "",
      phone: "",
      mobile: "",
      avatar: "",
      cover: "",
      licenseType: null,
      licenseNumber: "" 
  });

  // --- CARGA INTELIGENTE (PRIORIZA DATOS DE AGENCIA) ---
  useEffect(() => {
      if (isOpen) loadRealData();
  }, [isOpen]);

const loadRealData = async () => {
      setIsLoading(true); // 🔥 Empezamos a cargar
      try {
          // 1. Cargar Perfil de Usuario (Esto es lo principal)
          const userRes = await getUserMeAction();
          
          if (userRes.success && userRes.data) {
              const d = userRes.data;
              setUserId(d?.id ? String(d.id) : null);

              setProfile(prev => ({
                  ...prev,
                  name: d.companyName || d.name || "",
                  legalName: d.legalName || "",
                  email: d.email || "",
                  avatar: d.companyLogo || "", 
                  cover: d.coverImage || "",   
                  tagline: d.tagline || "",
                  zone: d.zone || "",
                  address: d.address || "",       
                  postalCode: d.postalCode || "", 
                  cif: d.cif || "",
                  phone: d.phone || "",      
                  mobile: d.mobile || "",    
                  web: d.website || "",
                  licenseType: d.licenseType || 'STARTER',
                  licenseNumber: d.licenseNumber || "", 
              }));

              // 🔥 2. CARGAMOS BILLING Y VIP EN PARALELO PARA IR MÁS RÁPIDO 🔥
              try {
                  const [billingRes, vipRes] = await Promise.all([
                      getBillingGateAction(),
                      checkVanguardVipStatusAction(String(d.id))
                  ]);

                  if (billingRes?.success && billingRes?.data) {
                      setBillingInfo(billingRes.data);
                  }
                  
                  if (vipRes?.success) {
                      setProfile(prev => ({ ...prev, isVanguardVip: vipRes.isVip }));
                  }
              } catch(e) {
                  console.error("Error en las cargas secundarias:", e);
              }
          }
      } catch (e) { 
          console.error("Error cargando perfil agencia:", e); 
      } finally {
          setIsLoading(false); // 🔥 Terminamos de cargar, pase lo que pase
      }
  };

// 📡 RADAR VIP: Escucha si alguien pide una zona desde el Diamante del Mapa (MarketPanel)
  useEffect(() => {
      const handleVipRequest = (e: any) => {
          // El mapa nos manda el código postal en e.detail.zip (por si quiere usarlo en el futuro)
          const zipCode = e.detail?.zip;
          
          // ABRIMOS EL MODAL OSCURO DE VANGUARD VIP
          setShowVipModal(true); 
      };

      if (typeof window !== 'undefined') {
          window.addEventListener('open-vip-request', handleVipRequest);
      }
      return () => {
          if (typeof window !== 'undefined') {
              window.removeEventListener('open-vip-request', handleVipRequest);
          }
      };
  }, []);


const handleSave = async () => {
  setIsSaving(true);
  if (soundEnabled) playSynthSound('click');
  try {
     const result = await updateUserAction({
          companyName: profile.name,     
        legalName: profile.legalName,
          companyLogo: profile.avatar,   
          coverImage: profile.cover,     
          tagline: profile.tagline,      
          zone: profile.zone, 
          address: profile.address,       // <-- NUEVO
          postalCode: profile.postalCode, // <-- NUEVO
          cif: profile.cif,
          licenseNumber: profile.licenseNumber, // <-- NUEVO
          phone: profile.phone,          
          mobile: profile.mobile,        
          website: profile.web,
      });

      if (result.success) {
          setIsEditing(false);
          
          if (typeof window !== 'undefined') {
              localStorage.removeItem("agency_profile_extras"); 
              window.dispatchEvent(new CustomEvent('agency-profile-updated', { 
                  detail: { 
                      ...profile,
                      companyName: profile.name,
                      companyLogo: profile.avatar 
                  } 
              }));
          }
      } else {
          alert("Error al guardar en la nube: " + result.error);
      }
  } catch (error) {
      console.error("Error crítico al guardar:", error);
  } finally {
      setIsSaving(false);
  }
};

const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    // 1. Mostrar Previsualización
    setProfile((prev) => ({
      ...prev,
      [type]: preview,
      ...(type === "avatar" ? { avatar: preview } : {}),
      ...(type === "cover" ? { cover: preview } : {}),
    }));

    setIsUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const url = await uploadToCloudinary(file);

      if (url) {
        const bustedUrl = bust(url);

        // 2. Guardar URL real en el estado (SIN emitir evento dentro)
        setProfile((prev) => {
          const next = {
            ...prev,
            [type]: bustedUrl,
            ...(type === "avatar" ? { avatar: bustedUrl } : {}),
            ...(type === "cover" ? { cover: bustedUrl } : {}),
          };
          return next;
        });

        // 3. Emitir evento AQUÍ (Fuera del setProfile, seguro)
        emitAgencyProfileUpdated({
          id: userId,
          companyName: profile.name,
          role: "AGENCIA",
          // Usamos la nueva URL si es la que acabamos de subir, o la vieja si no
          avatar: type === "avatar" ? bustedUrl : profile.avatar,
          cover: type === "cover" ? bustedUrl : profile.cover,
          companyLogo: type === "avatar" ? bustedUrl : profile.avatar,
          coverImage: type === "cover" ? bustedUrl : profile.cover,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading((prev) => ({ ...prev, [type]: false }));
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }
  };

const handleLogout = async () => {
  if (confirm("¿Cerrar sesión de agencia?")) {
    if (soundEnabled) playSynthSound("error");
    await logoutAction();
    window.location.href = "/";
  }
};

if (!isOpen) return null;

// 🔥 MODAL INTERNO 1: GESTOR DE EVENTOS
if (showEventManager) {
    return (
        <div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[60000] bg-[#F5F5F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
            <AgencyEventManager onClose={() => setShowEventManager(false)} />
        </div>
    );
}

// 🔥 MODAL INTERNO 2: GESTOR DE COLABORACIONES (B2B)
if (showCollabManager) {
    return (
        <div className="absolute inset-y-0 right-0 w-[500px] max-w-full z-[60000] bg-[#F5F5F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
            <CollaborationManager 
                // 1. Nueva función: Volver atrás (al perfil)
                onBack={() => setShowCollabManager(false)}
                
                // 2. Función Cerrar Total (X)
                onClose={() => {
                    setShowCollabManager(false);
                    onClose();
                }}

                // 3. Abrir Chat (Sin cerrar el panel bruscamente)
                onOpenChat={(detail: any) => {
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-chat-signal', { detail }));
                    }
                    // NOTA: Si quiere que el panel se cierre al abrir chat, descomente la siguiente línea:
                    // setShowCollabManager(false); onClose();
                }}
            />
        </div>
    );
}

// 🔥 MODAL INTERNO 3: GESTOR DE AGENDA Y LEADS
if (showAgendaManager) {
    return (
        <div className="absolute inset-y-0 right-0 w-[500px] max-w-full z-[60000] bg-[#F5F5F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
            <AgendaManager 
                onBack={() => setShowAgendaManager(false)}
                onClose={() => {
                    setShowAgendaManager(false);
                    onClose();
                }}
                onOpenChat={(detail: any) => {
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-chat-signal', { detail }));
                    }
                }}
            />
        </div>
    );
}

const license = {
  name: "Agency SF PRO",
  credits: 50,
  maxCredits: 50,
  rank: "Agencia Profesional",
  color: "emerald",
};

const creditPercentage = Math.min(
  (license.credits / license.maxCredits) * 100,
  100
);


 // 🍏 MODO DE CARGA: ESTILO CUPERTINO (APPLE)
  if (isLoading) {
      return (
          <div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[60000] bg-[#F5F5F7] flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto overflow-hidden">
              {/* Estilos inyectados para la animación de la barra sin tocar el CSS global */}
              <style>{`
                @keyframes cupertino-load {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(250%); }
                }
                .animate-cupertino {
                  animation: cupertino-load 1.5s infinite cubic-bezier(0.65, 0, 0.35, 1);
                }
              `}</style>

              {/* Fondo sutil */}
              <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F5F5F7] to-[#E5E5EA] z-0 opacity-80" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 animate-fade-in">
                  
                  {/* Icono central minimalista */}
                  <div className="w-20 h-20 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 bg-black/5 rounded-[24px] animate-pulse"></div>
                      <ShieldCheck size={32} className="text-slate-800 relative z-10" strokeWidth={1.5} />
                  </div>
                  
                  {/* Textos elegantes y espaciados */}
                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-2 text-center">
                      Preparando entorno
                  </h3>
                  <p className="text-sm text-slate-500 font-medium text-center mb-10 max-w-[260px] leading-relaxed">
                      Sincronizando credenciales, estado VIP y herramientas de gestión...
                  </p>
                  
                  {/* Barra de progreso infinita estilo MacOS */}
                  <div className="w-full max-w-[200px] h-[3px] bg-black/5 rounded-full overflow-hidden relative shadow-inner">
                      <div className="absolute top-0 left-0 h-full w-[40%] bg-slate-800 rounded-full animate-cupertino" />
                  </div>
                  
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6 animate-pulse">
                      Stratosfere Pro
                  </p>
              </div>
          </div>
      );
  }

  return (
<div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[60000] bg-[#F2F2F7] flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">      
     {/* CABECERA (COVER + LOGO AGENCIA SIMÉTRICA) */}
      <div className="relative h-[340px] shrink-0 group bg-black">
         <div className="absolute inset-0 overflow-hidden">
             {profile.cover ? (
                 <img src={profile.cover} className="w-full h-full object-cover opacity-70 transition-opacity group-hover:opacity-50" alt="Cover" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-emerald-950 opacity-80" />
             )}
             
             {/* 🔥 Degradado de seguridad para que los textos siempre respiren y se lean perfectos */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

             {isEditing && (
                 <label className="absolute top-12 left-8 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-black/80 transition-colors border border-white/20 z-50 shadow-xl backdrop-blur-md">
                     {isUploading.cover ? <span className="animate-spin">⏳</span> : <ImageIcon size={14}/>}
                     <span>{isUploading.cover ? "Subiendo..." : profile.cover ? "Cambiar Fondo" : "Subir Fondo"}</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading.cover}/>
                 </label>
             )}
         </div>
         
       {/* 🔥 BOTÓN X (Idéntico a DetailsPanel + Efecto Giro) 🔥 */}
         <button onClick={onClose} className="absolute top-12 right-8 w-10 h-10 bg-black/40 hover:bg-black/60 hover:rotate-90 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border border-white/20 text-white shadow-xl z-50">
             <X size={20}/>
         </button>
         
         <div className="absolute inset-0 flex flex-col items-center justify-end z-10 px-8 pb-8 pt-12">
             {/* LOGO DE AGENCIA */}
             <div className="w-24 h-24 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl shadow-black/40 relative group/avatar cursor-pointer mb-5 transition-transform duration-500 hover:scale-105">
                 <div className="w-full h-full rounded-full overflow-hidden relative border border-white/20 bg-black/40 flex items-center justify-center">
                    {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" alt="Logo Agencia" />
                    ) : (
                        <User size={40} className="text-white/50" />
                    )}
                    
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 transition-opacity backdrop-blur-[2px] cursor-pointer">
                           {isUploading.avatar ? <span className="animate-spin text-white">⏳</span> : <Camera className="text-white drop-shadow-lg" size={24}/>}
                           <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading.avatar}/>
                        </label>
                    )}
                 </div>
                 {/* Escudo centrado en la parte inferior */}
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white p-1.5 rounded-full border-[3px] border-[#1c1c1e] shadow-lg flex items-center justify-center" title="Verificado">
                     <ShieldCheck size={14} strokeWidth={3} />
                 </div>
             </div>

             <div className="text-center w-full space-y-3 mt-2">
                 {isEditing ? (
                     <>
                        <div className="relative max-w-md mx-auto">
                            <input 
                                value={profile.name} 
                                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                                className="w-full text-center bg-black/40 backdrop-blur-md text-white font-black text-3xl tracking-tight border border-white/20 rounded-xl py-2 px-4 outline-none focus:bg-black/60 transition-colors placeholder-white/30 shadow-lg" 
                                placeholder="Nombre Agencia" 
                            />
                            <Edit2 size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
                        </div>
                        <div className="relative max-w-xs mx-auto mt-2">
                            <input 
                                value={profile.tagline} 
                                onChange={(e) => setProfile({...profile, tagline: e.target.value})} 
                                className="w-full text-center bg-black/40 backdrop-blur-md text-emerald-400 text-[10px] font-black tracking-widest uppercase border border-emerald-500/30 rounded-lg py-1.5 px-3 outline-none focus:bg-black/60 transition-colors placeholder-emerald-600/50 shadow-lg" 
                                placeholder="Tu Slogan Aquí" 
                            />
                        </div>
                     </>
                 ) : (
                     <>
                        <h2 className="text-white font-black text-4xl leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {profile.name}
                        </h2>
                        <div className="text-emerald-300 text-[10px] font-black tracking-widest uppercase drop-shadow-md flex items-center justify-center gap-1.5 bg-emerald-500/10 backdrop-blur-md py-1.5 px-3 rounded-lg mx-auto w-fit border border-emerald-500/30 shadow-lg">
                            <Zap size={12} className="text-emerald-400"/> {profile.tagline}
                        </div>
                     </>
                 )}
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F2F2F7]">
          
          {/* LICENCIA OPERATIVA */}
          <section className="relative group rounded-[28px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border border-white/50" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-60" />

              <div className="relative z-10 px-6 py-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Licencia Operativa</span>
                    </div>
                    <div className="mt-1.5">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">{license?.name?.toUpperCase() || "AGENCY SF PRO"}</h3>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mt-1">{license?.rank || "Agencia Profesional"}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-black text-white flex items-center justify-center shadow-lg shadow-slate-900/10 border border-white/10 shrink-0">
                    <Award size={18} className="text-white drop-shadow-md" />
                  </div>
                </div>

          {/* 🎯 TRAMPA PSICOLÓGICA REDISEÑADA (ESQUEMA EXACTO DEL GENERAL) 🎯 */}
                <div className="w-full pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Créditos Disponibles
                  </span>
                  
                  <div className="flex items-center gap-3 w-full">
                      
                      {/* TRAMO 1: Barra de Créditos acortada + Texto 50/50 pegado a ella */}
                      <div className="flex items-center gap-2 flex-1">
                          <div className="h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div 
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-700 ease-out" 
                                style={{ width: `${creditPercentage || 0}%` }} 
                            />
                          </div>
                          {/* 🔥 Aquí el 50/50 ha retrocedido y se pega a la barra 🔥 */}
                          <div className="flex items-baseline gap-0.5 tabular-nums shrink-0">
                            <span className="text-sm font-black text-slate-900 leading-none">{license?.credits ?? 0}</span>
                            <span className="text-[10px] font-semibold text-slate-400 leading-none">/{license?.maxCredits ?? 0}</span>
                          </div>
                      </div>

                      {/* DIVISOR VISUAL */}
                      <div className="w-px h-5 bg-slate-200 shrink-0"></div>

              {/* TRAMO 2: Pegatina Agency Vanguard VIP (Estilo Deep Navy & Oro Exacto) */}
                      <div 
                          className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-700 relative overflow-hidden ${
                              profile.isVanguardVip 
                              ? 'bg-[#1B2234] border-[#262F44] shadow-md scale-[1.02]' 
                              : 'bg-slate-50 border-slate-200/80 grayscale opacity-80'
                          }`}
                      >
                          {/* 🔥 Hilo de cristal superior (Efecto relieve premium oscuro) 🔥 */}
                          {profile.isVanguardVip && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E0B253]/30 to-transparent"></div>}
                          
                          <Crown size={12} className={profile.isVanguardVip ? 'text-[#E0B253] drop-shadow-sm z-10' : 'text-slate-400'} strokeWidth={2.5}/>
                          
                          <span className={`z-10 text-[9px] font-black uppercase tracking-widest pt-[1px] ${
                              profile.isVanguardVip ? 'text-[#E0B253]' : 'text-slate-400'
                          }`}>
                              VANGUARD VIP
                          </span>
                      </div>

                  </div>
                </div>

              {/* 🔥 ESTADO REAL DE LA LICENCIA CONECTADO AL SERVIDOR 🔥 */}
                {(() => {
                    const status = billingInfo?.status || "CARGANDO...";
                    
                    // Configuración visual según el estado del servidor
                    let badgeText = "FREE TRIAL";
                    let badgeBg = "bg-slate-100 border-slate-200/60 text-slate-600";
                    let dotColor = "bg-slate-400";
                    let dotPing = false;
                    let rightText = "ACTIVA";

                    if (status === "ACTIVE") {
                        badgeText = "AGENCY PRO";
                        badgeBg = "bg-indigo-50 border-indigo-200 text-indigo-700";
                        dotColor = "bg-emerald-500";
                        dotPing = true;
                    } else if (status === "TRIAL") {
                        badgeText = "FREE TRIAL";
                        badgeBg = "bg-slate-100 border-slate-200/60 text-slate-600";
                        dotColor = "bg-emerald-500";
                        dotPing = true;
                    } else if (status === "EXPIRED" || status === "BLOCKED") {
                        badgeText = "PAGO PENDIENTE";
                        badgeBg = "bg-red-50 border-red-200 text-red-700";
                        dotColor = "bg-red-500";
                        dotPing = false;
                        rightText = "DESACTIVADA";
                    }

                return (
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/40">
                            
                            {/* FILA SUPERIOR: ETIQUETA AZUL Y PUNTO VERDE */}
                            <div className="flex items-center justify-between">
                              <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm w-fit ${badgeBg}`}>
                                <span className="text-[9px] font-black uppercase tracking-widest">{badgeText}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="relative flex h-2 w-2">
                                  {dotPing && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>}
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{rightText}</span>
                              </div>
                            </div>
                  {/* 🔥 FILA INFERIOR: ETIQUETA VIP (Clon exacto de la Ficha Pública) 🔥 */}
                            {profile.isVanguardVip && (
                                <div className="px-3 py-1.5 rounded-lg border border-[#262F44] bg-[#1B2234] text-[#E0B253] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg w-fit animate-fade-in-up relative overflow-hidden group">
                                    {/* Hilo de cristal superior */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E0B253]/30 to-transparent"></div>
                                    
                                    <Crown size={12} strokeWidth={2.5} className="drop-shadow-md z-10" />
                                    <span className="z-10 pt-[1px]">
                                        AVV
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })()}
              </div>
          </section>

       {/* 🔥 BOTONERA DE GESTIÓN (Eventos + B2B + Embajadores + VIP) */}
          <div className="space-y-3">
              
              {/* 1. GESTOR DE EVENTOS */}
              <button 
                  onClick={() => { if(soundEnabled) playSynthSound('click'); setShowEventManager(true); }}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 border border-indigo-100/50 shrink-0">
                          <Users size={20} strokeWidth={2.5} />
                      </div>
                      <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">Gestor de Eventos</h3>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Control de Aforo & Leads</p>
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all shrink-0">
                     <ChevronRight size={16} strokeWidth={3} />
                  </div>
              </button>

           {/* 1.5. GESTOR DE AGENDA Y ASESORAMIENTO */}
              <button 
                  onClick={() => { 
                      if(soundEnabled) playSynthSound('click'); 
                      setShowAgendaManager(true); // 🔥 AQUÍ ESTÁ LA MAGIA: Esto abre el panel real
                  }}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-rose-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-all duration-300 border border-rose-100/50 shrink-0 relative">
                          <Phone size={20} strokeWidth={2.5} />
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                      </div>
                      <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors">Citas & Asesoramiento</h3>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Gestión de Leads</p>
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all shrink-0">
                     <ChevronRight size={16} strokeWidth={3} />
                  </div>
              </button>
             
              {/* 2. GESTOR DE COLABORACIONES (B2B) */}
              <button 
                  onClick={() => { if(soundEnabled) playSynthSound('click'); setShowCollabManager(true); }}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300 border border-amber-100/50 shrink-0">
                          <Handshake size={20} strokeWidth={2.5}/>
                      </div>
                      <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">Colaboraciones B2B</h3>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Gestión de Alianzas</p>
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all shrink-0">
                     <ChevronRight size={16} strokeWidth={3} />
                  </div>
              </button>

              {/* 3. RED DE EMBAJADORES */}
              <button 
                  onClick={() => { 
                      if(onClose) onClose();
                      if(typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-ambassadors-signal'));
                  }}
                  className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 border border-blue-100/50 shrink-0">
                          <ShieldCheck size={20} strokeWidth={2.5}/>
                      </div>
                      <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">Red de Embajadores</h3>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Gestión de Embajadores</p>
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all shrink-0">
                     <ChevronRight size={16} strokeWidth={3} />
                  </div>
              </button>

              {/* 4. VANGUARD VIP MARKET (Premium Look) */}
              <button 
                  onClick={() => setShowVipModal(true)}
                  className="w-full bg-gradient-to-br from-slate-900 to-black p-[1px] rounded-2xl shadow-md flex items-center justify-between group hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden relative"
              >
                  {/* Brillo dinámico de fondo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

                  <div className="w-full bg-[#0a0a0a] p-4 rounded-[15px] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-600/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300 shrink-0">
                              <Crown size={20} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">VANGUARD VIP MARKET</h3>
                              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mt-0.5">Liderazgo de Zona B2B</p>
                          </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all shrink-0 border border-white/5">
                         <span className="font-bold text-lg leading-none">+</span>
                      </div>
                  </div>
              </button>

              {/* El Modal Oculto (Se renderiza por encima de todo cuando showVipModal es true) */}
              <VanguardRequestModal 
                  isOpen={showVipModal} 
                  onClose={() => setShowVipModal(false)} 
                  agencyData={{ ...profile, id: userId }} 
              />
          </div>

     {/* DATOS FISCALES, LEGALES Y CONTACTO */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 space-y-5">
              
              {/* 1. LICENCIA DE SOFTWARE STRATOSFERE (Autogenerada y Solo Lectura) */}
              <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><ShieldCheck size={20}/></div>
                  <div className="flex-1 pt-1">
                      <div className="text-[10px] font-bold text-black/40 uppercase mb-1">Licencia Software Stratosfere</div>
                      <div className="text-sm font-black text-indigo-900 leading-tight tracking-widest">
                          {userId ? `SF-PRO-${userId.slice(-6).toUpperCase()}` : 'PROCESANDO...'}
                      </div>
                  </div>
              </div>

              <div className="h-px bg-black/5"></div>

              {/* 2. DATOS FISCALES (Razón Social y CIF) */}
              <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors"><Award size={20}/></div>
                  <div className="flex-1 pt-1 space-y-3">
                      <div>
                          <div className="text-[10px] font-bold text-black/40 uppercase mb-1">Razón Social / Empresa</div>
                          {isEditing ? (
                              <input 
                                  value={profile.legalName} // 🔥 AHORA USA LEGALNAME
                                  onChange={(e)=>setProfile({...profile, legalName: e.target.value})} // 🔥 AHORA USA LEGALNAME
                                  className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-amber-500" 
                                  placeholder="Ej: Bernabeu Realty S.L." 
                              /> 
                          ) : (
                              <div className="text-sm font-bold text-black leading-tight">
                                  {profile.legalName || 'No definida'} {/* 🔥 AHORA USA LEGALNAME */}
                              </div>
                          )}
                      </div>
                      
                      {isEditing ? (
                          <div className="mt-2">
                              <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">CIF / NIF / DNI</div>
                              <input value={profile.cif} onChange={(e)=>setProfile({...profile, cif: e.target.value})} className="w-full text-xs font-semibold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-amber-500" placeholder="B12345678" />
                          </div>
                      ) : (
                          profile.cif && (
                              <div className="mt-2">
                                  <div className="text-[10px] font-bold text-black/40 uppercase mb-1">CIF / NIF</div>
                                  <div className="text-sm font-bold text-slate-700 leading-tight">{profile.cif}</div>
                              </div>
                          )
                      )}
                  </div>
              </div>

              <div className="h-px bg-black/5"></div>

              {/* 3. SEDE CENTRAL: ZONA + DIRECCIÓN FÍSICA Y CP */}
              <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><MapPin size={20}/></div>
                  <div className="flex-1 pt-1 space-y-3">
                      
                      {/* ZONA OPERATIVA */}
                      <div>
                          <div className="text-[10px] font-bold text-black/40 uppercase mb-1">Zona Operativa</div>
                          {isEditing ? (
                              <input value={profile.zone} onChange={(e)=>setProfile({...profile, zone: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-emerald-500" placeholder="Ej: Madrid Centro" /> 
                          ) : (
                              <div className="text-sm font-bold text-black leading-tight">{profile.zone || 'No definida'}</div>
                          )}
                      </div>

                      {/* DIRECCIÓN Y CP (Aparecen al editar o si ya hay datos) */}
                      {isEditing ? (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 mt-2">
                              <div className="col-span-2">
                                  <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">Dirección Oficina</div>
                                  <input value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})} className="w-full text-xs font-semibold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-emerald-500" placeholder="Calle, Número..." />
                              </div>
                              <div className="col-span-1">
                                  <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">C. Postal</div>
                                  <input value={profile.postalCode} onChange={(e)=>setProfile({...profile, postalCode: e.target.value})} className="w-full text-xs font-semibold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-emerald-500" placeholder="CP" />
                              </div>
                          </div>
                      ) : (
                          (profile.address || profile.postalCode) && (
                              <div className="pt-2 border-t border-black/5 mt-2">
                                  <div className="text-[10px] font-bold text-black/40 uppercase mb-1">Oficina Central</div>
                                  <div className="text-sm font-bold text-slate-700 leading-tight">
                                      {profile.address} {profile.address && profile.postalCode ? '-' : ''} {profile.postalCode}
                                  </div>
                              </div>
                          )
                      )}
                  </div>
              </div>
              
              <div className="h-px bg-black/5"></div>
              
              {/* 4. WEB, EMAIL Y TELÉFONOS */}
              <div className="grid grid-cols-1 gap-4">
                 <div className="flex items-start gap-3 group">
                     <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors"><Globe size={16}/></div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">Website</div>
                        {isEditing ? <input value={profile.web} onChange={e=>setProfile({...profile, web: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-blue-500" /> : <div className="text-sm font-bold text-black truncate">{profile.web || '---'}</div>}
                     </div>
                 </div>
                 <div className="flex items-start gap-3 group">
                     <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors"><Mail size={16}/></div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">Email</div>
                        {isEditing ? <input value={profile.email} onChange={e=>setProfile({...profile, email: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-blue-500" /> : <div className="text-sm font-bold text-black truncate">{profile.email}</div>}
                     </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 mt-2">
                 <div className="flex items-start gap-3 group">
                     <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors"><Phone size={16}/></div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">Fijo</div>
                        {isEditing ? <input value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-blue-500" placeholder="+34..." /> : <div className="text-sm font-bold text-black truncate">{profile.phone || '---'}</div>}
                     </div>
                 </div>
                 <div className="flex items-start gap-3 group">
                     <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors"><Smartphone size={16}/></div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold text-black/40 uppercase mb-0.5">Móvil</div>
                        {isEditing ? <input value={profile.mobile} onChange={e=>setProfile({...profile, mobile: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-blue-500" placeholder="+34..." /> : <div className="text-sm font-bold text-black truncate">{profile.mobile || '---'}</div>}
                     </div>
                 </div>
              </div>
          </section>
          
          <div className="h-10"></div>
      </div>

      {/* FOOTER: BOTONES DE GUARDAR Y SALIR */}
      <div className="p-6 bg-white border-t border-black/5 shrink-0 flex flex-col gap-3">
          {isEditing ? (
               <button onClick={handleSave} disabled={isSaving} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs tracking-[0.2em] shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? "GUARDANDO..." : <><Save size={16} /> GUARDAR CAMBIOS</>}
               </button>
          ) : (
               <button onClick={() => { if(soundEnabled) playSynthSound('click'); setIsEditing(true); }} className="w-full py-4 rounded-2xl bg-[#1c1c1e] text-white font-bold text-xs tracking-[0.2em] hover:bg-black hover:scale-[1.02] active:scale-95 transition-all uppercase flex items-center justify-center gap-2 shadow-md">
                  <Edit2 size={16} /> EDITAR PERFIL
               </button>
          )}
          <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-xs tracking-[0.2em] hover:bg-red-100 hover:text-red-600 transition-all uppercase flex items-center justify-center gap-2 border border-red-100">
              <LogOut size={16} /> CERRAR SESIÓN
          </button>
      </div>
    </div>
  );
}