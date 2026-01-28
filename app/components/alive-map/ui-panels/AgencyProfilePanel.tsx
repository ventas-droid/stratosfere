// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { 
  X, MapPin, ShieldCheck, Globe, Mail, Edit2, Save, Camera, 
  Zap, Award, TrendingUp, Layers, LogOut, Image as ImageIcon,
  Phone, Smartphone, User 
} from "lucide-react";
import { getUserMeAction, updateUserAction, logoutAction } from '@/app/actions';
import { uploadToCloudinary } from '@/app/utils/upload';
import { getBillingGateAction } from "@/app/actions";

// --- CONSTANTES DE LICENCIA ---
const LICENSE_LEVELS = {
  AGENCY: { name: "Agency SF PRO", credits: 50, maxCredits: 50, rank: "Agencia profesional", color: "emerald" },
  PRO:    { name: "Professional",  credits: 45, maxCredits: 100, rank: "Stratos Dominator", color: "emerald" },
  CORP:   { name: "Corporate",     credits: 200, maxCredits: 500, rank: "Market Leader", color: "purple" },
};


export default function AgencyProfilePanel({ isOpen, onClose, soundEnabled, playSynthSound }: any) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState({ avatar: false, cover: false });
  
  const [userId, setUserId] = useState<string | null>(null);

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
      name: "Nueva Agencia",
      tagline: "Slogan de Agencia",
      zone: "Zona Operativa",
      web: "",
      email: "",
      phone: "",
      mobile: "",
      avatar: "", // Esto será el LOGO de la empresa
      cover: "",
      licenseType: null 
  });

  // --- CARGA INTELIGENTE (PRIORIZA DATOS DE AGENCIA) ---
  useEffect(() => {
      if (isOpen) loadRealData();
  }, [isOpen]);

  // BUSQUE "const loadRealData" Y REEMPLÁCELA POR ESTA:

const loadRealData = async () => {
  try {
      // 📡 CONEXIÓN DIRECTA A BASE DE DATOS (Sin intermediarios locales)
      const userRes = await getUserMeAction();
      
      if (userRes.success && userRes.data) {
          const d = userRes.data;
         setUserId(d?.id ? String(d.id) : null);

           setProfile(prev => ({
              ...prev,
              // Prioridad: Datos corporativos de la DB
              name: d.companyName || d.name || "Nueva Agencia",
              email: d.email || "",
              
              // 🎨 BRANDING (Mapeo crítico)
              // La UI usa 'avatar', pero en DB leemos 'companyLogo'
              avatar: d.companyLogo || "", 
              cover: d.coverImage || "",   
              
              // 🏢 DATOS DE NEGOCIO
              tagline: d.tagline || "",
              zone: d.zone || "",
              
              // 📞 CONTACTO
              phone: d.phone || "",      // Fijo
              mobile: d.mobile || "",    // Móvil
              web: d.website || "",
              
              licenseType: d.licenseType || 'STARTER',
          }));
      }
  } catch (e) { console.error("Error cargando perfil agencia:", e); }
};

  // BUSQUE "const handleSave" Y REEMPLÁCELA POR ESTA:

const handleSave = async () => {
  setIsSaving(true);
  if (soundEnabled) playSynthSound('click');
  try {
      // 💾 GUARDADO EN LA NUBE (PostgreSQL)
      // Mapeamos el estado visual a las columnas de la Base de Datos
      const result = await updateUserAction({
          companyName: profile.name,     // Nombre Agencia
          companyLogo: profile.avatar,   // Logo Agencia (viene del estado 'avatar')
          coverImage: profile.cover,     // Fondo Perfil
          tagline: profile.tagline,      // Slogan
          zone: profile.zone,            // Zona Operativa
          phone: profile.phone,          // Teléfono Fijo
          mobile: profile.mobile,        // Móvil
          website: profile.web,
          // Nota: No enviamos 'avatar' ni 'name' personales aquí para no mezclarlos
      });

      if (result.success) {
          setIsEditing(false);
          
          // ⚡ Señal Táctica: Actualizar la UI inmediatamente sin recargar
          if (typeof window !== 'undefined') {
              // Limpiamos rastros antiguos si existieran
              localStorage.removeItem("agency_profile_extras"); 
              
              window.dispatchEvent(new CustomEvent('agency-profile-updated', { 
                  detail: { 
                      ...profile,
                      // Aseguramos que quien escuche sepa que esto es info corporativa
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

// ✅ Upload + preview inmediato + anti-cache + refresh global
const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  type: "avatar" | "cover"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1) Preview inmediato (sin esperar upload)
  const preview = URL.createObjectURL(file);

  // Guardamos preview en el campo visual correspondiente
  setProfile((prev) => ({
    ...prev,
    [type]: preview,
    ...(type === "avatar" ? { avatar: preview } : {}),
    ...(type === "cover" ? { cover: preview } : {}),
  }));

  // 2) Subiendo...
  setIsUploading((prev) => ({ ...prev, [type]: true }));

  try {
    const url = await uploadToCloudinary(file);

    if (url) {
      // 3) Anti-cache (Cloudinary a veces tarda en servir la nueva imagen)
      const bustedUrl = bust(url);

      // 4) Guardar en estado (y mantener compatibilidad DB/UI)
      setProfile((prev) => {
        const next = {
          ...prev,
          [type]: bustedUrl,
          ...(type === "avatar" ? { avatar: bustedUrl } : {}),
          ...(type === "cover" ? { cover: bustedUrl } : {}),
        };

        // 5) 🔥 Evento inmediato: refresca Profile + Details + UI sin recargar
        emitAgencyProfileUpdated({
          id: userId,
          companyName: next.name,
          role: "AGENCIA",

          // compatibilidad: algunos usan avatar/cover y otros companyLogo/coverImage
          avatar: type === "avatar" ? bustedUrl : next.avatar,
          cover: type === "cover" ? bustedUrl : next.cover,
          companyLogo: type === "avatar" ? bustedUrl : next.avatar,
          coverImage: type === "cover" ? bustedUrl : next.cover,
        });

        return next;
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

// 🔥 Fuente REAL de licencia (no perfil)
const license = {
  name: "Agency SF PRO",
  credits: 50,
  maxCredits: 50,
  rank: "Agencia Profesional",
  color: "emerald",
};

// % de uso (por ahora fijo, luego vendrá de usage real)
const creditPercentage = Math.min(
  (license.credits / license.maxCredits) * 100,
  100
);


  return (
    <div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[60000] bg-[#F2F2F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
      {/* CABECERA (COVER + LOGO AGENCIA) */}
      <div className="relative h-72 shrink-0 group bg-black">
         <div className="absolute inset-0 overflow-hidden">
             {profile.cover ? (
                 <img src={profile.cover} className="w-full h-full object-cover opacity-70 transition-opacity group-hover:opacity-50" alt="Cover" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-emerald-950 opacity-80" />
             )}
             {isEditing && (
                 <label className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-black/80 transition-colors border border-white/20 z-30 shadow-lg">
                     {isUploading.cover ? <span className="animate-spin">⏳</span> : <ImageIcon size={14}/>}
                     <span>{isUploading.cover ? "Subiendo..." : profile.cover ? "Cambiar Fondo" : "Subir Fondo"}</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading.cover}/>
                 </label>
             )}
         </div>
         
         <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-white/20 transition-all z-30 backdrop-blur-md border border-white/10"><X size={18}/></button>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 pt-4">
             {/* LOGO DE AGENCIA (NO FOTO DE USUARIO) */}
             <div className="w-28 h-28 rounded-full p-1.5 bg-white/10 backdrop-blur-md shadow-2xl relative group/avatar cursor-pointer">
                 <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-white/20 bg-black/40 flex items-center justify-center">
                    {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" alt="Logo Agencia" />
                    ) : (
                        <User size={40} className="text-white/50" />
                    )}
                    
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 transition-opacity backdrop-blur-[2px]">
                           {isUploading.avatar ? <span className="animate-spin text-white">⏳</span> : <Camera className="text-white drop-shadow-lg" size={24}/>}
                           <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading.avatar}/>
                        </label>
                    )}
                 </div>
                 <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-[3px] border-[#1c1c1e] shadow-lg" title="Verificado"><ShieldCheck size={14} strokeWidth={3} /></div>
             </div>

             <div className="mt-5 text-center w-full space-y-3">
                 {isEditing ? (
                     <>
                        <div className="relative">
                            <input 
                                value={profile.name} 
                                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                                className="w-full text-center bg-black/40 backdrop-blur-md text-white font-black text-2xl border border-white/20 rounded-xl py-2 px-4 outline-none focus:bg-black/60 transition-colors placeholder-white/30" 
                                placeholder="Nombre Agencia" 
                            />
                            <Edit2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
                        </div>
                        <div className="relative w-3/4 mx-auto">
                            <input 
                                value={profile.tagline} 
                                onChange={(e) => setProfile({...profile, tagline: e.target.value})} 
                                className="w-full text-center bg-black/40 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-widest uppercase border border-emerald-500/30 rounded-lg py-1.5 px-3 outline-none focus:bg-black/60 transition-colors placeholder-emerald-600" 
                                placeholder="Tu Slogan Aquí" 
                            />
                        </div>
                     </>
                 ) : (
                     <>
                        <h2 className="text-white font-black text-3xl tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{profile.name}</h2>
                        <div className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase drop-shadow-md flex items-center justify-center gap-2 bg-black/30 py-1 px-3 rounded-full mx-auto w-fit border border-emerald-500/20">
                            <Zap size={12} className="fill-emerald-400"/> {profile.tagline}
                        </div>
                     </>
                 )}
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F2F2F7]">
          
      {/* LICENCIA OPERATIVA — Cupertino High Tech (Rediseño Premium) */}
<section className="relative group rounded-[28px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
  
  {/* 1. CAPAS DE FONDO (Glassmorphism Real) */}
  <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border border-white/50" />
  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-60" />

  {/* 2. CONTENIDO (Z-Index alto para flotar sobre el cristal) */}
  <div className="relative z-10 px-6 py-5 space-y-5">

    {/* HEADER: Título y Badge */}
    <div className="flex items-start justify-between">
      <div className="min-w-0 space-y-1">
        
        {/* Etiqueta Superior */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Licencia Operativa
          </span>
        </div>

        {/* Título y Rank */}
        <div className="mt-1.5">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">
            {license?.name?.toUpperCase() || "AGENCY SF PRO"}
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mt-1">
            {license?.rank || "Agencia Profesional"}
          </p>
        </div>
      </div>

      {/* Icono Premium (Caja Flotante) */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-black text-white flex items-center justify-center shadow-lg shadow-slate-900/10 border border-white/10 shrink-0">
        <Award size={18} className="text-white drop-shadow-md" />
      </div>
    </div>

    {/* CAPACIDAD (Barra de Progreso Estilo Apple) */}
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Créditos Disponibles
        </span>
        <div className="flex items-baseline gap-1 tabular-nums">
          <span className="text-lg font-black text-slate-900 leading-none">
            {license?.credits ?? 0}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 leading-none">
            / {license?.maxCredits ?? 0}
          </span>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-white/50 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-700 ease-out"
          style={{ width: `${creditPercentage || 0}%` }}
        />
      </div>
    </div>

    {/* FOOTER: Estado y Trial */}
    <div className="flex items-center justify-between pt-3 border-t border-slate-200/40">
      
      {/* Badge de Trial (Estilo Pastilla iOS) */}
      <div className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 flex items-center gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
          FREE TRIAL
        </span>
      </div>

      {/* Estado Activo */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Activa
        </span>
      </div>

    </div>
  </div>
</section>



          {/* DATOS DE CONTACTO */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 space-y-5">
              <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><MapPin size={20}/></div>
                  <div className="flex-1 pt-1">
                      <div className="text-[10px] font-bold text-black/40 uppercase mb-1">Zona Operativa</div>
                      {isEditing ? <input value={profile.zone} onChange={(e)=>setProfile({...profile, zone: e.target.value})} className="w-full text-sm font-bold text-slate-900 bg-gray-100 rounded border border-gray-200 p-2 outline-none focus:border-emerald-500" placeholder="Ej: Madrid Centro" /> : <div className="text-sm font-bold text-black leading-tight">{profile.zone}</div>}
                  </div>
              </div>
              <div className="h-px bg-black/5"></div>
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