"use client";

import React, { useState, useEffect } from 'react';
import { 
    // 🛠️ Iconos de Interfaz
    X, Plus, ArrowLeft, User, Heart, ChevronRight, Store, LogOut,
    MapPin, Zap, Building2, Edit3, Trash2, Camera, Image as ImageIcon,
    Loader2, MessageSquare, Phone, // ✅ AÑADIDOS: Para el Buzón de Mensajes
    
    // 🏠 Iconos de Servicios y Propiedades
    Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
    TrendingUp, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
    Droplets, Paintbrush, Truck, Briefcase, Sparkles, Lock, Eye, Calculator,
    
    // 🎟️ Iconos de Tickets y Eventos
    Ticket, Calendar, Navigation, Clock
} from 'lucide-react';

import { 
    // 👤 Usuario y Propiedades
    getMyPropertiesAction, 
    deletePropertyAction, 
    getUserMeAction, 
    updateUserAction, 
    logoutAction,
    
    // 🎟️ Tickets
    getUserTicketsAction, 
    cancelTicketAction,

    // 📬 Buzón de Entrada (NUEVO)
    getMyReceivedLeadsAction, 
    markLeadsAsReadAction,

    // 🔥 AÑADIMOS ESTO PARA TRAER EL EXPEDIENTE COMPLETO
    getPropertyByIdAction 
} from '@/app/actions';

import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/app/utils/upload';

// --- DICCIONARIO MAESTRO ---
const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

const getServiceIds = (prop: any): string[] => {
    // 1. Obtenemos la lista sucia
    const ids = Array.isArray(prop?.selectedServices) ? prop.selectedServices : [];
    
    // 2. LISTA NEGRA (Aquí añadimos lo que queremos esconder: Pack Basic, Balcón, Amueblado...)
    const BASURA_A_ESCONDER = new Set([
        'pool','piscina','garden','jardin','jardín','garage','garaje',
        'security','seguridad','elevator','ascensor','parking','aparcamiento',
        'trastero','storage','terraza','terraz','balcon','balcón','balcony', // <--- Balcón fuera
        'aire','air','aircon','ac','calefaccion','calefacción','heating',
        'm2','mbuilt','m_built','bed','beds','bath','baths','room','rooms',
        'furnished','amueblado', // <--- Amueblado fuera
        'pack_basic','pack_premium','pack_pro' // <--- Packs fuera
    ]);

    // 3. Filtramos
    const filtered = ids.filter((id: any) => id && !BASURA_A_ESCONDER.has(String(id).toLowerCase().trim()));
    
    // 4. Devolvemos limpia
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

  // ✅ OPEN SMART: abre o refresca sin destruir modales
const openDetailsSmart = (prop: any) => {
  if (typeof window === "undefined" || !prop?.id) return;

  const id = String(prop.id);
  const current = (window as any).__currentOpenPropertyId;

  // Selección visual siempre
  window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id } }));

  // MISMA propiedad -> refresco silencioso (no desmonta overlays)
  if (current === id) {
    window.dispatchEvent(
      new CustomEvent("sync-property-state", { detail: { id, updates: prop } })
    );
    return;
  }

  // ✅ Distinta propiedad -> apertura total
  (window as any).__currentOpenPropertyId = id;
  window.dispatchEvent(new CustomEvent("open-details-signal", { detail: prop }));
};

  // --- ESTADOS ---
const [internalView, setInternalView] = useState<'MAIN' | 'PROPERTIES' | 'TICKETS' | 'LEADS'>('MAIN');  const [myProperties, setMyProperties] = useState<any[]>([]);
  
const [myTickets, setMyTickets] = useState<any[]>([]);
  
// 📡 RADAR TÁCTICO: Atrapa el eslogan y el B2B completo desde el mapa en silencio
  useEffect(() => {
      const handleInstantUpdate = (e: any) => {
          const { id, updates } = e.detail;
          setMyProperties((prevList: any[]) => prevList.map((item: any) => {
              if (String(item.id) === String(id)) {
                  return { ...item, ...updates }; // Se traga el eslogan y todo lo demás
              }
              return item;
          }));
      };
      
      if (typeof window !== 'undefined') {
          window.addEventListener('update-property-signal', handleInstantUpdate);
      }
      return () => {
          if (typeof window !== 'undefined') {
              window.removeEventListener('update-property-signal', handleInstantUpdate);
          }
      };
  }, []);

  // Modales
  const [servicesModalProp, setServicesModalProp] = useState<any | null>(null);
  const [contractModalProp, setContractModalProp] = useState<any | null>(null); // Modal Expediente (Propiedad)
  const [selectedTicket, setSelectedTicket] = useState<any>(null); // Modal Detalle Evento (Ticket)

  // 📨 ESTADOS DE MENSAJERÍA (BUZÓN)
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // 🧠 CÁLCULO INTELIGENTE: Solo contamos los que están en estado 'NEW'
  // Esto es lo que controla si aparece el punto rojo o no.
  const unreadCount = myLeads.filter((l: any) => l.status === 'NEW').length;

  // 👁️ EFECTO VISUAL: Al entrar al buzón, marcamos todo como leído automáticamente
  useEffect(() => {
      // Si estamos viendo el buzón Y hay mensajes nuevos...
      if (internalView === 'LEADS' && unreadCount > 0) {
          
          // 1. Recopilar IDs de los mensajes nuevos
          const unreadIds = myLeads.filter((l: any) => l.status === 'NEW').map((l: any) => l.id);
          
          // 2. Avisar a la base de datos (se ejecuta en segundo plano)
          markLeadsAsReadAction(unreadIds);

          // 3. Actualizar visualmente tras 2 segundos (para que el usuario vea que eran nuevos y luego se limpien)
          const timeout = setTimeout(() => {
              setMyLeads(prev => prev.map(l => ({ ...l, status: 'READ' })));
          }, 2000); 

          return () => clearTimeout(timeout);
      }
  }, [internalView, myLeads]); // Se ejecuta cuando cambia la vista o llegan mensajes

  // ESTADO DEL USUARIO
  const [user, setUser] = useState({ 
      name: "Cargando...", role: "...", email: "", avatar: "", cover: "",     
      companyName: "", licenseNumber: "", phone: "", mobile: "", website: ""
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
      // 1. Cargar Usuario
      const userRes = await getUserMeAction();
      if (userRes.success && userRes.data) {
        const d = userRes.data;
        setUser({
          name: d.name || "Usuario Stratos",
          role: String(d.role || "PARTICULAR"),
          email: d.email || "",
          avatar: d.avatar || "",
          cover: d.coverImage || "",
          phone: d.phone || "", mobile: d.mobile || "",    
          companyName: d.companyName || "", licenseNumber: d.licenseNumber || "", website: d.website || ""
        } as any);
      }

      // 2. Cargar Propiedades (CON INTELIGENCIA SAAS)
      const response = await getMyPropertiesAction();
      
      if (response.success && response.data) {
        const dbProperties = response.data.map((p: any) => ({
          ...p, // Mantiene activeCampaign, financials, isManaged, agencyName
          
          // Imagen: Si no hay, null (para mostrar placeholder gris)
          img: p.mainImage || (p.images && p.images[0]?.url) || null,

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

      // 3. Cargar Tickets
      const ticketsRes = await getUserTicketsAction();
      if (ticketsRes.success && ticketsRes.data) {
          setMyTickets(ticketsRes.data);
      }
// 4. 🔥 CARGAR MENSAJES (PEGAR ESTO AQUÍ)
      const leadsRes = await getMyReceivedLeadsAction();
      if (leadsRes.success) setMyLeads(leadsRes.data);

    } catch (e) {
      console.error("Error cargando perfil:", e);
    }
  };

  useEffect(() => {
    if (rightPanel === 'PROFILE') loadData();
  }, [rightPanel]);

  // --- HANDLERS ---
  const startEditing = () => {
      setEditForm({ name: user.name, avatar: user.avatar, cover: user.cover, phone: user.phone, mobile: user.mobile });
      setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(prev => ({ ...prev, [type]: true }));
      try {
          const url = await uploadToCloudinary(file);
          if (url) setEditForm(prev => ({ ...prev, [type]: url }));
      } catch (error) { alert("Error subiendo imagen"); } 
      finally { setIsUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserAction({ name: editForm.name, avatar: editForm.avatar, coverImage: editForm.cover, phone: editForm.phone, mobile: editForm.mobile });
      if (result.success) {
        setUser(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('reload-profile-assets'));
      }
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (e: any, id: any) => {
      e.stopPropagation();
      if(confirm('⚠️ ¿ELIMINAR PROPIEDAD?\nEsta acción es irreversible.')) {
          const backup = [...myProperties];
          setMyProperties(prev => prev.filter(p => p.id !== id));
          try {
              const result = await deletePropertyAction(String(id));
              if (!result.success) setMyProperties(backup);
          } catch (error) { setMyProperties(backup); }
      }
  };

  const handleEditClick = (e: any, property: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      toggleRightPanel('NONE');
      if (onEdit) onEdit(property);
  };
  
// 🔥 HANDLER DE VUELO SÚPER TÁCTICO (Respeta la Herencia del Fuego y evita Madrid)
const handleFlyTo = (e: any, property: any) => {
  if (e?.stopPropagation) e.stopPropagation();
  if (typeof soundEnabled !== "undefined" && playSynthSound) playSynthSound("click");
  if (typeof window === "undefined" || !property?.id) return;

  let targetProp = { ...property };

  // 1) 🛡️ RESPETAMOS LA HERENCIA DEL FUEGO
  if (targetProp.rawPrice) {
    targetProp.priceValue = targetProp.rawPrice;
    targetProp.price = targetProp.rawPrice;
  }
  // Si la propiedad YA ES PREMIUM (porque el particular lo pagó), lo blindamos
  if (targetProp.promotedTier === 'PREMIUM' || targetProp.isPromoted === true || targetProp.isPromoted === "true") {
    targetProp.promotedTier = 'PREMIUM';
    targetProp.isPromoted = true;
  }

  // 2) 🕵️‍♂️ TRADUCTOR SEGURO DE CAMPAÑAS
  const parseJsonSafe = (val: any) => {
      if (typeof val === "string") { try { return JSON.parse(val); } catch { return null; } }
      return val;
  };

  const safeCampaign = parseJsonSafe(targetProp.activeCampaign) || parseJsonSafe(targetProp.campaigns)?.[0];
  targetProp.activeCampaign = safeCampaign;

  // 3) 👔 VESTIMOS AL PANEL DE AGENCIA (Pero respetando a la Nano Card)
  const isManaged = targetProp.isManaged === true || targetProp.isManaged === "true" || (safeCampaign && safeCampaign.status === "ACCEPTED");

  if (isManaged && safeCampaign?.agency) {
      // La agencia hereda el control visual del Panel (Se pondrá en modo oscuro)
      targetProp.user = {
          ...targetProp.user,
          ...safeCampaign.agency,
          role: "AGENCIA" 
      };
      // ❌ Ya no inventamos fuegos falsos aquí. La herencia manda.
  } else {
      targetProp.user = {
          ...targetProp.user,
          role: targetProp.user?.role || "PARTICULAR",
          isOwner: true
      };
  }

  // 4) ✅ APERTURA INTELIGENTE (Manda el dardo al Panel sin desmontar nada)
  openDetailsSmart(targetProp);

  // 5) 🚁 SALTO RETARDADO ANTI-MADRID (150ms después de abrir el panel)
  // Al darle tiempo, el mapa no se asusta con el cambio de tamaño y vuela perfecto a Manilva.
  setTimeout(() => {
      let lng = Number(targetProp.longitude || targetProp.lng || (targetProp.coordinates && targetProp.coordinates[0]));
      let lat = Number(targetProp.latitude || targetProp.lat || (targetProp.coordinates && targetProp.coordinates[1]));

      if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
          window.dispatchEvent(
            new CustomEvent("fly-to-location", {
              detail: { center: [lng, lat], latitude: lat, longitude: lng, zoom: 18.5, pitch: 60, duration: 1500 },
            })
          );
      }
  }, 150);
};

  const handleCancelTicket = async (ticketId: string) => {
      if(!confirm("¿Cancelar asistencia?")) return;
      const backup = [...myTickets];
      setMyTickets(prev => prev.filter(t => t.id !== ticketId));
      const res = await cancelTicketAction(ticketId);
      if (!res.success) { alert("Error al cancelar."); setMyTickets(backup); }
      // Cerrar modal si estaba abierto
      if (selectedTicket && selectedTicket.id === ticketId) setSelectedTicket(null);
  };

  if (rightPanel !== 'PROFILE') return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#E5E5EA] shadow-2xl">
      
      {/* 1. CABECERA PERFIL */}
      <div className="relative h-80 shrink-0 bg-slate-900 group shadow-xl z-20">
         <div className="absolute inset-0 overflow-hidden">
             {(isEditing ? editForm.cover : user.cover) ? (
                 <img src={isEditing ? editForm.cover : user.cover} className="w-full h-full object-cover opacity-100" alt="Fondo" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900" />
             )}
             {isEditing && (
                 <label className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-black/90 transition-colors border border-white/20 z-30 backdrop-blur-md">
                     {isUploading.cover ? <span className="animate-spin">⏳</span> : <ImageIcon size={14}/>}
                     <span>Cambiar Fondo</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={isUploading.cover}/>
                 </label>
             )}
         </div>

         <button onClick={() => toggleRightPanel('NONE')} className="absolute top-6 right-6 p-2 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all z-30 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer">
            <X size={20}/>
         </button>

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
                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 cursor-pointer">
                           <Camera className="text-white" size={20}/>
                           <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
                        </label>
                    )}
                 </div>
             </div>
             
             <div className="mt-4 text-center w-full px-8 flex-1 flex flex-col justify-center pb-4">
                 {isEditing ? (
                     <div className="space-y-2 bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-white/20 w-full max-w-xs mx-auto">
                         <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/10 text-white font-black text-lg text-center border border-white/30 rounded-xl py-1.5 px-3 outline-none" placeholder="Nombre" />
                         <div className="grid grid-cols-2 gap-2">
                             <input value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} className="w-full bg-white/10 text-white text-xs font-bold text-center border border-white/30 rounded-lg py-2 outline-none placeholder-white/50" placeholder="Móvil" />
                             <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white/10 text-white text-xs font-bold text-center border border-white/30 rounded-lg py-2 outline-none placeholder-white/50" placeholder="Fijo" />
                         </div>
                         <button onClick={handleSaveProfile} disabled={isSaving} className="w-full py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                             {isSaving ? "Guardando..." : "Guardar"}
                         </button>
                     </div>
                 ) : (
                     <>
                        <h2 className="text-white font-black text-2xl drop-shadow-md mb-1">{user.name}</h2>
                        <p className="text-xs font-medium text-blue-100/90 mb-3 font-mono">{user.email}</p>
                        <div className="flex justify-center gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">{user.role}</span>
                            <button onClick={startEditing} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"><Edit3 size={12}/></button>
                        </div>
                     </>
                 )}
             </div>
         </div>
      </div>

      {/* 2. CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        
        {/* --- MENÚ PRINCIPAL --- */}
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-1">Tu Espacio</p>
                {user?.role === 'PARTICULAR' && (
                  <button onClick={() => { if (soundEnabled) playSynthSound('click'); toggleRightPanel('OWNER_PROPOSALS'); }} className="w-full bg-[#1d1d1f] text-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 backdrop-blur-sm"><Briefcase size={18} /></div>
                      <div className="text-left"><span className="block font-black text-sm tracking-wide">AGENCY HUD</span><span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Gestión Profesional</span></div>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-white relative z-10 transition-colors"/>
                  </button>
                )}
{/* 📬 BOTÓN BUZÓN DE ENTRADA (CON LÓGICA DE NOTIFICACIONES) */}
                <button onClick={() => setInternalView('LEADS')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-100 cursor-pointer relative overflow-hidden mt-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors relative">
                            <MessageSquare size={18}/>
                            {/* 🔥 SOLO SALE SI HAY MENSAJES NO LEÍDOS */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-white animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="text-left">
                            <span className="font-bold text-slate-900 text-sm block">Buzón de Entrada</span>
                            {/* 🔥 TEXTO QUE CAMBIA DE COLOR */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${unreadCount > 0 ? 'text-rose-500' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                {unreadCount > 0 ? `${unreadCount} MENSAJES NUEVOS` : "Buzón al día"}
                            </span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                </button>

                {/* 🏠 BOTÓN MIS PROPIEDADES */}
                <button onClick={() => setInternalView('PROPERTIES')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-100 cursor-pointer mt-3">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Propiedades</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                </button>

                <button onClick={() => setInternalView('TICKETS')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-indigo-100 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Ticket size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Entradas</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
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

        {/* --- VISTA: MIS PROPIEDADES (SAAS BLINDADO) --- */}
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

                      // 🔥 DETECTOR DE PREMIUM (FUEGO)
                      const isPremium = prop.promotedTier === 'PREMIUM' || prop.isPromoted === true;

                      // 🔥 LOGICA SAAS
                      const activeCampaign = prop.activeCampaign;
                      const isManaged = prop.isManaged || (activeCampaign && activeCampaign.status === "ACCEPTED");
                      const agencyName = prop.agencyName || activeCampaign?.agency?.companyName || "Agencia";

                      return (
                        <div 
                            key={prop.id} 
                            onClick={(e) => handleFlyTo(e, prop)} 
                            className={`group p-5 rounded-[24px] shadow-sm transition-all cursor-pointer relative overflow-hidden ${
                                isManaged ? 'bg-slate-50 border border-indigo-200' : 
                                isPremium ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 
                                'bg-white border border-transparent hover:border-slate-200'
                            }`}
                        >
                            {isManaged && <div className="absolute top-0 right-0 left-0 bg-indigo-600 h-1.5 w-full" />}

                            <div className="flex gap-4 mb-4 mt-2">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner relative border border-slate-200">
                                    {prop.img ? (
                                        <img src={prop.img} className="w-full h-full object-cover" alt="Propiedad"/>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <Camera size={20} />
                                            <span className="text-[8px] font-black uppercase mt-1 tracking-wider">Sin Foto</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        {/* TÍTULO + CORONA SI ES PREMIUM */}
                                        <h4 className={`font-bold truncate text-lg transition-colors pr-2 flex items-center gap-2 ${isPremium ? 'text-amber-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                            {prop?.title || "Sin título"}
                                            {isPremium && <Crown size={14} fill="currentColor" className="text-amber-500 animate-pulse"/>}
                                        </h4>

                                        {!isManaged && (
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isPendingPayment ? "bg-amber-100 text-amber-700" : (isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}`}>
                                                {isPendingPayment ? "PENDIENTE" : (isPublished ? "ONLINE" : "OFFLINE")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">REF: {prop.refCode || "---"}</span>
                                        {isPremium && <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">PREMIUM</span>}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1.5 truncate">
                                        <MapPin size={12} /><span className="truncate">{prop?.location || prop?.address || "Ubicación Privada"}</span>
                                    </div>
                                    <p className={`text-lg font-black mt-1 ${isPremium ? 'text-amber-600' : 'text-slate-900'}`}>{prop.price}</p>
                                </div>
                            </div>

                            {/* TARJETA DE GESTIÓN O TAGS (CORREGIDA CON ESTILO PREMIUM) */}
                            {isManaged && activeCampaign ? (
                                // CASO A: AGENCIA (Tarjeta Azul)
                                <div className="mb-4 bg-white p-4 rounded-[20px] border border-indigo-100 shadow-sm relative">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase size={12} className="text-indigo-600" />
                                            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">GESTIONADO POR {agencyName.toUpperCase()}</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400">{activeCampaign.duration || "6 Meses"}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div><p className="text-[9px] font-bold text-slate-400 uppercase">Honorarios</p><p className="text-sm font-black text-slate-700">{activeCampaign.commissionPct || activeCampaign.commission}%</p></div>
                                        <div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Total (con IVA)</p><p className="text-sm font-black text-indigo-600">{activeCampaign.financials?.total || "---"}</p></div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setContractModalProp({...prop, activeCampaign}); }} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200">
                                        <Eye size={12} /> VER CONDICIONES FIRMADAS
                                    </button>
                                </div>
                            ) : (
                                // CASO B: PARTICULAR (Tarjeta Gris O PREMIUM)
                                <div className={`mb-4 p-4 rounded-[20px] border shadow-sm ${isPremium ? 'bg-white border-amber-200' : 'bg-slate-50 border-slate-100/80'}`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-70">
                                        {isPremium ? <Zap size={10} className="text-amber-500"/> : <User size={10} className="text-slate-500" />}
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {isPremium ? 'POTENCIADO CON FUEGO' : 'GESTIÓN PARTICULAR'}
                                        </span>
                                    </div>
                                    
                                    {/* USAMOS serviceIds (filtrado) EN LUGAR DE prop.selectedServices */}
                                    {serviceIds && serviceIds.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {serviceIds.slice(0, 4).map((srvId: string) => (
                                                <div key={srvId} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase bg-white border-slate-200 text-slate-500">
                                                    <span>{srvId}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 font-medium italic mt-1">Venta directa sin intermediarios.</p>
                                    )}
                                </div>
                            )}

                          <div className="pt-3 border-t border-slate-100 flex gap-2">
                                
                                {/* Botón Servicios (Store) - YA LO TIENE */}
                                <button onClick={(e) => { e.stopPropagation(); if(soundEnabled) playSynthSound('click'); setServicesModalProp(prop); }} className="px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center"><Store size={14}/></button>
                                
                                {/* BOTÓN RAYO: SE PONE DORADO SI ES PREMIUM */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (typeof window !== 'undefined') {
                                            window.dispatchEvent(new CustomEvent('open-premium-signal', { detail: prop }));
                                        }
                                    }}
                                    className={`px-3 py-2 rounded-xl transition-colors flex items-center justify-center shadow-lg ${
                                        isPremium 
                                        ? 'bg-amber-500 text-white shadow-amber-500/30' 
                                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30'
                                    }`}
                                    title={isPremium ? "Modo Fuego Activado" : "Potenciar"}
                                >
                                    <Zap size={14} fill="currentColor" />
                                </button>

                                {isManaged ? (
                                    <div className="flex-1 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"><Lock size={12} /> GESTIONADO</div>
                                ) : (
                                    <button onClick={(e) => handleEditClick(e, prop)} className="flex-1 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"><Edit3 size={12}/> GESTIONAR</button>
                                )}
                                {!isManaged && (
                                    <button onClick={(e) => handleDelete(e, prop.id)} className="px-3 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100"><Trash2 size={14}/></button>
                                )}
                            </div>
                        </div>
                      );
                   })}
                </div>
            )}
          </div>
        )}
        {/* --- VISTA: TICKETS (CORREGIDA - NO CIERRA PANEL) --- */}
        {internalView === 'TICKETS' && (
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
                  </div>
              ) : (
                  <div className="space-y-4">
                      {Array.from(new Map(myTickets.map(item => [item.openHouseId, item])).values()).map((ticket) => {
                          if (!ticket?.openHouse || !ticket?.openHouse?.property) return null;
                          const event = ticket.openHouse;
                          const prop = ticket.openHouse.property;
                          const dateObj = new Date(event.startTime);
                          
                       // 🔥 Función INTELIGENTE para abrir modal y volar (BLINDADA)
const handleOpenDetail = async (e?: any) => {
  if (e) e.stopPropagation();

  // 1. Abrimos el modal del ticket al instante
  setSelectedTicket(ticket);

  try {
    // 2. Pedimos el expediente COMPLETO al servidor
    const res = await getPropertyByIdAction(prop.id);
    let fullProp = prop;

    if (res?.success && res.data) {
      fullProp = res.data;

      // 3. Actualizamos el ticket con los datos completos (para que el modal lea la Agencia)
      const updatedTicket = { ...ticket };
      updatedTicket.openHouse = { ...ticket.openHouse, property: fullProp };
      setSelectedTicket(updatedTicket);
    }

    // 4. 🚁 Volar siempre (esto NO desmonta nada)
    if (typeof window !== "undefined") {
      if (fullProp?.longitude && fullProp?.latitude) {
        window.dispatchEvent(
          new CustomEvent("fly-to-location", {
            detail: {
              center: [fullProp.longitude, fullProp.latitude],
              zoom: 19,
              pitch: 60,
              duration: 1500,
            },
          })
        );
      }

      // 5. 🛑 ADUANA: si ya está abierta, refrescamos sin destruir overlays
      const id = String(fullProp?.id || prop?.id);
      const currentOpenId = String((window as any).__currentOpenPropertyId || "");
      const isSameProp = currentOpenId === id;

      // Selección visual siempre
      window.dispatchEvent(new CustomEvent("select-property-signal", { detail: { id } }));

      if (isSameProp) {
        // ✅ refresco silencioso
        window.dispatchEvent(
          new CustomEvent("sync-property-state", { detail: { id, updates: fullProp } })
        );
        return;
      }

      // ✅ apertura total solo si es otra propiedad
      (window as any).__currentOpenPropertyId = id;
openDetailsSmart(fullProp);    }
  } catch (err) {
    console.error("Error al hidratar el ticket:", err);
  }
};
                          return (
                              <div key={ticket.id} onClick={handleOpenDetail} className="bg-white p-4 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-x-1 transition-all group relative overflow-hidden border border-white cursor-pointer">
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
                                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider truncate border border-indigo-100">OPEN HOUSE</span>
                                          </div>
                                          <h4 className="font-bold text-[#1c1c1e] text-base leading-tight truncate mt-1">{event.title || "Evento"}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 font-mono truncate uppercase mt-0.5 flex items-center gap-1"><MapPin size={10}/> {prop.address || "Ubicación Privada"}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                      <button onClick={handleOpenDetail} className="flex-1 bg-[#1c1c1e] text-white h-9 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer">
                                          <Navigation size={12} /> VER DETALLES
                                      </button>
                                  </div>
                              </div>
                          );
                      })}        </div>
                  )}
               </div>
            )}

       {/* --- VISTA: BUZÓN DE MENSAJES (DISEÑO PREMIUM + DATOS VISIBLES) --- */}
        {internalView === 'LEADS' && (
           <div className="animate-fade-in-right h-full flex flex-col bg-[#E5E5EA]"> 
              
              {/* 1. CABECERA CON NAVEGACIÓN */}
              <div className="flex items-center gap-4 p-8 pb-4 shrink-0">
                 <button 
                    onClick={() => setInternalView('MAIN')} 
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm cursor-pointer border border-white/50 group active:scale-95"
                 >
                    <ArrowLeft size={18} className="text-slate-700 group-hover:-translate-x-0.5 transition-transform"/>
                 </button>
                 <div>
                     <h3 className="text-2xl font-black text-slate-900 leading-none flex items-center gap-2">
                        Buzón de Entrada
                     </h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Gestión de Interesados</p>
                 </div>
              </div>
              
              {/* 2. ÁREA DE CONTENIDO */}
              <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
                  {loadingLeads ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                          <Loader2 className="animate-spin" size={32}/>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando...</span>
                      </div>
                  ) : myLeads.length === 0 ? (
                      /* ESTADO VACÍO PREMIUM */
                      <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in-up">
                          <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent opacity-50"/>
                              <MessageSquare size={48} className="text-slate-300 group-hover:text-indigo-400 transition-colors relative z-10" />
                              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500 rounded-full blur-2xl opacity-20"></div>
                          </div>
                          
                          <h4 className="text-xl font-black text-slate-900 mb-2">Todo tranquilo por aquí</h4>
                          <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed mb-8 font-medium">
                              Aún no has recibido solicitudes. Comparte tus propiedades para atraer interesados.
                          </p>
    
                          <button
                              onClick={() => setInternalView('PROPERTIES')}
                              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-slate-600 flex items-center gap-2 group cursor-pointer"
                          >
                              <Share2 size={14} className="text-indigo-500 group-hover:scale-110 transition-transform"/>
                              Ir a mis Propiedades
                          </button>
                      </div>
                  ) : (
                      /* LISTA DE MENSAJES */
                      <div className="space-y-4">
                          {myLeads.map((lead: any) => (
                              <div key={lead.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-white hover:border-indigo-100 hover:shadow-md transition-all group relative overflow-hidden">
                                  
                                  {/* Cabecera del Mensaje */}
                                  <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-3 relative z-10">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                              <img src={lead.property.img} className="w-full h-full object-cover" alt="Propiedad"/>
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-xs font-black text-slate-900 truncate">{lead.name}</p>
                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Ref: {lead.property.ref}</p>
                                          </div>
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg shrink-0">
                                          {new Date(lead.date).toLocaleDateString()}
                                      </span>
                                  </div>

                                  {/* Cuerpo del Texto */}
                                  <div className="bg-indigo-50/30 p-4 rounded-2xl mb-4 border border-indigo-50/50 relative">
                                      <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{lead.message || 'Sin mensaje escrito...'}"</p>
                                  </div>

                                  {/* Fichas de Datos (VISIBLES Y COPIABLES) */}
                                  <div className="space-y-2">
                                      
                                      {/* 1. Ficha Teléfono */}
                                      {lead.phone && (
                                          <div className="group flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-lg bg-white text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                                                      <Phone size={14}/>
                                                  </div>
                                                  <div>
                                                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider mb-0.5">Teléfono</p>
                                                      {/* 'select-all' permite copiar el número */}
                                                      <p className="text-xs font-black text-slate-900 select-all font-mono tracking-tight">{lead.phone}</p>
                                                  </div>
                                              </div>
                                              <a href={`tel:${lead.phone}`} className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm shrink-0 ml-2 cursor-pointer" title="Llamar">
                                                  <ChevronRight size={14}/>
                                              </a>
                                          </div>
                                      )}

                                      {/* 2. Ficha Email */}
                                      <div className="group flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
                                          <div className="flex items-center gap-3 min-w-0">
                                              <div className="w-8 h-8 rounded-lg bg-white text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                                                  <Mail size={14}/>
                                              </div>
                                              <div className="min-w-0">
                                                  <p className="text-[9px] font-bold text-blue-600/70 uppercase tracking-wider mb-0.5">Email</p>
                                                  {/* 'select-all' permite copiar el email */}
                                                  <p className="text-xs font-black text-slate-900 truncate select-all font-mono tracking-tight">{lead.email}</p>
                                              </div>
                                          </div>
                                          <a href={`mailto:${lead.email}`} className="w-8 h-8 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm shrink-0 ml-2 cursor-pointer" title="Enviar Email">
                                              <ChevronRight size={14}/>
                                          </a>
                                      </div>
                                  </div>
                                  
                              </div>
                          ))}
                      </div>
                  )}
              </div>
           </div>
        )}
      </div>

     {/* MODAL 1: SERVICIOS / ESTRATEGIA (DISEÑO PREMIUM) */}
      {servicesModalProp && (
        <div 
            className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" 
            onClick={() => setServicesModalProp(null)}
        >
            <div 
                className="w-[min(400px,92vw)] bg-white rounded-[32px] overflow-hidden shadow-2xl relative animate-scale-in" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* CABECERA CON FONDO */}
                <div className="bg-slate-50 p-6 pb-8 border-b border-slate-100 text-center relative">
                    {/* BOTÓN CIERRE TORNILLO (Gira al pasar el mouse) */}
                    <button 
                        onClick={() => setServicesModalProp(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border border-slate-200 text-slate-400 hover:text-slate-900 z-20 hover:rotate-90 active:scale-90 cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto flex items-center justify-center mb-4 text-emerald-500">
                        <Store size={32} />
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-1">Estrategia de Venta</h3>
                    <p className="text-xs text-slate-500 font-medium px-8">
                        Herramientas activas para acelerar la operación.
                    </p>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="p-6">
                    {getServiceIds(servicesModalProp).length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {getServiceIds(servicesModalProp).map((srvId: string) => (
                                <div key={srvId} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{srvId}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // ESTADO VACÍO (INVITACIÓN A MARKETPLACE)
                        <div className="text-center py-4">
                            <p className="text-sm text-slate-400 mb-6 italic">
                                Actualmente usas la estrategia orgánica básica.
                            </p>
                            
                            <button 
                                onClick={() => { 
                                    setServicesModalProp(null); 
                                    toggleRightPanel('NONE'); 
                                    if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); 
                                }}
                                className="w-full py-4 bg-[#1c1c1e] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <Zap size={14} className="text-yellow-400 group-hover:text-white transition-colors"/> 
                                Potenciar Anuncio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* MODAL 2: EXPEDIENTE OFICIAL (CONTRATO) */}
      {contractModalProp && (
          <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setContractModalProp(null)}>
              {/* ANCHO AUMENTADO */}
              <div className="bg-white w-[700px] max-w-full rounded-[30px] overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                  
                  {/* HEADER */}
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 text-white relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"/>
                      <div className="flex justify-between items-start relative z-10">
                          <div>
                              <p className="text-[10px] font-black tracking-[0.3em] opacity-70 uppercase mb-2">Expediente Oficial</p>
                              <h3 className="text-3xl font-black">{contractModalProp.title}</h3>
                              <p className="text-indigo-200 text-xs font-medium mt-1 uppercase tracking-wide">REF: {contractModalProp.refCode || "---"}</p>
                          </div>
                          <div className="flex gap-2">
                             <div className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                <Lock size={12} /> {contractModalProp.activeCampaign.mandateType === "EXCLUSIVE" ? "EXCLUSIVA" : "MANDATO SIMPLE"}
                             </div>
                             <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                                <Zap size={12} /> {contractModalProp.activeCampaign.duration || "6 Meses"}
                             </div>
                          </div>
                      </div>
                  </div>

                  {/* BODY: DESGLOSE FINANCIERO */}
                  <div className="p-8 space-y-8">
                      
                      {/* 💰 SECCIÓN 1: FINANZAS */}
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Calculator size={14} /> Desglose Económico
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Honorarios Netos</p>
                                  <p className="text-xl font-bold text-gray-800">{contractModalProp.activeCampaign.financials?.base || "---"}</p>
                                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{contractModalProp.activeCampaign.commission}%</span>
                              </div>
                              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">IVA (21%)</p>
                                  <p className="text-xl font-bold text-gray-600">{contractModalProp.activeCampaign.financials?.ivaAmount || "---"}</p>
                              </div>
                              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center shadow-inner">
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                  <p className="text-2xl font-black text-indigo-700">{contractModalProp.activeCampaign.financials?.total || "---"}</p>
                              </div>
                          </div>
                      </div>

                      {/* ✨ SECCIÓN 2: SERVICIOS */}
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles size={14} /> Servicios Incluidos
                          </p>
                          <div className="flex flex-wrap gap-2">
                              {(contractModalProp.activeCampaign.services || []).map((srv: string) => (
                                <div key={srv} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold uppercase shadow-sm flex items-center gap-2 hover:border-indigo-300 transition-colors">
                                    <Sparkles size={12} className="text-indigo-500"/> {srv.replace(/_/g, " ")}
                                </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  {/* FOOTER */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <button onClick={() => setContractModalProp(null)} className="px-8 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 hover:scale-105 transition-all shadow-lg">
                          Cerrar Expediente
                      </button>
                  </div>
              </div>
          </div>
      )}

     {/* 🎫 MODAL 3: DETALLE DE TICKET (CON AFORO Y DESCRIPCIÓN SMART) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedTicket(null)}>
            <div className="bg-white w-[500px] max-w-full rounded-[30px] overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* Header con Imagen */}
                <div className="h-48 relative bg-slate-900 shrink-0">
                    <img src={selectedTicket.openHouse.property.mainImage || ""} className="w-full h-full object-cover opacity-60" alt="Evento" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
                    
                    <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                        <X size={18}/>
                    </button>

                    <div className="absolute bottom-6 left-6 right-6">
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg border border-emerald-400">
                            CONFIRMADO
                        </span>
                        <h3 className="text-2xl font-black text-white leading-tight">{selectedTicket.openHouse.title}</h3>
                        <p className="text-white/90 text-xs mt-1 flex items-center gap-1 font-medium truncate">
                            <MapPin size={12}/> {selectedTicket.openHouse.property.address}
                        </p>
                    </div>
                </div>

                {/* Info Grid (4 COLUMNAS CON AFORO) */}
                <div className="grid grid-cols-4 border-b border-slate-100 shrink-0 bg-white divide-x divide-slate-100">
                    <div className="p-3 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Fecha</p>
                        <p className="text-xs font-black text-slate-900">
                            {new Date(selectedTicket.openHouse.startTime).toLocaleDateString('es-ES', {day:'2-digit', month:'short'})}
                        </p>
                    </div>
                    <div className="p-3 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hora</p>
                        <p className="text-xs font-black text-slate-900">
                            {new Date(selectedTicket.openHouse.startTime).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div className="p-3 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Duración</p>
                        <p className="text-xs font-black text-slate-900">{selectedTicket.openHouse.duration || 120}m</p>
                    </div>
                    {/* 🔥 NUEVO: AFORO */}
                    <div className="p-3 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Aforo</p>
                        <p className="text-xs font-black text-indigo-600">
                            {selectedTicket.openHouse.capacity ? `${selectedTicket.openHouse.capacity} Pax` : "Libre"}
                        </p>
                    </div>
                </div>

                {/* Cuerpo: Descripción y Amenities */}
                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles size={12} /> Experiencia
                    </h4>
                    
                    {/* 1. Descripción de Texto (LOGICA SMART) */}
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-5">
                        {selectedTicket.openHouse.description 
                            ? selectedTicket.openHouse.description 
                            : (selectedTicket.openHouse.amenities && selectedTicket.openHouse.amenities.length > 0)
                                ? "✨ Este evento incluye una selección de experiencias exclusivas para los asistentes. Consulta los servicios incluidos a continuación:"
                                : "El organizador te espera para presentarte esta propiedad. No olvides acudir puntual."
                        }
                    </p>

                    {/* 2. Lista de Amenities (DJs, Sorteos, etc) */}
                    {selectedTicket.openHouse.amenities && selectedTicket.openHouse.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedTicket.openHouse.amenities.map((tag: string, i: number) => (
                                <div key={i} className="px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold uppercase shadow-sm flex items-center gap-2">
                                    {tag.toLowerCase().includes('dj') && <span className="text-lg">🎧</span>}
                                    {tag.toLowerCase().includes('catering') && <span className="text-lg">🥂</span>}
                                    {tag.toLowerCase().includes('sorteo') && <span className="text-lg">🎁</span>}
                                    {tag.toLowerCase().includes('regalo') && <span className="text-lg">🛍️</span>}
                                    <span>{tag}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. Tarjeta de Organizador */}
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                            {selectedTicket.openHouse.property.user?.companyName?.[0] || "A"}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Organizado por</p>
                            <p className="text-sm font-black text-slate-900 leading-tight">
                                {selectedTicket.openHouse.property.user?.companyName || selectedTicket.openHouse.property.user?.name || "Agencia"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Botones */}
                <div className="p-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                    <button 
                        onClick={() => handleCancelTicket(selectedTicket.id)}
                        className="px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs tracking-widest uppercase hover:bg-red-100 transition-colors border border-red-100"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('fly-to-location', { 
                                    detail: { 
                                        center: [selectedTicket.openHouse.property.longitude, selectedTicket.openHouse.property.latitude], 
                                        zoom: 19, pitch: 60, duration: 1500 
                                    } 
                                }));
                            }
                            setSelectedTicket(null);
                            toggleRightPanel('NONE'); 
                        }}
                        className="flex-1 py-3 rounded-xl bg-[#1c1c1e] text-white font-bold text-xs tracking-widest uppercase hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Navigation size={14}/> Ir al Sitio
                    </button>
                </div>
            </div>
        </div>
      )}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[999999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in cursor-wait">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Cerrando Sesión...</p>
        </div>
      )}

    </div> 
  );
}