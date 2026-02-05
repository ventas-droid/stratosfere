"use client";

import React, { useState, useEffect } from 'react';
import { 
    // Iconos de Interfaz
    X, Plus, ArrowLeft, User, Heart, ChevronRight, Store, LogOut,
    MapPin, Zap, Building2, Edit3, Trash2, Camera, Image as ImageIcon,
    
    // Iconos de Servicios
    Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
    TrendingUp, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
    Droplets, Paintbrush, Truck, Briefcase, Sparkles, Lock,
    
    // 🔥 NUEVOS ICONOS
    Ticket, Calendar, Navigation, Clock
} from 'lucide-react';

import { 
    getPropertiesAction, 
    deletePropertyAction, 
    getUserMeAction, 
    updateUserAction, 
    logoutAction,
    // 🔥 NUEVAS ACCIONES
    getUserTicketsAction, 
    cancelTicketAction 
} from '@/app/actions';

import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/app/utils/upload';

// --- DICCIONARIO MAESTRO ---
const ICON_MAP: Record<string, any> = {
    'pool': Waves, 'piscina': Waves,
    'garage': Car, 'garaje': Car,
    'garden': Trees, 'jardin': Trees, 'jardín': Trees,
    'security': ShieldCheck, 'seguridad': ShieldCheck,
    'elevator': ArrowUp, 'ascensor': ArrowUp,
    'terrace': Sun, 'terraza': Sun,
    'storage': Box, 'trastero': Box, 'ac': Zap,
    'pack_basic': Star, 'pack_pro': Award, 'pack_elite': Crown, 
    'pack_investor': TrendingUp, 'pack_express': Zap,
    'foto': Camera, 'video': Globe, 'drone': Plane, 
    'tour3d': Box, 'render': Hammer, 'plano_2d': Ruler, 'plano_3d': LayoutGrid, 
    'destacado': TrendingUp, 'ads': Share2, 'email': Mail, 'copy': FileText, 
    'certificado': FileCheck, 'cedula': FileText, 'nota_simple': FileText, 
    'tasacion': Activity, 'lona': LayoutGrid, 'buzoneo': MapPin, 
    'revista': Newspaper, 'openhouse': KeyRound, 'homestaging': Sofa, 
    'limpieza': Droplets, 'pintura': Paintbrush, 'mudanza': Truck, 
    'seguro': ShieldCheck, 'abogado': Briefcase
};

const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

const NON_SERVICE_KEYS = new Set([
    'pool','piscina','garden','jardin','jardín','garage','garaje',
    'security','seguridad','elevator','ascensor','parking','aparcamiento',
    'trastero','storage','terraza','terraz','balcon','balcón',
    'aire','air','aircon','ac','calefaccion','calefacción','heating',
    'm2','mbuilt','m_built','bed','beds','bath','baths','room','rooms'
]);

const getServiceIds = (prop: any): string[] => {
    const ids = Array.isArray(prop?.selectedServices) ? prop.selectedServices : [];
    const filtered = ids.filter((id: any) => {
        const k = normalizeKey(id);
        if (!k) return false;
        return !NON_SERVICE_KEYS.has(k);
    });
    return Array.from(new Set(filtered));
};

export default function ProfilePanel({ 
  rightPanel, 
  toggleRightPanel, 
  toggleMainPanel, 
  onEdit,          
  soundEnabled, 
  playSynthSound 
}: any) {
  
  const router = useRouter();

  // --- ESTADOS ---
  const [internalView, setInternalView] = useState<'MAIN' | 'PROPERTIES' | 'TICKETS'>('MAIN');
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]); // Estado Tickets
  const [servicesModalProp, setServicesModalProp] = useState<any | null>(null);

  const [user, setUser] = useState({ 
      name: "Cargando...", 
      role: "...", 
      email: "",
      avatar: "",
      cover: "",     
      companyName: "",
      licenseNumber: "",
      phone: "",      
      mobile: "",     
      website: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", avatar: "", cover: "", phone: "", mobile: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState({ avatar: false, cover: false });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // --- CARGA DE DATOS ---
  const loadData = async () => {
    if (typeof window === 'undefined') return;
    try {
      const userRes = await getUserMeAction();
      if (userRes.success && userRes.data) {
        const d = userRes.data;
        setUser({
          name: d.name || "Usuario Stratos",
          role: String(d.role || "PARTICULAR"),
          email: d.email || "",
          avatar: d.avatar || "",
          cover: d.coverImage || "",
          phone: d.phone || "",      
          mobile: d.mobile || "",    
          companyName: d.companyName || "",
          licenseNumber: d.licenseNumber || "",
          website: d.website || ""
        } as any);
      }

      const response = await getPropertiesAction();
      if (response.success && response.data) {
        const dbProperties = response.data.map((p: any) => ({
          ...p,
          img: p.mainImage || (p.images && p.images[0]?.url) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3",
          selectedServices: [
            ...(p.selectedServices || []),
            p.pool ? 'pool' : null, p.garage ? 'garage' : null,
            p.elevator ? 'elevator' : null, p.terrace ? 'terrace' : null,
            p.garden ? 'garden' : null, p.storage ? 'storage' : null,
            p.ac ? 'ac' : null, p.security ? 'security' : null
          ].filter(Boolean),
          mBuilt: Number(p.mBuilt || 0),
          price: p.rawPrice
            ? new Intl.NumberFormat('es-ES').format(p.rawPrice)
            : (typeof p.price === 'number' ? new Intl.NumberFormat('es-ES').format(p.price) : p.price),
          coordinates: [p.longitude, p.latitude]
        }));
        setMyProperties(dbProperties);
      } else {
        setMyProperties([]);
      }

      // 🔥 CARGAR TICKETS
      const ticketsRes = await getUserTicketsAction();
      if (ticketsRes.success && ticketsRes.data) {
          setMyTickets(ticketsRes.data);
      }

    } catch (e) {
      console.error("Error cargando perfil:", e);
    }
  };

  useEffect(() => {
    if (rightPanel === 'PROFILE') loadData();
  }, [rightPanel]);

  // --- LÓGICA DE EDICIÓN ---
  const startEditing = () => {
      setEditForm({
          name: user.name,
          avatar: user.avatar.includes("unsplash") || !user.avatar ? "" : user.avatar,
          cover: user.cover || "",
          phone: user.phone || "",
          mobile: user.mobile || ""
      });
      setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(prev => ({ ...prev, [type]: true }));
      try {
          const url = await uploadToCloudinary(file);
          if (url) setEditForm(prev => ({ ...prev, [type]: url }));
      } catch (error) {
          console.error("Fallo visual:", error);
          alert("Error al subir la imagen");
      } finally {
          setIsUploading(prev => ({ ...prev, [type]: false }));
      }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserAction({
        name: editForm.name,
        avatar: editForm.avatar,
        coverImage: editForm.cover,
        phone: editForm.phone,
        mobile: editForm.mobile,
      });

      if (result.success) {
        setUser(prev => ({
          ...prev,
          name: editForm.name,
          avatar: editForm.avatar,
          cover: editForm.cover,
          phone: editForm.phone,
          mobile: editForm.mobile
        }));
        setIsEditing(false);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agency-profile-updated', { detail: editForm }));
          window.dispatchEvent(new CustomEvent('force-map-refresh'));
          window.dispatchEvent(new CustomEvent('reload-profile-assets'));
        }
      } else {
        alert("Error al guardar: " + result.error);
      }
    } catch (error) {
      console.error("Error crítico:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNCIONES DE PROPIEDADES ---
  const handleDelete = async (e: any, id: any) => {
      e.stopPropagation();
      if(confirm('⚠️ ¿CONFIRMAR ELIMINACIÓN?\nEsta acción es irreversible.')) {
          const backup = [...myProperties];
          setMyProperties(prev => prev.filter(p => p.id !== id));
          if(soundEnabled && playSynthSound) playSynthSound('error');
          try {
              const result = await deletePropertyAction(String(id));
              if (!result.success) {
                  alert("Error al borrar: " + result.error);
                  setMyProperties(backup);
              } else {
                  if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('force-map-refresh'));
                      window.dispatchEvent(new CustomEvent('reload-profile-assets'));
                  }
              }
          } catch (error) { setMyProperties(backup); }
      }
  };

  const handleEditClick = (e: any, property: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      toggleRightPanel('NONE');
      if (onEdit) onEdit(property);
  };
  
  const handleFlyTo = (e: any, property: any) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (soundEnabled && playSynthSound) playSynthSound('click');
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-details-signal', { detail: property }));
          if (property.coordinates) {
              window.dispatchEvent(new CustomEvent('fly-to-location', { 
                  detail: { center: property.coordinates, zoom: 18.5, pitch: 60 } 
              }));
          }
      }
  };

  // A. VOLAR AL EVENTO (VERSIÓN MAESTRA QUE TRANSMITE IMÁGENES)
  const handleTicketFlyTo = (ticket: any) => {
      if (soundEnabled) playSynthSound('click');
      
      const rawProp = ticket.openHouse?.property;
      if (!rawProp) return;

      // 1. EXTRAER DATOS DEL DUEÑO (Ahora sí vienen con logo y cover)
      const rawUser = rawProp.user || {};

      // 2. FABRICAR LA IDENTIDAD PARA EL DETAILS PANEL
      const builtIdentity = {
          id: rawUser.id,
          name: rawUser.companyName || rawUser.name || "Agencia",
          // 🔥 Si es agencia, usamos companyLogo. Si no, avatar.
          avatar: rawUser.companyLogo || rawUser.avatar || null, 
          coverImage: rawUser.coverImage || null, // El fondo
          role: rawUser.role || "AGENCIA",
          email: rawUser.email,
          phone: rawUser.mobile || rawUser.phone,
          companyName: rawUser.companyName,
          licenseNumber: rawUser.licenseNumber,
          website: rawUser.website
      };

      // 3. EMPAQUETAR PARA EL ENVÍO
      const targetProp = {
          ...rawProp,
          coordinates: [rawProp.longitude, rawProp.latitude],
          img: rawProp.mainImage || (rawProp.images && rawProp.images[0]?.url) || "",
          price: rawProp.price, 
          
          // Inyectamos la identidad fabricada
          user: builtIdentity,          
          ownerSnapshot: builtIdentity, 
      };

      if (typeof window !== 'undefined') {
          // A) Disparar apertura de ficha
          window.dispatchEvent(new CustomEvent('open-details-signal', { detail: targetProp }));
      
          // B) Disparar vuelo de mapa
          if (rawProp.latitude && rawProp.longitude) {
              window.dispatchEvent(new CustomEvent('fly-to-location', { 
                  detail: { 
                      center: [rawProp.longitude, rawProp.latitude], 
                      zoom: 18.5, 
                      pitch: 60 
                  } 
              }));
          }
      }
  };
  const handleCancelTicket = async (e: any, ticketId: string) => {
      e.stopPropagation();
      if(!confirm("¿Cancelar asistencia?\nSe liberará tu plaza y se avisará a la agencia.")) return;

      const backup = [...myTickets];
      setMyTickets(prev => prev.filter(t => t.id !== ticketId));

      const res = await cancelTicketAction(ticketId);
      if (!res.success) {
          alert("Error al cancelar.");
          setMyTickets(backup); 
      } else {
          if (soundEnabled) playSynthSound('delete');
      }
  };

  if (rightPanel !== 'PROFILE') return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#E5E5EA] shadow-2xl">
      
      {/* 1. CABECERA */}
      <div className="relative h-80 shrink-0 bg-slate-900 group shadow-xl z-20">
         <div className="absolute inset-0 overflow-hidden">
             {(isEditing ? editForm.cover : user.cover) ? (
                 <img src={isEditing ? editForm.cover : user.cover} className="w-full h-full object-cover opacity-100" alt="Fondo" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900" />
             )}
             
             {isEditing && (
                 <label className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-black/90 transition-colors border border-white/20 z-30 backdrop-blur-md shadow-xl hover:scale-105 transform duration-200">
                     {isUploading.cover ? <span className="animate-spin">⏳</span> : <ImageIcon size={14}/>}
                     <span>{isUploading.cover ? "Subiendo..." : "Cambiar Fondo"}</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading.cover}/>
                 </label>
             )}
         </div>

         <button onClick={() => toggleRightPanel('NONE')} className="absolute top-6 right-6 p-2 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all z-30 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer">
            <X size={20}/>
         </button>

         {/* BOTÓN VOLVER */}
         {(internalView === 'PROPERTIES' || internalView === 'TICKETS') && (
            <button onClick={() => setInternalView('MAIN')} className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20 transition-all z-30 border border-white/10 cursor-pointer">
              <ArrowLeft size={16}/> VOLVER
            </button>
         )}

         <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-4">
             <div className="w-24 h-24 rounded-full p-1 bg-white/20 backdrop-blur-md shadow-2xl relative group/avatar shrink-0">
                 <div className="w-full h-full rounded-full overflow-hidden bg-white relative border-2 border-white/50 flex items-center justify-center">
                    {(isEditing ? editForm.avatar : user.avatar) ? (
                        <img src={isEditing ? editForm.avatar : user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                        <User size={36} className="text-slate-300" />
                    )}
                    
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 cursor-pointer hover:bg-black/70 transition-colors">
                           {isUploading.avatar ? <span className="animate-spin text-white">⏳</span> : <Camera className="text-white drop-shadow-md" size={20}/>}
                           <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={isUploading.avatar}/>
                        </label>
                    )}
                 </div>
             </div>
             
             <div className="mt-4 text-center w-full px-8 flex-1 flex flex-col justify-center pb-4">
                 {isEditing ? (
                     <div className="space-y-2 bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-white/20 animate-fade-in w-full max-w-xs mx-auto">
                         <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/10 text-white font-black text-lg text-center border border-white/30 rounded-xl py-1.5 px-3 outline-none focus:bg-white/20 placeholder-white/50" placeholder="Tu Nombre" />
                         <div className="grid grid-cols-2 gap-2">
                             <input value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} className="w-full bg-white/10 text-white text-xs font-bold text-center border border-white/30 rounded-lg py-2 outline-none placeholder-white/50" placeholder="Móvil" />
                             <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white/10 text-white text-xs font-bold text-center border border-white/30 rounded-lg py-2 outline-none placeholder-white/50" placeholder="Fijo" />
                         </div>
                         <button onClick={handleSaveProfile} disabled={isSaving} className="w-full py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg mt-1 cursor-pointer">
                             {isSaving ? "Guardando..." : "Guardar Cambios"}
                         </button>
                     </div>
                 ) : (
                     <>
                        <h2 className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight leading-none mb-1">{user.name}</h2>
                        <p className="text-xs font-medium text-blue-100/90 truncate mb-3 font-mono tracking-tight drop-shadow-md">{user.email}</p>
                        <div className="flex justify-center gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm shadow-lg">{user.role}</span>
                            <button onClick={startEditing} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all backdrop-blur-sm border border-white/30 cursor-pointer"><Edit3 size={12}/></button>
                        </div>
                     </>
                 )}
             </div>
         </div>
      </div>

      {/* 2. CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        
        {/* --- VISTA: MENÚ PRINCIPAL --- */}
        {internalView === 'MAIN' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center border border-slate-100">
                    <div className="text-3xl font-black text-slate-900">{myProperties.length}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activos</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center border border-slate-100">
                     <div className="text-3xl font-black text-indigo-600">{myTickets.length}</div>
                     <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Eventos</div>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-1">Centro de Mando</p>
                {user?.role === 'PARTICULAR' && (
                  <button onClick={() => { if (soundEnabled) playSynthSound('click'); toggleRightPanel('OWNER_PROPOSALS'); }} className="w-full bg-[#1d1d1f] text-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 backdrop-blur-sm"><Briefcase size={18} /></div>
                      <div className="text-left"><span className="block font-black text-sm tracking-wide">AGENCY HUD</span><span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Gestión Profesional</span></div>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-white relative z-10 transition-colors"/>
                  </button>
                )}

                {/* BOTÓN: MIS EVENTOS */}
                <button onClick={() => setInternalView('TICKETS')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-indigo-100 cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Ticket size={18}/></div>
                        <div className="text-left"><span className="block font-bold text-slate-900 text-sm">Mis Eventos</span><span className="text-[9px] text-slate-400 font-bold uppercase block">{myTickets.length} Activos</span></div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                </button>

                {/* BOTÓN: MIS PROPIEDADES */}
                <button onClick={() => setInternalView('PROPERTIES')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-100 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Propiedades</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                </button>

                <button onClick={() => { if(soundEnabled) playSynthSound('click'); toggleRightPanel('VAULT'); }} className="w-full bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><Heart size={20} fill="currentColor" className="opacity-20 group-hover:opacity-100 transition-opacity"/></div>
                        <div className="text-left"><h4 className="font-bold text-slate-900 text-sm">Favoritos</h4><p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Colección Privada</p></div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all"/>
                </button>

                <button onClick={() => { if(soundEnabled) playSynthSound('click'); if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); }} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer border border-transparent hover:border-emerald-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors"><Store size={18} /></div>
                        <span className="font-bold text-slate-900 text-sm">Marketplace</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500"/>
                </button>
            </div>
            
            <button onClick={async () => { setIsLoggingOut(true); try { localStorage.clear(); sessionStorage.clear(); await logoutAction(); } catch (error) { console.error("Error al salir:", error); } finally { window.location.href = '/'; } }} className="w-full mt-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-sm flex items-center justify-center gap-3 text-slate-400 font-bold text-xs tracking-widest uppercase hover:bg-white hover:text-rose-500 hover:shadow-md hover:border-rose-100 transition-all duration-300 group cursor-pointer">
                <LogOut size={16} className="group-hover:scale-110 transition-transform"/>
                <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* --- VISTA: MIS PROPIEDADES --- */}
        {internalView === 'PROPERTIES' && (
          <div className="animate-fade-in-right space-y-6 mt-8">
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-2xl font-black text-slate-900">Mis Activos</h3>
               <button onClick={() => { toggleRightPanel('NONE'); if(toggleMainPanel) toggleMainPanel('ARCHITECT'); }} className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                    <Plus size={14}/> CREAR NUEVO
               </button>
            </div>

            {myProperties.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                    <Building2 size={40} className="mx-auto mb-2 text-slate-400"/>
                    <p className="text-sm font-bold">No tienes propiedades aún.</p>
                </div>
            ) : (
                <div className="space-y-4">
                   {myProperties.map((prop) => {
                      const serviceIds = getServiceIds(prop);
                      const st = String((prop as any)?.status || "").toUpperCase();
                      const isPendingPayment = st === "PENDIENTE_PAGO";
                      const isPublished = st === "PUBLICADO";

                      return (
                        <div key={prop.id} onClick={(e) => handleFlyTo(e, prop)} className="group bg-white p-5 rounded-[24px] shadow-sm border border-transparent hover:border-blue-500/30 transition-all cursor-pointer relative">
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner relative">
                                    <img src={prop.img} className="w-full h-full object-cover" alt="Propiedad"/>
                                    {prop.elevator && <div className="absolute top-1 right-1 bg-green-500 p-1 rounded-md text-white shadow-sm"><ArrowUp size={8} strokeWidth={4}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors">{prop?.title || "Sin título"}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isPendingPayment ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                            {isPendingPayment ? "PENDIENTE PAGO" : (isPublished ? "ONLINE" : "OFFLINE")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin size={10} />
                                        <span className="truncate">{prop?.location || prop?.address || ""}</span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 mt-1">{prop.price}</p>
                                </div>
                            </div>

                            {prop.selectedServices && prop.selectedServices.length > 0 && (
                                <div className="mb-4 bg-slate-50 p-4 rounded-[24px] border border-slate-100/80 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3 opacity-70">
                                        <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estrategia Activa</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {serviceIds.slice(0, 4).map((srvId: string) => (
                                            <div key={srvId} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase bg-white border-slate-200 text-slate-500">
                                                <span>{srvId}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); if(soundEnabled) playSynthSound('click'); setServicesModalProp(prop); }} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-emerald-100"><Store size={14}/></button>
                                <button onClick={(e) => handleEditClick(e, prop)} className="flex-1 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"><Edit3 size={12}/> GESTIONAR</button>
                                <button onClick={(e) => handleDelete(e, prop.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"><Trash2 size={14}/></button>
                            </div>
                        </div>
                      );
                   })}
                </div>
            )}
          </div>
        )}

   {/* --- VISTA: MIS TICKETS (DATOS REALES Y CONTENIDO) --- */}
        {internalView === ('TICKETS' as any) && (
           <div className="animate-fade-in-right space-y-6 pt-4">
              <div className="flex items-center gap-3 mb-6">
                 <button onClick={() => setInternalView('MAIN')} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm cursor-pointer border border-slate-100">
                    <ArrowLeft size={16} className="text-slate-700"/>
                 </button>
                 <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Ticket className="text-indigo-600" size={24}/> Mis Entradas
                 </h3>
              </div>

              {(!myTickets || myTickets.length === 0) ? (
                  <div className="text-center py-12 opacity-50 bg-white rounded-[32px] border border-slate-100 mx-4 shadow-sm">
                      <Calendar size={40} className="mx-auto mb-3 text-slate-300"/>
                      <p className="text-sm font-bold text-slate-500">Sin eventos próximos.</p>
                      <button onClick={() => setInternalView('MAIN')} className="mt-4 text-xs text-indigo-500 font-bold uppercase tracking-widest hover:underline cursor-pointer">Volver al menú</button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {/* Filtro visual anti-duplicados */}
                      {Array.from(new Map(myTickets.map(item => [item.openHouseId, item])).values()).map((ticket) => {
                          
                          if (!ticket?.openHouse || !ticket?.openHouse?.property) return null;

                          const event = ticket.openHouse;
                          const prop = ticket.openHouse.property;
                          
                          // 🔍 RASTREO DE IDENTIDAD (PRIORIDAD: USUARIO VIVO > SNAPSHOT)
                          // Esto asegura que si el usuario tiene nombre, SALGA.
                          const liveUser = prop.user || {};
                          const snapshot = (typeof prop.ownerSnapshot === 'object' ? prop.ownerSnapshot : {}) || {};
                          
                          const agencyName = 
                              liveUser.companyName || snapshot.companyName || 
                              liveUser.name || snapshot.name || 
                              "Agencia Organizadora";

                          const agencyPhone = 
                              liveUser.mobile || liveUser.phone || 
                              snapshot.mobile || snapshot.phone || 
                              "";

                          // Fechas
                          const dateObj = new Date(event.startTime);
                          const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                          // 🔍 RASTREO DE CONTENIDO (DJ, CATERING...)
                          // Si no hay amenities en BD, buscamos palabras clave en el título o descripción
                          const rawAmenities = event.amenities || [];
                          const textSearch = (event.title + " " + (event.description || "")).toLowerCase();
                          
                          const computedTags = [...rawAmenities];
                          if (computedTags.length === 0) {
                              if (textSearch.includes('dj') || textSearch.includes('música')) computedTags.push('DJ SET');
                              if (textSearch.includes('catering') || textSearch.includes('comida') || textSearch.includes('picoteo')) computedTags.push('CATERING');
                              if (textSearch.includes('cocktail') || textSearch.includes('copa')) computedTags.push('COCKTAIL');
                              if (textSearch.includes('vip')) computedTags.push('VIP ACCESS');
                              if (textSearch.includes('regalo') || textSearch.includes('welcome')) computedTags.push('WELCOME PACK');
                          }

                          return (
                              <div key={ticket.id} onClick={() => handleTicketFlyTo(ticket)} className="bg-white p-4 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all group relative overflow-hidden border border-white cursor-pointer">
                                  
                                  {/* CABECERA */}
                                  <div className="flex gap-4 items-start mb-3">
                                      <div className="w-20 h-20 rounded-[18px] bg-slate-200 overflow-hidden shrink-0 relative shadow-inner">
                                          <img src={prop.mainImage || "https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b"} className="w-full h-full object-cover" alt="" />
                                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                                              <span className="text-xl font-black leading-none drop-shadow-md">{dateObj.getDate()}</span>
                                              <span className="text-[9px] uppercase font-bold drop-shadow-md">{dateObj.toLocaleDateString('es-ES', {month:'short'})}</span>
                                          </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider truncate">OPEN HOUSE</span>
                                              <span className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {time}H</span>
                                          </div>
                                          <h4 className="font-bold text-[#1c1c1e] text-base leading-tight truncate">{event.title || "Evento"}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 font-mono truncate uppercase mt-0.5 flex items-center gap-1"><MapPin size={10}/> {prop.address || "Ubicación Privada"}</p>
                                          
                                          {/* 🔥 DATOS REALES DEL ORGANIZADOR */}
                                          <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-0.5">
                                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">ORGANIZADO POR:</p>
                                              <p className="text-xs font-black text-slate-900 truncate">{agencyName}</p>
                                              {agencyPhone && (
                                                  <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                                      📞 {agencyPhone}
                                                  </p>
                                              )}
                                          </div>
                                      </div>
                                  </div>

                                  {/* 🔥 ETIQUETAS DE CONTENIDO (DJ, CATERING...) */}
                                  {(event.description || computedTags.length > 0) && (
                                      <div className="mb-4 pl-1">
                                          {event.description && (
                                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2 italic">
                                                  "{event.description}"
                                              </p>
                                          )}
                                          
                                          {computedTags.length > 0 && (
                                              <div className="flex gap-2 flex-wrap">
                                                  {computedTags.map((tag: string, i: number) => (
                                                      <span key={i} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 uppercase flex items-center gap-1">
                                                          {tag === 'DJ SET' && '🎧'}
                                                          {tag === 'CATERING' && '🍱'}
                                                          {tag === 'COCKTAIL' && '🍸'}
                                                          {tag}
                                                      </span>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  )}

                                  {/* BOTONES */}
                                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                      <button onClick={(e) => { e.stopPropagation(); handleTicketFlyTo(ticket); }} className="flex-1 bg-[#1c1c1e] text-white h-9 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-600 hover:scale-[1.02] transition-all shadow-md active:scale-95 cursor-pointer">
                                          <Navigation size={12} /> IR AL SITIO
                                      </button>
                                      <button onClick={(e) => handleCancelTicket(e, ticket.id)} className="px-4 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all active:scale-95 cursor-pointer">
                                          CANCELAR
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
           </div>
        )}
      </div>

      {/* MODAL SERVICIOS */}
      {servicesModalProp && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setServicesModalProp(null)}>
            <div className="w-[min(720px,92vw)] max-h-[82vh] bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_30px_80px_rgba(0,0,0,0.20)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-slate-100">
                    <div className="min-w-0">
                        <p className="text-[11px] font-black tracking-[0.35em] text-slate-400 uppercase flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" />SERVICIOS ACTIVOS</p>
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-2 truncate">{servicesModalProp.title || "Activo"}</h3>
                    </div>
                    <button className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors" onClick={() => setServicesModalProp(null)}><X size={18} /></button>
                </div>
                <div className="px-8 py-6 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {getServiceIds(servicesModalProp).map((srvId: string) => (
                            <div key={srvId} className="rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-300 transition-all p-5 flex flex-col items-center text-center">
                                <p className="mt-3 text-[12px] font-black tracking-wide uppercase text-slate-700">{srvId}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

     {/* CORTINA DE SALIDA */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[999999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in cursor-wait">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Cerrando Sesión...</p>
        </div>
      )}

    </div> 
  );
}