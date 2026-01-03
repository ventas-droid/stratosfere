// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, ShieldCheck, Briefcase, Globe, Mail, Phone, Award, Edit2, Save, Camera } from "lucide-react";

export default function AgencyProfilePanel({ isOpen, onClose }: any) {
  
  // --- 1. ESTADOS DE MEMORIA ---
  const [isEditing, setIsEditing] = useState(false);
  
  // Datos por defecto (Alpha Corp)
  const defaultData = {
      name: "Alpha Corp Estate",
      tagline: "Agencia Certificada",
      rank: "Stratos Dominator",
      zone: "Alicante Centro & Playa San Juan",
      web: "www.alphacorp.com",
      email: "contact@alphacorp.com",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
  };

  const [profile, setProfile] = useState(defaultData);

  // --- 2. CARGAR MEMORIA AL INICIAR ---
  useEffect(() => {
      const saved = localStorage.getItem("agency_profile_data");
      if (saved) {
          setProfile(JSON.parse(saved));
      }
  }, []);

  // --- 3. GUARDAR DATOS ---
  const handleSave = () => {
      localStorage.setItem("agency_profile_data", JSON.stringify(profile));
      setIsEditing(false);
  };

  // Manejador de cambios en inputs
  const handleChange = (field: string, value: string) => {
      setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
   // 🔥 PANELES DE TITANIO (w-[600px] + z-max)
    <div className="fixed inset-y-0 right-0 w-[600px] max-w-full z-[60000] bg-[#F5F5F7]/95 backdrop-blur-2xl border-l border-black/5 flex flex-col shadow-2xl animate-slide-in-right font-sans pointer-events-auto">
      
      {/* CABECERA CON AVATAR */}
      <div className="relative h-56 bg-gradient-to-br from-emerald-900 to-black flex flex-col items-center justify-center shrink-0">
         <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-white/20 transition-all z-10"><X size={18}/></button>
         
         <div className="relative z-0 text-center w-full px-10">
             {/* FOTO DE PERFIL */}
             <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 shadow-2xl relative group">
                 <img src={profile.image} className="w-full h-full object-cover rounded-full" alt="Agency Logo" />
                 
                 {/* Badge Verificado */}
                 <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white" title="Verificado">
                     <ShieldCheck size={14} />
                 </div>

                 {/* Botón Cambiar Foto (Solo visual por ahora) */}
                 {isEditing && (
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm">
                        <Camera className="text-white" size={24}/>
                     </div>
                 )}
             </div>

             {/* NOMBRE Y TAGLINE (EDITABLES) */}
             <div className="mt-4 space-y-2">
                 {isEditing ? (
                     <>
                        <input 
                            value={profile.name} 
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full text-center bg-white/10 text-white font-extrabold text-xl border-b border-white/20 outline-none pb-1 placeholder-white/50"
                            placeholder="Nombre Agencia"
                        />
                        <input 
                            value={profile.tagline} 
                            onChange={(e) => handleChange('tagline', e.target.value)}
                            className="w-full text-center bg-transparent text-emerald-400 text-[10px] font-bold tracking-widest uppercase border-b border-white/10 outline-none pb-1 placeholder-emerald-400/50"
                            placeholder="Slogan o Título"
                        />
                     </>
                 ) : (
                     <>
                        <h2 className="text-white font-extrabold text-xl tracking-tight">{profile.name}</h2>
                        <div className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">{profile.tagline}</div>
                     </>
                 )}
             </div>
         </div>
      </div>

      {/* CUERPO DEL PERFIL */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* PACK CONTRATADO */}
          <section className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Licencia Activa</span>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wide">
                      {isEditing ? <input value={profile.rank} onChange={e=>handleChange('rank',e.target.value)} className="bg-transparent outline-none w-32 text-emerald-700" /> : profile.rank}
                  </span>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                  <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner"><Award size={24}/></div>
                  <div>
                      <div className="text-lg font-extrabold text-black">Jefe de Zona</div>
                      <div className="text-xs text-black/50 font-medium">ID: #STRATOS-{Math.floor(Math.random()*10000)}</div>
                  </div>
              </div>
          </section>

          {/* DATOS DE CONTACTO & ZONA */}
          <section className="space-y-4">
              {/* ZONA */}
              <div className="bg-white p-5 rounded-[20px] border border-black/5 flex items-center gap-4 hover:border-emerald-500/30 transition-colors group">
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors">
                    <MapPin className="text-black/40 group-hover:text-emerald-600" size={20}/>
                  </div>
                  <div className="w-full">
                      <div className="text-[10px] font-bold text-black/40 uppercase mb-0.5">Zona Operativa</div>
                      {isEditing ? (
                          <input 
                            value={profile.zone} 
                            onChange={(e)=>handleChange('zone', e.target.value)} 
                            className="w-full text-sm font-bold text-black border-b border-gray-200 outline-none pb-1" 
                          />
                      ) : (
                          <div className="text-sm font-bold text-black">{profile.zone}</div>
                      )}
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* WEB */}
                <div className="bg-white p-5 rounded-[20px] border border-black/5 flex flex-col justify-center gap-2 hover:border-emerald-500/30 transition-colors">
                    <Globe className="text-black/40" size={20}/>
                    {isEditing ? (
                        <input value={profile.web} onChange={e=>handleChange('web', e.target.value)} className="w-full text-sm font-bold border-b border-gray-200 outline-none" />
                    ) : (
                        <div className="text-sm font-bold text-black truncate">{profile.web}</div>
                    )}
                </div>
                
                {/* EMAIL */}
                <div className="bg-white p-5 rounded-[20px] border border-black/5 flex flex-col justify-center gap-2 hover:border-emerald-500/30 transition-colors">
                    <Mail className="text-black/40" size={20}/>
                    {isEditing ? (
                        <input value={profile.email} onChange={e=>handleChange('email', e.target.value)} className="w-full text-sm font-bold border-b border-gray-200 outline-none" />
                    ) : (
                        <div className="text-sm font-bold text-black truncate">{profile.email}</div>
                    )}
                </div>
              </div>
          </section>

          {/* BOTÓN DE ACCIÓN PRINCIPAL (EDITAR / GUARDAR) */}
          {isEditing ? (
               <button 
                  onClick={handleSave}
                  className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-xs tracking-[0.2em] shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
               >
                  <Save size={16} /> GUARDAR CAMBIOS
               </button>
          ) : (
               <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-5 rounded-2xl bg-black text-white font-bold text-xs tracking-[0.2em] hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
               >
                  <Edit2 size={16} /> EDITAR PERFIL
               </button>
          )}
          
          <div className="text-center">
              <p className="text-[9px] text-black/30 font-mono">STRATOSFERE OS // SYNC ID: 882-192</p>
          </div>
      </div>
    </div>
  );
}


