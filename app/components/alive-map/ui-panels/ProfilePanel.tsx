"use client";

import React, { useState, useEffect } from 'react';
import { 
    // Iconos de Interfaz
    X, Plus, ArrowLeft, User, Heart, ChevronRight, Store, LogOut,
    MapPin, Zap, Building2, Crosshair, Edit3, Trash2,
    
    // 🔥 TODOS LOS ICONOS DE SERVICIOS (RESPETANDO SU LISTA ORIGINAL)
    Waves, Car, Trees, ShieldCheck, ArrowUp, Sun, Box, Star, Award, Crown, 
    TrendingUp, Camera, Globe, Plane, Hammer, Ruler, LayoutGrid, Share2, 
    Mail, FileText, FileCheck, Activity, Newspaper, KeyRound, Sofa, 
    Droplets, Paintbrush, Truck, Briefcase, Sparkles
} from 'lucide-react';

import { getPropertiesAction, deletePropertyAction, getUserMeAction, updateUserAction, logoutAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/app/utils/upload';

// DICCIONARIO MAESTRO (COMPLETO, COMO USTED LO TENÍA)
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

// Separador de "ficha técnica" vs "servicios"
const normalizeKey = (v: any) => String(v || '').toLowerCase().trim();

const NON_SERVICE_KEYS = new Set([
    'pool','piscina',
    'garden','jardin','jardín',
    'garage','garaje',
    'security','seguridad',
    'elevator','ascensor',
    'parking','aparcamiento',
    'trastero','storage',
    'terraza','terraz','balcon','balcón',
    'aire','air','aircon','ac','calefaccion','calefacción','heating',
    'm2','mbuilt','m_built',
    'bed','beds','bath','baths','room','rooms','habitacion','habitaciones','baño','baños','bano','banos'
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

  // 🔥 ESTADO DE NAVEGACIÓN LIMPIO (Solo Main o Properties)
  const [internalView, setInternalView] = useState<'MAIN' | 'PROPERTIES'>('MAIN');
  
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [servicesModalProp, setServicesModalProp] = useState<any | null>(null);

  // ESTADO DE USUARIO
  const [user, setUser] = useState({ 
      name: "Cargando...", 
      role: "...", 
      email: "",
      avatar: "",
      companyName: "",
      licenseNumber: "",
      phone: "",
      website: ""
  });

  // ESTADOS PARA EDICIÓN DE PERFIL
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", avatar: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // --- FUNCIONES DE EDICIÓN ---
  const startEditing = () => {
      setEditForm({
          name: user.name,
          avatar: user.avatar.includes("unsplash") || !user.avatar ? "" : user.avatar 
      });
      setIsEditing(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const url = await uploadToCloudinary(file);
          if (url) {
              setEditForm(prev => ({ ...prev, avatar: url }));
          }
      } catch (error) {
          console.error("Fallo visual:", error);
          alert("Error al subir la imagen");
      } finally {
          setIsUploading(false);
      }
  };

  const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
          console.log("💾 Guardando perfil...", editForm);
          const result = await updateUserAction({
              name: editForm.name,
              avatar: editForm.avatar 
          });

          if (result.success) {
              setUser(prev => ({ ...prev, name: editForm.name, avatar: editForm.avatar }));
              setIsEditing(false);
              console.log("✅ Perfil actualizado con éxito");
          } else {
              alert("Error al guardar: " + result.error);
          }
      } catch (error) {
          console.error("Error crítico al guardar:", error);
      } finally {
          setIsSaving(false);
      }
  };

  // 🔥 AQUÍ ESTÁ EL RECORTE QUIRÚRGICO: 
  // Hemos quitado 'myFavorites' y 'loadFavorites' porque eran duplicados conflictivos.
  // La carga de datos ahora se centra SOLO en el usuario y sus propiedades.

  // --- FUNCIÓN DE CARGA BLINDADA ---
  const loadData = async () => {
      if (typeof window === 'undefined') return;
      
      try {
          // A. CARGAR IDENTIDAD
          const userRes = await getUserMeAction();
          if (userRes.success && userRes.data) {
              console.log("👤 Identidad confirmada:", userRes.data.email);
              setUser({
                  name: userRes.data.name || "Usuario Stratos",
                  role: userRes.data.role || "PARTICULAR",
                  email: userRes.data.email || "",
                  avatar: userRes.data.avatar || "",
                  companyName: userRes.data.companyName || "",
                  licenseNumber: userRes.data.licenseNumber || "",
                  phone: userRes.data.phone || "",
                  website: userRes.data.website || ""
              });
          }

          // B. CARGAR PROPIEDADES (SOLO DESDE SERVER)
          const response = await getPropertiesAction();
          
          if (response.success && response.data) {
             const dbProperties = response.data.map((p: any) => ({
                 ...p,
                 img: p.mainImage || (p.images && p.images[0]?.url) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3",
                 selectedServices: [
                    ...(p.selectedServices || []),
                    p.pool ? 'pool' : null, 
                    p.garage ? 'garage' : null,
                    p.elevator ? 'elevator' : null,
                    p.terrace ? 'terrace' : null,
                    p.garden ? 'garden' : null,
                    p.storage ? 'storage' : null,
                    p.ac ? 'ac' : null,
                    p.security ? 'security' : null
                 ].filter(Boolean),
                 mBuilt: Number(p.mBuilt || 0),
                 price: p.rawPrice 
                    ? new Intl.NumberFormat('es-ES').format(p.rawPrice)
                    : (typeof p.price === 'number' 
                        ? new Intl.NumberFormat('es-ES').format(p.price) 
                        : p.price),
                 coordinates: [p.longitude, p.latitude]
             }));
             setMyProperties(dbProperties);
          } else {
             setMyProperties([]); 
          }

      } catch (e) { console.error("Error cargando perfil:", e); }
  };

  useEffect(() => {
    if (rightPanel === 'PROFILE') loadData();
  }, [rightPanel]);

  // --- ESCUCHA DE EVENTOS ---
  useEffect(() => {
    const handleReload = () => {
        console.log("🔄 PERFIL: Recibida orden de recarga...");
        loadData(); 
    };

    const handleNewProperty = (e: any) => {
        const raw = e.detail;
        if (raw) {
            console.log("⚡️ Inyectando propiedad nueva en caliente:", raw);
            const formattedProp = {
                 ...raw,
                 img: raw.mainImage || (raw.images && raw.images[0]) || (raw.images && raw.images[0]?.url) || "https://images.unsplash.com/photo-1600596542815-27b5aec872c3",
                 selectedServices: [
                    ...(raw.selectedServices || []),
                    raw.pool ? 'pool' : null, 
                    raw.garage ? 'garage' : null,
                    raw.elevator ? 'elevator' : null,
                    raw.terrace ? 'terrace' : null,
                    raw.garden ? 'garden' : null,
                    raw.storage ? 'storage' : null,
                    raw.ac ? 'ac' : null,
                    raw.security ? 'security' : null
                 ].filter(Boolean),
                 mBuilt: Number(raw.mBuilt || raw.m2 || 0),
                 rooms: Number(raw.rooms || 0),
                 baths: Number(raw.baths || 0),
                 price: raw.rawPrice 
                    ? new Intl.NumberFormat('es-ES').format(raw.rawPrice)
                    : (typeof raw.price === 'number' 
                        ? new Intl.NumberFormat('es-ES').format(raw.price) 
                        : raw.price),
                 coordinates: raw.coordinates || [raw.longitude, raw.latitude]
            };
            setMyProperties(prev => [formattedProp, ...prev]);
            loadData();
        }
    };
    
    window.addEventListener('reload-profile-assets', handleReload);
    window.addEventListener('add-property-signal', handleNewProperty); 

    return () => {
        window.removeEventListener('reload-profile-assets', handleReload);
        window.removeEventListener('add-property-signal', handleNewProperty);
    };
  }, []);

  // --- ACCIONES DE PROPIEDAD (BORRAR / EDITAR) ---
  const handleDelete = async (e: any, id: any) => {
      e.stopPropagation();
      if(confirm('⚠️ ¿CONFIRMAR ELIMINACIÓN DE BASE DE DATOS?\nEsta acción es irreversible.')) {
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
          } catch (error) {
              setMyProperties(backup);
          }
      }
  };

  const handleEditClick = (e: any, property: any) => {
      e.stopPropagation();
      if(soundEnabled && playSynthSound) playSynthSound('click');
      toggleRightPanel('NONE');
      if (onEdit) onEdit(property);
  };
  
  // --- MANIOBRA DE VUELO (USADA EN MIS PROPIEDADES) ---
  const handleFlyTo = (e: any, property: any) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (soundEnabled && playSynthSound) playSynthSound('click');
      
      if (typeof window !== 'undefined') {
          console.log("🦅 Ejecutando protocolo de vuelo cruzado...");
          window.dispatchEvent(new CustomEvent('open-details-signal', { detail: property }));
          if (property.coordinates) {
              window.dispatchEvent(new CustomEvent('fly-to-location', { 
                  detail: { center: property.coordinates, zoom: 18.5, pitch: 60 } 
              }));
          }
      }
  };

  if (rightPanel !== 'PROFILE') return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[60000] flex flex-col pointer-events-auto animate-slide-in-right bg-[#E5E5EA] shadow-2xl">
      
      {/* CABECERA */}
      <div className="p-8 pb-4 flex justify-between items-start">
        <div>
          {internalView === 'MAIN' ? (
            <>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Perfil.</h2>
              <p className="text-slate-500 font-bold text-xs tracking-widest uppercase">Gestiona tu identidad.</p>
            </>
          ) : (
            <button onClick={() => setInternalView('MAIN')} className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors group cursor-pointer">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
              <span className="font-bold text-sm uppercase tracking-wider">Volver</span>
            </button>
          )}
        </div>
        <button 
            onClick={() => toggleRightPanel('NONE')} 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
        >
            <X size={20} className="text-slate-900"/>
        </button>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        
        {/* VISTA PRINCIPAL */}
        {internalView === 'MAIN' && (
          <div className="animate-fade-in space-y-8">
            
            {/* ID CARD */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                {/* MODO EDICIÓN */}
                {isEditing ? (
                    <div className="animate-fade-in space-y-4 relative z-20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editando Perfil</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} 
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer relative z-50"
                            >
                                <X size={14} className="text-gray-500"/>
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-2">Nombre Visible</label>
                            <input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="w-full p-4 bg-gray-50 rounded-2xl text-lg font-bold text-gray-900 outline-none border border-transparent focus:bg-white focus:border-blue-500/20 focus:shadow-lg transition-all placeholder:text-gray-300"
                                placeholder="Tu Nombre o Marca"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-2">Foto de Perfil</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200 flex items-center justify-center">
                                    {isUploading ? (
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : editForm.avatar ? (
                                        <img src={editForm.avatar} className="w-full h-full object-cover" alt="Preview"/>
                                    ) : (
                                        <User size={24} className="text-gray-300"/>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl transition-all group relative overflow-hidden">
                                        <Camera size={16} className="text-gray-400 group-hover:text-gray-600"/>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700">
                                            {isUploading ? "Subiendo..." : "Subir Nueva Foto"}
                                        </span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading}/>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSaving ? "Guardando..." : "Aplicar Cambios"}
                        </button>
                    </div>
                ) : (
                    /* MODO VISUALIZACIÓN */
                    <div className="flex items-center gap-5 relative z-20">
                        <div className="w-20 h-20 rounded-full p-1 bg-white shadow-2xl relative group cursor-pointer shrink-0" onClick={startEditing}>
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Avatar"/>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <User size={28} className="text-gray-300"/>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <Edit3 size={16} className="text-white"/>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight truncate leading-tight">
                                {user.companyName || user.name}
                            </h3>
                            <p className="text-xs font-medium text-gray-400 truncate mb-2 font-mono tracking-tight">
                                {user.email}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'AGENCIA' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {user.role === 'AGENCIA' ? 'Agencia' : 'Particular'}
                                </span>
                                <button 
                                    onClick={startEditing}
                                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br rounded-full blur-[60px] opacity-40 pointer-events-none ${user.role === 'AGENCIA' ? 'from-emerald-200 to-cyan-100' : 'from-blue-200 to-purple-100'}`}></div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center border border-slate-100">
                    <div className="text-3xl font-black text-slate-900">{myProperties.length}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activos en Cartera</div>
                </div>
                <div className="bg-white p-5 rounded-[24px] shadow-sm text-center flex flex-col items-center justify-center border border-slate-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mb-2 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                    <div className="text-[9px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full">Sistema Online</div>
                </div>
            </div>

           {/* MENÚ DE ACCESO TÁCTICO */}
            <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-1">Centro de Mando</p>
                
                {/* BOTÓN ESPECIAL: SOLO PARA AGENCIA */}
                {(user.role === 'AGENCIA' || user.companyName) && (
                    <button 
                        onClick={() => { 
                            if(soundEnabled) playSynthSound('click'); 
                            if(toggleMainPanel) toggleMainPanel('AGENCY_STOCK'); 
                        }} 
                        className="w-full bg-[#1d1d1f] text-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 backdrop-blur-sm">
                                <Briefcase size={18}/>
                            </div>
                            <div className="text-left">
                                <span className="block font-black text-sm tracking-wide">AGENCY HUD</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Gestión Profesional</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-white/30 group-hover:text-white relative z-10 transition-colors"/>
                    </button>
                )}

                {/* BOTÓN: MIS PROPIEDADES */}
                <button onClick={() => setInternalView('PROPERTIES')} className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm border border-transparent hover:border-blue-100 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={18}/></div>
                        <span className="font-bold text-slate-900 text-sm">Mis Propiedades</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                </button>

               {/* 🔥 BOTÓN FAVORITOS (EL CAMBIO CLAVE: TELETRANSPORTE A LA BÓVEDA) 🔥 */}
                <button 
                    onClick={() => {
                        if(soundEnabled) playSynthSound('click');
                        // EN LUGAR DE ABRIR LA LISTA INTERNA, NOS VAMOS AL PANEL BUENO
                        toggleRightPanel('VAULT'); 
                    }}
                    className="w-full bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                            <Heart size={20} fill="currentColor" className="opacity-20 group-hover:opacity-100 transition-opacity"/>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 text-sm">Favoritos</h4>
                            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Colección Privada</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all"/>
                </button>

                {/* BOTÓN: MARKETPLACE */}
                <button 
                    onClick={() => { 
                        if(soundEnabled) playSynthSound('click'); 
                        if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); 
                    }} 
                    className="w-full bg-white p-4 rounded-[24px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm cursor-pointer border border-transparent hover:border-emerald-100"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            <Store size={18} />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Marketplace</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500"/>
                </button>
            </div>
            
            {/* BOTÓN CERRAR SESIÓN */}
            <button 
                onClick={async () => {
                   setIsLoggingOut(true);
                   try {
                       localStorage.clear();
                       sessionStorage.clear();
                       await logoutAction(); 
                   } catch (error) { console.error("Error al salir:", error); } 
                   finally { window.location.href = '/'; }
                }}
                className="w-full mt-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-sm flex items-center justify-center gap-3 text-slate-400 font-bold text-xs tracking-widest uppercase hover:bg-white hover:text-rose-500 hover:shadow-md hover:border-rose-100 transition-all duration-300 group cursor-pointer"
            >
                <LogOut size={16} className="group-hover:scale-110 transition-transform"/>
                <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* VISTA MIS PROPIEDADES (DETALLE) */}
        {internalView === 'PROPERTIES' && (
          <div className="animate-fade-in-right space-y-6">
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-2xl font-black text-slate-900">Mis Activos</h3>
               <button 
                    onClick={() => { toggleRightPanel('NONE'); if(toggleMainPanel) toggleMainPanel('ARCHITECT'); }} 
                    className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
               >
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
                        return (
                        <div 
                            key={prop.id} 
                            onClick={(e) => handleFlyTo(e, prop)}
                            className="group bg-white p-5 rounded-[24px] shadow-sm border border-transparent hover:border-blue-500/30 transition-all cursor-pointer relative"
                        >
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-inner relative">
                                    <img src={prop.img} className="w-full h-full object-cover" alt="Propiedad"/>
                                    {prop.elevator && <div className="absolute top-1 right-1 bg-green-500 p-1 rounded-md text-white shadow-sm"><ArrowUp size={8} strokeWidth={4}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors">{prop.title || "Sin título"}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-700`}>ONLINE</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin size={10} />
                                        <span className="truncate">{prop.location || prop.address}</span>
                                    </div>
                                    <p className="text-base font-black text-slate-900 mt-1">{prop.price}€</p>
                                </div>
                            </div>
                            {/* SERVICIOS */}
                            {prop.selectedServices && serviceIds.length > 0 && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-2xl">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-wider flex items-center gap-1">
                                        <Zap size={10} className="text-yellow-500 fill-yellow-500"/> Estrategia Activa
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {serviceIds.slice(0, 4).map((srvId: string) => {
                                            const key = srvId.toLowerCase().trim();
                                            const Icon = ICON_MAP[key] || ICON_MAP[srvId] || Sparkles;
                                            const isPack = key.startsWith('pack');
                                            const label = srvId.replace('pack_', '').replace(/_/g, ' ');
                                            
                                            return (
                                                <div key={srvId} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase ${isPack ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    <Icon size={10} />
                                                    <span>{label}</span>
                                                </div>
                                            );
                                        })}
                                        {serviceIds.length > 4 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setServicesModalProp(prop); }}
                                                className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest uppercase border border-slate-900 hover:bg-slate-800 transition-colors"
                                            >
                                                VER TODO · +{serviceIds.length - 4}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                           {/* BARRA DE ACCIONES */}
                            <div className="pt-3 border-t border-slate-100 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        if(soundEnabled) playSynthSound('click');
                                        if (typeof window !== 'undefined') {
                                            window.dispatchEvent(new CustomEvent('edit-market-signal', { detail: prop }));
                                        }
                                        if(toggleMainPanel) toggleMainPanel('MARKETPLACE'); 
                                    }}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-emerald-100"
                                    title="Gestionar Servicios"
                                >
                                    <Store size={14}/>
                                </button>
                                <button 
                                    onClick={(e) => handleEditClick(e, prop)} 
                                    className="flex-1 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <Edit3 size={12}/> GESTIONAR
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, prop.id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Eliminar Activo"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    );
                    })}
                </div>
            )}
          </div>
        )}

        {/* ❌ VISTA DE FAVORITOS INTERNA ELIMINADA (Para evitar duplicidad y conflictos) */}

      </div>

      {/* MODAL SERVICIOS */}
      {servicesModalProp && (
        <div
            className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setServicesModalProp(null)}
        >
            <div
                className="w-[min(720px,92vw)] max-h-[82vh] bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_30px_80px_rgba(0,0,0,0.20)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-slate-100">
                    <div className="min-w-0">
                        <p className="text-[11px] font-black tracking-[0.35em] text-slate-400 uppercase flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-500" />
                            SERVICIOS ACTIVOS
                        </p>
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-2 truncate">
                            {servicesModalProp.title || "Activo"}
                        </h3>
                    </div>

                    <button
                        className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        onClick={() => setServicesModalProp(null)}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-8 py-6 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {getServiceIds(servicesModalProp).map((srvId: string) => {
                            const key = normalizeKey(srvId);
                            const Icon = ICON_MAP[key] || ICON_MAP[srvId] || Sparkles;
                            const isPack = key.startsWith('pack');
                            const label = srvId.replace('pack_', '').replace(/_/g, ' ');

                            return (
                                <div
                                    key={srvId}
                                    className="rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-300 transition-all p-5 flex flex-col items-center text-center"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                        isPack ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <Icon size={22} className={isPack ? 'text-indigo-600' : 'text-slate-700'} />
                                    </div>
                                    <p className="mt-3 text-[12px] font-black tracking-wide uppercase text-slate-700">
                                        {label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}

     {/* CORTINA DE SALIDA */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[999999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in cursor-wait">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">
                Cerrando Sesión...
            </p>
        </div>
      )}

    </div> 
  ); 
}