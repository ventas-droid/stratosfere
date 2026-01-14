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

// --- CONSTANTES DE LICENCIA ---
const LICENSE_LEVELS: Record<string, any> = {
    'STARTER': { name: 'Essential', credits: 10, maxCredits: 50, rank: 'Agente Independiente', color: 'blue' },
    'PRO':     { name: 'Professional', credits: 45, maxCredits: 100, rank: 'Stratos Dominator', color: 'emerald' },
    'CORP':    { name: 'Corporate', credits: 200, maxCredits: 500, rank: 'Market Leader', color: 'purple' }
};

export default function AgencyProfilePanel({ isOpen, onClose, soundEnabled, playSynthSound }: any) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState({ avatar: false, cover: false });
  
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
      licenseType: 'STARTER' 
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(prev => ({ ...prev, [type]: true }));
      try {
          const url = await uploadToCloudinary(file);
          if (url) setProfile(prev => ({ ...prev, [type]: url }));
      } catch (error) { console.error("Upload error:", error); } 
      finally { setIsUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleLogout = async () => {
      if(confirm("¿Cerrar sesión de agencia?")) {
          if (soundEnabled) playSynthSound('error');
          await logoutAction();
          window.location.href = "/";
      }
  };

  if (!isOpen) return null;

  const license = LICENSE_LEVELS[profile.licenseType] || LICENSE_LEVELS['STARTER'];
  const creditPercentage = Math.min((license.credits / license.maxCredits) * 100, 100);

  return (
    <div className="absolute inset-y-0 right-0 w-[480px] max-w-full z-[60000] bg-[#F5F5F7] border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F5F5F7]">
          {/* LICENCIA */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-[100px] ${license.color === 'purple' ? 'from-purple-500 to-indigo-600' : license.color === 'emerald' ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-cyan-600'}`}></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <Layers size={12}/> Licencia Operativa
                          </div>
                          <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                              {license.name.toUpperCase()}
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide ${license.color === 'purple' ? 'bg-purple-100 text-purple-600' : license.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {profile.licenseType}
                              </span>
                          </div>
                      </div>
                      <div className={`p-3 rounded-2xl ${license.color === 'purple' ? 'bg-purple-50 text-purple-500' : license.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                          <Award size={24}/>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                             <TrendingUp size={14} className="text-slate-400"/> {license.rank}
                          </div>
                          <div className="text-right">
                              <span className="text-xl font-black text-slate-900">{license.credits}</span>
                              <span className="text-[10px] text-slate-400 font-bold"> / {license.maxCredits} CR</span>
                          </div>
                      </div>
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${license.color === 'purple' ? 'bg-purple-500' : license.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${creditPercentage}%` }}></div>
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